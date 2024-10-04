const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/scrape", productController.scrapeTopShop);

module.exports = router;
