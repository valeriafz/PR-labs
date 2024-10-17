exports.handleUpload = async (req, res) => {
  const contentType = req.get("Content-Type");

  try {
    if (contentType === "application/json") {
      console.log("Received JSON data:", req.body);
      return res.status(200).send({ message: "JSON successfully sent" });
    } else if (contentType === "application/xml") {
      const xmlData = req.body.toString();
      console.log("Received XML data:", xmlData);
      return res.status(200).send("<message>XML successfully sent</message>");
    } else {
      return res.status(400).send("Unsupported Content-Type");
    }
  } catch (error) {
    console.error("Error in upload handler:", error);
    return res.status(500).send("Internal server error: " + error.message);
  }
};
