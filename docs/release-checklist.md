# 发布检查清单

本清单用于 Stage 4 预发布和 Stage 5 正式发布。未完成项目保持未勾选，并在 `execution-log.md` 记录证据。

## 预发布

- [ ] 已将 `docs/content-inventory.md` 中的占位模板全部替换为达到最低数量的真实内容。
- [ ] 真实内容已按 `docs/privacy-review.md` 完成自动扫描、人工复核和必要脱敏。
- [x] `npm ci` 成功（模板依赖安装，0 vulnerabilities）。
- [x] `npm run check` 通过。
- [x] `npm run build` 通过并生成 `site/dist`。
- [x] Playwright 冒烟测试通过（12 项）。
- [x] 首页、全部 P0 列表页和至少一个详情页可访问。
- [x] 404、RSS、Sitemap 和下载资源可访问。
- [x] 360 x 800、768 x 1024、1440 x 900 无非预期横向溢出。
- [x] 无未解释的 console error 或 pageerror。
- [x] 模板和项目文件敏感信息扫描完成；真实内容扫描待补齐真实资料。
- [ ] `_headers` 中的安全响应头已在预发布地址验证（本地文件和 `dist/_headers` 已确认）。
- [ ] 页面标题、描述、canonical、Open Graph、robots、RSS 和 Sitemap 正确。
- [ ] Lighthouse 结果和第三方资源残余风险已记录。

## 正式发布

- [ ] P0 页面和资源数量达标。
- [ ] 真实内容和公开授权审查通过。
- [ ] 生产地址使用 HTTPS。
- [ ] GitHub 与 Cloudflare 账号已启用双因素认证。
- [ ] 生产部署 ID、Git 提交 ID 和发布日期已记录。
- [ ] Git bundle 备份已创建并通过 `git bundle verify`。
- [ ] 回滚或重新部署上一个已验证版本的流程已演练。
- [ ] `docs/execution-log.md` 已记录 Stage 0 至 Stage 4 证据。

## 当前状态

Stage 0、Stage 1、Stage 2 和 Stage 3 已通过；当前处于 Stage 4，本地质量与安全检查已完成，但真实内容替换、最终脱敏和授权复核仍使预发布保持 BLOCKED。
