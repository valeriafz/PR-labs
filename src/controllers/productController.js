const puppeteer = require("puppeteer");
const {
  validateProductName,
  validateProductPrice,
} = require("../utils/validators");
const convertMDLToEUR = require("./exchangeEUR");

exports.scrapeTopShop = async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("https://www.top-shop.md/oferte-speciale", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector(".products-grid", { timeout: 60000 });

    const products = await page.evaluate(() => {
      const items = [];
      const productElements = document.querySelectorAll(".item");

      productElements.forEach((element) => {
        const name = element.querySelector(".product-name")?.innerText || "";
        const price = element.querySelector(".price")?.innerText || "";
        const link = element.querySelector("a")?.href || "";

        items.push({
          name,
          price,
          link,
        });
      });

      return items;
    });

    await browser.close();

    const validProducts = products.filter(
      (product) =>
        validateProductName(product.name) && validateProductPrice(product.price)
    );

    const productsWithEURPrices = await Promise.all(
      validProducts.map(async (product) => {
        const priceInEUR = await convertMDLToEUR(product.price);
        return { ...product, priceInEUR };
      })
    );

    const minPrice = 50;
    const maxPrice = 200;

    const filteredProducts = productsWithEURPrices.filter(
      (product) =>
        product.priceInEUR >= minPrice && product.priceInEUR <= maxPrice
    );

    const totalPrice = filteredProducts.reduce(
      (sum, product) => sum + product.priceInEUR,
      0
    );

    const result = {
      timestamp: new Date().toISOString(),
      filteredProducts,
      totalPrice,
    };

    res.json(result);
  } catch (error) {
    console.error("Error occurred while scraping:", error);
    res.status(500).json({ message: "Error occurred while scraping", error });
  }
};
