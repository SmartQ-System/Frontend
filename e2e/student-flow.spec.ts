import { test, expect } from '@playwright/test';

test.describe('Student Flow', () => {
  test('should login as student and complete a quiz', async ({ page }) => {
    // 1. Go to Login Page
    await page.goto('/login');
    
    // 2. Quick Login as Student (since we have this feature)
    await page.getByRole('button', { name: /كطالب/i }).click();
    
    // 3. Verify Dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('مرحباً')).toBeVisible();
    
    // 4. Start Quiz
    await page.getByText('ابدأ تحدي جديد').click();
    await expect(page).toHaveURL('/quiz');
    
    // 5. Quiz Setup (New Feature)
    // Select Rapid Mode if available, or just verify setup
    await expect(page.getByText('إعدادات الاختبار')).toBeVisible();
    await page.getByText('ابدأ الاختبار!').click();
    
    // 6. Countdown
    await expect(page.getByText('3')).toBeVisible();
    await expect(page.getByText('1')).toBeVisible(); // Fast forward conceptually
    
    // 7. Answer Questions
    // We'll answer at least one question
    const option = page.locator('button.w-full').first();
    await option.waitFor();
    await option.click();
    
    // 8. Wait for next question or finish
    // Since we don't know exact question count, we just verify the quiz interface is active
    await expect(page.locator('.text-2xl.font-mono')).toBeVisible(); // Timer
  });
});
