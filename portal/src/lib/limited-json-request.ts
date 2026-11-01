/**
 * AVOfis AV-019 / AV-025: byte-bounded JSON parsing for routes that may
 * later accept sensitive intake. Do not trust Content-Length: it can be
 * absent in chunked transfer, and bodies can exceed the advertised value.
 * This helper never logs or echoes request contents.
 */
export class RequestBodyLimitError extends Error {
  readonly code: "REQUEST_TOO_LARGE" | "INVALID_REQUEST_JSON";
  constructor(code: "REQUEST_TOO_LARGE" | "INVALID_REQUEST_JSON") {
    super(code);
    this.code = code;
  }
}

export async function readJsonWithByteLimit(
  request: Request,
  maxBytes: number
): Promise<unknown> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > 1024 * 1024) {
    throw new RequestBodyLimitError("INVALID_REQUEST_JSON");
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new RequestBodyLimitError("INVALID_REQUEST_JSON");
  }
  const header = request.headers.get("content-length");
  if (header !== null) {
    if (!/^(0|[1-9][0-9]*)$/.test(header)) {
      throw new RequestBodyLimitError("INVALID_REQUEST_JSON");
    }
    if (Number(header) > maxBytes) {
      throw new RequestBodyLimitError("REQUEST_TOO_LARGE");
    }
  }
  if (!request.body) throw new RequestBodyLimitError("INVALID_REQUEST_JSON");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      if (!(value instanceof Uint8Array)) {
        throw new RequestBodyLimitError("INVALID_REQUEST_JSON");
      }
      length += value.byteLength;
      if (length > maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new RequestBodyLimitError("REQUEST_TOO_LARGE");
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof RequestBodyLimitError) throw error;
    throw new RequestBodyLimitError("INVALID_REQUEST_JSON");
  } finally {
    reader.releaseLock();
  }

  try {
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch {
    throw new RequestBodyLimitError("INVALID_REQUEST_JSON");
  }
}
