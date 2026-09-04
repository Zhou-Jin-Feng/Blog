export function GET() {
  const siteUrl = (process.env.SITE_URL ?? 'http://localhost:4321').replace(/\/$/, '');
  const body = [`User-agent: *`, `Allow: /`, `Sitemap: ${siteUrl}/sitemap-index.xml`, ''].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
