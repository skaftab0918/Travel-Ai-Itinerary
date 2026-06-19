const Itinerary = require("../models/Itinerary");

// Get all itineraries for logged-in user
const getMyItineraries = async (req, res) => {
  const itineraries = await Itinerary.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .select("-extractedData -uploadedFiles");

  res.json({ itineraries });
};

// Get single itinerary (owner only)
const getItinerary = async (req, res) => {
  const itinerary = await Itinerary.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!itinerary) {
    return res.status(404).json({ message: "Itinerary not found." });
  }

  res.json({ itinerary });
};

// Poll status (for processing state)
const getStatus = async (req, res) => {
  const itinerary = await Itinerary.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).select("status title");

  if (!itinerary) {
    return res.status(404).json({ message: "Itinerary not found." });
  }

  res.json({ status: itinerary.status, title: itinerary.title });
};

// Get shared itinerary (public, no auth)
const getSharedItinerary = async (req, res) => {
  const itinerary = await Itinerary.findOne({
    shareToken: req.params.token,
    isPublic: true,
    status: "completed",
  }).populate("userId", "name");

  if (!itinerary) {
    return res.status(404).json({ message: "Shared itinerary not found or not public." });
  }

  res.json({ itinerary });
};

// Toggle sharing (make public/private)
const toggleShare = async (req, res) => {
  const itinerary = await Itinerary.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!itinerary) {
    return res.status(404).json({ message: "Itinerary not found." });
  }

  itinerary.isPublic = !itinerary.isPublic;
  await itinerary.save();

  res.json({
    isPublic: itinerary.isPublic,
    shareToken: itinerary.shareToken,
    message: itinerary.isPublic ? "Itinerary is now public" : "Itinerary is now private",
  });
};

// Delete itinerary
const deleteItinerary = async (req, res) => {
  const itinerary = await Itinerary.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!itinerary) {
    return res.status(404).json({ message: "Itinerary not found." });
  }

  res.json({ message: "Itinerary deleted." });
};

module.exports = {
  getMyItineraries,
  getItinerary,
  getStatus,
  getSharedItinerary,
  toggleShare,
  deleteItinerary,
};
