const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("file");

const uploadFile = (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: "Error uploading file" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({
      filename: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });
  });
};

module.exports = { uploadFile };
