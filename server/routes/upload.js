const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const upload = require("../config/multer");
const { processUpload } = require("../controllers/uploadController");

// Upload multiple travel documents (max 5 files)
router.post("/", protect, upload.array("files", 5), processUpload);

module.exports = router;
