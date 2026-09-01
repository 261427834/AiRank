"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { ProductCard } from "@/components/product-card";
import type { RankKind, RankList } from "@/lib/types";

const tabs: Array<{ kind: RankKind; label: string; description: string }> = [
  { kind: "score", label: "点评榜", description: "综合用户评分与产品质量" },
  { kind: "fresh", label: "新鲜榜", description: "新上架与近期活跃产品" },
  { kind: "hot", label: "热门榜", description: "访问热度与讨论趋势" }
];

export function RankingExplorer({ lists }: { lists: Record<RankKind, RankList> }) {
  const [activeTab, setActiveTab] = useState<RankKind>("score");
  const [queries, setQueries] = useState<Record<RankKind, string>>({ score: "", fresh: "", hot: "" });
  const query = queries[activeTab].trim().toLowerCase();

  const filteredItems = useMemo(() => {
    const items = lists[activeTab].items;
    if (!query) return items;
    return items.filter((product) => `${product.name}\n${product.summary}`.toLowerCase().includes(query));
  }, [activeTab, lists, query]);

  const activeIndex = tabs.findIndex((tab) => tab.kind === activeTab);
  const activeTabMeta = tabs[activeIndex];

  const changeQuery = (event: ChangeEvent<HTMLInputElement>) => {
    setQueries((current) => ({ ...current, [activeTab]: event.target.value }));
  };

  return (
    <section className="mt-10">
      <div className="glass-panel rounded-[28px] p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {tabs.map((tab) => (
            <button
              aria-pressed={tab.kind === activeTab}
              className={`rounded-2xl px-4 py-3 text-left transition ${tab.kind === activeTab ? "bg-gradient-to-r from-sky-500/90 to-indigo-500/90 text-white shadow-lg shadow-sky-950/50" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
              key={tab.kind}
              onClick={() => setActiveTab(tab.kind)}
              type="button"
            >
              <span className="block text-base font-bold">AI产品{tab.label}</span>
              <span className={`mt-1 block text-xs ${tab.kind === activeTab ? "text-white/80" : "text-slate-400"}`}>{tab.description}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/25 p-3 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-3 rounded-xl bg-white/5 px-4 py-3">
            <span aria-hidden className="text-slate-400">⌕</span>
            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              onChange={changeQuery}
              placeholder={`搜索${activeTabMeta.label}产品名称或简介`}
              value={queries[activeTab]}
              type="search"
            />
          </label>
          <output className="rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300 sm:w-32 sm:text-center">
            {filteredItems.length}/{lists[activeTab].items.length} 个
          </output>
        </div>
      </div>

      {filteredItems.length ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredItems.map((product) => (
            <ProductCard key={`${activeTab}-${product.id}`} product={product} />
          ))}
        </div>
      ) : (
        <div className="glass-panel mt-6 rounded-3xl p-12 text-center">
          <p className="text-lg font-semibold text-white">没有匹配的产品</p>
          <p className="mt-2 text-sm text-slate-400">请调整关键词，或切换到其他榜单继续查找。</p>
        </div>
      )}
    </section>
  );
}
