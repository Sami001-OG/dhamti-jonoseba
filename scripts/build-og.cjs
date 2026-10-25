const fs = require('fs');
const path = require('path');

function createSvg() {
  const photoPath = path.join(__dirname, '../public/assets/aistudio/InShot_20261024_162214860_dca4b29b.jpg');
  const photoBase64 = fs.readFileSync(photoPath).toString('base64');
  const photoDataUri = `data:image/jpeg;base64,${photoBase64}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <!-- Background Gradients -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="45%" stop-color="#022c22" />
      <stop offset="100%" stop-color="#011812" />
    </linearGradient>
    <radialGradient id="glowTopRight" cx="80%" cy="20%" r="55%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.25" />
      <stop offset="100%" stop-color="#022c22" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="glowBottomLeft" cx="15%" cy="85%" r="50%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#011812" stop-opacity="0" />
    </radialGradient>
    
    <!-- Gold Linear Gradient -->
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>

    <!-- Card Background Gradient -->
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.02" />
    </linearGradient>

    <!-- Shadow Filters -->
    <filter id="portraitShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.6" />
    </filter>

    <filter id="softGlow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.35" />
    </filter>

    <!-- Portrait Clip Path: Dignified Arched / Rounded Frame -->
    <clipPath id="portraitClip">
      <rect x="760" y="80" width="370" height="470" rx="36" />
    </clipPath>
  </defs>

  <!-- Deep Emerald Civic Background -->
  <rect width="1200" height="630" fill="url(#bgGrad)" />
  <rect width="1200" height="630" fill="url(#glowTopRight)" />
  <rect width="1200" height="630" fill="url(#glowBottomLeft)" />

  <!-- Subtle Elegant Geometric Lines -->
  <g opacity="0.05" stroke="#ffffff" stroke-width="1.2">
    <circle cx="945" cy="315" r="300" fill="none" />
    <circle cx="945" cy="315" r="230" fill="none" stroke-dasharray="6 6" />
    <circle cx="150" cy="120" r="180" fill="none" />
  </g>

  <!-- Outer Architectural Border -->
  <rect x="24" y="24" width="1152" height="582" rx="24" fill="none" stroke="#34d399" stroke-width="1.5" stroke-opacity="0.25" />

  <!-- LEFT CIVIC CONTENT COLUMN -->
  <!-- 1. Header Badge -->
  <g transform="translate(75, 75)">
    <rect width="320" height="40" rx="20" fill="#065f46" stroke="#34d399" stroke-width="1.2" stroke-opacity="0.5" />
    <circle cx="22" cy="20" r="6" fill="#34d399" />
    <text x="38" y="26" font-family="'Hind Siliguri', 'Segoe UI', Arial, sans-serif" font-size="15" font-weight="600" fill="#ecfdf5">
      ধামতী ইউনিয়ন নাগরিক সেবা মঞ্চ
    </text>
  </g>

  <!-- 2. Main Slogan -->
  <text x="75" y="195" font-family="'Noto Serif Bengali', 'Hind Siliguri', serif" font-size="52" font-weight="700" fill="#ffffff" filter="url(#softGlow)" letter-spacing="0">
    আমাদের ধামতী আমরাই গড়ব
  </text>

  <!-- 3. Sub Slogan -->
  <text x="75" y="255" font-family="'Noto Serif Bengali', 'Hind Siliguri', serif" font-size="30" font-weight="600" fill="url(#goldGrad)">
    একসাথে গড়ব আগামীর ধামতী
  </text>

  <!-- 4. Leader Civic Persona Card -->
  <g transform="translate(75, 310)">
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
  <g transform="translate(75, 480)">
    <!-- Hotline Pill -->
    <g transform="translate(0, 0)">
      <rect width="270" height="48" rx="14" fill="#064e3b" stroke="#34d399" stroke-width="1" stroke-opacity="0.5" />
      <text x="22" y="30" font-family="'Hind Siliguri', Arial, sans-serif" font-size="14" font-weight="600" fill="#a7f3d0">
        📞 হেল্পলাইন:
      </text>
      <text x="110" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="700" fill="#fbbf24">
        01613394074
      </text>
    </g>

    <!-- Email Pill -->
    <g transform="translate(285, 0)">
      <rect width="320" height="48" rx="14" fill="#064e3b" stroke="#34d399" stroke-width="1" stroke-opacity="0.5" />
      <text x="20" y="30" font-family="'Hind Siliguri', Arial, sans-serif" font-size="14" font-weight="600" fill="#a7f3d0">
        ✉️
      </text>
      <text x="50" y="30" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="14" font-weight="600" fill="#ffffff">
        Anwarbhuiyan184@gmail.com
      </text>
    </g>
  </g>

  <!-- RIGHT COLUMN: THE PERSON'S PORTRAIT (Aesthetic & Classy) -->
  <!-- Outer Halo Glow -->
  <circle cx="945" cy="315" r="235" fill="#f59e0b" fill-opacity="0.08" filter="blur(30px)" />
  
  <!-- Outer Gold/Emerald Double Frame Border -->
  <rect x="754" y="74" width="382" height="482" rx="42" fill="none" stroke="url(#goldGrad)" stroke-width="3" stroke-opacity="0.8" filter="url(#portraitShadow)" />
  <rect x="758" y="78" width="374" height="474" rx="38" fill="none" stroke="#059669" stroke-width="3" />

  <!-- The Actual High-Res Photo of Md. Anwar Hossain Bhuiyan -->
  <g clip-path="url(#portraitClip)">
    <image
      href="${photoDataUri}"
      x="730"
      y="60"
      width="430"
      height="510"
      preserveAspectRatio="xMidYMid slice"
    />
    
    <!-- Seamless Bottom Shadow Gradient Inside Portrait -->
    <rect x="760" y="430" width="370" height="120" fill="url(#bgGrad)" opacity="0.9" />

    <!-- Name Label Ribbon at bottom of photo -->
    <text x="945" y="505" text-anchor="middle" font-family="'Noto Serif Bengali', 'Hind Siliguri', serif" font-size="18" font-weight="700" fill="#ffffff">
      মোঃ আনোয়ার হোসেন ভূঁইয়া
    </text>
    <text x="945" y="528" text-anchor="middle" font-family="'Hind Siliguri', Arial, sans-serif" font-size="13" font-weight="500" fill="#6ee7b7">
      দেবিদ্বার, কুমিল্লা
    </text>
  </g>
</svg>`;

  fs.writeFileSync(path.join(__dirname, '../public/og-image.svg'), svg, 'utf-8');
  console.log('Successfully written public/og-image.svg with leader photo!');
}

createSvg();
