const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/ProductController");

router.post("/products", createProduct);

router.get("/products", getProducts);

router.put("/products/:sku", updateProduct);

router.delete("/products/:sku", deleteProduct);

module.exports = router;
