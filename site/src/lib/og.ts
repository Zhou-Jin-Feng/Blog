import { kindMeta } from './kinds';

/** 分享图（Open Graph）的尺寸和路径约定。图片由 src/pages/og/[...path].png.ts 在构建期生成。 */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/** 有专属分享图的内容类型，其余页面用全站通用图。 */
export type OgKind = 'post' | 'project' | 'doc';

/** 路径跟着详情页走：/og/blog/<id>.png、/og/projects/<id>.png、/og/docs/<id>.png；不传参数时是全站通用图 /og/site.png。 */
export function ogImagePath(kind?: OgKind, id?: string) {
  return kind && id ? `/og${kindMeta[kind].href}${id}.png` : '/og/site.png';
}

/** 详情页的 article:* 信息。 */
export interface ArticleMeta {
  published?: Date;
  modified?: Date;
  tags?: string[];
}
