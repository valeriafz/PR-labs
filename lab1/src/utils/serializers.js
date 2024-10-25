const serializeXML = (data) => {
  // console.log("Serialized to XML format:");

  let xml = `<result>\n`;
  xml += `  <timestamp>${data.timestamp}</timestamp>\n`;
  xml += `  <totalPrice>${data.totalPrice}</totalPrice>\n`;
  xml += `  <filteredProducts>\n`;

  data.filteredProducts.forEach((product) => {
    xml += `    <product>\n`;
    xml += `      <name>${product.name}</name>\n`;
    xml += `      <price>${product.price}</price>\n`;
    xml += `      <link>${product.link}</link>\n`;
    xml += `      <priceInEUR>${product.priceInEUR}</priceInEUR>\n`;
    xml += `      <sku>${product.sku}</sku>\n`;
    xml += `    </product>\n`;
  });

  xml += `  </filteredProducts>\n`;
  xml += `</result>\n`;

  console.log(xml);
  return xml;
};

const serializeJSON = (data) => {
  // console.log("Serialized to JSON format:");

  const jsonObject = {
    timestamp: data.timestamp,
    totalPrice: data.totalPrice,
    filteredProducts: data.filteredProducts.map((product) => ({
      name: product.name,
      price: product.price,
      link: product.link,
      priceInEUR: product.priceInEUR,
      sku: product.sku,
    })),
  };

  const json = JSON.stringify(jsonObject, null, 2);

  // console.log(json);
  return json;
};

module.exports = { serializeJSON, serializeXML };
