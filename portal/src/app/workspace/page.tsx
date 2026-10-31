"use client";

import { useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  createTask, toggleTask, deleteTask, filterTasks, createNote, deleteNote,
  type WorkTask, type WorkNote,
} from "@/lib/local-workspace";

export default function Page() {
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [notes, setNotes] = useState<WorkNote[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");
  const [visibility, setVisibility] = useState<"all" | "open" | "done">("all");
  const [message, setMessage] = useState("");
  const idCounter = useRef(1);
  const visibleTasks = filterTasks(tasks, visibility);

  function addTask() {
    const task = createTask(tasks, String(idCounter.current), taskTitle);
    if (!task) { setMessage("Görev eklenemedi. Başlığı veya liste sınırını kontrol edin."); return; }
    idCounter.current++;
    setTasks((old) => [...old, task]);
    setTaskTitle("");
    setMessage("Görev geçici listeye eklendi.");
  }

  function addNote() {
    const note = createNote(notes, String(idCounter.current), noteTitle, noteBody);
    if (!note) { setMessage("Not eklenemedi. Başlık, içerik veya liste sınırını kontrol edin."); return; }
    idCounter.current++;
    setNotes((old) => [...old, note]);
    setNoteTitle("");
    setNoteBody("");
    setMessage("Not geçici listeye eklendi.");
  }

  return (
    <main>
      <SiteHeader />
      <section className="container-shell py-16">
        <h1 className="text-3xl font-semibold text-white">Profesyonel Çalışma Alanı</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Kişisel görevleri ve notları bu sayfa açıkken düzenleyin. Bir görevi tamamlandı
          olarak işaretleyin, listeyi filtreleyin veya artık gerekli olmayan öğeyi çıkarın.
        </p>
        <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          Bu alan henüz hesapla eşzamanlı çalışan bir büro dosya yönetimi değildir.
          Bilgiler sadece açık sayfanın geçici belleğindedir, sunucuya gönderilmez ve
          yenilemede kaybolur. Gizli müvekkil veya kişisel veri girmeyin.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Görev listesi</h2>
            <label htmlFor="work-task" className="mt-5 block text-sm">Yeni görev</label>
            <div className="mt-2 flex flex-wrap gap-2">
              <input id="work-task" value={taskTitle} maxLength={200}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Örn. Duruşma tarihini kontrol et"
                className="min-w-0 flex-1 rounded-xl border border-white/20 bg-slate-950 p-3 text-white" />
              <button type="button" onClick={addTask}
                className="rounded-xl bg-sky-500 px-4 py-3 font-semibold text-slate-950">Görev ekle</button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2" aria-label="Görev görünümü">
              {(["all", "open", "done"] as const).map((key) => (
                <button key={key} type="button" onClick={() => setVisibility(key)}
                  aria-pressed={visibility === key}
                  className={`rounded-lg border px-3 py-2 text-sm ${visibility === key ? "border-sky-300 text-white" : "border-white/20 text-slate-300"}`}>
                  {key === "all" ? "Tümü" : key === "open" ? "Açık" : "Tamamlanan"}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm text-slate-300" role="status">
              {tasks.filter((t) => t.done).length} tamamlandı / {tasks.length} toplam görev
            </p>
            <ul className="mt-4 space-y-2">
              {visibleTasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/70 p-3">
                  <input type="checkbox" aria-label={`${task.title} tamamlandı`}
                    checked={task.done}
                    onChange={() => setTasks((old) => toggleTask(old, task.id))}
                    className="h-5 w-5 accent-sky-400" />
                  <span className={`min-w-0 flex-1 break-words text-sm ${task.done ? "text-slate-400 line-through" : "text-white"}`}>{task.title}</span>
                  <button type="button" onClick={() => setTasks((old) => deleteTask(old, task.id))}
                    aria-label={`${task.title} görevi sil`}
                    className="rounded-lg border border-rose-400/40 px-2 py-2 text-sm text-rose-200">Sil</button>
                </li>
              ))}
            </ul>
            {visibleTasks.length === 0 ? <p className="mt-4 text-sm text-slate-400">Bu görünümde görev yok.</p> : null}
          </section>
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold">Kişisel notlar</h2>
            <label htmlFor="note-title" className="mt-5 block text-sm">Not başlığı</label>
            <input id="note-title" value={noteTitle} maxLength={160}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-3" />
            <label htmlFor="note-body" className="mt-4 block text-sm">Not içeriği</label>
            <textarea id="note-body" rows={5} value={noteBody} maxLength={6000}
              onChange={(e) => setNoteBody(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 p-3" />
            <button type="button" onClick={addNote}
              className="mt-3 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-slate-950">Not ekle</button>
            <div className="mt-4 space-y-3">
              {notes.map((note) => (
                <article key={note.id} className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                  <h3 className="font-semibold">{note.title}</h3>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-300">{note.content}</p>
                  <button type="button" onClick={() => setNotes((old) => deleteNote(old, note.id))}
                    className="mt-3 rounded-lg border border-rose-400/40 px-3 py-2 text-sm text-rose-200">
                    Notu çıkar
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
        {message ? <p role="status" className="mt-5 text-sm text-sky-200">{message}</p> : null}
      </section>
      <SiteFooter />
    </main>
  );
}
