const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  time: String,
  type: {
    type: String,
    enum: ["flight", "hotel", "activity", "transport", "meal", "other"],
    default: "other",
  },
  title: String,
  description: String,
  location: String,
  confirmationNumber: String,
  icon: String,
});

const daySchema = new mongoose.Schema({
  date: String,
  dayNumber: Number,
  title: String,
  city: String,
  events: [eventSchema],
});

const itinerarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: "My Travel Itinerary",
    },
    destination: String,
    startDate: String,
    endDate: String,
    duration: Number, // in days
    uploadedFiles: [
      {
        originalName: String,
        storedName: String,
        url: String,
        fileType: String, // 'pdf' or 'image'
        size: Number,
      },
    ],
    extractedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    itinerary: {
      summary: String,
      highlights: [String],
      days: [daySchema],
      tips: [String],
      totalBudgetEstimate: String,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Itinerary", itinerarySchema);
