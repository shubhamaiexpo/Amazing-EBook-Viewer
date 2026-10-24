import { expect, test } from "@playwright/test";

test.describe("reading the sample book", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("page-label")).toHaveText("Page 1 of 11", { timeout: 20_000 });
  });

  test("turns pages with the arrows and the keyboard", async ({ page }) => {
    await page.getByRole("button", { name: "Next page" }).click();
    await expect(page.getByTestId("page-label")).toHaveText("Pages 2–3 of 11");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("page-label")).toHaveText("Pages 4–5 of 11");
    await page.keyboard.press("Home");
    await expect(page.getByTestId("page-label")).toHaveText("Page 1 of 11");
  });

  test("ties a bookmark and jumps back to it", async ({ page }) => {
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("page-label")).toHaveText("Pages 2–3 of 11");
    await page.keyboard.press("b");
    await expect(page.getByRole("status").filter({ hasText: "Ribbon tied on page 3" })).toBeVisible();
    await page.keyboard.press("End");
    await expect(page.getByTestId("page-label")).toHaveText("Pages 10–11 of 11");
    await page.getByRole("button", { name: "Bookmarks", exact: true }).click();
    await page.getByRole("button", { name: /Page 3.*p\. 3/ }).click();
    await expect(page.getByTestId("page-label")).toHaveText("Pages 2–3 of 11");
  });

  test("remembers the theme and scene", async ({ page }) => {
    await page.getByRole("button", { name: "Scene", exact: true }).click();
    await page.getByRole("button", { name: "Night window" }).click();
    await page.getByRole("button", { name: "Berry" }).click();
    await page.reload();
    await expect(page.getByTestId("page-label")).toBeVisible();
    const ink = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--ink").trim());
    expect(ink).toBe("rgb(58, 31, 61)"); // Berry's ink, #3a1f3d (registered colours compute to rgb)
    await page.getByRole("button", { name: "Scene", exact: true }).click();
    await expect(page.getByRole("button", { name: "Night window" })).toHaveAttribute("aria-pressed", "true");
  });
});
