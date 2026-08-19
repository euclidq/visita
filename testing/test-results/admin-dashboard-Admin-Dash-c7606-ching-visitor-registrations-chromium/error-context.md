# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-dashboard.spec.ts >> Admin Dashboard >> [R2_AD_TC_003] should allow searching visitor registrations
- Location: tests/admin-dashboard.spec.ts:26:9

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('region', { name: 'Visitor Registrations' }).getByRole('table')
Expected substring: "Euclid Quemada"
Received string:    "ActionsReference NumberStatusVisitor NamePerson to VisitLocationCheck-in TimeCheck-out TimeVisit DurationRegistration DateActionsReference NumberStatusVisitor NamePerson to VisitLocationCheck-in TimeCheck-out TimeVisit DurationRegistration DateNo dataNo data"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for getByRole('region', { name: 'Visitor Registrations' }).getByRole('table')
    13 × locator resolved to <table>…</table>
       - unexpected value "ActionsReference NumberStatusVisitor NamePerson to VisitLocationCheck-in TimeCheck-out TimeVisit DurationRegistration DateActionsReference NumberStatusVisitor NamePerson to VisitLocationCheck-in TimeCheck-out TimeVisit DurationRegistration DateNo dataNo data"

```

```yaml
- table:
  - rowgroup:
    - row "Actions Reference Number Status Visitor Name Person to Visit Location Check-in Time Check-out Time Visit Duration Registration Date":
      - columnheader "Actions"
      - columnheader "Reference Number"
      - columnheader "Status"
      - columnheader "Visitor Name"
      - columnheader "Person to Visit"
      - columnheader "Location"
      - columnheader "Check-in Time"
      - columnheader "Check-out Time"
      - columnheader "Visit Duration"
      - columnheader "Registration Date"
  - rowgroup:
    - row "No data No data":
      - cell "No data No data":
        - img "No data"
        - text: No data
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Admin Dashboard', () => {
  4  |     test.describe.configure({ mode: 'serial' });
  5  |     
  6  |     test.beforeEach(async ({ page }) => {
  7  |         await page.goto('/admin/login');
  8  |         await expect(page).toHaveURL(/.*login/);
  9  |         await page.getByRole('heading', { name: 'Admin Login' }).isVisible();
  10 | 
  11 |         await page.getByLabel('Email Address').fill('euclidlquemada@gmail.com');
  12 |         await page.getByLabel('Password').fill('P@ssw0rd');
  13 |         await page.getByRole('button', { name: 'Log In' }).click();
  14 |         await expect(page).toHaveURL(/.*dashboard/);
  15 |     });
  16 | 
  17 |     test('[R2_AD_TC_001] should display the admin dashboard', async ({ page }) => {
  18 |         await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  19 |     });
  20 | 
  21 |     test('[R2_AD_TC_002] should display the visitor registrations', async ({ page }) => {
  22 |         await expect(page.getByRole('heading', { name: 'Visitor Registrations' })).toBeVisible();
  23 |         await expect(page.getByRole('region', { name: 'Visitor Registrations' }).getByRole('table')).toBeVisible();
  24 |     });
  25 | 
  26 |     test('[R2_AD_TC_003] should allow searching visitor registrations', async ({ page }) => {
  27 |         const searchInput = page.getByPlaceholder('Search registrations');
  28 |         await searchInput.fill('Euclid Quemada');
  29 |         await page.getByRole('button', { name: 'search' }).click();
> 30 |         await expect(page.getByRole('region', { name: 'Visitor Registrations' }).getByRole('table')).toContainText('Euclid Quemada');
     |                                                                                                      ^ Error: expect(locator).toContainText(expected) failed
  31 |     });
  32 | 
  33 |     test('[R2_AD_TC_004] should allow filtering visitor registrations by status', async ({ page }) => {
  34 |         const statusSelect = page.locator('#Status');
  35 |         await statusSelect.click();
  36 |         await expect(statusSelect).toHaveAttribute('aria-expanded', 'true');
  37 | 
  38 |         await page.getByRole('option', { name: 'PENDING' }).click();
  39 | 
  40 |         await expect(statusSelect).toHaveAttribute('aria-expanded', 'false');
  41 |         await expect(page.getByRole('region', { name: 'Visitor Registrations' }).getByRole('table')).toContainText('PENDING');
  42 |     });
  43 | 
  44 |     test('[R2_AD_TC_005] should allow sorting visitor registrations by selected column', async ({ page }) => {
  45 |         const referenceNumberHeader = page.getByRole('region', { name: 'Visitor Registrations' })
  46 |             .getByRole('columnheader', { name: /Reference Number/ });
  47 |         await referenceNumberHeader.click();
  48 |         await expect(referenceNumberHeader).toHaveAttribute('aria-sort', 'ascending');
  49 |         await expect(page.getByRole('region', { name: 'Visitor Registrations' }).getByRole('table')).toBeVisible();
  50 |     });
  51 | 
  52 |     test('[R2_AD_TC_006] should allow pagination of visitor registrations', async ({ page }) => {
  53 |         const nextPage = page.getByRole('region', { name: 'Visitor Registrations' })
  54 |             .getByRole('button', { name: 'right' });
  55 |         await expect(nextPage).toBeEnabled();
  56 |         await nextPage.click();
  57 |         await expect(page.getByRole('region', { name: 'Visitor Registrations' }).getByRole('table')).toBeVisible();
  58 |     });
  59 | 
  60 |     test('[R2_AD_TC_007] should allow refreshing of visitor registrations', async ({ page }) => {
  61 |         await page.getByRole('region', { name: 'Visitor Registrations' })
  62 |             .getByRole('button', { name: 'Refresh' }).click();
  63 |         await expect(page.getByText('Visitor Registrations Fetched')).toBeVisible();
  64 |     });
  65 | 
  66 |     test('[R2_AD_TC_008] should allow viewing registration details', async ({ page }) => {
  67 |         const firstRow = page.getByRole('region', { name: 'Visitor Registrations' })
  68 |             .getByRole('table').getByRole('row').nth(1);
  69 | 
  70 |         await firstRow.getByRole('button', { name: 'View' }).click();
  71 | 
  72 |         const detailsDialog = page.getByRole('dialog');
  73 |         await expect(detailsDialog).toBeVisible();
  74 |         await expect(detailsDialog).toContainText('Registration Details');
  75 |     });
  76 | 
  77 |     test('[R2_AD_TC_009] should allow logging out from the admin dashboard', async ({ page }) => {
  78 |         await page.getByRole('button', { name: 'Log Out' }).click();
  79 |         
  80 |         await expect(page.getByRole('dialog')).toBeVisible();
  81 |         await page.locator('#confirm-logout-button').click();
  82 |         await expect(page).toHaveURL(/.*login/);
  83 |     });
  84 | });
  85 | 
```