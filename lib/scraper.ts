import { cache } from "react";
import snapshot from "@/data/rank-snapshot.json";
import type { DetailData, ProductDetail, ProductNote, ProductReview, RankData, RankList, RankedProduct } from "@/lib/types";

const DEFAULT_SOURCE = "https://ai.36kr.com";
const REQUEST_TIMEOUT_MS = 8_000;
const WRAPPER_TYPES = new Set(["ShallowReactive", "Reactive"]);

const sourceUrl = process.env.AIRANK_SOURCE_URL ?? DEFAULT_SOURCE;
const revalidateSeconds = Number(process.env.AIRANK_REVALIDATE_SECONDS ?? 1_800);

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hydratePayload(payload: unknown[], index: number, active = new Set<number>()): unknown {
  if (index < 0 || index >= payload.length) return undefined;
  if (active.has(index)) return undefined;

  active.add(index);
  try {
    return hydrateSource(payload[index], payload, active);
  } finally {
    active.delete(index);
  }
}

function hydrateSource(source: unknown, payload: unknown[], active: Set<number>): unknown {
  if (source === null || typeof source !== "object") return source;

  if (Array.isArray(source)) {
    const marker = source[0];
    if (typeof marker === "string" && WRAPPER_TYPES.has(marker) && source.length === 2) {
      return typeof source[1] === "number" ? hydratePayload(payload, source[1], active) : source[1];
    }
    if (marker === "Set") {
      return new Set(source.slice(1).map((item) => (typeof item === "number" ? hydratePayload(payload, item, active) : hydrateSource(item, payload, active))));
    }
    return source.map((item) => (typeof item === "number" ? hydratePayload(payload, item, active) : hydrateSource(item, payload, active)));
  }

  const hydrated: UnknownRecord = {};
  for (const [key, item] of Object.entries(source)) {
    hydrated[key] = typeof item === "number" ? hydratePayload(payload, item, active) : hydrateSource(item, payload, active);
  }
  return hydrated;
}

export function extractNuxtData(html: string): UnknownRecord {
  const match = html.match(/<script\b[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error("NUXT_DATA script not found");

  const payload = JSON.parse(match[1]) as unknown[];
  if (!Array.isArray(payload) || payload.length === 0) throw new Error("NUXT_DATA payload is empty");

  const hydrated = hydratePayload(payload, 0);
  if (!isRecord(hydrated)) throw new Error("NUXT_DATA payload did not decode to an object");
  return hydrated;
}

function text(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

function optionalText(value: unknown): string | null {
  const result = text(value).trim();
  return result.length > 0 ? result : null;
}

function positiveInteger(value: unknown): number | null {
  const result = Number(value);
  return Number.isSafeInteger(result) && result > 0 ? result : null;
}

function normalizeRankedList(value: unknown): RankList {
  const source = isRecord(value) && Array.isArray(value.items) ? value.items : [];
  const items: RankedProduct[] = [];

  for (const entry of source) {
    if (!isRecord(entry)) continue;
    const id = positiveInteger(entry.id);
    const name = text(entry.name).trim();
    const logo = text(entry.logo).trim();
    if (!id || !name || !logo) continue;

    items.push({
      rank: items.length + 1,
      id,
      logo,
      name,
      summary: text(entry.summary),
      score: text(entry.score),
      starRating: Number(entry.starRating ?? 0),
      logoTone: Number(entry.logoTone ?? 0)
    });
  }

  return {
    items,
    startTime: Number(value && isRecord(value) ? value.startTime : 0),
    endTime: Number(value && isRecord(value) ? value.endTime : 0)
  };
}

function fallbackRankData(): RankData {
  return {
    score: normalizeRankedList(snapshot.score),
    fresh: normalizeRankedList(snapshot.fresh),
    hot: normalizeRankedList(snapshot.hot),
    sourceUrl: snapshot.source,
    updatedAt: snapshot.fetchedAt,
    isFallback: true
  };
}

async function fetchPage(path: string): Promise<string> {
  const response = await fetch(`${sourceUrl}${path}`, {
    headers: {
      "user-agent": "AiRank/0.1 (Next.js real-time public-data collector)",
      accept: "text/html,application/xhtml+xml"
    },
    next: { revalidate: revalidateSeconds },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) throw new Error(`Source responded ${response.status}`);
  return response.text();
}

export const getRankData = cache(async (): Promise<RankData> => {
  try {
    const payload = extractNuxtData(await fetchPage("/ai-product-rank"));
    const data = isRecord(payload.data) ? payload.data : {};
    const rank = isRecord(data["ai-product-rank-data"]) ? data["ai-product-rank-data"] : {};
    const score = normalizeRankedList(rank.score);
    const fresh = normalizeRankedList(rank.fresh);
    const hot = normalizeRankedList(rank.hot);

    if (!score.items.length || !fresh.items.length || !hot.items.length) throw new Error("Incomplete ranking payload");
    return { score, fresh, hot, sourceUrl: `${sourceUrl}/ai-product-rank`, updatedAt: new Date().toISOString(), isFallback: false };
  } catch {
    return fallbackRankData();
  }
});

function normalizeDetail(value: unknown, id: number): ProductDetail | null {
  if (!isRecord(value)) return null;
  const name = text(value.name).trim();
  const logo = text(value.logo).trim();
  if (!name || !logo) return null;

  const seo = isRecord(value.seo) ? value.seo : {};
  return {
    id,
    name,
    summary: text(value.summary),
    companyName: optionalText(value.companyName),
    employeeCount: optionalText(value.employeeCount),
    financingState: optionalText(value.financingState),
    companyAddress: optionalText(value.companyAddress),
    foundingDate: optionalText(value.foundingDate),
    officialWebsite: optionalText(value.officialWebsite),
    images: Array.isArray(value.imgPathList) ? value.imgPathList.map(text).filter(Boolean) : [],
    tags: Array.isArray(value.tagList) ? value.tagList.map(text).filter(Boolean) : [],
    score: text(value.score),
    logo,
    noteCount: Number(value.noteCount ?? 0),
    reviewCount: Number(value.reviewCount ?? 0),
    introduction: text(value.introduction),
    seoTitle: text(seo.title) || `${name} - AiRank`,
    seoDescription: text(seo.description) || text(value.summary)
  };
}

function normalizeReviews(value: unknown): ProductReview[] {
  const source = isRecord(value) && isRecord(value.data) && Array.isArray(value.data.itemList) ? value.data.itemList : [];
  return source.flatMap((entry): ProductReview[] => {
    if (!isRecord(entry) || !positiveInteger(entry.id)) return [];
    return [{
      id: Number(entry.id),
      userName: text(entry.userName) || "匿名用户",
      userLogo: text(entry.userLogo),
      content: text(entry.content),
      score: text(entry.score) || "0",
      publishTime: Number(entry.publishTime ?? 0),
      images: Array.isArray(entry.imgList) ? entry.imgList.map(text).filter(Boolean) : []
    }];
  });
}

function normalizeNotes(value: unknown): ProductNote[] {
  const source = isRecord(value) && isRecord(value.data) && Array.isArray(value.data.itemList) ? value.data.itemList : [];
  return source.flatMap((entry): ProductNote[] => {
    if (!isRecord(entry) || !positiveInteger(entry.id)) return [];
    return [{
      id: Number(entry.id),
      title: text(entry.title),
      userName: text(entry.userName) || "匿名用户",
      userLogo: text(entry.userLogo),
      publishTime: Number(entry.publishTime ?? 0),
      image: text(entry.imgPath),
      praiseCount: Number(entry.statPraise ?? 0),
      circles: Array.isArray(entry.circleList) ? entry.circleList.flatMap((circle) => isRecord(circle) ? [text(circle.name)] : []) : []
    }];
  });
}

export const getDetailData = cache(async (id: number): Promise<DetailData | null> => {
  try {
    const payload = extractNuxtData(await fetchPage(`/product-detail/${id}`));
    const data = isRecord(payload.data) ? payload.data : {};
    const product = normalizeDetail(data["ai-product-detail"], id);
    if (!product) return null;

    return {
      product,
      reviews: normalizeReviews(data[`product-reviews-${id}`]),
      notes: normalizeNotes(data[`product-notes-${id}`])
    };
  } catch {
    return null;
  }
});
