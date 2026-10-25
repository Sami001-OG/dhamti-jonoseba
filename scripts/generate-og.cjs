const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function generateOG() {
  const photoPath = path.join(__dirname, '../public/leader.jpg');
  if (!fs.existsSync(photoPath)) {
    console.error('Leader photo not found at:', photoPath);
    process.exit(1);
  }

  const photoBase64 = fs.readFileSync(photoPath).toString('base64');
  const photoDataUri = `data:image/jpeg;base64,${photoBase64}`;

  // 1200 x 630 OpenGraph SVG with Md. Anwar Hossain Bhuiyan's genuine portrait
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Deep Emerald & Forest Gradients -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="50%" stop-color="#022c22" />
      <stop offset="100%" stop-color="#011812" />
    </linearGradient>
    <radialGradient id="glowTopRight" cx="80%" cy="20%" r="55%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#022c22" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowBottomLeft" cx="15%" cy="85%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#011812" stop-opacity="0" />
    </radialGradient>
    
    <!-- Gold Linear Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>

    <!-- Drop Shadows -->
    <filter id="portraitShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.65" />
    </filter>
    <filter id="softTextShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000000" flood-opacity="0.5" />
    </filter>

    <!-- Portrait Clip Path: Classy Arched / Rounded Rect Frame -->
    <clipPath id="portraitClip">
      <rect x="760" y="70" width="370" height="470" rx="36" />
    </clipPath>
  </defs>

  <!-- Deep Emerald Civic Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />
  <rect width="1200" height="630" fill="url(#glowTopRight)" />
  <rect width="1200" height="630" fill="url(#glowBottomLeft)" />

  <!-- Subtle Elegant Architectural Lines -->
  <g opacity="0.06" stroke="#ffffff" stroke-width="1.2">
    <circle cx="945" cy="305" r="290" fill="none" />
    <circle cx="945" cy="305" r="220" fill="none" stroke-dasharray="6 6" />
    <circle cx="150" cy="120" r="180" fill="none" />
  </g>

  <!-- Outer Architectural Border -->
  <rect x="24" y="24" width="1152" height="582" rx="24" fill="none" stroke="#34d399" stroke-width="1.5" stroke-opacity="0.25" />

  <!-- LEFT CIVIC CONTENT COLUMN -->
  <!-- 1. Header Badge -->
  <g transform="translate(75, 75)">
    <rect width="320" height="42" rx="21" fill="#065f46" stroke="#34d399" stroke-width="1.2" stroke-opacity="0.5" />
    <circle cx="22" cy="21" r="6" fill="#34d399" />
    <text x="38" y="27" font-family="'Hind Siliguri', 'Segoe UI', Arial, sans-serif" font-size="15" font-weight="600" fill="#ecfdf5">
      ধামতী ইউনিয়ন নাগরিক সেবা মঞ্চ
    </text>
  </g>

  <!-- 2. Main Slogan -->
  <text x="75" y="195" font-family="'Noto Serif Bengali', 'Hind Siliguri', serif" font-size="52" font-weight="700" fill="#ffffff" filter="url(#softTextShadow)">
    আমাদের ধামতী আমরাই গড়ব
  </text>

  <!-- 3. Sub Slogan -->
  <text x="75" y="255" font-family="'Noto Serif Bengali', 'Hind Siliguri', serif" font-size="30" font-weight="600" fill="url(#goldGrad)">
    একসাথে গড়ব আগামীর ধামতী
  </text>

  <!-- 4. Leader Civic Persona Card -->
  <g transform="translate(75, 305)">
    <rect width="630" height="135" rx="20" fill="#022c22" fill-opacity="0.85" stroke="#10b981" stroke-width="1.5" stroke-opacity="0.4" />
    
    <!-- Accent Left Golden Bar -->
    <rect x="0" y="20" width="5" height="95" rx="2.5" fill="url(#goldGrad)" />

    <text x="28" y="44" font-family="'Hind Siliguri', 'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#6ee7b7" letter-spacing="1">
      উদ্যোগ ও সার্বিক তত্ত্বাবধানে:
    </text>

    <text x="28" y="82" font-family="'Noto Serif Bengali', 'Hind Siliguri', serif" font-size="30" font-weight="700" fill="#ffffff">
      মোঃ আনোয়ার হোসেন ভূঁইয়া
    </text>

    <text x="28" y="114" font-family="'Hind Siliguri', 'Segoe UI', Arial, sans-serif" font-size="15" font-weight="500" fill="#a7f3d0">
      ধামতী ইউনিয়ন সেবক | জনসেবা, নাগরিক অধিকার ও স্বচ্ছতা
    </text>
  </g>

  <!-- 5. Bottom Contacts & Direct Hotline -->
  <g transform="translate(75, 475)">
    <!-- Phone Pill -->
    <g transform="translate(0, 0)">
      <rect width="270" height="50" rx="14" fill="#064e3b" stroke="#34d399" stroke-width="1" stroke-opacity="0.5" />
      <text x="20" y="32" font-family="'Hind Siliguri', Arial, sans-serif" font-size="14" font-weight="600" fill="#a7f3d0">
        📞 হেল্পলাইন:
      </text>
      <text x="110" y="32" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="700" fill="#fbbf24">
        01613394074
      </text>
    </g>

    <!-- Email Pill -->
    <g transform="translate(285, 0)">
      <rect width="320" height="50" rx="14" fill="#064e3b" stroke="#34d399" stroke-width="1" stroke-opacity="0.5" />
      <text x="20" y="32" font-family="'Hind Siliguri', Arial, sans-serif" font-size="14" font-weight="600" fill="#a7f3d0">
        ✉️
      </text>
      <text x="50" y="32" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="14" font-weight="600" fill="#ffffff">
        Anwarbhuiyan184@gmail.com
      </text>
    </g>
  </g>

  <!-- RIGHT COLUMN: THE PERSON'S PORTRAIT (Aesthetic & Classy) -->
  <!-- Outer Halo Glow -->
  <circle cx="945" cy="305" r="235" fill="#f59e0b" fill-opacity="0.10" filter="blur(30px)" />
  
  <!-- Outer Gold/Emerald Double Frame Border -->
  <rect x="754" y="64" width="382" height="482" rx="42" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-opacity="0.8" filter="url(#portraitShadow)" />
  <rect x="758" y="68" width="374" height="474" rx="38" fill="none" stroke="#059669" stroke-width="2.5" />

  <!-- The Actual High-Res Portrait of Md. Anwar Hossain Bhuiyan -->
  <g clip-path="url(#portraitClip)">
    <image
      href="${photoDataUri}"
      x="760"
      y="70"
      width="370"
      height="470"
      preserveAspectRatio="xMidYMid slice"
    />
    <!-- Subtle natural bottom gradient blend for editorial portrait elegance -->
    <rect x="760" y="440" width="370" height="100" fill="url(#bgGrad)" opacity="0.7" />
    <text x="945" y="520" text-anchor="middle" font-family="'Noto Serif Bengali', 'Hind Siliguri', serif" font-size="18" font-weight="700" fill="#ffffff">
      মোঃ আনোয়ার হোসেন ভূঁইয়া
    </text>
  </g>
</svg>`;

  const svgPath = path.join(__dirname, '../public/og-image.svg');
  const pngPath = path.join(__dirname, '../public/og-image.png');

  fs.writeFileSync(svgPath, svgContent, 'utf8');
  console.log('Saved SVG to:', svgPath);

  // Use Playwright to render pixel-perfect 1200x630 PNG
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 }
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&family=Noto+Serif+Bengali:wght@600;700&family=Plus+Jakarta+Sans:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1200px; height: 630px; overflow: hidden; background: #064e3b; }
    svg { display: block; width: 1200px; height: 630px; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

  await page.setContent(html, { waitUntil: 'networkidle' });
  // Short pause to ensure web fonts render
  await page.waitForTimeout(600);
  await page.screenshot({ path: pngPath, type: 'png' });
  await browser.close();

  const stats = fs.statSync(pngPath);
  console.log('Successfully generated og-image.png (' + stats.size + ' bytes) at:', pngPath);
}

generateOG().catch((err) => {
  console.error('Error generating OG image:', err);
  process.exit(1);
});
