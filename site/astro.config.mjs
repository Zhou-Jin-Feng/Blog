// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL;

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [mdx(), ...(site ? [sitemap()] : [])]
});
