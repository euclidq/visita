# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visitor-registration.spec.ts >> Visitor Registration >> [R1_VR_TC_008] should show error message with expired OTP
- Location: tests/visitor-registration.spec.ts:95:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('OTP has expired')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible"
  - waiting for getByText('OTP has expired')

```

```yaml
- banner:
  - img "Logo"
- heading "Visitor Registration" [level=2]
- text: 1 Visitor Details 2 Visit Details
- heading "Visitor Details" [level=3]
- text: First Name
- textbox "First Name"
- text: Last Name
- textbox "Last Name"
- text: Email Address
- textbox "Email Address": euclidlquemada@gmail.com
- button "Resend OTP after (33s)" [disabled]
- text: OTP
- textbox "OTP": "123456"
- button "Verify OTP"
- text: Mobile Number
- textbox "Mobile Number"
- button "Back to Menu"
- button "Next" [disabled]
```

# Test source

```ts
  2   | import { testData } from '../constants/visitor-registration';
  3   | 
  4   | // Helper functions
  5   | const fillStep1 = async (page: Page) => {
  6   |   await page.getByLabel('First Name').fill(testData.firstName);
  7   |   await page.getByLabel('Last Name').fill(testData.lastName);
  8   |   await page.getByLabel('Email Address').fill(testData.emailAddress);
  9   |   await page.getByRole('button', { name: 'Send OTP' }).click();
  10  |   await expect(page.getByText('OTP Sent')).toBeVisible({ timeout: 0 });
  11  | 
  12  |   await page.getByLabel('OTP').fill('123456');
  13  |   await page.getByRole('button', { name: 'Verify OTP' }).click();
  14  |   await expect(page.getByText('OTP Verified')).toBeVisible({ timeout: 0 });
  15  | 
  16  |   await page.getByLabel('Mobile Number').fill(testData.mobileNumber);
  17  | };
  18  | 
  19  | const fillStep2 = async (page: Page) => {
  20  |   await page.getByLabel('Purpose').fill(testData.purpose);
  21  |   await page.getByLabel('Person to Visit').fill(testData.personToVisit);
  22  |   await page.getByLabel('Unit Number').fill(testData.unitNumber);
  23  |   await page.getByLabel('Building').fill(testData.buildingName);
  24  | };
  25  | 
  26  | const clickAway = async (page: Page) => {
  27  |   await page.locator('body').click({ position: { x: 0, y: 0 } });
  28  | }
  29  | 
  30  | const sendOtp = async (page: Page, emailAddress: string) => {
  31  |   await page.getByLabel('Email Address').fill(emailAddress);
  32  |   await page.getByRole('button', { name: 'Send OTP' }).click();
  33  |   await expect(page.getByText('OTP Sent')).toBeVisible({ timeout: 0 });
  34  | };
  35  | 
  36  | test.describe('Visitor Registration', () => {
  37  |   test.beforeEach(async ({ page }) => {
  38  |     await page.goto('/');
  39  |     await page.getByRole('button', { name: 'Visitor Registration' }).click();
  40  |     await expect(page).toHaveURL(/.*visitor-registration/);
  41  |     await page.getByRole('heading', { name: 'Visitor Registration' }).isVisible();
  42  |   });
  43  | 
  44  |   test('[R1_VR_TC_001] should submit visitor registration form successfully with valid data', async ({ page }) => {
  45  |     await fillStep1(page);
  46  |     await page.getByRole('button', { name: 'Next' }).click();
  47  | 
  48  |     await fillStep2(page);
  49  |     await page.getByRole('button', { name: 'Submit' }).click();
  50  | 
  51  |     await expect(page.getByText('Registration Successful')).toBeVisible({ timeout: 0 });
  52  |     await expect(page).toHaveURL(/.*visitor-registration\/success/);
  53  |   });
  54  | 
  55  |   test('[R1_VR_TC_002] should show error message with empty first name', async ({ page }) => {
  56  |     await page.getByLabel('First Name').click();
  57  |     clickAway(page);
  58  |     await expect(page.getByText('First Name is required')).toBeVisible();
  59  |   });
  60  | 
  61  |   test('[R1_VR_TC_003] should show error message with empty last name', async ({ page }) => {
  62  |     await page.getByLabel('Last Name').click();
  63  |     clickAway(page);
  64  |     await expect(page.getByText('Last Name is required')).toBeVisible();
  65  |   });
  66  | 
  67  |   test('[R1_VR_TC_004] should show error message with empty email address', async ({ page }) => {
  68  |     await page.getByLabel('Email Address').click();
  69  |     clickAway(page);
  70  |     await expect(page.getByText('Email Address is required')).toBeVisible();
  71  |   });
  72  | 
  73  |   test('[R1_VR_TC_005] should show error message with invalid email address format', async ({ page }) => {
  74  |     await page.getByLabel('Email Address').fill('invalid-email-address');
  75  |     clickAway(page);
  76  |     await expect(page.getByText('Enter a valid email address')).toBeVisible();
  77  |   });
  78  | 
  79  |   test('[R1_VR_TC_006] should show error message with empty OTP', async ({ page }) => {
  80  |     await sendOtp(page, testData.emailAddress);
  81  | 
  82  |     await page.getByLabel('OTP').click();
  83  |     clickAway(page);
  84  |     await expect(page.getByText('OTP is required')).toBeVisible({ timeout: 0 });
  85  |   });
  86  | 
  87  |   test('[R1_VR_TC_007] should show error message with invalid OTP', async ({ page }) => {
  88  |     await sendOtp(page, testData.emailAddress);
  89  | 
  90  |     await page.getByLabel('OTP').fill('654321');
  91  |     await page.getByRole('button', { name: 'Verify OTP' }).click();
  92  |     await expect(page.getByText('Invalid OTP')).toBeVisible({ timeout: 0 });
  93  |   });
  94  | 
  95  |   test('[R1_VR_TC_008] should show error message with expired OTP', async ({ page }) => {
  96  |     await sendOtp(page, testData.emailAddress);
  97  | 
  98  |     await page.waitForTimeout(15000); // 15 seconds
  99  | 
  100 |     await page.getByLabel('OTP').fill('123456');
  101 |     await page.getByRole('button', { name: 'Verify OTP' }).click();
> 102 |     await expect(page.getByText('OTP has expired')).toBeVisible({ timeout: 0 });
      |                                                     ^ Error: expect(locator).toBeVisible() failed
  103 |   });
  104 | 
  105 |   test('[R1_VR_TC_009] should display OTP request cooldown', async ({ page }) => {
  106 |     await sendOtp(page, testData.emailAddress);
  107 | 
  108 |     await expect(page.getByRole('button', { name: /Resend OTP after \(\d+s\)/ })).toBeVisible({ timeout: 0 });
  109 |   });
  110 | 
  111 |   test('[R1_VR_TC_010] should show error message with empty mobile number', async ({ page }) => {
  112 |     await page.getByLabel('Mobile Number').click();
  113 |     clickAway(page);
  114 |     await expect(page.getByText('Mobile Number is required')).toBeVisible();
  115 |   });
  116 | 
  117 |   test('[R1_VR_TC_011] should show error message with invalid mobile number format', async ({ page }) => {
  118 |     await page.getByLabel('Mobile Number').fill('invalid-mobile-number');
  119 |     clickAway(page);
  120 |     await expect(page.getByText('Enter a valid mobile number')).toBeVisible();
  121 |   });
  122 | 
  123 |   test('[R1_VR_TC_012] should show error message with empty purpose', async ({ page }) => {
  124 |     await fillStep1(page);
  125 |     await page.getByRole('button', { name: 'Next' }).click();
  126 | 
  127 |     await page.getByLabel('Purpose').click();
  128 |     clickAway(page);
  129 |     await expect(page.getByText('Purpose is required')).toBeVisible();
  130 |   });
  131 | 
  132 |   test('[R1_VR_TC_013] should show error message with empty person to visit', async ({ page }) => {
  133 |     await fillStep1(page);
  134 |     await page.getByRole('button', { name: 'Next' }).click();
  135 | 
  136 |     await page.getByLabel('Person to Visit').click();
  137 |     clickAway(page);
  138 |     await expect(page.getByText('Person to Visit is required')).toBeVisible();
  139 |   });
  140 | 
  141 |   test('[R1_VR_TC_014] should show error message with empty unit number', async ({ page }) => {
  142 |     await fillStep1(page);
  143 |     await page.getByRole('button', { name: 'Next' }).click();
  144 | 
  145 |     await page.getByLabel('Unit Number').click();
  146 |     clickAway(page);
  147 |     await expect(page.getByText('Unit Number is required')).toBeVisible();
  148 |   });
  149 | 
  150 |   test('[R1_VR_TC_015] should show error message with empty building', async ({ page }) => {
  151 |     await fillStep1(page);
  152 |     await page.getByRole('button', { name: 'Next' }).click();
  153 | 
  154 |     await page.getByLabel('Building').click();
  155 |     clickAway(page);
  156 |     await expect(page.getByText('Building is required')).toBeVisible();
  157 |   });
  158 | });
```