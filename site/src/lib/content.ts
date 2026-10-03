import { getCollection } from 'astro:content';
import type { ContentKind } from './kinds';

/** 未标记草稿的博客文章，按发布日期从新到旧。 */
export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export interface ContentItem {
  key: string;
  kind: ContentKind;
  title: string;
  summary: string;
  href: string;
  /** 主题标签：文章标签、项目技术栈。星图用它连线。 */
  tags: string[];
  /** 其余可检索的属性：项目状态、文档版本、视频平台、文件类型。 */
  facets: string[];
  date?: Date;
  relatedKey?: string;
}

/** 把五类内容整理成同一种结构，按 kindMeta 的类型顺序排列。 */
export async function collectContent(): Promise<ContentItem[]> {
  const [posts, projects, docs, videos, downloads] = await Promise.all([
    getPublishedPosts(),
    getCollection('projects'),
    getCollection('docs'),
    getCollection('videos'),
    getCollection('downloads'),
  ]);

  return [
    ...posts.map((post) => ({
      key: `post:${post.id}`, kind: 'post' as const, title: post.data.title, summary: post.data.description,
      href: `/blog/${post.id}/`, tags: post.data.tags, facets: [], date: post.data.publishDate,
    })),
    ...projects.map((project) => ({
      key: `project:${project.id}`, kind: 'project' as const, title: project.data.title, summary: project.data.summary,
      href: `/projects/${project.id}/`, tags: project.data.techStack, facets: [project.data.status],
    })),
    ...docs
      .sort((a, b) => b.data.updatedDate.valueOf() - a.data.updatedDate.valueOf())
      .map((doc) => ({
        key: `doc:${doc.id}`, kind: 'doc' as const, title: doc.data.title, summary: doc.data.summary,
        href: `/docs/${doc.id}/`, tags: [], facets: [doc.data.version], date: doc.data.updatedDate,
      })),
    ...videos.map((video) => ({
      key: `video:${video.id}`, kind: 'video' as const, title: video.data.title, summary: video.data.summary,
      href: '/video/', tags: [], facets: [video.data.platform], relatedKey: `project:${video.data.projectSlug}`,
    })),
    ...downloads.map((item) => ({
      key: `download:${item.id}`, kind: 'download' as const, title: item.data.title, summary: item.data.summary,
      href: '/downloads/', tags: [], facets: [item.data.fileType],
    })),
  ];
}
