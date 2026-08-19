import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/admin/login');
        await expect(page).toHaveURL(/.*login/);
        await page.getByRole('heading', { name: 'Admin Login' }).isVisible();

        await page.getByLabel('Email Address').fill('euclidlquemada@gmail.com');
        await page.getByLabel('Password').fill('P@ssw0rd');
        await page.getByRole('button', { name: 'Log In' }).click();
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('[R2_AD_TC_001] should display the admin dashboard', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    });

    test('[R2_AD_TC_002] should display the visitor registrations', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Visitor Registrations' })).toBeVisible();
        await expect(page.getByRole('table')).toBeVisible();
    });

    test('[R2_AD_TC_003] should allow searching visitor registrations', async ({ page }) => {
        const searchInput = page.getByPlaceholder('Search registrations');
        await searchInput.fill('Euclid Quemada');
        await page.getByRole('button', { name: 'search', exact: true }).click();
        await expect(page.getByRole('table')).toContainText('Euclid Quemada');
    });

    test('[R2_AD_TC_004] should allow filtering visitor registrations by status', async ({ page }) => {
        const statusSelect = page.locator('#Status');
        await statusSelect.click();
        await expect(statusSelect).toHaveAttribute('aria-expanded', 'true');

        await page.getByRole('option', { name: 'PENDING', exact: true }).click();

        await expect(statusSelect).toHaveAttribute('aria-expanded', 'false');
        await expect(page.getByRole('table')).toContainText('PENDING');
    });

    test('[R2_AD_TC_005] should allow sorting visitor registrations by selected column', async ({ page }) => {
        const referenceNumberHeader = page.getByRole('columnheader', { name: /Reference Number/ });
        await referenceNumberHeader.click();
        await expect(referenceNumberHeader).toHaveAttribute('aria-sort', 'ascending');
        await expect(page.getByRole('table')).toBeVisible();
    });

    test('[R2_AD_TC_006] should allow pagination of visitor registrations', async ({ page }) => {
        const nextPage = page.getByRole('button', { name: 'right', exact: true });
        await expect(nextPage).toBeEnabled();
        await nextPage.click();
        await expect(page.getByRole('table')).toBeVisible();
    });

    test('[R2_AD_TC_007] should allow refreshing of visitor registrations', async ({ page }) => {
        await page.getByRole('button', { name: 'Refresh', exact: true }).click();
        await expect(page.getByText('Visitor Registrations Fetched')).toBeVisible();
    });

    test('[R2_AD_TC_008] should allow viewing registration details', async ({ page }) => {
        const firstRow = page.getByRole('table').getByRole('row').nth(1);

        await firstRow.getByRole('button', { name: 'View', exact: true }).click();

        const detailsDialog = page.getByRole('dialog');
        await expect(detailsDialog).toBeVisible();
        await expect(detailsDialog).toContainText('Registration Details');
    });

    test('[R2_AD_TC_009] should allow logging out from the admin dashboard', async ({ page }) => {
        await page.getByRole('button', { name: 'Log Out' }).click();
        
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.locator('#confirm-logout-button').click();
        await expect(page).toHaveURL(/.*login/);
    });
});
