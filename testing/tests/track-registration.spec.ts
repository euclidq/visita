import { test, expect, type Page } from '@playwright/test';

const testData = {
    referenceNumber: 'VISIT-1785221437615',
    emailAddress: 'euclidlquemada@gmail.com',
    otp: '123456'
};

const clickAway = async (page: Page) => {
  await page.locator('body').click({ position: { x: 0, y: 0 } });
}

const sendOtp = async (page: Page, emailAddress: string) => {
  await page.getByLabel('Email Address').fill(emailAddress);
  await page.getByRole('button', { name: 'Send OTP' }).click();
  await expect(page.getByText('OTP Sent')).toBeVisible({ timeout: 0 });
};

test.describe('Track Registration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Track Registration' }).click();
        await expect(page).toHaveURL(/.*track-registration/);
        await page.getByRole('heading', { name: 'Track Registration' }).isVisible();
    });

    test('[R1_TR_TC_001] should submit track registration form successfully', async ({ page }) => {
        await page.getByLabel('Reference Number').fill(testData.referenceNumber);
        sendOtp(page, testData.emailAddress);
        await page.getByLabel('OTP').fill(testData.otp);
        
        await page.getByRole('button', { name: 'Track Registration' }).click();
        await expect(page.locator('#reference-number')).toBeVisible();
        await expect(page.locator('#visitor-name')).toBeVisible();
        await expect(page.locator('#purpose')).toBeVisible();
        await expect(page.locator('#person-to-visit')).toBeVisible();
        await expect(page.locator('#location')).toBeVisible();
    });

    test('[R1_TR_TC_002] should show error message with empty reference number', async ({ page }) => {
        await page.getByLabel('Reference Number').click();
        await clickAway(page);
        await expect(page.getByText('Reference Number is required')).toBeVisible();
    });

    test('[R1_TR_TC_003] should show error message with empty email address', async ({ page }) => {
        await page.getByLabel('Email Address').click();
        await clickAway(page);
        await expect(page.getByText('Email Address is required')).toBeVisible();
    });

    test('[R1_TR_TC_004] should show error message with invalid email address format', async ({ page }) => {
        await page.getByLabel('Email Address').fill('invalid-email');
        clickAway(page);
        await expect(page.getByText('Enter a valid email address')).toBeVisible();
    });

    test('[R1_TR_TC_005] should show error message with empty OTP', async ({ page }) => {
        await sendOtp(page, testData.emailAddress);

        await page.getByLabel('OTP').click();
        clickAway(page);

        await expect(page.getByText('OTP is required')).toBeVisible();
    });

    test('[R1_TR_TC_006] should show error message with invalid OTP', async ({ page }) => {
        await page.getByLabel('Reference Number').fill(testData.referenceNumber);
        await sendOtp(page, testData.emailAddress);

        await page.getByLabel('OTP').fill('invalid-otp');
        await page.getByRole('button', { name: 'Track Registration' }).click();

        await expect(page.getByText('Invalid OTP')).toBeVisible();
    });

    test('[R1_TR_TC_007] should show error message with expired OTP', async ({ page }) => {
        await page.getByLabel('Reference Number').fill(testData.referenceNumber);
        await sendOtp(page, testData.emailAddress);

        await page.waitForTimeout(15000); // 15 seconds

        await page.getByLabel('OTP').fill(testData.otp);
        await page.getByRole('button', { name: 'Track Registration' }).click();

        await expect(page.getByText('Expired OTP')).toBeVisible();
    });

    test('[R1_TR_TC_008] should display OTP request cooldown', async ({ page }) => {
        await page.getByLabel('Reference Number').fill(testData.referenceNumber);
        await sendOtp(page, testData.emailAddress);

        await expect(page.getByRole('button', { name: /Resend OTP after \(\d+s\)/ })).toBeVisible();
    });

    // invalid reference number and email address combination
    test('[R1_TR_TC_009] should show error message with invalid reference number and invalid email address', async ({ page }) => {
        await page.getByLabel('Reference Number').fill('invalid-reference-number');
        await sendOtp(page, 'sample@email.com');

        await page.getByLabel('OTP').fill(testData.otp);
        await page.getByRole('button', { name: 'Track Registration' }).click();

        await expect(page.getByText('Visit Not Found')).toBeVisible();
    });

    test('[R1_TR_TC_010] should show error message with invalid reference number', async ({ page }) => {
        await page.getByLabel('Reference Number').fill('invalid-reference-number');
        await sendOtp(page, testData.emailAddress);

        await page.getByLabel('OTP').fill(testData.otp);
        await page.getByRole('button', { name: 'Track Registration' }).click();

        await expect(page.getByText('Visit Not Found')).toBeVisible();
    });

    test('[R1_TR_TC_011] should show error message with invalid email address', async ({ page }) => {
        await page.getByLabel('Reference Number').fill(testData.referenceNumber);
        await sendOtp(page, 'sample@email.com');

        await page.getByLabel('OTP').fill(testData.otp);
        await page.getByRole('button', { name: 'Track Registration' }).click();

        await expect(page.getByText('Visit Not Found')).toBeVisible();
    });
});