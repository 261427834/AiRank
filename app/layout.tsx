import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AiRank - AI 产品排行榜",
    template: "%s | AiRank"
  },
  description: "实时采集公开榜单数据的 AI 产品点评榜、新鲜榜与热门榜。",
  openGraph: {
    title: "AiRank - AI 产品排行榜",
    description: "点评榜、新鲜榜、热门榜与产品详情一站查看。",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-[#050914] text-slate-100 antialiased">
        <SiteHeader />
        <main className="pb-24">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
