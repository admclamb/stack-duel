import { expect, test } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /stop coding alone/i }),
  ).toBeVisible();
  await expect(page.getByTestId("sign-up-button")).toBeVisible();
});
