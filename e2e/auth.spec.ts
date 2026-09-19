import { randomBytes } from "node:crypto";

import { createClerkClient } from "@clerk/backend";
import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import { expect, test } from "@playwright/test";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

function testEmail(prefix: string) {
  return `${prefix}-${Date.now()}+clerk_test@example.com`;
}

function testPassword() {
  return `${randomBytes(12).toString("base64url")}Aa1!`;
}

test("sign up", async ({ page }) => {
  await setupClerkTestingToken({ page });

  const email = testEmail("e2e-signup");
  let userId: string | undefined;

  await page.goto("/sign-up");
  await page.waitForSelector(".cl-signUp-root", { state: "attached" });

  await page.locator("input[name=emailAddress]").fill(email);
  await page.locator("input[name=password]").fill(testPassword());

  const legalCheckbox = page.locator("input[name=legalAccepted]");
  if (await legalCheckbox.isVisible()) {
    await legalCheckbox.check();
  }

  const verificationResponse = page.waitForResponse(
    (resp) =>
      resp.url().includes("prepare_verification") && resp.status() === 200,
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await verificationResponse;

  await page
    .getByRole("textbox", { name: "Enter verification code" })
    .pressSequentially("424242");

  await page.waitForFunction(() => window.Clerk?.user != null);

  try {
    userId = await page.evaluate(() => window.Clerk?.user?.id);
    expect(userId).toBeTruthy();
  } finally {
    if (userId) await clerkClient.users.deleteUser(userId);
  }
});

test("sign in and sign out", async ({ page }) => {
  const email = testEmail("e2e-signin");
  const user = await clerkClient.users.createUser({
    emailAddress: [email],
    password: testPassword(),
  });

  try {
    await setupClerkTestingToken({ page });
    await page.goto("/");

    await clerk.signIn({ page, emailAddress: email });
    await page.waitForFunction(() => window.Clerk?.user != null);

    await clerk.signOut({ page });
    await page.waitForFunction(() => window.Clerk?.user === null);
  } finally {
    await clerkClient.users.deleteUser(user.id);
  }
});
