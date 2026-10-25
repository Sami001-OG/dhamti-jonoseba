const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function generateOG() {
  const photoPath = path.join(__dirname, '../public/assets/aistudio/InShot_20261024_162214860_dca4b29b.jpg');
  const photoBase64 = fs.readFileSync(photoPath).toString('base64');
  const photoDataUri = `data:image/jpeg;base64,${photoBase64}`;

  const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1200px;
      height: 630px;
      background: radial-gradient(circle at 85% 20%, #065f46 0%, #022c22 45%, #011812 100%);
      font-family: 'Hind Siliguri', -apple-system, sans-serif;
      color: #ffffff;
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 48px 64px;
    }
    
    /* Background subtle civic aura */
    .bg-circle-1 {
      position: absolute;
      top: -80px;
      right: 180px;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(6, 95, 70, 0) 70%);
      pointer-events: none;
    }
    .bg-circle-2 {
      position: absolute;
      bottom: -100px;
      left: 100px;
      width: 450px;
      height: 450px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, rgba(2, 44, 34, 0) 70%);
      pointer-events: none;
    }

    /* Outer golden-green border accent */
    .outer-frame {
      position: absolute;
      inset: 18px;
      border: 1.5px solid rgba(52, 211, 153, 0.25);
      border-radius: 24px;
      pointer-events: none;
    }

    .left-content {
      flex: 1;
      max-width: 650px;
      z-index: 10;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .badge-row {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(6, 95, 70, 0.7);
      border: 1px solid rgba(52, 211, 153, 0.4);
      padding: 6px 16px;
      border-radius: 9999px;
      width: fit-content;
      margin-bottom: 22px;
      backdrop-filter: blur(8px);
    }
    .badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #34d399;
    }
    .badge-text {
      font-size: 15px;
      font-weight: 600;
      color: #ecfdf5;
      letter-spacing: 0.3px;
    }

    .main-slogan {
      font-family: 'Noto Serif Bengali', serif;
      font-size: 52px;
      font-weight: 700;
      line-height: 1.18;
      color: #ffffff;
      margin-bottom: 12px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    .sub-slogan {
      font-family: 'Noto Serif Bengali', serif;
      font-size: 26px;
      font-weight: 600;
      color: #fde68a;
      line-height: 1.35;
      margin-bottom: 28px;
    }

    .leader-box {
      background: rgba(2, 44, 34, 0.85);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .leader-name {
      font-family: 'Noto Serif Bengali', serif;
      font-size: 25px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.2px;
    }
    .leader-title {
      font-size: 14px;
      font-weight: 500;
      color: #6ee7b7;
    }

    .contact-row {
      display: flex;
      align-items: center;
      gap: 24px;
      font-size: 14px;
      color: #d1fae5;
      font-weight: 500;
    }
    .contact-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Right portrait side */
    .right-portrait {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-left: 36px;
    }

    .portrait-halo {
      position: absolute;
      width: 370px;
      height: 370px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(16, 185, 129, 0.1) 50%, transparent 75%);
      z-index: 1;
    }

    .portrait-card {
      position: relative;
      z-index: 2;
      width: 340px;
      height: 440px;
      border-radius: 32px;
      overflow: hidden;
      border: 4px solid #059669;
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 0 2px rgba(251, 191, 36, 0.4);
      background-color: #022c22;
    }

    .portrait-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }

    .portrait-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(2, 44, 34, 0.95) 0%, rgba(2, 44, 34, 0.6) 65%, transparent 100%);
      padding: 24px 16px 12px;
      text-align: center;
    }
    .portrait-footer-name {
      font-family: 'Noto Serif Bengali', serif;
      font-size: 16px;
      font-weight: 700;
      color: #ffffff;
    }
    .portrait-footer-sub {
      font-size: 12px;
      color: #a7f3d0;
      margin-top: 2px;
    }
  </style>
</head>
<body>
  <div class="bg-circle-1"></div>
  <div class="bg-circle-2"></div>
  <div class="outer-frame"></div>

  <div class="left-content">
    <div class="badge-row">
      <div class="badge-dot"></div>
      <span class="badge-text">ধামতী ইউনিয়ন নাগরিক সেবা মঞ্চ</span>
    </div>

    <h1 class="main-slogan">আমাদের ধামতী আমরাই গড়ব</h1>
    <h2 class="sub-slogan">একসাথে গড়ব আগামীর ধামতী</h2>

    <div class="leader-box">
      <div class="leader-name">মোঃ আনোয়ার হোসেন ভূঁইয়া</div>
      <div class="leader-title">ধামতী ইউনিয়ন সেবক | জনসেবা ও সমস্যা সমাধান পোর্টাল</div>
    </div>

    <div class="contact-row">
      <div class="contact-item">
        <span>📞 ০১৬১৩-৩৯৪০৭৪</span>
      </div>
      <div class="contact-item">
        <span>✉️ Anwarbhuiyan184@gmail.com</span>
      </div>
    </div>
  </div>

  <div class="right-portrait">
    <div class="portrait-halo"></div>
    <div class="portrait-card">
      <img src="${photoDataUri}" alt="মোঃ আনোয়ার হোসেন ভূঁইয়া" />
      <div class="portrait-footer">
        <div class="portrait-footer-name">মোঃ আনোয়ার হোসেন ভূঁইয়া</div>
        <div class="portrait-footer-sub">ধামতী ইউনিয়ন, দেবিদ্বার, কুমিল্লা</div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 }
  });

  await page.setContent(html, { waitUntil: 'networkidle' });
  // Wait for Google Fonts to render
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const outputPath = path.join(__dirname, '../public/og-image.png');
  await page.screenshot({ path: outputPath, type: 'png' });
  console.log('Successfully generated public/og-image.png');

  await browser.close();
}

generateOG().catch(err => {
  console.error('Error generating OG:', err);
  process.exit(1);
});
