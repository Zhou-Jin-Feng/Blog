import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from 'astro';
import { getCollection } from 'astro:content';
import { fromDoc } from '../../lib/markdown-export';

/** 每份文档的 Markdown 原文，供详情页和下载页的“下载 Markdown”使用。 */
export const getStaticPaths = (async () => (await getCollection('docs')).map((doc) => ({ params: { slug: doc.id }, props: { doc } }))) satisfies GetStaticPaths;

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export const GET: APIRoute<Props> = ({ props, site }) =>
  new Response(fromDoc(props.doc).markdown(site!), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
