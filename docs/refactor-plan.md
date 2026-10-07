# 重构方案：哪些用轮子，哪些自己做

更新时间：2026-10-07
状态：方案已确认（2026-10-03）；阶段 1、2 及收尾项已合并上线（PR #1、#2、#3）；阶段 3 全部上线（星图 PR #6，相关内容和分享图 PR #10）；真实内容分批替换中（第一批 PR #5、第二批 PR #8 已上线）；仓库已于 2026-10-07 公开（见第 9 节末尾）
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
| OG 分享图 | 没有；全站 `og:type` 都是 `website` | — | 构建期生成（原定 astro-og-canvas，实施时改用 satori，见 4.4） |
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
| `satori` | 0.35.0 | 2026-10-06 查询。与框架无关，构建期运行；PNG 转换用 Astro 自带的 `sharp`（0.35），不另装原生依赖 |

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

### 4.4 OG 分享图：构建期用 satori 生成

原计划：

- 构建期为每篇文章和每个项目生成一张 PNG，按站点配色排版标题、类型和站点名。
- 中文标题需要在仓库里放一个中文字体文件（比如 Noto Sans SC 子集）。字体只在构建期用，不发给访客。
- 同时修正 `BaseLayout.astro`：详情页的 `og:type` 改成 `article`，补上 `og:image`、`twitter:card` 和 `article:published_time`。

实施时没有用 astro-og-canvas：它的版式固定为“logo、标题、描述”三段，放不下计划里的类型和站点名，只能把它们画进背景图。改用 satori（Vercel 的 HTML/CSS 转 SVG 库，`@vercel/og` 的底层）自己排版，再用 Astro 自带的 sharp 转成 PNG。代价是多写约 100 行，好处是版式完全自定，也不需要 astro-og-canvas 依赖的 26 MB CanvasKit。

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

- **相关文章**：构建期按标签重合度取前 3 篇，放在详情页底部。逻辑只有十几行，引入库不划算。对应建设方案 V1.1 的"相关文章"。实施时把项目也算进来（项目的技术栈当标签），见第 9 节。

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
- **评论**（giscus 等）：建设方案把评论列为首版不做。另外，giscus 需要一个开启了 Discussions 的公开仓库；评估时仓库还是私有的，公开后这条限制不再存在。
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

阶段 3 星图（分支 `feat/graph-d3-force`）：

- 起因：真实项目带来 13 个技术栈标签，旧布局下首页星图有十几处标签互相压住（Python × FastAPI、TypeScript × Milvus 等），共享标签全挤在两个项目之间。
- 构建期布局改用 `d3-force` 3.0.0：连线、斥力、向心力直接用 d3 的力，另写了两个自定义力。一个按矩形推开（标签是横向长条，`forceCollide` 只认圆），一个把节点连同标签限制在画布内。布局不再整体缩放，标签占位按 520px 宽时的最大字号估算，这样计算时的尺寸和实际显示一致。
- 初始位置：栏目按子树大小分扇区；同栏目的内容在扇区内均匀排开；标签放在所有关联内容的平均方向上，共享标签落在几条内容之间，专属标签靠向各自的内容；标签另加一个弱的环形力，沿外圈散开。
- 新增 e2e 用例：在 1060、1280、1440px 宽度下检查标签互不遮挡、也不压住其他节点。用旧布局跑这个用例会失败并列出重叠。
- 验证：模板内容和真实内容两种情况下，`check` 0 错误，`build` 16 页，`test:e2e` 33 个通过、1 个跳过（新用例在手机尺寸下跳过，窄屏不显示技术栈标签）。两次构建的布局完全一致。
- 2026-10-05 合并到 `main`（`12c0eea`），同一批还有第一批真实内容 PR #5（`cd691de`）和依赖升级 PR #7（`712b992`，`http-cache-semantics` 4.3.0，消除 `npm audit` 告警，详见该 PR）。线上首页的星图数据与本地构建逐字节一致。

阶段 2 补充：中文搜索（分支 `fix/cjk-search-and-anchors`）：

- 换成真实笔记后发现，Pagefind 1.5 在浏览器端用 `Intl.Segmenter` 切分查询，和建索引时的分词不一致：“镜像”“端口”“调试”这类词被切成单字，前者完全搜不到，后者漏掉了主题就是调试的那篇。实测 48 个常见技术词里 5 个受影响。Pagefind 没有关闭这种切分的选项，#987 提的子串搜索也没有实现。
- 处理：`SearchPalette.astro` 发现查询里有会被切成单字的中文时，每段只留第一个字，借 Pagefind 的前缀匹配拿候选页，再逐页核对原文里是否真有这个词；命中的排前面（标题含词优先，其次按出现次数），摘要从原文截取。其余查询不受影响。最坏情况多加载的是候选页的片段，现在全站片段合计 192KB。
- 一并核实了“中文标题的目录链接点了不跳转”：Playwright 实测跳转正常，是内置浏览器面板在后台时平滑滚动不推进造成的假象，补了回归用例。

阶段 3 收尾：相关内容、分享图（分支 `feat/related-og-hide-video`）：

- 相关内容（`src/lib/related.ts`、`RelatedContent.astro`）：文章和项目详情页底部最多列 3 条，文章用标签、项目用技术栈。排序依次看共同标签数、共同标签有多少见（只有两条内容共有的 LangChain 比人人都有的 Python 更说明问题）、日期。没有共同标签的不凑数：Prompt 和 RAG 两篇各只有 1 条，文档没有标签，不显示。把项目算进来是因为只看文章时 6 篇里有 2 篇一条都没有；现在笔记和项目互相引用，比如 Docker 指南会推荐两个用了 Docker 的项目。
- 分享图：`src/pages/og/[...path].png.ts` 在构建期给每篇文章、每个项目、每份文档各生成一张 1200×630 的 PNG，其余页面共用 `/og/site.png`。版式见 `src/lib/og-render.ts`：顶栏同网站品牌区，右上角是类型，左侧色条用类型色；“主题：副题”式标题在冒号后换行；底部是标签和日期（项目是状态、文档是版本）。每张 25–35 KB，10 张共用约 1.5 秒。
- 字体：`src/assets/og/` 下是 Noto Sans SC 常规体和粗体的子集（OFL 1.1，许可证随附），覆盖 GB2312 的全部汉字和符号，加上现有内容 frontmatter 里出现的字，两个文件共约 3.3 MB。由 `npm run og:fonts` 从本机已安装的 Noto Sans SC 生成。构建遇到字体里没有的字会直接失败，并提示重新生成子集，不会产出带方框的图。
- meta：详情页 `og:type` 改为 `article`，补 `og:image`（含宽高、类型、替代文字）、`og:site_name`、`og:locale`、`twitter:card` 和 `article:published_time`、`article:modified_time`、`article:tag`。
- 依赖：新增 `satori`；`sharp` 原本是 Astro 的可选依赖，改为直接依赖；脚本用的 `subset-font` 放在 devDependencies。satori 0.35.0 锁定的 `fflate` 0.7.3 有一条告警（解析畸形 ZIP64 时死循环，satori 只用它解压字体，用不到这个函数），用 `overrides` 升到修复版 0.7.5。升级 satori 时检查它是否已自带修复版，是的话删掉这条 override。
- 同批还有两项：演示视频按用户决定先隐藏，开关是 `src/data/site.ts` 的 `features.videos`（见 `content-inventory.md` D 节）；本地 e2e 固定 4 个进程，实测 4 到 10 个进程总耗时只差一两秒，瓶颈在最长的单个用例。
- 实施中发现：satori 把空数组也当作多个子节点，要求 `display: flex`；平衡换行和 `lineClamp` 一起用时会误加省略号，所以平衡换行的部分改用最大高度截断。
- 新增 e2e 用例：站点地图里每个页面的 `og:image` 都指向存在的 1200×630 PNG，详情页是 `article`；文章的发布时间和标签；相关内容的排序和“没有就不显示”；视频栏目关闭时 `/video/` 返回 404，导航、星图和站点地图里都没有视频。
- 2026-10-06 合并到 `main`（`c02896b`），CI 和生产部署通过。线上页面和本地用生产域名构建的结果一致，只多了 Cloudflare 自动插入的统计脚本；10 张分享图里 7 张逐字节相同，另外 3 张只是 PNG 压缩编码不同（Windows 和 Linux 上的 sharp），解码后像素完全一致；`/video/` 返回 404。
- 比对时发现：本地 Windows 工作区的文件是 CRLF 换行，所以本地构建的 Markdown 下载比线上（Linux 构建，LF）大约 2%，下载页显示的大小也跟着偏大。只影响本地构建，以线上为准。之后已在 `.gitattributes` 里把 Markdown 固定为 LF 检出，本地构建的 7 份 Markdown 下载和下载页都已和线上一致。

维护项（2026-10-06）：

- 依赖告警（PR #11，`7482819`）：10 月 5 日后新公布的 3 条。`smol-toml`、`source-map-js` 升补丁版本；`postcss-selector-parser` 只有 7.x 修了，而 Expressive Code 最新版仍依赖 `postcss-nested` 6，用 `overrides` 把它换成 7.0.2。构建产物逐字节不变，`npm audit` 恢复为 0；线上代码块样式和本地构建一致。
- 模板时期的文字（PR #12，`0a6b520`）：全站描述去掉“模板”二字，页脚改为站点名，搜索面板里简历、下载两条过时的说明换掉。线上已核对，旧文字没有残留。
- Markdown 固定为 LF 换行（PR #13，`87de0c5`）：见上文阶段 3 收尾的最后一条。

仓库公开（2026-10-07）：

- 用户决定把仓库从私有改为公开。理由：免费方案下私有仓库开不了分支保护（查询 `main` 的保护规则返回 403，提示升级 Pro 或公开仓库），公开后可以给 `main` 加保护，“不直接推 `main`”不再只靠流程；网站内容本来全部公开，Markdown 原文也能下载，仓库公开后新增可见的只有历史和过程记录；仓库本身也能作为作品展示。
- 公开前扫描了全部历史、提交信息和 PR，结论 PASS，见 `privacy-review.md` 2026-10-07 一行。
- 步骤：先合并收尾改动（PR #14，`9c83bec`：README 更新为现状，补脱敏记录，去掉“仓库私有”的说法）；再由用户在 GitHub 设置里改为公开；最后给 `main` 开分支保护。三步都在当天完成。
- 分支保护由用户在网页上配置（Claude 用 `gh` 配置时被本机权限审核拦下）。核对结果：必须经 PR 合并，不要求审批；必须通过 GitHub Actions 的 `verify`；不要求先同步 `main`；管理员也不能绕过；禁止强推和删除。
- 用户同时开启了合并后自动删除分支、Secret scanning 和推送保护（开启后 GitHub 扫描了全部历史，0 条告警），About 填了描述。
- 公开后核对：Cloudflare 不为 fork 来的 PR 生成预览地址（官方文档）；Actions 的 `GITHUB_TOKEN` 默认只读，首次贡献者的 PR 要批准后才跑 CI；`main` 上的 CI 和生产部署通过。
- 收尾（分支 `chore/license-and-cleanup`）：加 MIT 许可证（见下一条）；`.gitignore` 忽略 `.claude/`（其中 `launch.json` 有本机绝对路径）；`CLAUDE.md` 补“GitHub 仓库设置”一节，删掉对已不存在的 `site/CLAUDE.md` 的说明。
- 许可证：用户选最宽松的 MIT（根目录 `LICENSE`）。只覆盖代码和文档：`site/src/content/` 的内容和 `site/public/images/` 的配图不在其内（简历、履历是个人信息，部分笔记整理自课程，作者未必有权再授权），作者保留所有权利；`site/src/assets/og/` 的字体按 OFL 1.1。

## 参考

- Astro 7 升级指南：<https://docs.astro.build/en/guides/upgrade-to/v7/>
- Expressive Code 更新日志：<https://github.com/expressive-code/expressive-code/blob/main/packages/astro-expressive-code/CHANGELOG.md>
- Pagefind 多语言支持：<https://pagefind.app/docs/multilingual/>
- Pagefind JS API：<https://pagefind.app/docs/api/>
- Cloudflare Pages 开启 Web Analytics：<https://developers.cloudflare.com/pages/how-to/web-analytics/>
