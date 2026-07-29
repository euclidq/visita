import { test, expect, type Page } from '@playwright/test';

const testData = {
    emailAddress: 'euclidlquemada@gmail.com',
    password: 'your-password'
};

test.describe('Login', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/admin/login');
        await expect(page).toHaveURL(/.*login/);
        await page.getByRole('heading', { name: 'Admin Login' }).isVisible();
    });

    test('[TC-001] should login successfully with valid credentials', async ({ page }) => {
});