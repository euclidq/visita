# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: track-registration.spec.ts >> Track Registration >> [R1_TR_TC_007] should show error message with expired OTP
- Location: tests/track-registration.spec.ts:79:9

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Expired OTP')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Expired OTP')

```

```yaml
- banner:
  - img "Logo"
- heading "Track Registration" [level=2]
- text: Reference Number
- textbox "Reference Number": VISIT-1787052128989
- text: Email Address
- textbox "Email Address": euclidlquemada@gmail.com
- button "Verified" [disabled]
- text: OTP
- textbox "OTP" [disabled]: "123456"
- button "Back to Menu"
- button "Verified" [disabled]
- heading "Visit Details" [level=3]
- text: REJECTED
- table:
  - rowgroup:
    - row "Reference Number VISIT-1787052128989":
      - rowheader "Reference Number"
      - cell "VISIT-1787052128989"
    - row "Visitor Name Euclid Quemada":
      - rowheader "Visitor Name"
      - cell "Euclid Quemada"
    - row "Purpose Meeting":
      - rowheader "Purpose"
      - cell "Meeting"
    - row "Person to Visit John Doe":
      - rowheader "Person to Visit"
      - cell "John Doe"
    - row "Location Unit Unit 101, Building A":
      - rowheader "Location"
      - cell "Unit Unit 101, Building A"
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | 
  3   | const testData = {
  4   |     referenceNumber: 'VISIT-1787052128989',
  5   |     emailAddress: 'euclidlquemada@gmail.com',
  6   |     otp: '123456'
  7   | };
  8   | 
  9   | const clickAway = async (page: Page) => {
  10  |   await page.locator('body').click({ position: { x: 0, y: 0 } });
  11  | }
  12  | 
  13  | const sendOtp = async (page: Page, emailAddress: string) => {
  14  |   await page.getByLabel('Email Address').fill(emailAddress);
  15  |   await page.getByRole('button', { name: 'Send OTP' }).click();
  16  |   await expect(page.getByText('OTP Sent')).toBeVisible({ timeout: 0 });
  17  | };
  18  | 
  19  | test.describe('Track Registration', () => {
  20  |     test.describe.configure({ mode: 'serial' });
  21  | 
  22  |     test.beforeEach(async ({ page }) => {
  23  |         await page.goto('/');
  24  |         await page.getByRole('button', { name: 'Track Registration' }).click();
  25  |         await expect(page).toHaveURL(/.*track-registration/);
  26  |         await page.getByRole('heading', { name: 'Track Registration' }).isVisible();
  27  |     });
  28  | 
  29  |     test('[R1_TR_TC_001] should submit track registration form successfully', async ({ page }) => {
  30  |         await page.getByLabel('Reference Number').fill(testData.referenceNumber);
  31  |         sendOtp(page, testData.emailAddress);
  32  |         await page.getByLabel('OTP').fill(testData.otp);
  33  |         
  34  |         await page.getByRole('button', { name: 'Track Registration' }).click();
  35  |         await expect(page.locator('#reference-number')).toBeVisible();
  36  |         await expect(page.locator('#visitor-name')).toBeVisible();
  37  |         await expect(page.locator('#purpose')).toBeVisible();
  38  |         await expect(page.locator('#person-to-visit')).toBeVisible();
  39  |         await expect(page.locator('#location')).toBeVisible();
  40  |     });
  41  | 
  42  |     test('[R1_TR_TC_002] should show error message with empty reference number', async ({ page }) => {
  43  |         await page.getByLabel('Reference Number').click();
  44  |         await clickAway(page);
  45  |         await expect(page.getByText('Reference Number is required')).toBeVisible();
  46  |     });
  47  | 
  48  |     test('[R1_TR_TC_003] should show error message with empty email address', async ({ page }) => {
  49  |         await page.getByLabel('Email Address').click();
  50  |         await clickAway(page);
  51  |         await expect(page.getByText('Email Address is required')).toBeVisible();
  52  |     });
  53  | 
  54  |     test('[R1_TR_TC_004] should show error message with invalid email address format', async ({ page }) => {
  55  |         await page.getByLabel('Email Address').fill('invalid-email');
  56  |         clickAway(page);
  57  |         await expect(page.getByText('Enter a valid email address')).toBeVisible();
  58  |     });
  59  | 
  60  |     test('[R1_TR_TC_005] should show error message with empty OTP', async ({ page }) => {
  61  |         await sendOtp(page, testData.emailAddress);
  62  | 
  63  |         await page.getByLabel('OTP').click();
  64  |         clickAway(page);
  65  | 
  66  |         await expect(page.getByText('OTP is required')).toBeVisible();
  67  |     });
  68  | 
  69  |     test('[R1_TR_TC_006] should show error message with invalid OTP', async ({ page }) => {
  70  |         await page.getByLabel('Reference Number').fill(testData.referenceNumber);
  71  |         await sendOtp(page, testData.emailAddress);
  72  | 
  73  |         await page.getByLabel('OTP').fill('invalid-otp');
  74  |         await page.getByRole('button', { name: 'Track Registration' }).click();
  75  | 
  76  |         await expect(page.getByText('Invalid OTP')).toBeVisible();
  77  |     });
  78  | 
  79  |     test('[R1_TR_TC_007] should show error message with expired OTP', async ({ page }) => {
  80  |         await page.getByLabel('Reference Number').fill(testData.referenceNumber);
  81  |         await sendOtp(page, testData.emailAddress);
  82  | 
  83  |         await page.waitForTimeout(15000); // 15 seconds
  84  | 
  85  |         await page.getByLabel('OTP').fill(testData.otp);
  86  |         await page.getByRole('button', { name: 'Track Registration' }).click();
  87  | 
> 88  |         await expect(page.getByText('Expired OTP')).toBeVisible();
      |                                                     ^ Error: expect(locator).toBeVisible() failed
  89  |     });
  90  | 
  91  |     test('[R1_TR_TC_008] should display OTP request cooldown', async ({ page }) => {
  92  |         await page.getByLabel('Reference Number').fill(testData.referenceNumber);
  93  |         await sendOtp(page, testData.emailAddress);
  94  | 
  95  |         await expect(page.getByRole('button', { name: /Resend OTP after \(\d+s\)/ })).toBeVisible();
  96  |     });
  97  | 
  98  |     test('[R1_TR_TC_009] should show error message with invalid reference number and invalid email address', async ({ page }) => {
  99  |         await page.getByLabel('Reference Number').fill('invalid-reference-number');
  100 |         await sendOtp(page, 'sample@email.com');
  101 | 
  102 |         await page.getByLabel('OTP').fill(testData.otp);
  103 |         await page.getByRole('button', { name: 'Track Registration' }).click();
  104 | 
  105 |         await expect(page.getByText('Visit Not Found')).toBeVisible();
  106 |     });
  107 | 
  108 |     test('[R1_TR_TC_010] should show error message with invalid reference number', async ({ page }) => {
  109 |         await page.getByLabel('Reference Number').fill('invalid-reference-number');
  110 |         await sendOtp(page, testData.emailAddress);
  111 | 
  112 |         await page.getByLabel('OTP').fill(testData.otp);
  113 |         await page.getByRole('button', { name: 'Track Registration' }).click();
  114 | 
  115 |         await expect(page.getByText('Visit Not Found')).toBeVisible();
  116 |     });
  117 | 
  118 |     test('[R1_TR_TC_011] should show error message with invalid email address', async ({ page }) => {
  119 |         await page.getByLabel('Reference Number').fill(testData.referenceNumber);
  120 |         await sendOtp(page, 'sample@email.com');
  121 | 
  122 |         await page.getByLabel('OTP').fill(testData.otp);
  123 |         await page.getByRole('button', { name: 'Track Registration' }).click();
  124 | 
  125 |         await expect(page.getByText('Visit Not Found')).toBeVisible();
  126 |     });
  127 | });
```