# 个人博客

中文内容为主的个人博客，Astro 7 静态站，部署在 Cloudflare Pages。当前是**模板工程版**：站点骨架和流程已跑通并上线，内容还是模板占位，真实内容替换、脱敏和授权复核按用户决定后置。

## 目录约定

- `site/` — Astro 站点，**所有 npm 命令都从这里跑**，不在仓库根跑。
- `docs/` — 公开的规划、执行、发布文档，是项目的事实来源。
- `agent/` — 流程记录与可复用经验，不纳入交付。

`site/CLAUDE.md` 和 `site/AGENTS.md` 是 Astro 脚手架自动生成的样板，只有通用文档链接，本文件优先。

## 命令

```bash
cd site
npm ci
npm run dev        # astro dev
npm run check      # astro check，类型与内容校验
npm run build      # 生产构建，结束后用 Pagefind 生成搜索索引
npm run test:e2e   # Playwright，会用生产构建并自动起 preview
```

需要 Node.js >= 22.12.0。CI（`.github/workflows/ci.yml`）在 push 到 `main` 和 PR 上跑 `check` → `build` → `test:e2e`，改完代码本地至少过一遍这三步再说完成。

- 搜索索引只在 `build` 时生成，`astro dev` 下搜索面板搜不到正文；调搜索要先 build，再 `npm run preview`。
- 改了 Markdown 渲染相关的配置（如 `astro.config.mjs` 里的 Expressive Code）后，先删 `site/node_modules/.astro` 再 build，否则会沿用缓存里的旧渲染结果。

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
| `resume`（`src/content/resume.yaml`） | `id` `order` `title` `content` |

每个 collection 都有 `template` 字段，默认 `true`，用来标记模板占位内容。换成真实内容时要显式设 `false`。

读内容时优先用 `site/src/lib/content.ts`：`getPublishedPosts()` 取非草稿文章并按日期倒序，`collectContent()` 把五类 Markdown 内容整理成统一结构。内容类型的显示名称在 `site/src/lib/kinds.ts`。

## 硬性约束

- **未获得用户当次明确授权，不执行 `git commit` 或 `git push`。** 每次都要单独确认，上一次的授权不延续到下一次。
- 推送到 `main` 会直接触发 Cloudflare Pages 生产部署，没有中间环节。所以改动一律建分支、提 PR，CI 通过且用户确认后由用户合并，不直接推 `main`。私有仓库在免费方案下无法开启分支保护，这条靠流程遵守。
- 不对公开历史强制推送。需要回退用 `git revert`，或在 Pages 里对已验证的提交重新部署。
- 发布前先更新 `docs/content-inventory.md`，并完成隐私、授权、链接检查。流程见 `docs/release-checklist.md`。

## 部署

生产地址 https://blog-4cr.pages.dev 。Pages 配置：生产分支 `main`，Root directory `site`，Build command `npm run build`，输出 `dist`，环境变量 `NODE_VERSION=22` 和 `SITE_URL=https://blog-4cr.pages.dev`。

本地未设 `SITE_URL` 时，sitemap 和 canonical 回退到 `http://localhost:4321`。

## 本机环境

Windows，系统代理 `127.0.0.1:7897` **不会传给 bash 子进程**。需要出海的命令先在同一条命令里导出：

```bash
export HTTPS_PROXY=http://127.0.0.1:7897 HTTP_PROXY=http://127.0.0.1:7897 NO_PROXY=localhost,127.0.0.1
```
