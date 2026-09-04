# 个人博客

这是一个以中文内容为主的个人博客项目，用于公开展示学习笔记、技术文档、个人工程实践项目、Demo、演示视频和可下载资料。

当前处于 **Stage 5：模板工程版发布、回滚与维护收尾**。Stage 4 已按用户决定以 PASS WITH NOTES 通过；真实内容替换、最终脱敏和授权复核后置，尚未创建 Cloudflare Pages 项目。

目标远端仓库：`https://github.com/Zhou-Jin-Feng/Blog.git`（本地 `origin` 已配置，仓库保持私有）。

## 文档入口

- [个人博客首版建设与执行手册-优化版](docs/个人博客首版建设与执行手册-优化版.md)：当前执行依据，推荐路线和阶段闸门仍需按记录确认。
- [个人博客建设建议方案](docs/个人博客建设建议方案.md)：早期方案参考，不自动覆盖优化版中的最新决策表。
- [项目任务清单](docs/project-task-list.md)：阶段任务、状态和闸门。
- [执行记录](docs/execution-log.md)：命令证据、决策和人工确认。
- [内容清单](docs/content-inventory.md)：首发内容准备和公开审查。
- [发布检查清单](docs/release-checklist.md)：预发布与正式发布检查。
- [公开内容与脱敏审查](docs/privacy-review.md)：当前模板基线结果与真实内容替换后的强制检查。

## 计划路线

按手册顺序推进：

1. Stage 0：决策、环境、内容和隐私准备（已通过）。
2. Stage 1：仓库与 Astro 基线（已通过）。
3. Stage 2：内容模型与 P0 页面（已通过，模板内容保留）。
4. Stage 3：视觉、媒体、响应式与无障碍（已通过，保留模板）。
5. Stage 4：质量、安全与预发布（模板范围 PASS WITH NOTES）。
6. Stage 5：正式发布、回滚与维护交接（当前）。

## 本地开发与验证

需要 Node.js 22.12.0 或更高的偶数版本。命令均从 `site/` 目录运行：

```powershell
npm ci
npm run dev
npm run check
npm run build
npm run test:e2e
```

Playwright 测试会使用生产构建并自动启动本地预览。未设置 `SITE_URL` 时，Sitemap 和
canonical 使用 `http://localhost:4321` 回退地址；部署前必须设置真实的 pages.dev 地址。

## 部署入口

计划使用 GitHub 私有仓库连接 Cloudflare Pages，生产分支为 `main`，Root directory
为 `site`，Build command 为 `npm run build`，Build output directory 为 `dist`。
首次部署和 `SITE_URL` 配置已移交 Stage 5，当前尚未创建 Pages 项目。用户已明确允许先以模板推进工程完工；真实内容替换和最终审查仍需在最终公开内容前完成。

## 说明

`docs/` 保存公开的项目规划、执行和发布文档；`agent/` 保存不纳入项目交付的流程记录与可复用经验。未获得用户当次明确授权，不执行 `git commit` 或 `git push`。
