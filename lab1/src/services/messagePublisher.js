const amqp = require("amqplib/callback_api");

const sendToQueue = (queueName, data) => {
  amqp.connect("amqp://user:password@172.19.0.2:5672", (error0, connection) => {
    if (error0) {
      console.error("RabbitMQ Connection Error:", error0);
      return;
    }
    connection.createChannel((error1, channel) => {
      if (error1) {
        console.error("RabbitMQ Channel Error:", error1);
        return;
      }
      channel.assertQueue(queueName, { durable: false });
      channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
      console.log(`Message sent to queue ${queueName}:`, data);
      setTimeout(() => connection.close(), 500);
    });
  });
};

module.exports = { sendToQueue };
