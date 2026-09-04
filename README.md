# 个人博客

这是一个以中文内容为主的个人博客项目，用于公开展示学习笔记、技术文档、个人工程实践项目、Demo、演示视频和可下载资料。

当前处于 **Stage 1：仓库与 Astro 基线已完成，等待人工闸门确认**。尚未执行 Git 提交或推送，也未创建 Cloudflare Pages 项目。

目标远端仓库：`https://github.com/Zhou-Jin-Feng/Blog.git`（本地 `origin` 已配置，仓库保持私有）。

## 文档入口

- [个人博客首版建设与执行手册-优化版](docs/个人博客首版建设与执行手册-优化版.md)：当前执行依据，推荐路线和阶段闸门仍需按记录确认。
- [个人博客建设建议方案](docs/个人博客建设建议方案.md)：早期方案参考，不自动覆盖优化版中的最新决策表。
- [项目任务清单](docs/project-task-list.md)：阶段任务、状态和闸门。
- [执行记录](docs/execution-log.md)：命令证据、决策和人工确认。
- [内容清单](docs/content-inventory.md)：首发内容准备和公开审查。
- [发布检查清单](docs/release-checklist.md)：预发布与正式发布检查。
- [公开内容与脱敏审查](docs/privacy-review.md)：当前基线结果与真实内容替换后的阻塞检查。

## 计划路线

按手册顺序推进：

1. Stage 1：仓库与 Astro 基线。
2. Stage 2：内容模型与 P0 页面。
3. Stage 3：视觉、媒体、响应式与无障碍。
4. Stage 4：质量、安全与预发布。
5. Stage 5：正式发布、回滚与维护交接。

## 本地开发与验证

需要 Node.js 22.12.0 或更高的偶数版本。命令均从 `site/` 目录运行：

```powershell
npm ci
npm run dev
npm run check
npm run build
npm run test:e2e
```

Playwright 测试会使用生产构建并自动启动本地预览。Sitemap 仅在构建环境提供真实的
`SITE_URL` 后生成，避免在部署地址确定前写入错误的 canonical URL。

## 部署入口

计划使用 GitHub 私有仓库连接 Cloudflare Pages，生产分支为 `main`，Root directory
为 `site`，Build command 为 `npm run build`，Build output directory 为 `dist`。
首次部署和 `SITE_URL` 配置属于 Stage 4，当前尚未创建 Pages 项目。

## 说明

`docs/` 保存公开的项目规划、执行和发布文档；`agent/` 保存不纳入项目交付的流程记录与可复用经验。未获得用户当次明确授权，不执行 `git commit` 或 `git push`。
