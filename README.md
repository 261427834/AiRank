# AiRank

AiRank 是一个基于 Next.js App Router、TypeScript 与 Tailwind CSS 的 AI 产品排行榜展示站。它实时解析 36氪AI测评公开页面中的 `__NUXT_DATA__` 数据，并提供点评榜、新鲜榜、热门榜、关键词筛选和本地产品详情页。

## 功能

- 三大榜单 Tab，各自保留独立搜索状态
- 按产品名称与简介实时筛选
- 60 个榜单产品卡片，前三名金属排名徽章
- 本地产品详情页：公司信息、标签、官网、截图、产品介绍、评价与笔记
- 源站失败时自动使用 `data/rank-snapshot.json` 降级
- 30 分钟增量缓存，可用 `AIRANK_REVALIDATE_SECONDS` 调整

## 本地运行

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

## 测试与构建

```bash
npm test
npm run build
npm start
```

当前 build 脚本使用 Webpack。此环境的 Turbopack 会尝试派生受限的 Node 子进程，导致 `os error 5`；Webpack 构建路径已验证通过。

## 数据与来源

- 榜单来源：`https://ai.36kr.com/ai-product-rank`
- 详情来源：`https://ai.36kr.com/product-detail/:id`
- 请求超时：8 秒
- 默认缓存：1800 秒
- 快照时间见 `data/rank-snapshot.json`

本项目不复制 36氪商标、备案信息或官方品牌素材，仅在页面中标注数据来源。
