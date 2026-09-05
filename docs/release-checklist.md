# 发布检查清单

本清单用于 Stage 4 预发布和 Stage 5 正式发布。未完成项目保持未勾选，并在 `execution-log.md` 记录证据。

## 预发布

- [ ] 已将 `docs/content-inventory.md` 中的占位模板全部替换为达到最低数量的真实内容（用户已明确后置）。
- [ ] 真实内容已按 `docs/privacy-review.md` 完成自动扫描、人工复核和必要脱敏（用户已明确后置）。
- [x] 用户已明确接受模板先用于 Stage 4 工程推进，阶段结论记录为 PASS WITH NOTES。
- [x] `npm ci` 成功（模板依赖安装，0 vulnerabilities）。
- [x] `npm run check` 通过。
- [x] `npm run build` 通过并生成 `site/dist`。
- [x] Playwright 冒烟测试通过（12 项）。
- [x] 首页、全部 P0 列表页和至少一个详情页可访问。
- [x] 404、RSS、Sitemap 和下载资源可访问。
- [x] 360 x 800、768 x 1024、1440 x 900 无非预期横向溢出。
- [x] 无未解释的 console error 或 pageerror。
- [x] 模板和项目文件敏感信息扫描完成；真实内容扫描待补齐真实资料。
- [x] `_headers` 中的安全响应头已在线上验证；HSTS 未返回，已作为非阻断说明记录。
- [x] 页面标题、描述、canonical、Open Graph、robots、RSS 和 Sitemap 正确且无 localhost 泄漏。
- [x] Lighthouse 结果和残余可访问性风险已记录于 `docs/reports/lighthouse/README.md`。

## 正式发布

- [x] 模板工程版 P0 站内页面和本地资源可访问，并持续显示模板标识。
- [x] 当前模板资源的公开检查已完成；模板视频外链和私有 GitHub 链接对访客返回 404，已记录为模板范围说明。
- [ ] 真实内容数量和公开授权审查通过（用户已明确后置，不阻塞模板工程版）。
- [x] 生产地址 `https://blog-4cr.pages.dev` 使用 HTTPS，HTTP 请求 301 跳转到 HTTPS。
- [x] GitHub 与 Cloudflare 账号已启用双因素认证；Cloudflare TOTP 页面状态已验证，GitHub 由用户明确确认。
- [x] 生产部署 ID、Git 提交 ID 和发布日期已记录。
- [x] Git bundle 备份已创建并通过 `git bundle verify`（`Blog-backup-20260904-212452.bundle`，HEAD `b442f34`）。
- [x] 已对提交 `b442f34` 演练平台重新部署，新部署成功且生产内容未变化。
- [x] `docs/execution-log.md` 已记录 Stage 0 至 Stage 5 证据。

## 当前状态

Stage 5 已于 2026-09-05 通过最终人工闸门，结论为 PASS WITH NOTES。生产地址、线上回归、Lighthouse、仓库外备份、重新部署演练和账号 2FA 均已有证据。模板视频外链 404、私有 GitHub 链接对访客 404、HSTS、可访问性问题、Node 22 维护期、CSP 和真实内容最终审查作为说明保留。用户要求本阶段完成后先不要 commit 和 push，因此所有新增记录只保留在本地。
