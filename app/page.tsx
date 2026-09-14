import { RankingExplorer } from "@/components/ranking-explorer";
import { getRankData } from "@/lib/scraper";

export const runtime = "edge";

export default async function HomePage() {
  const rankData = await getRankData();
  const updatedAt = new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai"
  }).format(new Date(rankData.updatedAt));

  return (
    <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[36px] border border-white/10 p-8 sm:p-12">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(14,165,233,0.24),rgba(79,70,229,0.18),transparent)]" />
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.36em] text-sky-300">AI Product Ranking</p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-6xl">
            看清每一款
            <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent"> AI 产品</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            汇总点评、新鲜度与热度三张榜单，支持关键词筛选，并进入详情页查看产品介绍、截图、评价与笔记。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
            <span className={`rounded-full border px-4 py-2 ${rankData.isFallback ? "border-amber-300/40 bg-amber-300/10 text-amber-200" : "border-emerald-300/40 bg-emerald-300/10 text-emerald-200"}`}>
              {rankData.isFallback ? "降级快照" : "实时数据"}
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-300">更新时间：{updatedAt}</span>
          </div>
        </div>
      </section>

      <RankingExplorer lists={{ score: rankData.score, fresh: rankData.fresh, hot: rankData.hot }} />
    </div>
  );
}

