import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from 'astro';
import { getCollection } from 'astro:content';
import { getPublishedPosts } from '../../lib/content';
import { formatDate } from '../../lib/format';
import { ogImagePath } from '../../lib/og';
import { renderOgImage, type OgCard } from '../../lib/og-render';

/** 分享图：每篇文章、每个项目、每份文档各一张，首页和列表页等共用一张全站通用图。路径约定见 lib/og.ts。 */
export const getStaticPaths = (async () => {
  const [posts, projects, docs] = await Promise.all([getPublishedPosts(), getCollection('projects'), getCollection('docs')]);
  // ogImagePath() 给的是完整路径，去掉 /og/ 前缀和 .png 后缀就是本路由的参数。
  const image = (path: string, card: OgCard) => ({ params: { path: path.slice('/og/'.length, -'.png'.length) }, props: { card } });
  return [
    image(ogImagePath(), {
      title: '学习笔记、技术文档与个人工程实践',
      description: '把学习和工程的过程整理成可阅读、可复现的公开内容。',
      tags: ['博客', '项目', '文档', '简历'],
      meta: [],
    }),
    ...posts.map((post) => image(ogImagePath('post', post.id), {
      kind: 'post', title: post.data.title, description: post.data.description, tags: post.data.tags, meta: [formatDate(post.data.publishDate)],
    })),
    ...projects.map((project) => image(ogImagePath('project', project.id), {
      kind: 'project', title: project.data.title, description: project.data.summary, tags: project.data.techStack, meta: [project.data.status],
    })),
    ...docs.map((doc) => image(ogImagePath('doc', doc.id), {
      kind: 'doc', title: doc.data.title, description: doc.data.summary, tags: [], meta: [doc.data.version, formatDate(doc.data.updatedDate)],
    })),
  ];
}) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = async ({ props, site }) =>
  new Response(new Uint8Array(await renderOgImage(props.card, site)), { headers: { 'Content-Type': 'image/png' } });
