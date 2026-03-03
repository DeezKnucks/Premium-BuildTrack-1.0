import { test, expect } from '@playwright/test';

const BASE_URL = 'https://workflow-engine-83.preview.emergentagent.com';

test.describe('BuildTrack Core Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Remove emergent preview badge if present
    await page.addInitScript(() => {
      const style = document.createElement('style');
      style.textContent = '[class*="emergent"], [id*="emergent-badge"] { display: none !important; }';
      document.head.appendChild(style);
    });
  });

  test('splash screen displays correctly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Check for splash screen elements
    await expect(page.getByText('BuildTrack')).toBeVisible({ timeout: 5000 });
    
    // Take screenshot
    await page.screenshot({ path: 'splash_screen.jpeg', quality: 20, fullPage: false });
  });

  test('onboarding shows Peter Martinez info', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for splash to transition to onboarding
    await page.waitForTimeout(3000);
    
    // Check for Peter Martinez name
    const peterText = page.getByText(/Peter Martinez/i);
    await expect(peterText).toBeVisible({ timeout: 10000 });
    
    // Check for Founder title
    await expect(page.getByText(/Founder/i)).toBeVisible();
    
    // Check for headshot image (verify it exists)
    const headshotImage = page.locator('img[src*="customer-assets.emergentagent.com"]');
    await expect(headshotImage).toBeVisible();
    
    await page.screenshot({ path: 'onboarding_peter.jpeg', quality: 20, fullPage: false });
  });

  test('login page loads after clicking Skip', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Click Skip button
    await page.click('text=Skip', { timeout: 5000 });
    await page.waitForTimeout(2000);
    
    // Verify login form elements
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
    await expect(page.getByText('Sign In')).toBeVisible();
    
    await page.screenshot({ path: 'login_page.jpeg', quality: 20, fullPage: false });
  });

  test('login with demo credentials succeeds', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Skip onboarding
    await page.click('text=Skip', { timeout: 5000 });
    await page.waitForTimeout(2000);
    
    // Fill login form
    await page.fill('input[placeholder="Enter your email"]', 'demo@buildtrack.com');
    await page.fill('input[placeholder="Enter your password"]', 'demo123');
    
    // Click Sign In
    await page.click('text=Sign In');
    await page.waitForTimeout(4000);
    
    // Verify dashboard loads - check for "Welcome back" text
    await expect(page.getByText(/Welcome back/i)).toBeVisible({ timeout: 10000 });
    
    await page.screenshot({ path: 'dashboard_after_login.jpeg', quality: 20, fullPage: false });
  });
});

test.describe('BuildTrack Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await page.click('text=Skip', { timeout: 5000 });
    await page.waitForTimeout(2000);
    await page.fill('input[placeholder="Enter your email"]', 'demo@buildtrack.com');
    await page.fill('input[placeholder="Enter your password"]', 'demo123');
    await page.click('text=Sign In');
    await page.waitForTimeout(4000);
  });

  test('dashboard displays user name', async ({ page }) => {
    await expect(page.getByText('Demo User')).toBeVisible();
  });

  test('dashboard shows Overview section', async ({ page }) => {
    await expect(page.getByText('Overview')).toBeVisible();
    await expect(page.getByText('Active Projects')).toBeVisible();
    await expect(page.getByText('Tasks Complete')).toBeVisible();
  });

  test('dashboard shows Weekly Progress chart', async ({ page }) => {
    await expect(page.getByText('Weekly Progress')).toBeVisible();
    
    // Check for day labels in the chart
    await expect(page.getByText('Mon')).toBeVisible();
    await expect(page.getByText('Tue')).toBeVisible();
    await expect(page.getByText('Wed')).toBeVisible();
    
    await page.screenshot({ path: 'dashboard_charts.jpeg', quality: 20, fullPage: false });
  });

  test('dashboard shows Performance section', async ({ page }) => {
    await expect(page.getByText('Performance')).toBeVisible();
  });

  test('dashboard shows bottom navigation', async ({ page }) => {
    // Use role selectors for tabs to avoid ambiguity with card text
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Projects' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Tasks' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'AI' })).toBeVisible();
  });

  test('dashboard shows Quick Actions section', async ({ page }) => {
    // Scroll down to see Quick Actions
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);
    
    await expect(page.getByText('Quick Actions')).toBeVisible({ timeout: 5000 });
    
    await page.screenshot({ path: 'dashboard_quick_actions.jpeg', quality: 20, fullPage: false });
  });
});
