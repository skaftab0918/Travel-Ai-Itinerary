const path = require("path");
const { v4: uuidv4 } = require("uuid");
const Itinerary = require("../models/Itinerary");
const { extractTravelData, generateItinerary } = require("../services/geminiService");

const processUpload = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded." });
  }

  // Build file metadata
  const uploadedFiles = req.files.map((file) => ({
    originalName: file.originalname,
    storedName: file.filename,
    url: `/uploads/${file.filename}`,
    fileType: file.mimetype.startsWith("image/") ? "image" : "pdf",
    size: file.size,
    path: file.path,
  }));

  // Create itinerary record in "processing" state
  const itinerary = await Itinerary.create({
    userId: req.user._id,
    title: "Processing your itinerary...",
    uploadedFiles: uploadedFiles.map(({ path: _, ...rest }) => rest),
    status: "processing",
    shareToken: uuidv4(),
  });

  // Respond immediately so client can show processing state
  res.status(202).json({
    message: "Files uploaded. Processing started.",
    itineraryId: itinerary._id,
    status: "processing",
  });

  // Process asynchronously
  try {
    // Step 1: Extract travel data
    const extractedData = await extractTravelData(uploadedFiles);

    // Step 2: Generate itinerary
    const generated = await generateItinerary(extractedData);

    // Step 3: Update itinerary record
    await Itinerary.findByIdAndUpdate(itinerary._id, {
      title: generated.title || "My Travel Itinerary",
      destination: generated.destination,
      startDate: generated.startDate,
      endDate: generated.endDate,
      duration: generated.duration,
      extractedData,
      itinerary: {
        summary: generated.summary,
        highlights: generated.highlights || [],
        days: generated.days || [],
        tips: generated.tips || [],
        totalBudgetEstimate: generated.totalBudgetEstimate,
      },
      status: "completed",
    });

    console.log(`✅ Itinerary ${itinerary._id} generated successfully`);
  } catch (error) {
    console.error("❌ AI processing error:", error.message);
    await Itinerary.findByIdAndUpdate(itinerary._id, {
      status: "failed",
      title: "Processing failed — please try again",
    });
  }
};

module.exports = { processUpload };
