// 生成分享图（/og/*.png）用的中文字体子集，只在构建期使用，不发给访客。
// 字符范围：ASCII、常用标点、GB2312 全部符号和 6763 个汉字，再加上现有内容 frontmatter 和分享图文案里出现的所有字。
// 构建时如果报“分享图字体缺字”，在 site/ 下运行 `npm run og:fonts` 重新生成即可。
//
// 源字体是 Noto Sans SC（SIL Open Font License 1.1），默认取 Windows 已安装的版本；
// 其他系统用 OG_FONT_REGULAR、OG_FONT_BOLD 指定常规体和粗体的路径（.otf 或 .ttf 均可）。
import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import subsetFont from 'subset-font';

const sources = {
  Regular: process.env.OG_FONT_REGULAR ?? 'C:/Windows/Fonts/Noto Sans SC (TrueType).otf',
  Bold: process.env.OG_FONT_BOLD ?? 'C:/Windows/Fonts/Noto Sans SC Bold (TrueType).otf',
};
const outDir = 'src/assets/og';

function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, i) => String.fromCodePoint(from + i)).join('');
}

/** GB2312 第 rowFrom 到 rowTo 区（按 EUC 编码的高字节），用 GBK 解码器逐个解出。 */
function gb2312(rowFrom, rowTo) {
  const decoder = new TextDecoder('gbk');
  let text = '';
  for (let hi = rowFrom; hi <= rowTo; hi += 1) {
    for (let lo = 0xa1; lo <= 0xfe; lo += 1) {
      const ch = decoder.decode(new Uint8Array([hi, lo]));
      // GB2312 的空位在 GBK 里解码成替换符或私用区字符，跳过。
      if (ch !== '\ufffd' && !/[\ue000-\uf8ff]/.test(ch)) text += ch;
    }
  }
  return text;
}

async function* walk(dir) {
  for (const name of await readdir(dir)) {
    const path = join(dir, name);
    if ((await stat(path)).isDirectory()) yield* walk(path);
    else yield path;
  }
}

/** 现有内容 frontmatter 里的字（标题、摘要、标签、技术栈等），以及分享图自己的文案。 */
async function contentText() {
  let text = '';
  for await (const path of walk('src/content')) {
    if (!path.endsWith('.md')) continue;
    const source = await readFile(path, 'utf8');
    text += source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  }
  for (const path of ['src/data/site.ts', 'src/lib/og-render.ts', 'src/pages/og/[...path].png.ts']) {
    text += await readFile(path, 'utf8');
  }
  return text;
}

const text = [
  range(0x20, 0x7e),
  range(0xa0, 0xff),
  range(0x2010, 0x205e),
  range(0x2190, 0x2199),
  gb2312(0xa1, 0xa9),
  gb2312(0xb0, 0xf7),
  await contentText(),
].join('');
const chars = new Set(text.replace(/\s/g, ' '));

for (const [weight, source] of Object.entries(sources)) {
  // 保留 name 表里的版权（0）、许可证说明（13）和许可证网址（14），满足 OFL 对随附版权和许可证的要求。
  const font = await subsetFont(await readFile(source), [...chars].join(''), { targetFormat: 'woff', preserveNameIds: [0, 13, 14] });
  const out = join(outDir, `NotoSansSC-${weight}.woff`);
  await writeFile(out, font);
  console.log(`${out}  ${(font.length / 1024).toFixed(0)} KB`);
}
console.log(`共 ${chars.size} 个字符`);
