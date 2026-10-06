import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import satori, { type Font } from 'satori';
import sharp from 'sharp';
import { siteConfig } from '../data/site';
import { kindMeta } from './kinds';
import { OG_SIZE, type OgKind } from './og';

/** 一张分享图的内容。只在构建期运行（satori 排版成 SVG，sharp 转成 PNG）。 */
export interface OgCard {
  /** 内容类型；不填是全站通用图，不显示类型标签。 */
  kind?: OgKind;
  title: string;
  description: string;
  /** 左下角的标签，超过 5 个时只显示前 4 个和剩余数量。 */
  tags: string[];
  /** 右下角的补充信息，比如日期、版本、项目状态，最后接上站点域名。 */
  meta: string[];
}

// 配色取自 global.css 的浅色主题，改动时同步。
const colors = { bg: '#e9efeb', ink: '#17252d', muted: '#4f6168', line: '#cbd8d1' };
/** 左侧色条用各类型的 --k-* 颜色。类型标签的文字和浅底至少 4.5:1，金色（项目）因此加深。 */
const kindStyle: Record<OgKind | 'site', { bar: string; ink: string; soft: string }> = {
  site: { bar: '#1d6b5b', ink: '#1d6b5b', soft: '#d3e8e0' },
  post: { bar: '#1d6b5b', ink: '#1d6b5b', soft: '#d3e8e0' },
  project: { bar: '#d99a06', ink: '#8a6100', soft: '#f8ecc8' },
  doc: { bar: '#4361c2', ink: '#4361c2', soft: '#dbe2f3' },
};

// Noto Sans SC 的子集，由 scripts/og-fonts.mjs 生成。构建在 site/ 下运行，按当前目录找。
const FONT_DIR = resolve('src/assets/og');
let fonts: Promise<Font[]> | undefined;
function loadFonts() {
  fonts ??= Promise.all(['Regular', 'Bold'].map((weight) => readFile(resolve(FONT_DIR, `NotoSansSC-${weight}.woff`))))
    .then(([regular, bold]) => [
      { name: 'Noto Sans SC', data: regular, weight: 400, style: 'normal' },
      { name: 'Noto Sans SC', data: bold, weight: 700, style: 'normal' },
    ]);
  return fonts;
}

type Style = Record<string, string | number>;
interface Element {
  type: 'div';
  props: { style: Style; children?: Element | string | (Element | string)[] };
}

/** satori 认 React 元素的结构，这里不引入 React，直接拼对象。 */
function div(style: Style, ...children: (Element | string | false | undefined)[]): Element {
  const kids = children.filter((child): child is Element | string => Boolean(child));
  // satori 把数组一律当作多个子节点，空数组也要求 display: flex，所以没有子节点时不传。
  return { type: 'div', props: { style, children: kids.length > 1 ? kids : kids[0] } };
}

/** 字体里没有表情符号，去掉，免得构建报缺字。 */
const clean = (text: string) => text.replace(/\p{Emoji_Presentation}|\uFE0F|\u200D/gu, '').trim();

const TITLE_SIZE = 58;
const TITLE_LINE = Math.ceil(TITLE_SIZE * 1.28);

/**
 * 标题平衡换行，最多 3 行。“主题：副题”式的标题拆成两段：主题占一行，副题单独换行，不会被拆到两行中间。
 * 平衡换行和 lineClamp 一起用时 satori 会误加省略号，所以平衡换行的部分用最大高度截断。
 */
function titleLines(title: string) {
  const text = clean(title);
  const colon = text.indexOf('：');
  const base = { display: 'block', fontSize: TITLE_SIZE, fontWeight: 700, lineHeight: `${TITLE_LINE}px` };
  const balanced = (lines: number) => ({ ...base, textWrap: 'balance', maxHeight: TITLE_LINE * lines, overflow: 'hidden' });
  if (colon <= 0 || colon === text.length - 1) return [div(balanced(3), text)];
  return [div({ ...base, lineClamp: 1 }, text.slice(0, colon + 1)), div(balanced(2), text.slice(colon + 1))];
}

function layout({ kind, title, description, tags, meta }: OgCard, host: string) {
  const style = kindStyle[kind ?? 'site'];
  const shownTags = tags.length > 5 ? [...tags.slice(0, 4), `+${tags.length - 4}`] : tags;
  return div(
    { ...OG_SIZE, display: 'flex', flexDirection: 'column', position: 'relative', padding: '64px 72px 56px 84px', background: colors.bg, color: colors.ink, fontFamily: 'Noto Sans SC' },
    div({ position: 'absolute', top: 0, bottom: 0, left: 0, width: 12, background: style.bar }),
    // 页眉和网站顶栏的品牌区一致，右侧是内容类型。
    div(
      { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
      div(
        { display: 'flex', alignItems: 'center' },
        div({ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 16, background: colors.ink, color: colors.bg, fontSize: 32, fontWeight: 700 }, '工'),
        div(
          { display: 'flex', flexDirection: 'column', marginLeft: 18 },
          div({ fontSize: 28, fontWeight: 700 }, siteConfig.name),
          div({ fontSize: 18, color: colors.muted, letterSpacing: 3 }, '学习、工程、复盘'),
        ),
      ),
      kind && div({ display: 'flex', padding: '6px 22px', borderRadius: 999, background: style.soft, color: style.ink, fontSize: 24, fontWeight: 700 }, kindMeta[kind].label),
    ),
    div(
      { display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1 },
      ...titleLines(title),
      div({ display: 'block', marginTop: 24, fontSize: 28, lineHeight: 1.6, color: colors.muted, lineClamp: 2 }, clean(description)),
    ),
    div(
      { display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 22, borderTop: `2px solid ${colors.line}`, color: colors.muted, fontSize: 22 },
      div({ display: 'flex' }, ...shownTags.map((tag) => div({ display: 'flex', marginRight: 14, padding: '4px 16px', border: `2px solid ${colors.line}`, borderRadius: 999 }, clean(tag)))),
      div({ display: 'flex' }, [...meta, host].filter(Boolean).join(' · ')),
    ),
  );
}

export async function renderOgImage(card: OgCard, site: URL | undefined) {
  const missing = new Set<string>();
  const svg = await satori(layout(card, site?.host ?? ''), {
    ...OG_SIZE,
    fonts: await loadFonts(),
    // 字体子集里没有的字，satori 会来要别的字体。这里不联网去找，记下来报错，提示重新生成子集。
    loadAdditionalAsset: async (_code, segment) => {
      missing.add(segment);
      return [];
    },
  });
  if (missing.size > 0) {
    throw new Error(`分享图字体缺字：${[...missing].join('、')}（《${card.title}》）。在 site/ 下运行 npm run og:fonts 重新生成字体子集。`);
  }
  // 调色板 PNG：卡片只有几种颜色，体积约为真彩色的一半（实测 25–35 KB），文字边缘看不出差别。
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toBuffer();
}
