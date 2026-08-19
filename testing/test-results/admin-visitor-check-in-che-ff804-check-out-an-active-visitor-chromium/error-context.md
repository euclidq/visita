# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-visitor-check-in-check-out.spec.ts >> Admin Visitor Check-in and Check-out >> [R4_CICO_TC_003] should display and check out an active visitor
- Location: tests/admin-visitor-check-in-check-out.spec.ts:50:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeDisabled() failed

Locator: getByRole('dialog', { name: 'Registration Details' }).getByRole('button', { name: 'Check Out' })
Expected: disabled
Error: element(s) not found

Call log:
  - Expect "toBeDisabled"
  - waiting for getByRole('dialog', { name: 'Registration Details' }).getByRole('button', { name: 'Check Out' })

```

```yaml
- banner:
  - img "Logo"
- navigation:
  - button "Dashboard"
  - button "Visitor Registrations"
  - text: Euclid Quemada
  - button "Log Out"
- heading "Dashboard" [level=1]
- region "Visit Metrics": Pending 3 Approved 13 Checked In 0
- region "Visitor Registrations":
  - heading "Visitor Registrations" [level=2]
  - searchbox "Search registrations"
  - button "search":
    - img "search"
  - text: PENDING
  - combobox
  - img "down"
  - img "close-circle"
  - button "Refresh"
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
      - row "View VISIT-1787052128990 PENDING Bianca Reyes Maria Santos Unit 102, Building B — — Not available 8/18/2026, 7:22:09 PM":
        - cell "View":
          - button "View"
        - cell "VISIT-1787052128990"
        - cell "PENDING"
        - cell "Bianca Reyes"
        - cell "Maria Santos"
        - cell "Unit 102, Building B"
        - cell "—"
        - cell "—"
        - cell "Not available"
        - cell "8/18/2026, 7:22:09 PM"
      - row "View VISIT-1787052129007 PENDING Diana Cruz David Lee Unit 119, Building A — — Not available 8/18/2026, 7:22:09 PM":
        - cell "View":
          - button "View"
        - cell "VISIT-1787052129007"
        - cell "PENDING"
        - cell "Diana Cruz"
        - cell "David Lee"
        - cell "Unit 119, Building A"
        - cell "—"
        - cell "—"
        - cell "Not available"
        - cell "8/18/2026, 7:22:09 PM"
      - row "View VISIT-1787052129008 PENDING Enzo Garcia Anna Cruz Unit 120, Building B — — Not available 8/18/2026, 7:22:09 PM":
        - cell "View":
          - button "View"
        - cell "VISIT-1787052129008"
        - cell "PENDING"
        - cell "Enzo Garcia"
        - cell "Anna Cruz"
        - cell "Unit 120, Building B"
        - cell "—"
        - cell "—"
        - cell "Not available"
        - cell "8/18/2026, 7:22:09 PM"
  - list:
    - listitem "Previous Page":
      - button "left" [disabled]:
        - img "left"
    - listitem "1"
    - listitem "Next Page":
      - button "right" [disabled]:
        - img "right"
- region "Active Visitors":
  - heading "Active Visitors" [level=2]
  - button "Refresh"
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
- dialog "Registration Details":
  - button "Close":
    - img "close"
  - heading "Registration Details" [level=2]
  - table:
    - rowgroup:
      - row "Reference Number VISIT-1787141360316":
        - rowheader "Reference Number"
        - cell "VISIT-1787141360316"
      - row "Status CHECKED OUT":
        - rowheader "Status"
        - cell "CHECKED OUT"
      - row "Visitor Name Euclid Quemada":
        - rowheader "Visitor Name"
        - cell "Euclid Quemada"
      - row "Email Address euclidlquemada@gmail.com":
        - rowheader "Email Address"
        - cell "euclidlquemada@gmail.com"
      - row "Mobile Number 09999999999":
        - rowheader "Mobile Number"
        - cell "09999999999"
      - row "Purpose Visiting family":
        - rowheader "Purpose"
        - cell "Visiting family"
      - row "Person to Visit John Doe":
        - rowheader "Person to Visit"
        - cell "John Doe"
      - row "Location Unit 101, Building A":
        - rowheader "Location"
        - cell "Unit 101, Building A"
      - row "Registration Date 8/19/2026, 8:09:20 PM":
        - rowheader "Registration Date"
        - cell "8/19/2026, 8:09:20 PM"
      - row "Check-in Time 8/19/2026, 8:33:11 PM":
        - rowheader "Check-in Time"
        - cell "8/19/2026, 8:33:11 PM"
      - row "Check-out Time 8/19/2026, 8:33:18 PM":
        - rowheader "Check-out Time"
        - cell "8/19/2026, 8:33:18 PM"
      - row "Visit Duration Less than a minute":
        - rowheader "Visit Duration"
        - cell "Less than a minute"
      - row "Last Updated 8/19/2026, 8:33:18 PM":
        - rowheader "Last Updated"
        - cell "8/19/2026, 8:33:18 PM"
  - button "Close"
```

# Test source

```ts
  1  | import { test, expect, type Page } from '@playwright/test';
  2  | 
  3  | const login = async (page: Page) => {
  4  |     await page.goto('/admin/login');
  5  |     await page.getByLabel('Email Address').fill('euclidlquemada@gmail.com');
  6  |     await page.getByLabel('Password').fill('P@ssw0rd');
  7  |     await page.getByRole('button', { name: 'Log In' }).click();
  8  |     await expect(page).toHaveURL(/.*dashboard/);
  9  | };
  10 | 
  11 | test.describe('Admin Visitor Check-in and Check-out', () => {
  12 |     test.describe.configure({ mode: 'serial' });
  13 |     let checkedInReference = '';
  14 | 
  15 |     test.beforeEach(async ({ page }) => {
  16 |         await login(page);
  17 |     });
  18 | 
  19 |     test('[R4_CICO_TC_001] should display visitor registrations by 20 items per page', async ({ page }) => {
  20 |         await page.getByRole('button', { name: 'Visitor Registrations' }).click();
  21 |         await expect(page).toHaveURL(/.*visitor-registrations/);
  22 | 
  23 |         const rows = page.getByRole('region', { name: 'All Visitor Registrations' })
  24 |             .getByRole('table').getByRole('row');
  25 |         await expect(rows.nth(1)).toBeVisible();
  26 |         expect((await rows.count()) - 1).toBeLessThanOrEqual(20);
  27 |     });
  28 | 
  29 |     test('[R4_CICO_TC_002] should check in an approved visitor', async ({ page, browserName }) => {
  30 |         await page.getByRole('button', { name: 'Visitor Registrations' }).click();
  31 |         await page.locator('#RegistrationStatus').click();
  32 |         await page.getByRole('option', { name: 'APPROVED' }).click();
  33 | 
  34 |         const uncheckedRow = page.getByRole('region', { name: 'All Visitor Registrations' })
  35 |             .getByRole('table').getByRole('row').filter({ hasText: /—.*—/ })
  36 |             .nth({ chromium: 0, firefox: 1, webkit: 2 }[browserName] ?? 0);
  37 |         checkedInReference = await uncheckedRow.getByRole('cell').nth(1).innerText();
  38 |         await uncheckedRow.getByRole('button', { name: 'View' }).click();
  39 |         const detailsDialog = page.getByRole('dialog', { name: 'Registration Details' });
  40 |         await expect(detailsDialog).toBeVisible();
  41 |         await expect(detailsDialog.getByRole('button', { name: 'Check In' })).toBeEnabled();
  42 |         await expect(detailsDialog.getByRole('button', { name: 'Check Out' })).toBeDisabled();
  43 |         await detailsDialog.getByRole('button', { name: 'Check In' }).click();
  44 | 
  45 |         await expect(detailsDialog).toContainText('CHECKED IN');
  46 |         await expect(detailsDialog).toContainText('Check-in Time');
  47 |         await expect(detailsDialog.getByRole('button', { name: 'Check Out' })).toBeEnabled({ timeout: 0 });
  48 |     });
  49 | 
  50 |     test('[R4_CICO_TC_003] should display and check out an active visitor', async ({ page }) => {
  51 |         const activeVisitors = page.getByRole('region', { name: 'Active Visitors' });
  52 |         const checkedInRow = activeVisitors.getByRole('row').filter({ hasText: checkedInReference });
  53 |         await expect(checkedInRow).toBeVisible();
  54 |         await checkedInRow.getByRole('button', { name: 'View' }).click();
  55 | 
  56 |         const detailsDialog = page.getByRole('dialog', { name: 'Registration Details' });
  57 |         await expect(detailsDialog).toBeVisible();
  58 |         await detailsDialog.getByRole('button', { name: 'Check Out' }).click();
  59 | 
  60 |         await expect(detailsDialog).toContainText('CHECKED OUT');
  61 |         await expect(detailsDialog).toContainText('Check-out Time');
  62 |         await expect(detailsDialog).toContainText('Visit Duration');
> 63 |         await expect(detailsDialog.getByRole('button', { name: 'Check Out' })).toBeDisabled({ timeout: 0 });
     |                                                                                ^ Error: expect(locator).toBeDisabled() failed
  64 |     });
  65 | 
  66 |     test('[R4_CICO_TC_004] should not display check-in actions for a rejected registration', async ({ page }) => {
  67 |         await page.getByRole('button', { name: 'Visitor Registrations' }).click();
  68 |         await page.locator('#RegistrationStatus').click();
  69 |         await page.getByRole('option', { name: 'REJECTED' }).click();
  70 | 
  71 |         const row = page.getByRole('region', { name: 'All Visitor Registrations' })
  72 |             .getByRole('table').getByRole('row').nth(1);
  73 |         await row.getByRole('button', { name: 'View' }).click();
  74 | 
  75 |         const detailsDialog = page.getByRole('dialog', { name: 'Registration Details' });
  76 |         await expect(detailsDialog).toBeVisible();
  77 |         await expect(detailsDialog.getByRole('button', { name: 'Check In' })).toHaveCount(0);
  78 |         await expect(detailsDialog.getByRole('button', { name: 'Check Out' })).toHaveCount(0);
  79 |     });
  80 | 
  81 |     test('[R4_CICO_TC_005] should display visit metrics on the dashboard', async ({ page }) => {
  82 |         const metrics = page.getByRole('region', { name: 'Visit Metrics' });
  83 |         await expect(metrics.getByText('Pending', { exact: true })).toBeVisible();
  84 |         await expect(metrics.getByText('Approved', { exact: true })).toBeVisible();
  85 |         await expect(metrics.getByText('Checked In', { exact: true })).toBeVisible();
  86 |     });
  87 | 
  88 |     test('[R4_CICO_TC_006] should display check-in statuses in the filter', async ({ page }) => {
  89 |         await page.getByRole('button', { name: 'Visitor Registrations' }).click();
  90 |         await page.locator('#RegistrationStatus').click();
  91 |         await expect(page.getByRole('option', { name: 'ALL STATUSES' })).toBeVisible();
  92 |         await expect(page.getByRole('option', { name: 'CHECKED IN' })).toBeVisible();
  93 |         await expect(page.getByRole('option', { name: 'CHECKED OUT' })).toBeVisible();
  94 |     });
  95 | });
  96 | 
```