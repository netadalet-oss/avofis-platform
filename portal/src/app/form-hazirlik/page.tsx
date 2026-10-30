"use client";
import {sectorPreviews} from "@/lib/sector-intake-preview";
export default function FormPreparation(){return <main><h1>Yerel form hazırlık taslakları</h1><p>Gönderim yok; iş, kira ve tüketici konuları için 14 kayıt.</p><ul>{sectorPreviews.map(t=><li key={t.sourceId}>{t.sourceId} · {t.title}</li>)}</ul></main>}
