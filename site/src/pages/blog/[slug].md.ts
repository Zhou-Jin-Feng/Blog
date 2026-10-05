import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from 'astro';
import { getPublishedPosts } from '../../lib/content';
import { fromPost } from '../../lib/markdown-export';

/** 每篇文章的 Markdown 原文，供详情页和下载页的“下载 Markdown”使用。 */
export const getStaticPaths = (async () => (await getPublishedPosts()).map((post) => ({ params: { slug: post.id }, props: { post } }))) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = ({ props, site }) =>
  new Response(fromPost(props.post).markdown(site!), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
