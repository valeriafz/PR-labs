const validateProductName = (name) => {
  const minLength = 3;
  const maxLength = 100;
  return (
    typeof name === "string" &&
    name.length >= minLength &&
    name.length <= maxLength
  );
};

const validateProductPrice = (price) => {
  return typeof price === "string" && price.trim().length > 0; // Ensure price is non-empty
};

module.exports = {
  validateProductName,
  validateProductPrice,
};
