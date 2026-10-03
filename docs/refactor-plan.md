# 重构方案：哪些用轮子，哪些自己做

更新时间：2026-10-03
状态：方案已确认（2026-10-03）；阶段 1、2 及收尾项已合并上线（PR #1、#2、#3）；阶段 3 等真实内容替换时开始
评估基线：`main` @ `3d04865`

## 1. 背景

10 月 1 日至 3 日的前端重塑（`99ad554`、`3d04865`）加入了星图、全站搜索、目录高亮、主题切换等交互，基本都是手写的。之前讨论"哪些地方直接用现成轮子、哪些适合自己做"的会话记录已经丢失，本文按当前代码重新评估。

判断标准：

1. 问题通用、有成熟方案、自己写很难做到同等质量的，用轮子。
2. 体现站点辨识度的，或者现成库要大改才能贴合的，自己做。
3. 现有手写实现很小、没有维护负担的，不为了用轮子而替换。
4. 轮子尽量放在构建期运行，不增加访客要下载的 JS。

## 2. 现状盘点

| 功能 | 现在的实现 | 规模 | 结论 |
| --- | --- | --- | --- |
| 站内搜索 | `search.json` 只索引标题、摘要、标签；`SearchPalette` 手写打分和高亮 | 238 + 41 行 | 引擎换成 Pagefind，保留面板 |
| 星图布局（构建期） | `graph.ts` 的 `layout()` 手写力导向，算法与 d3-force 基本相同 | 约 100 行 | 换成 d3-force |
| 星图交互（浏览器端） | 回弹、漂移、拖拽、标签栅格化 | 约 400 行 | 保留 |
| 代码块 | Astro 默认 Shiki 单主题，CSS 强制深色背景，无复制按钮 | 1 行 CSS | 引入 Expressive Code |
| 目录高亮 | `Toc.astro`，Astro headings + IntersectionObserver | 64 行 | 保留 |
| 阅读时长 | `format.ts`，中文按字、英文按词分别估算 | 6 行 | 保留 |
| 阅读进度、页头描边、履历时间线 | CSS 滚动驱动动画 | 纯 CSS | 保留，已经是浏览器原生能力 |
| 页面切换 | Astro `ClientRouter` | 内置 | 保留 |
| 主题切换 | `Header.astro` 手写，View Transition 圆形扩散 | 约 40 行 | 保留 |
| RSS、Sitemap、MDX | 官方集成 | — | 保留 |
| robots.txt | 手写端点 | 8 行 | 保留 |
| 简历、履历数据 | 写在 `src/data/site.ts` 里 | — | 改成 content collection |
| OG 分享图 | 没有；全站 `og:type` 都是 `website` | — | 引入 astro-og-canvas |
| 访问统计 | 没有 | — | Cloudflare Web Analytics |
| 相关文章 | 没有 | — | 自己写 |

## 3. 已核实的约束

### 3.1 Astro 7 的 Markdown 引擎

Astro 7 默认用 Sätteri 渲染 `.md` 和 `.mdx`，**不运行 remark/rehype 插件**。要继续用这类插件，得额外安装 `@astrojs/markdown-remark` 并把整站切回 unified 管线。

所以选 Markdown 相关的轮子时，先确认它支持 Sätteri。本方案只选原生支持 Sätteri 的轮子，不切回 unified。

Astro 7 还要求 Node.js >= 22.12.0。CI 和 Pages 目前用 Node 22。

### 3.2 版本

以下版本于 2026-10-03 从 npm registry 查询。

| 包 | 最新版本 | 兼容情况 |
| --- | --- | --- |
| `astro` | 7.3.5 | 本地是 7.3.1 |
| `pagefind` | 1.5.2 | 独立 CLI，处理构建产物，与框架版本无关 |
| `d3-force` | 3.0.0 | 纯 JS，只在构建期运行。实测同样的输入跑两次，布局完全一致（内置固定种子的随机数） |
| `astro-expressive-code` | 0.44.2 | peer 依赖 `astro ^7`。0.43 起检测到 Sätteri 时自动改用 Sätteri 插件，0.44 起正式支持 Astro 7 |
| `astro-og-canvas` | 0.13.2 | peer 依赖 `astro ^5 \|\| ^6 \|\| ^7` |
| `astro-pagefind` | 2.0.1 | peer 依赖包含 `astro ^7`，但本方案不用它，原因见 4.1 |

## 4. 用轮子的部分

### 4.1 搜索：引擎换成 Pagefind，保留自己的 Ctrl+K 面板

现在的问题：

- 只索引标题、摘要和标签，搜不到正文。换成真实文章后，这会是最明显的短板。
- 打分和高亮都是手写的，中文不分词，只能做子串匹配。
- `search.json` 一次全量下载，内容越多，第一次打开搜索越慢。

Pagefind 在构建后扫描 `dist`，生成分片索引，浏览器按需下载。npm 安装默认就是 extended 版本，会根据 `<html lang="zh-CN">` 对中文分词。搜索结果带高亮摘要，还能返回命中的小标题（`sub_results`）。

做法：

- 构建脚本改成 `astro build && pagefind --site dist`。直接用 CLI，不用 `astro-pagefind` 集成，因为它额外带一套现成的搜索界面，我们用不上。代价是 `astro dev` 下没有索引，调试搜索要先 build，再用 preview 看。
- `SearchPalette` 保留外观、键盘操作和 ARIA 属性。内部的 `score()`、`highlight()` 和 `search.json` 加载逻辑换成 Pagefind 的 JS API（`search()` + `data()`）。大致删掉 100 行，新增 40 行左右。
- 详情页正文加 `data-pagefind-body`。模板提示、导航、页脚加 `data-pagefind-ignore`。内容类型用 `data-pagefind-meta` 或 `data-pagefind-filter` 标注，面板里继续显示类型和日期。
- 视频和下载没有详情页。给卡片标题加 `id`，Pagefind 会把它们作为列表页里的子结果返回，点击直接跳到对应卡片。
- 删除 `src/pages/search.json.ts`。博客、项目这类栏目入口不放进索引，改成面板里的一份静态列表。
- 测试：`interactions.spec.ts` 里"搜索索引不含草稿"改成检查 Pagefind 搜不到草稿标题，搜索面板的用例保留。

注意事项：

- 动态加载 `/pagefind/pagefind.js` 时要避开 Vite 的模块解析（运行时拼接路径，加 `@vite-ignore`）。实施时确认 dev 和 build 都不报错。
- 中文分词效果要用真实内容实测：至少 3 个中文关键词、1 个英文技术词、1 个标签。
- `ClientRouter` 换页后，面板脚本不能重复初始化。现有实现是模块级单例，保持即可。

### 4.2 星图的构建期布局：换成 d3-force

`graph.ts` 的 `layout()` 基本就是照着 d3-force 手写的：连线弹簧按节点度数分配偏置和强度（正是 `forceLink` 的默认公式），两两斥力对应 `forceManyBody`，向心力对应 `forceX`/`forceY`，碰撞对应 `forceCollide`。

换成 d3-force 的好处：

- 约 100 行代码变成 25 行左右的配置。参数名和 d3 文档一一对应，以后调参不用读自己写的物理代码。
- 斥力用 Barnes–Hut 近似，碰撞多轮迭代，节点变多后效果和速度都更稳。现在是两两计算，节点上限约 66 个，暂时没问题。
- 只在构建期运行，访客不多下载任何 JS。
- 结果确定，满足"每次构建布局一致"的要求。`seeded()` 生成初始位置的部分可以保留。

不换的部分：浏览器端的回弹弹簧（约 25 行，把节点拉回构建期算好的位置）、漂移、拖拽和标签栅格化。这些决定交互手感，把 d3-force 搬到浏览器端反而要多加载一个库，交互也得重写。

时机：放到替换真实内容的阶段。现在的参数是按 9 条模板内容调的，换成真实内容后数量和标签分布都会变，本来就要重调，到时直接在 d3-force 上调。

验收：首页星图前后截图对比；`interactions.spec.ts` 里两个星图用例通过。

### 4.3 代码块：用 Expressive Code

现在代码块用的是 Shiki 默认的单一主题，再用 CSS 强制深色背景。没有复制按钮、文件名和终端样式，也不跟随站点的深浅主题。这是技术博客，代码块会是正文里最常见的元素之一。

Expressive Code 提供复制按钮、文件名标题、终端窗口样式、行高亮和增删标记，支持双主题，并且原生支持 Sätteri。

做法：

- 运行 `npx astro add astro-expressive-code`，确保它在 `astro.config.mjs` 的集成列表里排在 `mdx()` 前面。
- 选一深一浅两套主题，用 `themeCssSelector` 绑定到 `<html data-theme>`，跟随站点主题切换，不跟随系统的媒体查询（主题由站点自己管理）。具体配置项在实施时对照文档核实。
- 删除 `global.css` 里 `.prose pre` 的手写样式。
- 在一篇模板文章里加代码块样例，补一个 e2e 用例：检查复制按钮存在，切换主题后代码块颜色跟着变。

时机：第一篇带代码的真实文章发布之前。

### 4.4 OG 分享图：用 astro-og-canvas

- 构建期为每篇文章和每个项目生成一张 PNG，按站点配色排版标题、类型和站点名。
- 中文标题需要在仓库里放一个中文字体文件（比如 Noto Sans SC 子集）。字体只在构建期用，不发给访客。
- 同时修正 `BaseLayout.astro`：详情页的 `og:type` 改成 `article`，补上 `og:image`、`twitter:card` 和 `article:published_time`。

时机：替换真实内容之后、对外分享之前。对应建设方案 V1.1 的"定制 Open Graph 图片"。

### 4.5 访问统计：用 Cloudflare Web Analytics

- 在 Pages 项目的 Metrics 里点 Enable，下次部署时统计脚本会自动注入，不用改代码。这一步需要你在 Cloudflare 后台操作。
- 以后收紧 CSP 时，要放行它的脚本域名。

对应建设方案 V1.1 的"隐私友好的访问统计"。

## 5. 自己做的部分

### 5.1 保留现有实现

- **星图的视觉和交互**：这是站点辨识度最高的部分。"构建期布局 + 浏览器端回弹、漂移、栅格化标签"这一套，没有现成库能直接给出。
- **视觉系统**：传统色、`light-dark()`、主题圆形扩散、CSS 滚动驱动动画。
- **目录、阅读时长、主题切换、robots.txt**：都很小，换成现成库不会更省事。阅读时长按中文字数和英文词数分开估算，比常见的库更贴合中文。
- **内容模型**：五个 collection 加 `template` 标记，配合发布清单里的隐私和授权流程，是为这个项目定制的。

### 5.2 新增，自己写

- **相关文章**：构建期按标签重合度取前 3 篇，放在详情页底部。逻辑只有十几行，引入库不划算。对应建设方案 V1.1 的"相关文章"。

## 6. 内部整理（与轮子无关，最先做）

前面几项都要读同一批内容数据。先把重复代码收拢，后续改动才不用同时改五六个地方。这一步不改变任何行为，现有测试应该全部通过。

1. **新建 `src/lib/content.ts`**
   - `getPublishedPosts()`：取非草稿博客并按日期倒序，这段逻辑现在在首页、博客列表、博客详情、RSS、`search.json.ts`、`graph.ts` 里写了 6 遍。
   - `collectContent()`：把五类内容统一成 `{ kind, title, summary, href, tags, date }`。现在 `search.json.ts` 和 `graph.ts` 的 `collectItems()` 各做了一遍。
   - 内容类型名称（文章、项目、文档、视频、下载）只保留一份。现在 `graph.ts` 的 `kindMeta`、`ContentGraph.astro` 的 `KIND_LABEL`、`search.json.ts` 的 `type` 字符串各写了一份。
2. **新建 `DetailLayout.astro`**：博客、项目、文档三个详情页的骨架几乎一样，包括阅读进度条、面包屑、标题过渡名、`article-layout` 和目录。抽成一个布局后，各页只需要传元信息和正文。
3. **简历和履历数据从 `src/data/site.ts` 挪到 `src/content/`**：用 Astro 内置的 `file()` loader 读 YAML，同样用 zod 校验。以后替换真实内容只改内容文件、不改代码，也能纳入 `docs/content-inventory.md` 的清单管理。
4. **主题色合并成一份**：`theme-color` 的两个十六进制值在 `BaseLayout.astro` 和 `Header.astro` 里各写了一遍。

## 7. 不建议做的

- **整体换成现成主题**（AstroPaper、Fuwari 等）：通用功能已经由官方集成提供了。换主题会丢掉星图和视觉系统，内容模型和测试也得重写。
- **为了用 remark/rehype 插件把 Markdown 切回 unified 管线**：等于放弃 Astro 7 的默认引擎，而目前没有非用不可的插件。
- **标题锚点插件**：Sätteri 版目前只有个人维护的小仓库。需要时再评估，或者自己写几行。
- **评论**（giscus 等）：建设方案把评论列为首版不做。另外，giscus 需要一个开启了 Discussions 的公开仓库，而当前仓库是私有的。
- **Git-based CMS**（Sveltia CMS、Decap CMS 等）：属于建设方案的 V2，等确实需要在网页上编辑内容时再评估。

## 8. 实施顺序

每个阶段单独建分支、提 PR。CI 通过、你确认后再合并到 `main`，合并就会触发生产部署。

| 阶段 | 内容 | 前置条件 | 验收 |
| --- | --- | --- | --- |
| 1 内部整理 | 第 6 节的 1–4 项 | 无 | `check`、`build`、`test:e2e` 全部通过，页面输出不变 |
| 2 搜索和代码块 | Pagefind、Expressive Code | 阶段 1 | 改写后的搜索用例通过；中文搜索实测通过；代码块复制和主题切换用例通过 |
| 3 随真实内容一起做 | 用 d3-force 重调星图、相关文章、OG 图 | 阶段 1，且真实内容开始替换 | 星图截图对比；OG 图在分享调试工具里显示正常 |
| 随时 | Cloudflare Web Analytics | 无 | 你在后台开启后，线上页面能看到统计脚本 |

附带的维护项：

- Astro 7.3.1 → 7.3.5、`@astrojs/mdx` 8.0.0 → 8.0.2，都是补丁版本，可以在阶段 1 顺手升级。
- Node 22 已进入维护期。本地已经是 Node 24，可以把 CI 和 Pages 的 `NODE_VERSION` 升到 24。Pages 的环境变量需要你在后台修改。

## 9. 决定与进度

2026-10-03 用户确认：同意阶段顺序；接受简历和履历改为 content collection；开启 Cloudflare Web Analytics。用户已于当天在 Pages 后台开启，下一次生产部署生效。

阶段 1 完成情况（分支 `refactor/internal-cleanup`）：

- 新增 `src/lib/content.ts`（`getPublishedPosts()`、`collectContent()`）和 `src/lib/kinds.ts`（内容类型名称），首页、博客列表、博客详情、RSS、`search.json.ts`、`graph.ts`、`ContentGraph.astro` 改用它们。
- 新增 `src/layouts/DetailLayout.astro`，博客、项目、文档详情页改用它。
- 简历、履历改为 `src/content/resume.yaml`、`src/content/timeline.yaml`，新增 `resume`、`timeline` 两个 collection。
- 主题色合并到 `src/data/site.ts` 的 `themeColors`，`global.css` 的 `--bg` 旁注明需同步。
- `astro` 7.3.1 → 7.3.5、`@astrojs/mdx` 8.0.0 → 8.0.2、`@astrojs/markdown-satteri` 0.4.0 → 0.4.2。
- 验证：`check` 0 错误；`build` 16 页；`test:e2e` 26/26 通过。与改动前的构建产物逐页对比，除主题色脚本和标题过渡作用域名外，所有 HTML、`search.json`、RSS、sitemap 内容一致，星图布局数据不变。
- 遗留：`npm audit` 报告 6 个间接依赖漏洞（1 中 5 高，涉及 `devalue`、`fast-uri`、`undici`、`http-cache-semantics`），升级前后数量相同，不是本次引入。
- 2026-10-03 合并到 `main`（`e6ad37e`），生产部署确认生效，Cloudflare Web Analytics 脚本已注入。

阶段 2 完成情况（分支 `feat/search-and-code-blocks`）：

- 搜索：`pagefind` 1.5.2，构建脚本改为 `astro build && pagefind --site dist`。详情页正文、视频页、下载页标记为索引范围，模板提示、目录、翻页等标记为忽略；类型和日期写进索引元数据。删除 `search.json.ts`，栏目页面的说明移到 `navItems.summary`。
- 搜索面板保留原有外观和键盘操作：空输入列出最近内容；有输入时栏目页按标题本地匹配，正文交给 Pagefind；视频、下载卡片作为子结果，直接跳到卡片锚点。Pagefind 摘要只保留文字和 `<mark>`。
- 代码块：`astro-expressive-code` 0.44.2，主题 everforest 浅色/深色，跟随 `<html data-theme>`；界面文字补了中文。`astro.config.mjs` 显式设置 `markdown.processor: satteri()`，否则 Expressive Code 不会挂到 Sätteri 上。删除 `.prose pre` 手写样式。
- 测试：搜索草稿用例改为直接查 Pagefind 索引；新增卡片锚点、代码块复制按钮和主题切换用例。
- 实施中发现的两点：Pagefind 一个 `data-pagefind-meta` 属性只认一组 `key:value`，逗号分隔不会拆开；本地改了 Expressive Code 配置后要清 `node_modules/.astro` 缓存才会重新渲染。
- 本地浏览器测试因本机安全闸门不允许 Playwright 的 Chromium 联网而未跑，以 PR CI 为准，CI 全部通过。2026-10-03 合并到 `main`（`cda73a3`），生产部署确认生效。

收尾项（分支 `chore/search-loading-and-maintenance`）：

- 线上实测发现首次搜索要下载 Pagefind 的脚本、worker 和索引，期间面板仍显示"最近内容"，容易误以为是结果。改为在 Pagefind 就绪前显示"正在加载搜索索引…"，并补了用例（人为延迟 `pagefind.js` 验证提示出现和消失）。
- `npm audit fix`：`devalue`、`fast-uri`、`undici` 升补丁版本，漏洞数 7 → 4。剩余 4 个都来自 `astro` 依赖的 `http-cache-semantics`，npm 给出的修复是降级到 Astro 2.x，不可行，等上游更新。
- CI 改用 Node 24，与本机一致；Pages 的 `NODE_VERSION` 已由用户在后台改为 24。
- 2026-10-03 合并到 `main`（`f1ca31c`），CI 和生产部署通过，线上已有加载提示。

## 参考

- Astro 7 升级指南：<https://docs.astro.build/en/guides/upgrade-to/v7/>
- Expressive Code 更新日志：<https://github.com/expressive-code/expressive-code/blob/main/packages/astro-expressive-code/CHANGELOG.md>
- Pagefind 多语言支持：<https://pagefind.app/docs/multilingual/>
- Pagefind JS API：<https://pagefind.app/docs/api/>
- Cloudflare Pages 开启 Web Analytics：<https://developers.cloudflare.com/pages/how-to/web-analytics/>
