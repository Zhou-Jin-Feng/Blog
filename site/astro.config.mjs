// @ts-check
import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL ?? 'http://localhost:4321';

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [mdx(), sitemap()]
});
