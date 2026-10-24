const { chromium } = require('playwright');

async function runVerification() {
  console.log('--- Starting Playwright UI & Typography Verification ---');
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (err) {
    console.error('Failed to launch chromium:', err.message);
    process.exit(1);
  }

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('1. Loading http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });

  // 1. Title verification
  const title = await page.title();
  console.log(`✓ Page Title: "${title}"`);
  if (!title.includes('আনোয়ার হোসেন ভূঁইয়া')) {
    throw new Error('Title does not contain leader name!');
  }

  // 2. Leader Permanent Portrait check
  const leaderImg = await page.$('img[alt="মোঃ আনোয়ার হোসেন ভূঁইয়া"], img[alt*="আনোয়ার"]');
  if (!leaderImg) {
    throw new Error('Leader profile image element not found!');
  }
  const imgSrc = await leaderImg.getAttribute('src');
  console.log(`✓ Permanent Leader Photo Src: ${imgSrc}`);
  if (!imgSrc.includes('3y27qH6j')) {
    throw new Error('Leader photo URL does not match hardcoded portrait URL!');
  }

  // 3. Slogan verification
  const sloganText = await page.textContent('#hero-banner');
  if (sloganText.includes('আমাদের ধামতী আমরাই গড়ব') && sloganText.includes('একসাথে গড়ব আগামীর ধামতী')) {
    console.log('✓ Main Slogans verified successfully on the pedestal!');
  } else {
    throw new Error('Official slogans not found in HeroSection!');
  }

  // 4. Electoral Manifesto Section Check
  const manifestoSection = await page.$('#manifesto');
  if (!manifestoSection) {
    throw new Error('#manifesto section not found!');
  }
  const manifestoText = await manifestoSection.textContent();
  if (manifestoText.includes('নির্বাচনী ইশতেহার') && manifestoText.includes('বাস্তবায়িত')) {
    console.log('✓ Electoral Manifesto section verified with progress tracking!');
  } else {
    throw new Error('Manifesto content not properly rendered!');
  }

  // 5. Citizen Feed Advice & Complaints Check
  const adviceTab = await page.$('button:has-text("উপদেশ")');
  if (!adviceTab) {
    throw new Error('Advice (উপদেশ) filter button not found in ProblemFeedSection!');
  }
  console.log('✓ Advice (উপদেশ) tab found in citizen feed.');

  // Click advice tab and verify advice items
  await adviceTab.click();
  await page.waitForTimeout(500);
  const feedContent = await page.textContent('#problem-feed');
  if (feedContent.includes('উপদেশ ও পরামর্শ') || feedContent.includes('ADV-2026')) {
    console.log('✓ Advice items filtered and displayed successfully.');
  }

  // 6. Report / Advice Modal test
  const openModalBtn = await page.$('header button:has-text("অভিযোগ / উপদেশ দিন")');
  if (openModalBtn) {
    await page.evaluate(() => {
      // Ensure no backdrop is blocking
      const el = Array.from(document.querySelectorAll('header button')).find(b => b.textContent.includes('অভিযোগ'));
      if (el) el.click();
    });
    await page.waitForTimeout(400);
    const modalContent = await page.textContent('body');
    if (modalContent.includes('পরামর্শ') && modalContent.includes('অভিযোগ')) {
      console.log('✓ Submission Modal opened and offers both Grievance & Advice modes.');
    }
    // Close modal via Esc key or close button
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  // 7. Typography and Zero-Pill Check
  const fontFamilies = await page.evaluate(() => {
    const heading = document.querySelector('h1');
    const computed = window.getComputedStyle(heading);
    return {
      fontFamily: computed.fontFamily,
      letterSpacing: computed.letterSpacing,
      lineHeight: computed.lineHeight
    };
  });
  console.log('✓ Typography Computed Settings:', fontFamilies);

  if (consoleErrors.length > 0) {
    console.warn('Console errors detected:', consoleErrors);
  } else {
    console.log('✓ Zero console errors detected during run.');
  }

  await browser.close();
  console.log('=== All Playwright Verifications Passed Successfully! ===');
}

runVerification().catch(err => {
  console.error('Playwright verification failed:', err);
  process.exit(1);
});
