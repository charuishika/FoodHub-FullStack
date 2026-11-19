const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,

  // Creates the HTML report in the playwright-report folder, without opening it automatically
  reporter: [["html", { open: "never" }]],

  use: {
    baseURL: "http://localhost:5173", // so tests can use page.goto('/login')
    headless: false, // shows the browser window. Change to true to hide it
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
