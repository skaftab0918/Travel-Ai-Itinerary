const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Convert file to Gemini-compatible format
const fileToGenerativePart = (filePath, mimeType) => {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType,
    },
  };
};

const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  return mimeTypes[ext] || "application/octet-stream";
};

/**
 * Extract travel booking information from uploaded files
 */
const extractTravelData = async (files) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const fileParts = files.map((file) => {
    const mimeType = getMimeType(file.storedName);
    return fileToGenerativePart(file.path, mimeType);
  });

  const extractionPrompt = `You are a travel document analyzer. Carefully examine the provided travel documents (flight tickets, hotel bookings, travel passes, etc.) and extract ALL relevant information.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "flights": [
    {
      "airline": "",
      "flightNumber": "",
      "from": "",
      "to": "",
      "departureDate": "",
      "departureTime": "",
      "arrivalDate": "",
      "arrivalTime": "",
      "class": "",
      "confirmationNumber": "",
      "passengerName": ""
    }
  ],
  "hotels": [
    {
      "name": "",
      "location": "",
      "checkIn": "",
      "checkOut": "",
      "roomType": "",
      "confirmationNumber": "",
      "nights": 0
    }
  ],
  "transport": [
    {
      "type": "",
      "from": "",
      "to": "",
      "date": "",
      "time": "",
      "confirmationNumber": ""
    }
  ],
  "travelers": [],
  "destinations": [],
  "dateRange": {
    "start": "",
    "end": ""
  },
  "documentTypes": []
}

Extract every detail visible. If a field is not found, use empty string or empty array. Return ONLY the JSON, nothing else.`;

  const result = await model.generateContent([extractionPrompt, ...fileParts]);
  const response = result.response.text();

  try {
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    console.error("Extraction parse error:", response);
    return {
      flights: [],
      hotels: [],
      transport: [],
      travelers: [],
      destinations: [],
      dateRange: { start: "", end: "" },
      documentTypes: ["travel document"],
    };
  }
};

/**
 * Generate a structured AI travel itinerary from extracted data
 */
const generateItinerary = async (extractedData) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are an expert travel planner creating a detailed, personalized travel itinerary.

Based on these extracted travel bookings:
${JSON.stringify(extractedData, null, 2)}

Generate a comprehensive, day-by-day travel itinerary. Be creative, practical, and specific. Include realistic local recommendations.

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Descriptive trip title (e.g., 'Mumbai to Paris — 7 Days of Art & Culture')",
  "destination": "Primary destination city/country",
  "startDate": "YYYY-MM-DD or formatted date string",
  "endDate": "YYYY-MM-DD or formatted date string",
  "duration": number_of_days,
  "summary": "Engaging 2-3 sentence overview of the trip",
  "highlights": ["highlight1", "highlight2", "highlight3"],
  "days": [
    {
      "dayNumber": 1,
      "date": "formatted date",
      "title": "Memorable day title (e.g., 'Arrival & First Impressions')",
      "city": "City name",
      "events": [
        {
          "time": "HH:MM AM/PM",
          "type": "flight|hotel|activity|transport|meal|other",
          "title": "Event title",
          "description": "Detailed description with practical tips",
          "location": "Specific venue/address",
          "confirmationNumber": "if applicable",
          "icon": "✈️|🏨|🎭|🚂|🍽️|📍"
        }
      ]
    }
  ],
  "tips": [
    "Practical travel tip 1",
    "Practical travel tip 2",
    "Practical travel tip 3",
    "Practical travel tip 4",
    "Practical travel tip 5"
  ],
  "totalBudgetEstimate": "Rough estimate based on visible bookings"
}

Important rules:
- Create one day entry for EACH day of the trip
- Include actual confirmed bookings (flights, hotels) as events with their confirmation numbers
- Fill each day with 3-6 realistic activities/meals between confirmed bookings
- Use specific local restaurant names, landmarks, neighborhoods
- Make times realistic (don't schedule dinner at 10 AM)
- Assign appropriate icons to each event type
- Return ONLY the JSON, no markdown formatting`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  try {
    const cleaned = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    console.error("Itinerary generation parse error:", response);
    throw new Error("Failed to parse AI-generated itinerary");
  }
};

module.exports = { extractTravelData, generateItinerary };
