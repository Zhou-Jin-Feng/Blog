import { defineConfig, devices } from '@playwright/test';

// 本机装有安全闸门时，测试浏览器必须显式走闸门代理，只靠环境变量不够（见 CLAUDE.md）。CI 不设置这个变量。
const proxyServer = process.env.PLAYWRIGHT_PROXY;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // 本地默认是 CPU 线程数的一半（本机 10 个），偶发超时。实测 4 到 10 个进程总耗时只差一两秒，
  // 瓶颈在最长的单个用例，所以取 4 个：几乎一样快，CPU 争用最小。
  workers: process.env.CI ? 1 : 4,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'on-first-retry',
    ...(proxyServer && {
      launchOptions: {
        proxy: { server: proxyServer },
        args: ['--disable-quic', '--force-webrtc-ip-handling-policy=disable_non_proxied_udp'],
      },
    }),
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4321',
    env: { ...process.env, ASTRO_PREVIEW_BACKGROUND: '1' },
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
