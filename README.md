# 个人工程实践手记

中文个人博客，记录学习笔记、技术文档和个人工程实践。线上地址：<https://blog-4cr.pages.dev>

## 有什么

- **博客**：学习笔记和工程实践文章。每篇都能下载 Markdown 原文，也能打印或存为 PDF。
- **项目**：个人工程项目的技术栈、本人贡献和状态。
- **文档**：按版本和更新时间整理的技术文档。
- **简历、履历、关于**：网页版简历、经历时间线和公开联系方式。
- 首页是一张星图，把栏目、内容和标签连成关系图。`Ctrl+K`（或 `/`）打开全站搜索。文章和项目底部按共同标签推荐相关内容。
- 演示视频栏目已经做好，暂时用开关隐藏，有了真实视频再打开。

学习笔记由作者在 AI 辅助下整理，页面底部和下载的 Markdown 里都有注明。

## 技术栈

| 用途 | 选型 |
| --- | --- |
| 站点 | [Astro](https://astro.build/) 7，纯静态输出 |
| 内容 | Content collections，用 zod 严格校验；Markdown、MDX、YAML |
| 搜索 | [Pagefind](https://pagefind.app/) 建索引；搜索面板自己写，补了中文短词匹配 |
| 代码块 | [Expressive Code](https://expressive-code.com/)，跟随站点深浅主题 |
| 首页星图 | 构建期用 [d3-force](https://d3js.org/d3-force) 布局，浏览器端只负责交互 |
| 分享图 | 构建期用 [satori](https://github.com/vercel/satori) 排版、sharp 转 PNG |
| 测试 | [Playwright](https://playwright.dev/) 端到端测试 |
| CI / 部署 | GitHub Actions；Cloudflare Pages，统计用 Cloudflare Web Analytics |

## 目录

- `site/`：Astro 站点，npm 命令都在这里运行。
- `docs/`：方案、内容清单、脱敏审查和发布记录，见下文“文档”。
- `CLAUDE.md`：开发约定，内容最全。开发中使用了 AI 编程代理，这份文件也是给代理读的项目说明。
- `.github/workflows/ci.yml`：CI。每次推送到 `main` 和每个 PR 都依次运行 `check`、`build`、`test:e2e`。

## 本地开发

需要 Node.js 22.12.0 或更高版本，CI 和 Pages 用 Node 24。

```bash
cd site
npm ci
npm run dev        # 开发服务器
npm run check      # 类型和内容校验
npm run build      # 生产构建，结束后用 Pagefind 生成搜索索引
npm run test:e2e   # Playwright 端到端测试，使用生产构建
```

- 搜索索引只在 `build` 时生成，`npm run dev` 下搜不到正文。调试搜索要先 build，再 `npm run preview`。
- 不设环境变量 `SITE_URL` 时，sitemap 和 canonical 使用 `http://localhost:4321`。
- 分享图的中文字体是 Noto Sans SC 子集。新内容用到子集里没有的字时构建会失败，运行 `npm run og:fonts` 重新生成，说明见 [site/src/assets/og/README.md](site/src/assets/og/README.md)。

## 部署

推送到 `main` 会触发 Cloudflare Pages 生产部署。Pages 配置：Root directory `site`，构建命令 `npm run build`，输出目录 `dist`，环境变量 `NODE_VERSION=24` 和 `SITE_URL=https://blog-4cr.pages.dev`。

改动都走分支和 PR，CI 通过后再合并。需要回退时用 `git revert`，或在 Pages 里重新部署已验证的提交，不强制推送。

## 文档

- [重构方案与进度](docs/refactor-plan.md)：当前的技术方案，以及之后每次改动的记录。
- [内容清单](docs/content-inventory.md)：已发布内容的来源和审查状态。
- [脱敏审查记录](docs/privacy-review.md)：每批内容公开前的隐私和授权检查。
- [发布检查清单](docs/release-checklist.md)

首版（模板阶段，2026 年 8 月底至 9 月）的记录：[建设与执行手册](docs/个人博客首版建设与执行手册-优化版.md)、[早期建议方案](docs/个人博客建设建议方案.md)、[任务清单](docs/project-task-list.md)、[执行记录](docs/execution-log.md)、[Lighthouse 报告](docs/reports/lighthouse/README.md)。

## 许可证

代码和文档按 [MIT 许可证](LICENSE) 发布，以下内容除外：

- `site/src/content/` 下的文章、笔记、项目介绍、简历和履历，以及 `site/public/images/` 下的配图：作者保留所有权利，转载请先联系作者。
- `site/src/assets/og/` 下的 Noto Sans SC 字体子集：按 [SIL Open Font License 1.1](site/src/assets/og/OFL.txt) 授权。
