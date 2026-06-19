const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getMyItineraries,
  getItinerary,
  getStatus,
  getSharedItinerary,
  toggleShare,
  deleteItinerary,
} = require("../controllers/itineraryController");

// Protected routes
router.get("/", protect, getMyItineraries);
router.get("/:id", protect, getItinerary);
router.get("/:id/status", protect, getStatus);
router.patch("/:id/share", protect, toggleShare);
router.delete("/:id", protect, deleteItinerary);

// Public shared route
router.get("/shared/:token", getSharedItinerary);

module.exports = router;
