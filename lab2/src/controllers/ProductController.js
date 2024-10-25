const db = require("../db/dbConnection");

const createProduct = async (req, res) => {
  const { name, price, link, priceInEUR, sku } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO products (name, price, link, price_in_eur, sku) VALUES (?, ?, ?, ?, ?)",
      [name, price, link, priceInEUR, sku]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const [products] = await db.query(
      "SELECT * FROM products LIMIT ? OFFSET ?",
      [limit, offset]
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { name, price, link, priceInEUR } = req.body;
  const { sku } = req.params;
  try {
    await db.query(
      "UPDATE products SET name = ?, price = ?, link = ?, price_in_eur = ? WHERE sku = ?",
      [name, price, link, priceInEUR, sku]
    );
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  const { sku } = req.params;
  try {
    await db.query("DELETE FROM products WHERE sku = ?", [sku]);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
