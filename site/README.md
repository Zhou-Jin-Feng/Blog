# 个人博客站点

本目录是个人博客的 Astro 静态站点。当前仅包含 Stage 1 最小基线，内容模型和正式页面将在后续阶段实现。

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
public/              静态资源
src/pages/           文件路由
tests/               Playwright 冒烟测试
astro.config.mjs     Astro 与集成配置
playwright.config.ts 浏览器测试配置
```

设置真实的 `SITE_URL` 后，生产构建会生成 Sitemap。首次部署前不要使用占位 URL。
