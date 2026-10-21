import fs from 'fs';
import { chromium } from 'playwright';

async function generateIcons() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const svgContent = fs.readFileSync('public/icon.svg', 'utf8');
  
  // Render 512x512
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:#FFF4E4;">${svgContent}</body></html>`);
  await page.setViewportSize({ width: 512, height: 512 });
  await page.screenshot({ path: 'public/pwa-512x512.png' });
  await page.screenshot({ path: 'public/pwa-maskable-512x512.png' });

  // Render 192x192
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:#FFF4E4;"><div style="width:192px;height:192px;">${svgContent.replace('width="512"', 'width="192"').replace('height="512"', 'height="192"')}</div></body></html>`);
  await page.setViewportSize({ width: 192, height: 192 });
  await page.screenshot({ path: 'public/pwa-192x192.png' });

  // Render 180x180 (apple-touch-icon)
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:#FFF4E4;"><div style="width:180px;height:180px;">${svgContent.replace('width="512"', 'width="180"').replace('height="512"', 'height="180"')}</div></body></html>`);
  await page.setViewportSize({ width: 180, height: 180 });
  await page.screenshot({ path: 'public/apple-touch-icon.png' });

  await browser.close();
  console.log('Android PNG icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
