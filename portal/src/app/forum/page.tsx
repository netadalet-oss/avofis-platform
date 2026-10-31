"use client";

import { useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  addTopic, addReply, searchTopics, removeTopic, removeReply,
  type LocalTopic
} from "@/lib/local-forum";

export default function ForumPage() {
  const [topics, setTopics] = useState<LocalTopic[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const counter = useRef(1);
  const results = searchTopics(topics, query);

  function createTopic() {
    const topic = addTopic(topics, String(counter.current), title, description);
    if (!topic) { setMessage("Başlık ve açıklama gerekli; en fazla 20 geçici konu eklenebilir."); return; }
    counter.current += 1;
    setTopics((previous) => [...previous, topic]);
    setTitle("");
    setDescription("");
    setMessage("Konu yalnızca bu sayfaya eklendi; toplulukta yayımlanmadı.");
  }
  function reply(topicId: string) {
    const body = replyDrafts[topicId] || "";
    const changed = addReply(topics, topicId, String(counter.current), body);
    if (!changed) { setMessage("Yanıt eklenemedi. Metni ve sınırları kontrol edin."); return; }
    counter.current += 1;
    setTopics(changed);
    setReplyDrafts((old) => ({ ...old, [topicId]: "" }));
    setMessage("Yanıt yalnızca kişisel tartışma taslağına eklendi.");
  }

  return (
    <main>
      <SiteHeader />
      <section className="container-shell py-16">
        <h1 className="text-3xl font-semibold text-white">Forum — Kişisel Tartışma Taslakları</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Tartışma konularınızı, açıklamaları ve örnek yanıtları yayımlamadan önce
          kendi ekranınızda düzenleyin.
        </p>
        <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          Bu bir canlı forum değildir. Konular ve yanıtlar başka kullanıcılar tarafından
          görülmez, sunucuya gönderilmez veya moderasyona sunulmaz. Sekme yenilenince
          kaybolurlar. Gizli müvekkil bilgisi veya kişisel veri eklemeyin.
        </p>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Yeni konu taslağı</h2>
            <label htmlFor="forum-title" className="mt-5 block text-sm">Konu başlığı</label>
            <input id="forum-title" value={title} maxLength={160}
              onChange={(e)=>setTitle(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-3" />
            <label htmlFor="forum-body" className="mt-4 block text-sm">Açıklama</label>
            <textarea id="forum-body" value={description} rows={7} maxLength={5000}
              onChange={(e)=>setDescription(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-3" />
            <button type="button" onClick={createTopic}
              className="mt-4 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-slate-950">Geçici konu oluştur</button>
            {message ? <p role="status" className="mt-3 text-sm text-sky-200">{message}</p> : null}
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Konu taslaklarım</h2>
            <label htmlFor="forum-search" className="mt-4 block text-sm">Başlık ve açıklamada ara</label>
            <input id="forum-search" value={query} onChange={(e)=>setQuery(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-3" />
            <p className="mt-4 text-sm text-slate-300">{results.length} eşleşen / {topics.length} konu taslağı</p>
            <div className="mt-5 space-y-4">
              {results.map((item)=>(
                <article key={item.id} className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-300">{item.description}</p>
                  <h4 className="mt-4 font-medium">Kişisel yanıt taslakları ({item.replies.length})</h4>
                  <ul className="mt-2 space-y-2">
                    {item.replies.map((response)=>(
                      <li key={response.id} className="rounded-lg border border-white/10 p-3">
                        <p className="whitespace-pre-wrap break-words text-sm">{response.body}</p>
                        <button type="button" onClick={()=>setTopics((old)=>removeReply(old,item.id,response.id))}
                          className="mt-2 text-sm text-rose-200 underline">Yanıtı kaldır</button>
                      </li>
                    ))}
                  </ul>
                  <label htmlFor={"reply-"+item.id} className="mt-4 block text-sm">Yanıt taslağı</label>
                  <textarea id={"reply-"+item.id} rows={3} maxLength={3000}
                    value={replyDrafts[item.id] || ""}
                    onChange={(e)=>setReplyDrafts((old)=>({...old,[item.id]:e.target.value}))}
                    className="mt-2 w-full rounded-lg border border-white/20 bg-slate-950 p-3"/>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button type="button" onClick={()=>reply(item.id)}
                      className="rounded-lg border border-sky-300/40 px-3 py-2 text-sm text-sky-200">Yanıt taslağı ekle</button>
                    <button type="button" onClick={()=>setTopics((old)=>removeTopic(old,item.id))}
                      className="rounded-lg border border-rose-400/40 px-3 py-2 text-sm text-rose-200">Konuyu kaldır</button>
                  </div>
                </article>
              ))}
            </div>
            {results.length===0 ? <p className="mt-4 text-sm text-slate-400">Aranan taslak bulunamadı.</p> : null}
          </section>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
