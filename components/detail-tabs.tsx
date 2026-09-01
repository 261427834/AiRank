"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductNote, ProductReview } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeZone: "Asia/Shanghai" });

export function DetailTabs({ notes, reviews }: { notes: ProductNote[]; reviews: ProductReview[] }) {
  const [activeTab, setActiveTab] = useState<"reviews" | "notes">("reviews");

  return (
    <section className="mt-8">
      <div className="flex gap-3">
        {([
          ["reviews", `用户评价 ${reviews.length}`],
          ["notes", `产品笔记 ${notes.length}`]
        ] as const).map(([kind, label]) => (
          <button
            aria-pressed={activeTab === kind}
            className={`rounded-xl px-5 py-3 text-sm font-bold transition ${activeTab === kind ? "bg-sky-500 text-white shadow-lg shadow-sky-950/50" : "border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white"}`}
            key={kind}
            onClick={() => setActiveTab(kind)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        {activeTab === "reviews" ? (
          reviews.length ? (
            reviews.map((review) => (
              <article className="glass-panel rounded-3xl p-5" key={review.id}>
                <div className="flex items-center gap-3">
                  <span className="relative h-10 w-10 overflow-hidden rounded-full border border-white/10 bg-white/10">
                    {review.userLogo ? <Image alt={review.userName} className="object-cover" height={40} src={review.userLogo} unoptimized width={40} /> : null}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{review.userName}</p>
                    <p className="text-xs text-slate-400">{dateFormatter.format(new Date(review.publishTime))}</p>
                  </div>
                  <span className="ml-auto rounded-lg bg-amber-300/15 px-3 py-1 text-sm font-bold text-amber-200">{review.score}</span>
                </div>
                <p className="mt-4 leading-7 text-slate-200">{review.content}</p>
              </article>
            ))
          ) : (
            <EmptyMessage message="暂无用户评价" />
          )
        ) : notes.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {notes.map((note) => (
              <article className="glass-panel overflow-hidden rounded-3xl" key={note.id}>
                {note.image ? (
                  <div className="relative aspect-video border-b border-white/10 bg-black/30">
                    <Image alt={note.title || note.userName} className="object-cover" fill sizes="(max-width: 768px) 100vw, 50vw" src={note.image} unoptimized />
                  </div>
                ) : null}
                <div className="p-5">
                  <p className="text-lg font-bold leading-8 text-white">{note.title}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span>{note.userName}</span>
                    <span>{dateFormatter.format(new Date(note.publishTime))}</span>
                    {note.circles.map((circle) => (
                      <span className="rounded-full border border-white/10 px-2 py-1" key={circle}>{circle}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyMessage message="暂无产品笔记" />
        )}
      </div>
    </section>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">{message}</div>;
}
