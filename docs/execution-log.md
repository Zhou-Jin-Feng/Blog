# 项目执行记录

本文件只记录可复核的项目事实、命令结果、风险和人工确认，不记录凭据、令牌、密码或其他敏感信息。

## Stage 0 - 执行前确认

- 状态：PASS
- 开始时间：2026-09-03
- 完成时间：2026-09-04
- 执行人：Codex
- Git 提交：未提交（Stage 0 执行时尚未初始化 Git）
- 部署地址：无

### 已执行任务

- [x] 阅读 `docs/个人博客首版建设与执行手册-优化版.md` 全文。
- [x] 对照早期参考文档，确认优化版为当前执行参考。
- [x] 创建 `docs/` 并归档项目目录下的两份手册。
- [x] 创建根 `README.md`、`.gitignore` 和 Stage 0 记录文件。
- [x] S0-02 检查本地环境。
- [x] S0-03 验证 GitHub 远端访问和权限。
  - [x] 远端访问成功，当前无返回引用。
  - [x] 仓库可见性已确认设为私有。
  - [x] 当前账号具有 ADMIN 与 push 权限。
- [x] S0-01 确认 D-01 至 D-07。
- [x] S0-04 建立首发内容清单模板。
- [x] S0-04 记录用户批准的模板占位和真实内容延期策略。
- [x] S0-05 完成当前项目文档和模板的公开内容基线审查与脱敏。
- [x] 汇总 Stage 0 决策和验证证据。
- [x] 用户确认 Stage 0 闸门（2026-09-04：“Stage 0 通过，进入 Stage 1”，授权继续）。

### 验证证据

#### 文档阅读与归档

- 优化版手册状态：Stage 0 已于 2026-09-04 通过人工闸门。
- 优化版要求：Stage 0 通过前不初始化 Astro、不提交、不推送、不创建 Cloudflare Pages 项目。
- 归档后文件：`docs/个人博客建设建议方案.md`、`docs/个人博客首版建设与执行手册-优化版.md`。
- 用户已确认项目目标远端仓库为 `https://github.com/Zhou-Jin-Feng/Blog.git`；本地 `origin` 已在 Stage 1 配置。

#### S0-02 本地环境

```text
工作目录：已核对（公开记录中已脱敏）
Git：git version 2.55.0.windows.2
Node.js：v24.18.0
npm：11.16.0
```

官方核对（2026-09-03，Stage 1 于 2026-09-04 复核）：Astro 安装文档和 Astro 7.3.1 的 npm engine 均要求 Node.js v22.12.0 或更高版本；安装文档不支持奇数版本。当前 v24.18.0 满足要求。来源：https://docs.astro.build/en/install-and-setup/ 。

#### S0-03 GitHub 远端访问

```text
命令：git ls-remote https://github.com/Zhou-Jin-Feng/Blog.git
退出码：0
返回引用：无
```

解释：命令成功退出且无引用，符合仓库可访问、当前看起来为空的结果；仓库可见性已由用户确认私有。

用户补充：该 URL 是计划存放本项目的私有仓库。Stage 1 配置时使用纯 URL，不使用 Markdown 链接语法：

```powershell
git remote add origin 'https://github.com/Zhou-Jin-Feng/Blog.git'
```

GitHub CLI 显示当前登录账号为 `Zhou-Jin-Feng`；`gh repo view` 返回
`visibility=PRIVATE`、`isEmpty=true`、`viewerPermission=ADMIN`，仓库 API 返回
`permissions.push=true` 与 `permissions.admin=true`。推送权限验证通过，且未向远端写入测试提交。

Stage 0 未执行上述命令；Stage 1 已按批准路线完成配置。

#### S0-04 模板占位策略

- `docs/content-inventory.md` 已覆盖博客文章、个人工程实践项目、技术文档、演示视频、下载文件、个人介绍、简历和履历八类内容。
- 用户确认开发阶段暂不替换真实内容，在网站完工后再替换。
- 真实内容最低数量和最终审查移动到 Stage 4，作为公开预览与正式发布的阻塞条件。

#### S0-05 当前基线脱敏

- 密钥值模式：无命中。
- 手机号、身份证号：无命中。
- 高风险凭据文件：无命中。
- 邮箱：仅命中用户明确授权公开的 `2644897763@qq.com`。
- 本机绝对路径：发现后已全部替换为 `<项目根目录>`，复扫无命中。
- 详细记录：`docs/privacy-review.md`。

### D-01 至 D-07 决策记录

| 决策 | 推荐值 | 当前状态 | 用户决定 | 理由/备注 |
| --- | --- | --- | --- | --- |
| D-01 托管路线 | Astro + GitHub + Cloudflare Pages | 已确认 | 用户确认 | Linux 不作为首版依赖 |
| D-02 首版管理方式 | Git + Markdown，不做管理后台 | 已确认 | 用户确认 | 管理面板进入 V2 |
| D-03 仓库可见性 | 私有 | 已确认 | 用户确认 | 上线前完成内容审查 |
| D-04 首发地址 | 先使用 pages.dev | 已确认 | 用户确认 | 自定义域名后置 |
| D-05 联系方式 | 2644897763@qq.com | 已确认 | 用户确认 | 作为公开联系方式 |
| D-06 简历范围 | 网页摘要 + 脱敏 PDF | 已确认 | 用户确认 | PDF 必须单独检查敏感信息 |
| D-07 独立域名 | 首版不购买，后续再绑定 | 已确认（后置） | 用户确认 | 不阻塞首发 |

### 偏差与风险

- 与手册的目录示例存在差异：按用户明确要求，两份已有手册均归档至 `docs/`，根目录保留 `README.md` 作为项目入口。
- Stage 0 按闸门要求未初始化 Git；用户确认后已在 Stage 1 完成初始化。
- 用户已接受模板占位作为开发基线；真实内容替换及最终脱敏延至 Stage 4，但会阻塞公开预览和正式发布。
- Node.js 当前满足 2026-09-04 复核的 Astro 7.3.1 前置条件。

### 下一阶段

- 是否允许进入：是，用户已明确授权进入 Stage 1。
- 待处理事项：按 Stage 1 顺序初始化 Git、创建 Astro 基线并完成本地验证；真实内容替换和最终脱敏已列入 Stage 4 阻塞项。

## Stage 1 - 仓库与 Astro 基线

- 状态：PASS，等待用户人工闸门确认
- 开始时间：2026-09-04
- 完成时间：2026-09-04 15:21（Asia/Shanghai）
- 执行人：Codex
- Git 提交：尚未提交
- 部署地址：无

### 已执行任务

- [x] S1-01 初始化 Git 并配置远端。
- [x] S1-02 创建 Astro Minimal + TypeScript Strict 项目并安装首版依赖。
- [x] S1-03 建立 CI、Playwright 和稳定 npm 脚本。
- [x] S1-04 验证本地运行、检查、生产构建和冒烟测试。
- [x] 汇总 Stage 1 证据并等待用户闸门确认。

### S1-01 验证证据

```text
命令：git init; git branch -M main; git remote add origin https://github.com/Zhou-Jin-Feng/Blog.git
仓库根目录：<项目根目录>
当前分支：main
origin fetch：https://github.com/Zhou-Jin-Feng/Blog.git
origin push：https://github.com/Zhou-Jin-Feng/Blog.git
提交/推送：均未执行
```

### S1-02 验证证据

```text
项目：site/，Astro 7.3.1，TypeScript strict 配置 extends astro/tsconfigs/strict
依赖：@astrojs/mdx 8.0.0、@astrojs/rss 4.0.19、@astrojs/sitemap 3.7.4、@astrojs/check 0.9.10、@playwright/test 1.62.1
安装：npm ci 成功，added 281 packages，无安装错误
锁文件：site/package-lock.json 已存在并保留
```

### S1-03 验证证据

- [x] `site/package.json` 已提供 `dev`、`check`、`test:e2e`、`build`、`preview` 脚本。
- [x] `site/playwright.config.ts` 已配置生产预览、桌面 Chromium 和 Pixel 5 移动 Chromium。
- [x] `site/tests/smoke.spec.ts` 已覆盖首页 200、标题/H1、控制台错误、未知路由 404。
- [x] `.github/workflows/ci.yml` 已配置 `npm ci`、Playwright 浏览器、check、build 和 e2e。
- [x] 根 `.gitignore` 已忽略站点依赖、构建产物、Playwright 报告和 agent 工作文件。

### S1-04 验证证据

```text
npm run check：退出码 0；0 errors、0 warnings、0 hints。
npm run build：退出码 0；生成 site/dist/index.html，无未解释警告。
npm run test:e2e：退出码 0；4 passed（desktop-chromium/mobile-chromium 各验证首页和 404）。
开发服务器：astro dev --background --host 127.0.0.1；HTTP 200，首页包含 <title>Astro</title>；验证后已停止。
生产预览：Playwright webServer 通过 ASTRO_PREVIEW_BACKGROUND=1 关闭 Astro 的 AI 环境自动后台检测，由 Playwright 正常托管前台进程；测试后无残留 dev/preview 进程。
测试期间 Node 输出 `NO_COLOR` 被 `FORCE_COLOR` 覆盖的环境提示；该提示来自当前 Codex 运行环境，未产生站点 console error/pageerror，不影响测试结果。
```

### Stage 1 偏差、风险与结论

- `@astrojs/sitemap` 需要真实生产 `site` URL 才能生成绝对地址。当前 `astro.config.mjs`
  通过 `SITE_URL` 环境变量条件启用 Sitemap；Stage 1 未猜测 pages.dev 项目名，因此默认构建
  不生成 Sitemap。Stage 4 首次创建 Pages 项目并取得真实地址后，必须设置 `SITE_URL`，复跑
  `npm run build` 和预发布检查。
- 首版首页仍是 Astro Minimal 英文基线页；真实中文内容、P0 路由、简历和脱敏 PDF 按计划留在
  Stage 2/Stage 4，不将占位内容伪装为真实内容。
- 本阶段未执行 `git commit`、`git push`，未创建 Cloudflare Pages 项目，符合当前授权边界。
- 阶段复审结论：PASS（自动检查和本地基线验证通过），等待用户人工确认后进入 Stage 2。

### 下一阶段

- 是否允许进入：否，等待用户确认 Stage 1 闸门。
- 待处理事项：用户确认后执行 Stage 2 的内容模型与 P0 页面。
