"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const root = path.resolve(__dirname, "..");
const fn = path.join(root, "src/lib/limited-json-request.ts");
const compiled = ts.transpileModule(fs.readFileSync(fn, "utf8"), {
  fileName: fn,
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
}).outputText;
const mod = { exports: {} };
new Function("module", "exports", compiled)(mod, mod.exports);
const { readJsonWithByteLimit, RequestBodyLimitError } = mod.exports;

const url = "https://synthetic.invalid/api/intake";
function requestText(body, headers = {}) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body
  });
}
function chunkedRequest(chunks) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    duplex: "half",
    body: new ReadableStream({
      start(controller) {
        for (const piece of chunks) controller.enqueue(new TextEncoder().encode(piece));
        controller.close();
      }
    })
  });
}

test("small JSON is accepted without requiring Content-Length", async () => {
  const result = await readJsonWithByteLimit(chunkedRequest(['{"journey":"', 'sample"}']), 7000);
  assert.deepEqual(result, { journey: "sample" });
});

test("a chunked upload larger than maxBytes is rejected on actual received bytes", async () => {
  const secret = "PRIVATE_CANARY_NOT_TO_ECHO";
  await assert.rejects(
    () => readJsonWithByteLimit(chunkedRequest(['{"pad":"', "x".repeat(7090), secret, '"}']), 7000),
    e => e instanceof RequestBodyLimitError && e.code === "REQUEST_TOO_LARGE" &&
      !e.message.includes(secret)
  );
});

test("spoofed short Content-Length never bypasses actual stream measurement", async () => {
  const request = requestText("Q".repeat(100), { "Content-Length": "2" });
  await assert.rejects(
    () => readJsonWithByteLimit(request, 20),
    e => e.code === "REQUEST_TOO_LARGE"
  );
});

test("invalid JSON, missing/wrong content type, and malformed length fail closed", async () => {
  const bad = [
    requestText('{"broken":'),
    requestText('{"ok":true}', { "Content-Type": "text/plain" }),
    requestText('{"ok":true}', { "Content-Length": "not-a-number" })
  ];
  for (const request of bad) {
    await assert.rejects(() => readJsonWithByteLimit(request, 7000),
      e => e instanceof RequestBodyLimitError && e.code === "INVALID_REQUEST_JSON");
  }
});

test("intake route uses bounded stream parser after existing release gate", () => {
  const source = fs.readFileSync(path.join(root, "src/app/api/intake/route.ts"), "utf8");
  assert.match(source, /if\(!intakeReleased\(\)\)return fail\(503\)/);
  assert.match(source, /readJsonWithByteLimit\(request,7000\)/);
  assert.doesNotMatch(source, /await request\.json\(\)/);
  assert.ok(source.indexOf("if(!intakeReleased())") < source.indexOf("readJsonWithByteLimit(request,7000)"));
});
