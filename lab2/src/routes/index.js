const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/ProductController");
const { uploadFile } = require("../controllers/UploadController");

router.post("/products", createProduct);

router.get("/products", getProducts);

router.put("/products/:sku", updateProduct);

router.delete("/products/:sku", deleteProduct);

router.post("/upload", uploadFile);

module.exports = router;
