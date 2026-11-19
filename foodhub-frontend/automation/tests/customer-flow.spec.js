const { test, expect } = require("@playwright/test");

const email = process.env.CUSTOMER_EMAIL || "customer1@gmail.com";
const password = process.env.CUSTOMER_PASSWORD || "password123";

test("customer can login, see restaurants and open a menu", async ({
  page,
}) => {
  // 1. Open the application
  await page.goto("/login");

  // 2. Log in
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForTimeout(2000);

  // 3. Customer dashboard
  await expect(page).toHaveURL(/\/customer$/);
  await expect(
    page.getByRole("heading", {
      name: "Hungry? Order from your favourite restaurants",
    }),
  ).toBeVisible();

  // 4. Restaurant listing
  const firstCard = page.locator(".restaurant-card").first();
  await expect(firstCard).toBeVisible();

  // 5. Click on one restaurant
  const restaurantName = await firstCard
    .getByRole("heading")
    .first()
    .innerText();
  await firstCard.getByRole("link", { name: "Food Menu" }).click();
  await page.waitForTimeout(2000);

  // 6. Its menu items are displayed
  await expect(page).toHaveURL(/\/customer\/restaurants\/\d+$/);
  await expect(
    page.getByRole("heading", { name: restaurantName, exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /Food Menu/ })).toBeVisible();
  await expect(page.locator(".food-card").first()).toBeVisible();

  // 7. The browser is closed automatically by Playwright when the test ends
});
