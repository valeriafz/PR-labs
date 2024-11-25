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

        // Ensure the product data contains the expected fields
        const { name, price, link, priceInEUR, sku } = product;

        try {
          const response = await axios.post(
            "http://localhost:3000/api/products",
            {
              name,
              price,
              link,
              priceInEUR,
              sku,
            }
          );
          console.log("Successfully sent product to LAB2:", response.data);
        } catch (error) {
          console.error("Error sending product to LAB2:", error);
        }

        // Acknowledge the message after it has been processed
        channel.ack(msg);
      }
    });
  });
});
