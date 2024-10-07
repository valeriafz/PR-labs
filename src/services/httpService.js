const tls = require("tls");

const fetchHtmlUsingTcpSocket = (hostname, path) => {
  return new Promise((resolve, reject) => {
    const client = tls.connect(
      443,
      hostname,
      { rejectUnauthorized: false },
      () => {
        // User-Agent header to avoid being blocked
        const request = `GET ${path} HTTP/1.1\r\nHost: ${hostname}\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3\r\nConnection: close\r\n\r\n`;
        client.write(request);
      }
    );

    let responseData = "";

    client.on("data", (data) => {
      responseData += data.toString();
    });

    client.on("end", () => {
      resolve(responseData);
    });

    client.on("error", (err) => {
      reject(err);
    });
  });
};

module.exports = { fetchHtmlUsingTcpSocket };
