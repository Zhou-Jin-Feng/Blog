import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const markdown = (name: string) =>
  glob({ pattern: '**/*.md', base: `./src/content/${name}` });

const blog = defineCollection({
  loader: markdown('blog'),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string().min(1)).min(1).max(5),
    draft: z.boolean().default(false),
    /** 页面底部注明“AI 辅助润色”，下载的 Markdown 里也带上。 */
    aiAssisted: z.boolean().default(false),
    template: z.boolean().default(true),
    cover: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: markdown('projects'),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    role: z.string().min(1),
    techStack: z.array(z.string().min(1)).min(1),
    status: z.enum(['进行中', '已完成', '维护中']),
    period: z.string().optional(),
    repoUrl: z.url().optional(),
    demoUrl: z.url().optional(),
    videoUrl: z.url().optional(),
    featured: z.boolean().default(false),
    template: z.boolean().default(true),
  }),
});

const docs = defineCollection({
  loader: markdown('docs'),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    version: z.string().min(1),
    updatedDate: z.coerce.date(),
    source: z.string().min(1),
    aiAssisted: z.boolean().default(false),
    template: z.boolean().default(true),
  }),
});

const videos = defineCollection({
  loader: markdown('videos'),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    projectSlug: z.string().min(1),
    platform: z.enum(['Bilibili', 'YouTube', '其他']),
    videoUrl: z.url(),
    poster: z.string().optional(),
    template: z.boolean().default(true),
  }),
});

const downloads = defineCollection({
  loader: markdown('downloads'),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    version: z.string().min(1),
    updatedDate: z.coerce.date(),
    fileType: z.string().min(1),
    fileSize: z.string().min(1),
    downloadUrl: z.string().min(1),
    template: z.boolean().default(true),
  }),
});

const timeline = defineCollection({
  loader: file('./src/content/timeline.yaml'),
  schema: z.object({
    order: z.number().int(),
    period: z.string().min(1),
    type: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    result: z.string().min(1),
    template: z.boolean().default(true),
  }),
});

const resume = defineCollection({
  loader: file('./src/content/resume.yaml'),
  schema: z
    .object({
      order: z.number().int(),
      title: z.string().min(1),
      content: z.string().min(1).optional(),
      /** 条目以“标签：内容”书写时，标签会加粗显示。 */
      items: z.array(z.string().min(1)).min(1).optional(),
      template: z.boolean().default(true),
    })
    .refine((data) => data.content || data.items, { message: 'content 和 items 至少填写一项' }),
});

export const collections = { blog, projects, docs, videos, downloads, timeline, resume };
