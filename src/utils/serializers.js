const serializeXML = (data) => {
  console.log("Serialized to XML format:");

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
  console.log("Serialized to JSON format:");
  let json = `{\n`;
  json += `  "timestamp": "${data.timestamp}",\n`;
  json += `  "totalPrice": ${data.totalPrice},\n`;
  json += `  "filteredProducts": [\n`;

  data.filteredProducts.forEach((product) => {
    json += `    {\n`;
    json += `      "name": "${product.name}",\n`;
    json += `      "price": "${product.price}",\n`;
    json += `      "link": "${product.link}",\n`;
    json += `      "priceInEUR": ${product.priceInEUR},\n`;
    json += `      "sku": "${product.sku}"\n`;
    json += `    },\n`;
  });

  json = json.slice(0, -2) + `\n  ]\n}`;

  console.log(json);
  return json;
};

module.exports = { serializeJSON, serializeXML };
