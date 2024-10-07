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
  return price.trim().length > 0;
};

module.exports = {
  validateProductName,
  validateProductPrice,
};
