import Image from "next/image";
import Link from "next/link";
import type { RankedProduct } from "@/lib/types";

const rankStyles = [
  "rank-gold text-amber-950",
  "rank-silver text-slate-850",
  "rank-bronze text-orange-950"
];

export function ProductCard({ product }: { product: RankedProduct }) {
  const isTopThree = product.rank <= 3;

  return (
    <Link
      className={`glass-panel group flex h-full flex-col gap-4 rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:border-sky-300/40 hover:shadow-sky-950/60 ${isTopThree ? "ring-1 ring-white/15" : ""}`}
      href={`/product-detail/${product.id}`}
    >
      <div className="flex items-start gap-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-base font-black ${rankStyles[product.rank - 1] ?? "border border-white/15 bg-white/10 text-slate-200"}`}
        >
          {product.rank}
        </span>
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
          <Image alt={`${product.name} logo`} className="object-contain" height={96} src={product.logo} unoptimized width={96} />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-white">{product.name}</h3>
          <p className="mt-1 text-sm font-semibold text-sky-300">{product.score}</p>
        </div>
      </div>
      <p className="line-clamp-3 flex-1 text-sm leading-6 text-slate-300">{product.summary}</p>
      <span className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-medium text-slate-300 transition group-hover:border-sky-300/40 group-hover:text-sky-200">
        查看产品详情
        <span aria-hidden>→</span>
      </span>
    </Link>
  );
}
