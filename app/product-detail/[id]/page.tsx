import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageCarousel } from "@/components/image-carousel";
import { DetailTabs } from "@/components/detail-tabs";
import { getDetailData, getRankData } from "@/lib/scraper";
import type { DetailData, ProductDetail, RankedProduct, RankKind } from "@/lib/types";

type PageProps = { params: Promise<{ id: string }> };

const rankKinds: RankKind[] = ["score", "fresh", "hot"];

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function findFallbackProduct(id: number, lists: Record<RankKind, { items: RankedProduct[] }>): RankedProduct | null {
  for (const kind of rankKinds) {
    const product = lists[kind].items.find((item) => item.id === id);
    if (product) return product;
  }
  return null;
}

function detailFromFallback(product: RankedProduct): ProductDetail {
  return {
    id: product.id,
    name: product.name,
    summary: product.summary,
    companyName: null,
    employeeCount: null,
    financingState: null,
    companyAddress: null,
    foundingDate: null,
    officialWebsite: null,
    images: [],
    tags: [],
    score: product.score,
    logo: product.logo,
    noteCount: 0,
    reviewCount: 0,
    introduction: product.summary,
    seoTitle: `${product.name} - AiRank`,
    seoDescription: product.summary
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return { title: "产品未找到" };

  const detail = await getDetailData(id);
  if (!detail) return { title: "产品详情" };

  return {
    title: detail.product.seoTitle,
    description: detail.product.seoDescription,
    openGraph: {
      title: detail.product.seoTitle,
      description: detail.product.seoDescription,
      images: detail.product.logo ? [{ url: detail.product.logo }] : undefined,
      type: "website"
    }
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) notFound();

  const [rankData, sourceDetail] = await Promise.all([getRankData(), getDetailData(id)]);
  const fallbackProduct = findFallbackProduct(id, rankData);
  if (!sourceDetail && !fallbackProduct) notFound();

  const detail: DetailData = sourceDetail ?? {
    product: detailFromFallback(fallbackProduct as RankedProduct),
    reviews: [],
    notes: []
  };
  const { product, reviews, notes } = detail;
  const companyInfo = [
    ["公司", product.companyName],
    ["员工规模", product.employeeCount],
    ["融资状态", product.financingState],
    ["成立时间", product.foundingDate],
    ["地址", product.companyAddress]
  ].filter(([, value]) => Boolean(value));

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <Link className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-sky-300/40 hover:text-white" href="/">
        <span aria-hidden>←</span>
        返回排行榜
      </Link>

      <section className="glass-panel mt-6 overflow-hidden rounded-[32px] p-6 sm:p-10">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex flex-1 flex-col sm:flex-row sm:items-start">
            <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-white/10">
              <Image alt={`${product.name} logo`} className="object-contain" height={128} src={product.logo} unoptimized width={128} />
            </span>
            <div className="mt-5 flex-1 sm:ml-6 sm:mt-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black text-white sm:text-4xl">{product.name}</h1>
                {product.score ? <span className="rounded-xl bg-amber-300/15 px-3 py-2 text-lg font-bold text-amber-200">{product.score}</span> : null}
              </div>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">{product.summary}</p>
              {product.tags.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-3 py-1 text-xs font-medium text-sky-200" key={tag}>{tag}</span>
                  ))}
                </div>
              ) : null}
              {product.officialWebsite ? (
                <a
                  className="mt-7 inline-flex rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-5 py-3 text-sm font-bold text-white transition hover:from-sky-400 hover:to-indigo-400"
                  href={product.officialWebsite}
                  rel="noreferrer nofollow"
                  target="_blank"
                >
                  访问官方网站
                </a>
              ) : null}
            </div>
          </div>

          {companyInfo.length ? (
            <dl className="grid w-full gap-3 rounded-3xl border border-white/10 bg-black/25 p-5 text-sm lg:w-96">
              {companyInfo.map(([label, value]) => (
                <div className="flex gap-4" key={label}>
                  <dt className="w-20 shrink-0 text-slate-500">{label}</dt>
                  <dd className="flex-1 font-medium text-slate-200">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="glass-panel rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white">产品介绍</h2>
          <div className="mt-4 whitespace-pre-line text-sm leading-8 text-slate-300 sm:text-base">{product.introduction}</div>
        </div>
        <div className="glass-panel rounded-3xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white">互动概览</h2>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <Metric label="用户评价" value={product.reviewCount} />
            <Metric label="产品笔记" value={product.noteCount} />
          </div>
        </div>
      </section>

      {product.images.length ? (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-white">产品截图</h2>
          <ImageCarousel alt={product.name} images={product.images} />
        </section>
      ) : null}

      <DetailTabs notes={notes} reviews={reviews} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
      <p className="text-3xl font-black text-white">{value.toLocaleString("zh-CN")}</p>
      <p className="mt-2 text-sm text-slate-400">{label}</p>
    </div>
  );
}
