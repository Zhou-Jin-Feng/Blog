// @ts-check
import { defineConfig } from 'astro/config';

import { satteri } from '@astrojs/markdown-satteri';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode, { pluginFramesTexts } from 'astro-expressive-code';

const site = process.env.SITE_URL ?? 'http://localhost:4321';

// Expressive Code 自带英文和德文界面文字，补一套中文。
pluginFramesTexts.addLocale('zh-CN', {
  terminalWindowFallbackTitle: '终端窗口',
  copyButtonTooltip: '复制代码',
  copyButtonCopied: '已复制',
});

// https://astro.build/config
export default defineConfig({
  site,
  // Astro 7 默认就是 Sätteri，这里显式写出，Expressive Code 才会挂到 Sätteri 的 HAST 插件上。
  markdown: { processor: satteri() },
  integrations: [
    // 必须排在 mdx() 前面。代码块配色跟随站点的 data-theme，不跟随系统设置。
    expressiveCode({
      themes: ['everforest-light', 'everforest-dark'],
      themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
      useDarkModeMediaQuery: false,
      defaultLocale: 'zh-CN',
      styleOverrides: {
        borderRadius: '14px',
        codeFontFamily: 'var(--font-mono)',
        codeFontSize: '0.9rem',
        uiFontFamily: 'var(--font-sans)',
      },
    }),
    mdx(),
    sitemap(),
  ],
});
