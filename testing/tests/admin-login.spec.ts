import { test, expect } from '@playwright/test';

const testData = {
    emailAddress: 'euclidlquemada@gmail.com',
    password: 'P@ssw0rd'
};

test.describe('Admin Login', () => {
    test.describe.configure({ mode: 'serial' });
    
    test.beforeEach(async ({ page }) => {
        await page.goto('/admin/login');
        await expect(page).toHaveURL(/.*login/);
        await page.getByRole('heading', { name: 'Admin Login' }).isVisible();
    });

    test('[R2_AL_TC_001] should login successfully with valid email address and password', async ({ page }) => {
        await page.getByLabel('Email Address').fill(testData.emailAddress);
        await page.getByLabel('Password').fill(testData.password);
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('[R2_AL_TC_002] should show error message with invalid email address and password', async ({ page }) => {
        await page.getByLabel('Email Address').fill('invalid@email.com');
        await page.getByLabel('Password').fill('invalid-password');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Login Failed')).toBeVisible();
    });

    test('[R2_AL_TC_003] should show error message with invalid email address', async ({ page }) => {
        await page.getByLabel('Email Address').fill('invalid@email.com');
        await page.getByLabel('Password').fill(testData.password);
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Login Failed')).toBeVisible();
    });

    test('[R2_AL_TC_004] should show error message with invalid password', async ({ page }) => {
        await page.getByLabel('Email Address').fill(testData.emailAddress);
        await page.getByLabel('Password').fill('wrongpassword');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Login Failed')).toBeVisible();
    });

    test('[R2_AL_TC_005] should show error message with empty email address', async ({ page }) => {
        await page.getByLabel('Password').fill(testData.password);
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Email Address is required')).toBeVisible();
    });

    test('[R2_AL_TC_006] should show error message with invalid email address format', async ({ page }) => {
        await page.getByLabel('Email Address').fill('invalid-email-address');
        await page.getByLabel('Password').fill(testData.password);
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Enter a valid email address')).toBeVisible();
    });

    test('[R2_AL_TC_007] should show error message with empty password', async ({ page }) => {
        await page.getByLabel('Email Address').fill(testData.emailAddress);
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page.getByText('Password is required')).toBeVisible();
    });
});