const axios = require("axios");

const sendData = async (data, contentType) => {
  try {
    const response = await axios.post(
      "http://localhost:8000/api/upload",
      data,
      {
        headers: {
          "Content-Type": contentType,
        },
      }
    );
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error(
      `Error sending ${contentType} data:`,
      error.response ? error.response.data : error.message
    );
    return {
      success: false,
      message: `Error sending ${contentType} data`,
      error,
    };
  }
};

module.exports = { sendData };
