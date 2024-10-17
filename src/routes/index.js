const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const uploadController = require("../controllers/uploadController");

router.get("/scrape", productController.scrapeTopShop);
router.post("/upload", uploadController.handleUpload);

module.exports = router;
