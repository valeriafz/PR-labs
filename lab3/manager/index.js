const amqp = require("amqplib/callback_api");
const axios = require("axios");

amqp.connect("amqp://user:password@rabbitmq:5672", (error0, connection) => {
  if (error0) {
    console.error("RabbitMQ Connection Error:", error0);
    return;
  }

  connection.createChannel((error1, channel) => {
    if (error1) {
      console.error("RabbitMQ Channel Error:", error1);
      return;
    }

    console.log("Successfully connected to RabbitMQ!");

    const queue = "productQueue";

    channel.assertQueue(queue, { durable: false });
    console.log("Waiting for messages in", queue);

    channel.consume(queue, async (msg) => {
      if (msg) {
        const product = JSON.parse(msg.content.toString());
        console.log("Received product data:", product);

        const { name, price, link, priceInEUR, sku } = product;

        axios
          .post("http://lab2-my_node_app-1:3000/api/products", {
            ...product,
            price: product.price.replace(",", "."),
          })
          .then((response) => {
            console.log("Product successfully sent to LAB2:", response.data);
          })
          .catch((error) => {
            console.error("Axios error:", error.message);
            if (error.response) {
              console.error("Error response data:", error.response.data);
              console.error("Status:", error.response.status);
            }
            if (error.request) {
              console.error("Request data:", error.request);
            }
          });

        // Acknowledge the message after it has been processed
        channel.ack(msg);
      }
    });
  });
});
