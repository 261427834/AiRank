import { beforeEach, describe, expect, it, vi } from "vitest";

const makeHtml = (payload: unknown[]) =>
  `<html><script type="application/json" data-nuxt-data="nuxt-app" id="__NUXT_DATA__">${JSON.stringify(payload)}</script></html>`;

async function importScraper() {
  const module = await import("@/lib/scraper");
  return module;
}

describe("Nuxt payload parsing", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it("decodes Nuxt wrappers and normalizes ranking items", async () => {
    const { extractNuxtData } = await importScraper();
    const payload = [
      ["ShallowReactive", 1],
      { data: 2 },
      { "ai-product-rank-data": 3 },
      ["ShallowReactive", 4],
      { score: 5 },
      { items: 6, startTime: 7, endTime: 8 },
      [9],
      100,
      200,
      { id: 10, name: 11, logo: 12, summary: 13, score: 14, starRating: 15, logoTone: 16 },
      7,
      "Ai Product",
      "https://example.com/logo.png",
      "A useful assistant",
      "4.8",
      4.8,
      2
    ];

    const data = extractNuxtData(makeHtml(payload)) as {
      data: Record<"ai-product-rank-data", { score: unknown }>;
    };
    expect(data.data["ai-product-rank-data"].score).toEqual({
      items: [{
        id: 7,
        name: "Ai Product",
        logo: "https://example.com/logo.png",
        summary: "A useful assistant",
        score: "4.8",
        starRating: 4.8,
        logoTone: 2
      }],
      startTime: 100,
      endTime: 200
    });
  });

  it("rejects a page without the Nuxt payload", async () => {
    const { extractNuxtData } = await importScraper();
    expect(() => extractNuxtData("<html></html>")).toThrow("NUXT_DATA script not found");
  });

  it("uses the local snapshot when the source request fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => {
      throw new Error("source unavailable");
    }));
    const { getRankData } = await importScraper();
    const result = await getRankData();

    expect(result.isFallback).toBe(true);
    expect(result.score.items).toHaveLength(20);
    expect(result.fresh.items).toHaveLength(20);
    expect(result.hot.items).toHaveLength(20);
    expect(result.score.items[0]).toMatchObject({ rank: 1, name: "麦芽AI", score: "4.5" });
  });

  it("normalizes product detail, reviews, and notes", async () => {
    const payload = [
      ["ShallowReactive", 1],
      { data: 2 },
      {
        "ai-product-detail": 3,
        "product-reviews-99": 4,
        "product-notes-99": 5
      },
      {
        name: 6,
        summary: 7,
        logo: 8,
        score: 9,
        imgPathList: 10,
        tagList: 11,
        noteCount: 12,
        reviewCount: 13,
        introduction: 14,
        seo: 15
      },
      { data: 16 },
      { data: 17 },
      "Deep Product",
      "Fast assistant",
      "https://example.com/product.png",
      "4.6",
      [18],
      [19],
      2,
      1,
      "Full introduction",
      { title: 20, description: 21 },
      { itemList: [22] },
      { itemList: [26] },
      "Product screenshot",
      "AI助手",
      "Deep Product - AiRank",
      "Deep product description",
      {
        id: 23,
        userName: "Reviewer",
        userLogo: "https://example.com/user.png",
        content: "Very useful",
        score: "5.0",
        publishTime: 24,
        imgList: [25]
      },
      3568010593722249,
      1787560144543,
      "https://example.com/review.png",
      {
        id: 27,
        title: "Native experience",
        userName: "Note author",
        userLogo: "https://example.com/note-user.png",
        publishTime: 28,
        imgPath: 29,
        statPraise: 30,
        circleList: [31]
      },
      3568010593722201,
      1787135505875,
      "https://example.com/note.png",
      2,
      { name: "AI笔记" }
    ];

    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, text: async () => makeHtml(payload) })));
    const { getDetailData } = await importScraper();
    const detail = await getDetailData(99);

    expect(detail?.product).toMatchObject({
      id: 99,
      name: "Deep Product",
      score: "4.6",
      images: ["Product screenshot"],
      tags: ["AI助手"],
      noteCount: 2,
      reviewCount: 1
    });
    expect(detail?.reviews).toHaveLength(1);
    expect(detail?.reviews[0]).toMatchObject({ userName: "Reviewer", content: "Very useful" });
    expect(detail?.notes).toHaveLength(1);
    expect(detail?.notes[0]).toMatchObject({ title: "Native experience", circles: ["AI笔记"] });
  });
});
