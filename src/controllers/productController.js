const cheerio = require("cheerio");
const {
  validateProductName,
  validateProductPrice,
} = require("../utils/validators");
const convertMDLToEUR = require("./exchangeEUR");
const { fetchHtmlUsingTcpSocket } = require("../services/httpService");

exports.scrapeTopShop = async (req, res) => {
  try {
    const hostname = "www.top-shop.md";
    const path = "/oferte-speciale";

    const html = await fetchHtmlUsingTcpSocket(hostname, path);

    const $ = cheerio.load(html);
    const products = [];

    $(".item").each((index, element) => {
      const name = $(element).find(".product-name").text().trim();
      const price = $(element).find(".special-price").text().trim();
      const link = $(element).find("a").attr("href");

      products.push({ name, price, link });
    });

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
