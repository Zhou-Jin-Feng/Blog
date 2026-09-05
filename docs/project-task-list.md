# 个人博客项目任务清单

更新时间：2026-09-05

## 当前状态

- 当前阶段：Stage 5 已完成，进入模板工程版维护期
- 当前状态：模板工程版已上线并通过最终人工闸门；真实内容替换与最终公开审查后置
- Stage 0 闸门：PASS（用户于 2026-09-04 明确授权进入 Stage 1）
- Stage 1 闸门：PASS（用户已授权进入 Stage 2）
- Stage 2 闸门：PASS WITH NOTES（用户已确认保持模板并进入 Stage 3）
- Stage 3 闸门：PASS WITH NOTES（用户已确认保持当前 UI 并进入 Stage 4）
- Stage 4 闸门：PASS WITH NOTES（用户于 2026-09-04 明确要求先用模板，真实内容后置）
- Stage 5 闸门：PASS WITH NOTES（用户于 2026-09-05 完成 2FA 后确认继续）

## 总体路线

| 阶段 | 目标 | 核心产物 | 当前状态 | 闸门 |
| --- | --- | --- | --- | --- |
| 0 | 决策、环境、内容和隐私准备 | 决策记录、内容清单、环境检查结果 | PASS | 已通过人工确认 |
| 1 | 初始化仓库和 Astro 基线 | 可运行、可检查、可构建的站点骨架 | PASS | 用户已确认进入 Stage 2 |
| 2 | 内容模型与 P0 页面 | 内容模型、模板内容和全部首发路由 | PASS WITH NOTES | 用户已确认进入 Stage 3 |
| 3 | 视觉、媒体、响应式与无障碍 | 可公开展示的界面 | PASS WITH NOTES | 用户已确认进入 Stage 4 |
| 4 | 质量、安全与预发布 | 可重复构建、本地质量与安全证据 | PASS WITH NOTES | 用户接受模板范围和真实内容延期风险 |
| 5 | 正式发布、回滚与维护 | 正式地址、线上证据、备份和交接记录 | PASS WITH NOTES | 已通过人工确认 |

## Stage 0 任务

- [x] S0-00 建立 `docs/` 文档目录和执行记录文件。
- [x] S0-01 确认 D-01 至 D-07；静态路线、Git + Markdown、私有仓库、pages.dev、公开邮箱、简历范围和独立域名后置均已确认。
- [x] S0-02 检查工作目录、Git、Node.js 和 npm，并核对 Astro 官方 Node.js 前置条件。
- [x] S0-03 验证用户指定的 GitHub 远端 `https://github.com/Zhou-Jin-Feng/Blog.git`。
  - [x] 远端访问成功，当前无返回引用。
  - [x] 仓库可见性已确认设为私有。
  - [x] 当前账号经 GitHub CLI 和仓库 API 验证具有 ADMIN 与 push 权限。
- [x] S0-04 建立首发内容清单模板。
- [x] S0-04 用户确认开发阶段使用模板，真实内容移至完工后的预发布检查。
- [x] S0-05 完成当前项目文档和模板的敏感信息扫描及脱敏。
- [x] 汇总 Stage 0 证据。
- [x] 用户确认 Stage 0 闸门（2026-09-04）。

## Stage 1 任务

- [x] S1-01 初始化根 Git、main 分支并配置 `origin`。
- [x] S1-02 创建 Astro Minimal + TypeScript Strict 项目并安装依赖。
- [x] S1-03 补齐根 README、忽略规则、CI、Playwright 配置和稳定脚本。
- [x] S1-04 完成本地开发运行、`npm run check`、`npm run build` 和 Playwright 冒烟测试验证。
- [x] 汇总 Stage 1 证据并通过用户人工闸门。

## Stage 2 任务

- [x] S2-01 固定信息架构并实现主导航及 P0 路由。
- [x] S2-02 使用 Astro Content Collections API 建立 blog、projects、docs、videos、downloads 字段校验。
- [x] S2-03 完成首页、列表页、详情页、简历、履历、关于、404、RSS、Sitemap、robots 和下载资源。
- [x] S2-04 按用户决定使用明确标注的模板内容；真实内容替换最初移至 Stage 4，后由 D-08 改为工程完工后处理。
- [x] S2-05 完成首页精选内容、模板提示、响应式基础布局和内部导航。
- [x] S2-06 运行 `npm run check`、`npm run build` 和 Playwright Stage 2 回归测试。
- [x] 汇总 Stage 2 证据，更新执行记录和项目经验记录。

## Stage 3 任务

- [x] S3-01 建立统一视觉层，包括品牌标记、当前导航态、颜色层级、标题体系、按钮、卡片和页脚。
- [x] S3-02 完成 360 x 800、768 x 1024、1440 x 900 三种视口的响应式布局与溢出检查。
- [x] S3-03 为视频模板加入固定 16:9 预览占位，并保持下载和外链信息可读；真实媒体和授权审查按 D-08 后置到工程完工后。
- [x] S3-04 完成跳到主要内容、唯一 H1、连续标题层级、键盘焦点、当前导航态和 reduced-motion 支持。
- [x] S3-05 运行 `npm run check`、`npm run build` 和 Stage 3 Playwright 回归测试。
- [x] 汇总 Stage 3 证据并更新执行记录和项目经验记录。

## Stage 4 任务

- [x] S4-00 按用户 2026-09-04 的范围变更，先使用模板完成 Stage 4 工程验证；真实内容替换、脱敏、授权和本人贡献复核后置，并记录为 PASS WITH NOTES。
- [x] S4-01 执行 `npm ci`、`npm run check`、`npm run build`，并确认 `dist` 产物完整。
- [x] S4-02 使用生产预览运行 Playwright，12 项全部通过。
- [x] S4-03 扫描模板和项目文件中的凭据模式及高风险文件名；真实内容扫描在后续替换时执行。
- [x] S4-04 添加 Cloudflare Pages 基础 `_headers`，并确认构建后复制到 `site/dist/_headers`。
- [x] S4-05 已准备模板范围的本地提交版本 `000365d`；推送和部署仍需单独授权。
- [x] S4-06 范围移交：Cloudflare Pages 项目和真实 `pages.dev` 地址改由 S5-02 执行，现已完成。
- [x] S4-07 范围移交：线上 HTTPS、路由、资源、SEO 和安全响应头检查改由 S5-03 执行，现已完成。
- [x] S4-08 范围移交：Lighthouse 质量基线改由 S5-04 执行，现已完成。
- [x] 汇总 Stage 4 当前证据、风险和阻塞原因。

## Stage 5 任务

- [x] S5-00 记录模板工程版范围变更、Stage 4 PASS WITH NOTES 和真实内容后置风险。
- [x] S5-01 已将 `b442f34` 提交并推送到 GitHub `main`，远端引用一致，`Site CI` 运行 `33876048959` 成功。
- [x] S5-02 已创建 Cloudflare Pages 项目 `blog`，设置 `SITE_URL` 并取得 `https://blog-4cr.pages.dev`。
- [x] S5-03 已验证 HTTPS、P0 路由、下载、RSS、Sitemap、canonical、安全响应头和构建日志。
- [x] S5-04 已执行首页、文章详情和项目详情的移动端 Lighthouse 检查并保存 JSON 与摘要。
- [x] S5-05 已创建仓库外 `Blog-backup-20260904-212452.bundle`，并通过 `git bundle verify` 确认完整历史和 HEAD `b442f34`。
- [x] S5-06 已对已验证提交 `b442f34` 执行 Cloudflare 重新部署；新部署 `73a307ce-f55e-43ce-a111-5c67a3d33dbf` 成功，生产内容未变化。
- [x] S5-07 已更新维护交接和最终闸门记录。
- [x] GitHub 与 Cloudflare 均已启用 2FA；Cloudflare TOTP 已由页面状态验证，GitHub 由用户明确确认。用户随后确认 Stage 5 最终闸门。
- [ ] 后置内容任务：工程完工后替换真实内容，完成最终脱敏、授权和本人贡献复核，再复跑发布检查。

## 已后置的真实内容任务

- [ ] 将模板替换为达到最低数量的真实首发内容（用户明确要求在工程完工后处理）。
- [ ] 由 Codex 对真实内容完成敏感信息、隐私、元数据和授权审查（不因本次模板范围放行而视为完成）。

## 当前操作边界

用户已接受模板用于当前工程推进，但模板不得冒充真实经历或真实首发资料。用户已于 2026-09-04 明确授权开始 Stage 5；`b442f34` 的提交与推送已完成。用户随后要求“做完 Stage 5 先不要 commit 和 push”，因此后续变更只保留在本地，不再产生新的提交或推送。真实内容最终审查完成前，不得宣称真实内容版通过最终验收。

## 下一步

Stage 5 自动检查、Pages 发布、重新部署演练、账号 2FA 和最终人工闸门均已完成，最终结论为 PASS WITH NOTES。保留说明：Lighthouse 可访问性为 96，存在颜色对比度、品牌链接可访问名称和文章详情双 H1 问题；模板视频外链和私有 GitHub 链接对访客返回 404；HSTS 未返回；Node 22 已进入维护期；CSP 尚未按真实来源收紧；真实内容与最终公开审查继续后置。模板工程版进入维护期，后续不得执行未经明确授权的新提交或推送。
