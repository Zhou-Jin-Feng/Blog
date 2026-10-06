# 分享图字体

`NotoSansSC-Regular.woff`、`NotoSansSC-Bold.woff` 是 Noto Sans SC 2.002（Adobe 设计，SIL Open Font License 1.1，全文见同目录的 `OFL.txt`）的子集，只在构建期给 `src/lib/og-render.ts` 生成分享图用，不发给访客。

- 字符范围：ASCII、常用标点、GB2312 的全部符号和 6763 个汉字，以及生成时内容 frontmatter 和分享图文案里出现的所有字。
- 生成方法：在 `site/` 下运行 `npm run og:fonts`（脚本 `scripts/og-fonts.mjs`）。源字体默认取 Windows 已安装的 Noto Sans SC，其他系统用环境变量 `OG_FONT_REGULAR`、`OG_FONT_BOLD` 指定路径。
- 什么时候要重新生成：构建报“分享图字体缺字”时。通常是新内容的标题或摘要用了 GB2312 以外的字。
- 子集保留了原字体 `name` 表里的版权和许可证信息，字体名仍是 Noto Sans SC（保留字体名是 “Source”，不涉及）。
