# 个人博客

中文内容为主的个人博客，Astro 7 静态站，部署在 Cloudflare Pages。站点骨架和流程已上线，内容正在分批换成真实内容：项目、简历、履历、个人介绍、学习笔记和技术文档已替换；演示视频还没有，栏目先用开关隐藏（见下文“栏目开关”）。进度和每批的审查记录见 `docs/content-inventory.md`、`docs/privacy-review.md`。

## 目录约定

- `site/` — Astro 站点，**所有 npm 命令都从这里跑**，不在仓库根跑。
- `docs/` — 公开的规划、执行、发布文档，是项目的事实来源。
- `agent/` — 流程记录与可复用经验，不纳入交付。
- `private/` — 本地私有资料（如简历原件），已加入 `.gitignore`，不提交。网站内容只能从这里提取用户同意公开的信息。

`site/CLAUDE.md` 和 `site/AGENTS.md` 是 Astro 脚手架自动生成的样板，只有通用文档链接，本文件优先。

## 命令

```bash
cd site
npm ci
npm run dev        # astro dev
npm run check      # astro check，类型与内容校验
npm run build      # 生产构建，结束后用 Pagefind 生成搜索索引
npm run test:e2e   # Playwright，会用生产构建并自动起 preview
npm run og:fonts   # 重新生成分享图字体子集，构建报“分享图字体缺字”时用
```

需要 Node.js >= 22.12.0，本机、CI 和 Pages 统一用 Node 24。CI（`.github/workflows/ci.yml`）在 push 到 `main` 和 PR 上跑 `check` → `build` → `test:e2e`，改完代码本地至少过一遍这三步再说完成。

- 搜索索引只在 `build` 时生成，`astro dev` 下搜索面板搜不到正文；调搜索要先 build，再 `npm run preview`。
- Pagefind 建索引和浏览器端切分查询（`Intl.Segmenter`）用的分词不同，“镜像”“调试”这类词会被浏览器切成单字，直接搜搜不到。`SearchPalette.astro` 对这类查询按原文子串补充匹配，原文里出现查询词的页面排在前面；其余查询仍按 Pagefind 的排序。
- 在 Claude 内置浏览器里测页内锚点跳转不可靠：面板在后台时不刷新画面，平滑滚动不会推进，看起来像“点了不跳”。以 Playwright 的结果为准。
- 改了 Markdown 渲染相关的配置（如 `astro.config.mjs` 里的 Expressive Code）后，先删 `site/node_modules/.astro` 再 build，否则会沿用缓存里的旧渲染结果。
- `package.json` 的 `overrides` 把 satori 锁定的 `fflate` 从 0.7.3 升到修复版 0.7.5，以消除 `npm audit` 告警。升级 satori 时看它是否已自带修复版，是的话删掉这条。

## 内容模型

七个 collection 定义在 `site/src/content.config.ts`，全部用 zod 严格校验，加内容时字段不全会直接构建失败。前五个是 `src/content/<名称>/` 下的 Markdown，后两个是单个 YAML 文件：

| collection | 必填字段要点 |
| --- | --- |
| `blog` | `title` `description` `publishDate` `tags`（1-5 个） |
| `projects` | `title` `summary` `role` `techStack` `status`（进行中/已完成/维护中） |
| `docs` | `title` `summary` `version` `updatedDate` `source` |
| `videos` | `title` `summary` `projectSlug` `platform`（Bilibili/YouTube/其他）`videoUrl` |
| `downloads` | `title` `summary` `version` `updatedDate` `fileType` `fileSize` `downloadUrl` |
| `timeline`（`src/content/timeline.yaml`） | `id` `order` `period` `type` `title` `description` `result` |
| `resume`（`src/content/resume.yaml`） | `id` `order` `title`，`content`（一段话）和 `items`（条目列表）至少填一项 |

每个 collection 都有 `template` 字段，默认 `true`，用来标记模板占位内容。换成真实内容时要显式设 `false`。各页面只在确实显示了模板条目时才出“模板内容”提示。

`blog` 和 `docs` 还有 `aiAssisted`（默认 `false`）：设为 `true` 时，页面底部和下载的 Markdown 里都会注明“本文由作者整理，AI 辅助润色”。用户的学习笔记都是 AI 辅助整理的，发布时要设为 `true`。

文章和文档页都能下载 Markdown 原文：`src/pages/blog/[slug].md.ts`、`src/pages/docs/[slug].md.ts` 在构建时生成 `/blog/<slug>.md`、`/docs/<slug>.md`，导出逻辑在 `src/lib/markdown-export.ts`；下载页自动列出全部文章和文档。`downloads` collection 只放另外提供的独立文件，可以为空。PDF 由访客用浏览器打印另存，打印样式在 `global.css` 末尾，打印前会临时切到浅色主题。文章配图放在 `public/images/blog/<文章 slug>/`，正文里用 `/images/...` 绝对路径引用，导出时会换成完整网址。

读内容时优先用 `site/src/lib/content.ts`：`getPublishedPosts()` 取非草稿文章并按日期倒序，`collectContent()` 把五类 Markdown 内容整理成统一结构。内容类型的显示名称在 `site/src/lib/kinds.ts`。

文章和项目详情页底部的“相关内容”在构建时按共同标签计算（`src/lib/related.ts`，项目的技术栈当标签用），所以标签和技术栈的写法要统一，比如都写 `FastAPI`；没有共同标签就不显示。

### 栏目开关

`site/src/data/site.ts` 的 `features.videos` 控制视频栏目，目前是 `false`：导航、首页星图和搜索面板里都没有视频，`/video/` 不生成。用户做好演示视频后再开启，步骤见 `docs/content-inventory.md` D 节。e2e 用例按这个开关断言对应的状态，切换开关不用改测试。

### 分享图

构建时 `src/pages/og/[...path].png.ts` 给每篇文章、每个项目、每份文档生成一张 1200×630 的 PNG（`/og/blog/<slug>.png` 等），其余页面共用 `/og/site.png`；路径约定在 `src/lib/og.ts`，版式在 `src/lib/og-render.ts`（satori 排版，sharp 转 PNG）。中文字体是 `src/assets/og/` 下的 Noto Sans SC 子集，覆盖 GB2312 全部汉字和现有内容用到的字。新内容的标题、摘要或标签用了子集里没有的字时，构建会失败并提示；在 `site/` 下运行 `npm run og:fonts` 重新生成后再 build（脚本默认读 Windows 已安装的 Noto Sans SC，说明见同目录的 `README.md`）。

## 硬性约束

- **未获得用户当次明确授权，不执行 `git commit` 或 `git push`。** 每次都要单独确认，上一次的授权不延续到下一次。
- 推送到 `main` 会直接触发 Cloudflare Pages 生产部署，没有中间环节。所以改动一律建分支、提 PR，CI 通过且用户确认后由用户合并，不直接推 `main`。私有仓库在免费方案下无法开启分支保护，这条靠流程遵守。
- 不对公开历史强制推送。需要回退用 `git revert`，或在 Pages 里对已验证的提交重新部署。
- 发布前先更新 `docs/content-inventory.md`，并完成隐私、授权、链接检查。流程见 `docs/release-checklist.md`。

## 部署

生产地址 https://blog-4cr.pages.dev 。Pages 配置：生产分支 `main`，Root directory `site`，Build command `npm run build`，输出 `dist`，环境变量 `NODE_VERSION=24` 和 `SITE_URL=https://blog-4cr.pages.dev`。

本地未设 `SITE_URL` 时，sitemap 和 canonical 回退到 `http://localhost:4321`。

## 本机环境

Windows，装有安全闸门（Claude Isolated Guard）。所有流量都经闸门代理 `127.0.0.1:17890`，bash 子进程的 `HTTP(S)_PROXY` 默认已指向它，npm、git、gh、curl 直接用即可。**不要手动改用其他代理（包括系统代理 `7897`），不要添加直连绕过，不要关闭防护。**

本地跑 e2e 时，Playwright 启动的浏览器要显式走闸门代理，只靠环境变量不够：

```bash
cd site
PLAYWRIGHT_PROXY=http://127.0.0.1:17890 npm run test:e2e
```

PowerShell 下写成 `$env:PLAYWRIGHT_PROXY='http://127.0.0.1:17890'; npm run test:e2e`。本地服务只用 `127.0.0.1` 或 `localhost` 和白名单里的端口：e2e 测试用 4321；在 Claude 内置浏览器里手动预览用 9999（内置浏览器只放行这个端口）。起服务前先确认端口空闲，用完立即停掉。

闸门按浏览器可执行文件的完整路径审计，即 `%LOCALAPPDATA%\ms-playwright\` 下的 `chromium-<版本>\chrome-win64\chrome.exe` 和 `chromium_headless_shell-<版本>\chrome-headless-shell-win64\chrome-headless-shell.exe`，不是整个目录放行。升级 `@playwright/test` 时如果浏览器版本变了，顺序是：退出相关会话和浏览器 → 升级 → 闸门发现新路径、部署规则并审计通过 → 从专线入口重启后再用。不要在旧会话里直接启动新浏览器"试试看"，也不要通过整目录放行、关闭防护或改用普通代理来解决。
