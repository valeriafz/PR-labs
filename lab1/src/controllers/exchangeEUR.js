const axios = require("axios");

const getExchangeRate = async () => {
  try {
    const response = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/MDL"
    );
    return response.data.rates.EUR;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    throw new Error("Failed to fetch exchange rate.");
  }
};

const convertMDLToEUR = async (mdlPrice) => {
  const conversionRate = await getExchangeRate();
  const priceNumber = parseFloat(mdlPrice.replace(".", "").replace(",", "."));

  const priceInEUR = priceNumber * conversionRate;

  return parseFloat(priceInEUR.toFixed(2));
};

module.exports = convertMDLToEUR;
