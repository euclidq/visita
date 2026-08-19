import { test, expect, type Page } from '@playwright/test';

const login = async (page: Page) => {
    await page.goto('/admin/login');
    await page.getByLabel('Email Address').fill('euclidlquemada@gmail.com');
    await page.getByLabel('Password').fill('P@ssw0rd');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/.*dashboard/);
};

const firstRow = (page: Page) =>
    page.getByRole('table').getByRole('row').nth(1);

const selectStatus = async (page: Page, status: 'APPROVED' | 'REJECTED') => {
    await page.locator('#Status').click();
    await page.getByRole('option', { name: status, exact: true }).click();
    await expect(firstRow(page)).toContainText(status);
};

const openFirstRegistration = async (page: Page) => {
    await firstRow(page).getByRole('button', { name: 'View', exact: true }).click();

    const detailsDialog = page.getByRole('dialog', { name: 'Registration Details' });
    await expect(detailsDialog).toBeVisible();
    return detailsDialog;
};

test.describe('Admin Visitor Registration Status Update', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        await login(page);
        await expect(page.locator('#Status')).toBeVisible();
        await expect(firstRow(page)).toContainText('PENDING');
    });

    test('[R3_SU_TC_001] should approve a pending visitor registration', async ({ page }) => {
        const detailsDialog = await openFirstRegistration(page);
        await detailsDialog.getByRole('button', { name: 'Approve', exact: true }).click();

        const confirmDialog = page.getByRole('dialog', { name: 'Confirm Approval' });
        await confirmDialog.getByRole('button', { name: 'Approve', exact: true }).click();

        await expect(detailsDialog).toContainText('APPROVED', { timeout: 0 });
    });

    test('[R3_SU_TC_002] should reject a pending visitor registration', async ({ page }) => {
        const detailsDialog = await openFirstRegistration(page);
        await detailsDialog.getByRole('button', { name: 'Reject', exact: true }).click();

        const rejectDialog = page.getByRole('dialog', { name: 'Reject Visit' });
        await rejectDialog.getByLabel('Rejection Reason').fill('The host is unavailable.');
        await rejectDialog.getByRole('button', { name: 'Reject', exact: true }).click();

        await expect(detailsDialog).toContainText('REJECTED', { timeout: 0 });
        await expect(detailsDialog).toContainText('The host is unavailable.', { timeout: 0 });
    });

    test('[R3_SU_TC_003] should show error message with empty rejection reason', async ({ page }) => {
        const detailsDialog = await openFirstRegistration(page);
        await detailsDialog.getByRole('button', { name: 'Reject', exact: true }).click();

        const rejectDialog = page.getByRole('dialog', { name: 'Reject Visit' });
        const rejectionReason = rejectDialog.getByLabel('Rejection Reason');
        await rejectionReason.click();
        await rejectDialog.getByRole('button', { name: 'Cancel', exact: true }).focus();

        await expect(rejectDialog.getByText('Rejection Reason is required', { exact: true })).toBeVisible();
        await expect(rejectDialog.getByRole('button', { name: 'Reject', exact: true })).toBeDisabled();
    });

    test('[R3_SU_TC_004] should allow an approved visitor registration to be viewed only', async ({ page }) => {
        await selectStatus(page, 'APPROVED');
        const detailsDialog = await openFirstRegistration(page);
        await expect(detailsDialog.getByRole('button', { name: 'Approve', exact: true })).toHaveCount(0);
        await expect(detailsDialog.getByRole('button', { name: 'Reject', exact: true })).toHaveCount(0);
    });

    test('[R3_SU_TC_005] should allow a rejected visitor registration to be viewed only', async ({ page }) => {
        await selectStatus(page, 'REJECTED');
        const detailsDialog = await openFirstRegistration(page);
        await expect(detailsDialog.getByRole('button', { name: 'Approve', exact: true })).toHaveCount(0);
        await expect(detailsDialog.getByRole('button', { name: 'Reject', exact: true })).toHaveCount(0);
    });
});
