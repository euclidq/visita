import { test, expect, type Page } from '@playwright/test';
import { testData } from '../constants/visitor-registration';

// Helper functions
const fillStep1 = async (page: Page) => {
  await page.getByLabel('First Name').fill(testData.firstName);
  await page.getByLabel('Last Name').fill(testData.lastName);
  await page.getByLabel('Email Address').fill(testData.emailAddress);
  await page.getByRole('button', { name: 'Send OTP' }).click();
  await expect(page.getByText('OTP Sent')).toBeVisible({ timeout: 0 });

  await page.getByLabel('OTP').fill('123456');
  await page.getByRole('button', { name: 'Verify OTP' }).click();
  await expect(page.getByText('OTP Verified')).toBeVisible({ timeout: 0 });

  await page.getByLabel('Mobile Number').fill(testData.mobileNumber);
};

const fillStep2 = async (page: Page) => {
  await page.getByLabel('Purpose').fill(testData.purpose);
  await page.getByLabel('Person to Visit').fill(testData.personToVisit);
  await page.getByLabel('Unit Number').fill(testData.unitNumber);
  await page.getByLabel('Building').fill(testData.buildingName);
};

const clickAway = async (page: Page) => {
  await page.locator('body').click({ position: { x: 0, y: 0 } });
}

const sendOtp = async (page: Page, emailAddress: string) => {
  await page.getByLabel('Email Address').fill(emailAddress);
  await page.getByRole('button', { name: 'Send OTP' }).click();
  await expect(page.getByText('OTP Sent')).toBeVisible({ timeout: 0 });
};

test.describe('Visitor Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Visitor Registration' }).click();
    await expect(page).toHaveURL(/.*visitor-registration/);
    await page.getByRole('heading', { name: 'Visitor Registration' }).isVisible();
  });

  test('[TC-001] should submit visitor registration form successfully', async ({ page }) => {
    await fillStep1(page);
    await page.getByRole('button', { name: 'Next' }).click();

    await fillStep2(page);
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText('Registration Successful')).toBeVisible({ timeout: 0 });
    await expect(page).toHaveURL(/.*visitor-registration\/success/);
  });

  test('[TC-002] should require first name', async ({ page }) => {
    await page.getByLabel('First Name').click();
    clickAway(page);
    await expect(page.getByText('First Name is required')).toBeVisible();
  });

  test('[TC-003] should require last name', async ({ page }) => {
    await page.getByLabel('Last Name').click();
    clickAway(page);
    await expect(page.getByText('Last Name is required')).toBeVisible();
  });

  test('[TC-004] should require email address', async ({ page }) => {
    await page.getByLabel('Email Address').click();
    clickAway(page);
    await expect(page.getByText('Email Address is required')).toBeVisible();
  });

  test('[TC-005] should require valid email address', async ({ page }) => {
    await page.getByLabel('Email Address').fill('invalid-email-address');
    clickAway(page);
    await expect(page.getByText('Enter a valid email address')).toBeVisible();
  });

  test('[TC-006] should require OTP', async ({ page }) => {
    await sendOtp(page, testData.emailAddress);

    await page.getByLabel('OTP').click();
    clickAway(page);
    await expect(page.getByText('OTP is required')).toBeVisible({ timeout: 0 });
  });

  test('[TC-007] should require valid OTP', async ({ page }) => {
    await sendOtp(page, testData.emailAddress);

    await page.getByLabel('OTP').fill('654321');
    await page.getByRole('button', { name: 'Verify OTP' }).click();
    await expect(page.getByText('Invalid OTP')).toBeVisible({ timeout: 0 });
  });

  test('[TC-008] should require unexpired OTP', async ({ page }) => {
    await sendOtp(page, testData.emailAddress);

    await page.waitForTimeout(15000); // 15 seconds

    await page.getByLabel('OTP').fill('123456');
    await page.getByRole('button', { name: 'Verify OTP' }).click();
    await expect(page.getByText('OTP has expired')).toBeVisible({ timeout: 0 });
  });

  test('[TC-009] should display OTP requuest cooldown', async ({ page }) => {
    await sendOtp(page, testData.emailAddress);

    await expect(page.getByRole('button', { name: /Resend OTP after \(\d+s\)/ })).toBeVisible({ timeout: 0 });
  });

  test('[TC-010] should require mobile number', async ({ page }) => {
    await page.getByLabel('Mobile Number').click();
    clickAway(page);
    await expect(page.getByText('Mobile Number is required')).toBeVisible();
  });

  test('[TC-011] should require valid mobile number', async ({ page }) => {
    await page.getByLabel('Mobile Number').fill('invalid-mobile');
    clickAway(page);
    await expect(page.getByText('Enter a valid mobile number')).toBeVisible();
  });

  test('[TC-012] should require purpose', async ({ page }) => {
    await fillStep1(page);
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByLabel('Purpose').click();
    clickAway(page);
    await expect(page.getByText('Purpose is required')).toBeVisible();
  });

  test('[TC-013] should require person to visit', async ({ page }) => {
    await fillStep1(page);
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByLabel('Person to Visit').click();
    clickAway(page);
    await expect(page.getByText('Person to Visit is required')).toBeVisible();
  });

  test('[TC-014] should require unit number', async ({ page }) => {
    await fillStep1(page);
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByLabel('Unit Number').click();
    clickAway(page);
    await expect(page.getByText('Unit Number is required')).toBeVisible();
  });

  test('[TC-015] should require building', async ({ page }) => {
    await fillStep1(page);
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByLabel('Building').click();
    clickAway(page);
    await expect(page.getByText('Building is required')).toBeVisible();
  });
});