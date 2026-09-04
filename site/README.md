# 个人博客站点

本目录是个人博客的 Astro 静态站点。当前已完成 Stage 2 的内容模型、模板内容和 P0 页面，真实内容将在 Stage 4 预发布前替换。

## 命令

```powershell
npm ci
npm run dev
npm run check
npm run build
npm run test:e2e
npm run preview
```

## 目录

```text
public/                 静态资源
src/content.config.ts   内容集合与字段校验
src/content/            Markdown 模板内容
src/pages/              文件路由
tests/                  Playwright Stage 2 回归测试
astro.config.mjs        Astro 与集成配置
playwright.config.ts    浏览器测试配置
```

未设置 `SITE_URL` 时，生产构建使用 `http://localhost:4321` 作为 Sitemap 和 canonical 的回退地址；首次部署前必须设置真实的 pages.dev URL。
