import { test, expect, type Page } from '@playwright/test';

const login = async (page: Page) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email Address').fill('euclidlquemada@gmail.com');
    await page.getByLabel('Password').fill('P@ssw0rd');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
};

test.describe('Admin Visitor Check-in and Check-out', () => {
    test.describe.configure({ mode: 'serial' });
    let checkedInReference = '';

    test.beforeEach(async ({ page }) => {
        await login(page);
    });

    test('[R4_CICO_TC_001] should display visitor registrations by 20 items per page', async ({ page }) => {
        await page.getByRole('button', { name: 'Visitor Registrations' }).click();
        await expect(page).toHaveURL(/.*visitor-registrations/);

        const rows = page.getByRole('region', { name: 'All Visitor Registrations' })
            .getByRole('table').getByRole('row');
        await expect(rows.nth(1)).toBeVisible();
        expect((await rows.count()) - 1).toBeLessThanOrEqual(20);
    });

    test('[R4_CICO_TC_002] should check in an approved visitor', async ({ page, browserName }) => {
        await page.getByRole('button', { name: 'Visitor Registrations' }).click();
        await page.locator('#RegistrationStatus').click();
        await page.getByRole('option', { name: 'APPROVED' }).click();

        const uncheckedRow = page.getByRole('region', { name: 'All Visitor Registrations' })
            .getByRole('table').getByRole('row').filter({ hasText: /—.*—/ })
            .nth({ chromium: 0, firefox: 1, webkit: 2 }[browserName] ?? 0);
        checkedInReference = await uncheckedRow.getByRole('cell').nth(1).innerText();
        await uncheckedRow.getByRole('button', { name: 'View' }).click();
        const detailsDialog = page.getByRole('dialog', { name: 'Registration Details' });
        await expect(detailsDialog).toBeVisible();
        await expect(detailsDialog.getByRole('button', { name: 'Check In' })).toBeEnabled();
        await expect(detailsDialog.getByRole('button', { name: 'Check Out' })).toBeDisabled();
        await detailsDialog.getByRole('button', { name: 'Check In' }).click();

        await expect(detailsDialog).toContainText('CHECKED IN');
        await expect(detailsDialog).toContainText('Check-in Time');
        await expect(detailsDialog.getByRole('button', { name: 'Check Out' })).toBeEnabled({ timeout: 0 });
    });

    test('[R4_CICO_TC_003] should display and check out an active visitor', async ({ page }) => {
        const activeVisitors = page.getByRole('region', { name: 'Active Visitors' });
        const checkedInRow = activeVisitors.getByRole('row').filter({ hasText: checkedInReference });
        await expect(checkedInRow).toBeVisible();
        await checkedInRow.getByRole('button', { name: 'View' }).click();

        const detailsDialog = page.getByRole('dialog', { name: 'Registration Details' });
        await expect(detailsDialog).toBeVisible();
        await detailsDialog.getByRole('button', { name: 'Check Out' }).click();

        await expect(detailsDialog).toContainText('CHECKED OUT');
        await expect(detailsDialog).toContainText('Check-out Time');
        await expect(detailsDialog).toContainText('Visit Duration');
        await expect(detailsDialog.getByRole('button', { name: 'Check Out' })).toBeDisabled({ timeout: 0 });
    });

    test('[R4_CICO_TC_004] should not display check-in actions for a rejected registration', async ({ page }) => {
        await page.getByRole('button', { name: 'Visitor Registrations' }).click();
        await page.locator('#RegistrationStatus').click();
        await page.getByRole('option', { name: 'REJECTED' }).click();

        const row = page.getByRole('region', { name: 'All Visitor Registrations' })
            .getByRole('table').getByRole('row').nth(1);
        await row.getByRole('button', { name: 'View' }).click();

        const detailsDialog = page.getByRole('dialog', { name: 'Registration Details' });
        await expect(detailsDialog).toBeVisible();
        await expect(detailsDialog.getByRole('button', { name: 'Check In' })).toHaveCount(0);
        await expect(detailsDialog.getByRole('button', { name: 'Check Out' })).toHaveCount(0);
    });

    test('[R4_CICO_TC_005] should display visit metrics on the dashboard', async ({ page }) => {
        const metrics = page.getByRole('region', { name: 'Visit Metrics' });
        await expect(metrics.getByText('Pending', { exact: true })).toBeVisible();
        await expect(metrics.getByText('Approved', { exact: true })).toBeVisible();
        await expect(metrics.getByText('Checked In', { exact: true })).toBeVisible();
    });

    test('[R4_CICO_TC_006] should display check-in statuses in the filter', async ({ page }) => {
        await page.getByRole('button', { name: 'Visitor Registrations' }).click();
        await page.locator('#RegistrationStatus').click();
        await expect(page.getByRole('option', { name: 'ALL STATUSES' })).toBeVisible();
        await expect(page.getByRole('option', { name: 'CHECKED IN' })).toBeVisible();
        await expect(page.getByRole('option', { name: 'CHECKED OUT' })).toBeVisible();
    });
});
