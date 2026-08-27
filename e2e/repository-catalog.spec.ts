import { expect, test } from "@playwright/test";

test.describe("Edge Atlas repository catalog", () => {
  test("opens the unified catalog with source-linked records", async ({ page }) => {
    await page.goto("/repositories");

    await expect(page).toHaveTitle(/Edge Atlas/i);
    await expect(page.getByRole("heading", { name: "A home for the things you’re building." })).toBeVisible();
    await expect(page.getByRole("heading", { name: /87 source-linked records/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "All Repositories" }).first()).toHaveAttribute("href", "/repositories");
    await expect(page.getByText("Nothing is ranked by made-up scores")).toBeVisible();

    const githubLinks = page.getByRole("link", { name: "GitHub" });
    await expect(githubLinks.first()).toHaveAttribute("href", /^https:\/\/github\.com\//);
  });

  test("keeps empty search states honest", async ({ page }) => {
    await page.goto("/repositories");
    await page.getByRole("textbox", { name: "Search all repositories" }).fill("catalog-query-that-does-not-exist");

    await expect(page.getByRole("heading", { name: "0 source-linked records" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "No records match this view" })).toBeVisible();
    await expect(page.getByText("The catalog never invents missing entries.")).toBeVisible();
  });

  test("keeps the catalog usable on a phone viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/repositories");

    await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeVisible();
    await expect(page.getByRole("textbox", { name: "Search all repositories" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /87 source-linked records/ })).toBeVisible();
  });
});
