---
title: "个人工程实践手记：Astro 纯静态技术博客"
summary: "记录学习笔记、技术文档与工程实践的中文技术博客，纯静态输出，带全文搜索、内容星图、OG 分享图与端到端测试。"
role: "个人项目，独立完成需求规划、架构设计、前端重塑、构建管线与全流程测试。"
techStack: ["Astro", "TypeScript", "Pagefind", "Playwright", "Cloudflare Pages", "CSS"]
status: "已完成"
period: "2026.09.04 - 2026.10.07"
repoUrl: "https://github.com/Zhou-Jin-Feng/Blog"
demoUrl: "https://blog-4cr.pages.dev"
featured: false
template: false
---

## 背景与目标

为了沉淀和展示平时的学习笔记、技术文档和工程实践项目，构建了这一中文技术博客。核心理念是保持纯静态交付、零服务器运维成本、所有文章均可下载 Markdown 原文及友好的打印排版，并在首屏提供内容关系星图直观展示知识网络。

采用 Astro 7 纯静态输出，部署在 Cloudflare Pages 上，严格区分框架轮子与自研特色功能。

## 主要工作

- **内容体系与严格校验**：通过 Astro Content Collections 定义并严格校验 7 个集合（博客、项目、文档、视频、下载、时间线、简历），所有学习笔记均标记 AI 辅助润色，保证真实与透明。
- **双模站内搜索**：构建期利用 Pagefind 扫描静态产物并生成多语言中文分词索引；前端自研 `SearchPalette`（支持快捷键 `Ctrl+K`），针对中文单字/短词补充子串优先匹配，兼顾速度与准确度。
- **首页星图与视觉呈现**：构建期使用 `d3-force` 算法预先求解力导向星图布局；浏览器端实现平滑阻尼交互、精灵图贴图与基于动态字号的防遮挡碰撞规避算法；代码块使用 Expressive Code，主题无缝同步站点深浅色模式。
- **自动化流水线与测试保障**：构建期通过 `satori` + `sharp` 为每个页面自动生成 1200×630 分享图并动态抽取汉字子集；全流程编写 Playwright E2E 自动化测试；配置 GitHub Actions CI 并通过 Cloudflare Pages 自动部署。

## 评测与取舍

遵循“成熟通用的用轮子，体现辨识度的自己做，轮子尽量放在构建期运行”的原则：搜索索引、星图布局和 OG 生成全部在构建期完成，最大化削减访客端 JavaScript 体积。

移动端经 Lighthouse 评估获得接近满分的高性能、无障碍与最佳实践评分，首屏加载快速且交互流畅。

## 当前状态

2026 年 9 月 4 日首次提交完成 Stage 1 基线，至 2026 年 10 月 7 日完成全量脱敏并公开开源。代码见 [GitHub 仓库](https://github.com/Zhou-Jin-Feng/Blog)，线上演示见 [blog-4cr.pages.dev](https://blog-4cr.pages.dev)。