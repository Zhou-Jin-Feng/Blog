# Stage 5 Lighthouse 摘要

- 执行日期：2026-09-05
- Lighthouse：13.4.1
- 目标环境：`https://blog-4cr.pages.dev`，移动端 393 x 852

| 页面 | 报告 | 性能 | 可访问性 | 最佳实践 | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| 首页 | `home.json` | 100 | 96 | 100 | 100 |
| 文章详情 | `blog-template-architecture.json` | 99 | 96 | 100 | 100 |
| 项目详情 | `project-template-rag.json` | 100 | 96 | 100 | 100 |

## 说明

- 三份报告均指出部分前景色与背景色对比度不足，以及品牌链接的可见文字与可访问名称不完全匹配。
- 独立 HTML 检查确认文章详情页存在两个 H1；首页和项目详情页各一个 H1。
- Playwright 移动端复核未发现横向溢出、console error 或 pageerror。
- Lighthouse CLI 在保存完整 JSON 后清理临时 Chrome 目录时出现 `EPERM`；三份 JSON 均可解析，版本、分类得分和审计明细完整，因此不影响报告有效性。
- 用户要求 Stage 5 完成后先不要提交和推送，本轮只记录问题，不修改并发布新的前端版本。这些问题进入后续 UI 修订。
