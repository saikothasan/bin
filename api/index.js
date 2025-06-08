const express = require("express")
const fs = require("fs")
const path = require("path")
const cors = require("cors")

// Initialize Express
const app = express()

// Middleware
app.use(express.json())
app.use(cors())

// Load BIN data
const binsPath = path.join(__dirname, "bins_su.json")
let bins = []

try {
  const data = fs.readFileSync(binsPath, "utf8")
  bins = JSON.parse(data)
  console.log(`Loaded ${bins.length} BIN records`)
} catch (error) {
  console.error("Error loading bins.json:", error)
}

// BIN lookup endpoint
app.get("/api/lookup/:bin", (req, res) => {
  const binNumber = req.params.bin

  if (!binNumber || binNumber.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Please provide at least 6 digits of the BIN number",
    })
  }

  // Find matching BIN
  const result = bins.find((bin) => bin.number.startsWith(binNumber))

  if (result) {
    return res.json({
      success: true,
      data: result,
    })
  } else {
    return res.status(404).json({
      success: false,
      message: "BIN not found",
    })
  }
})

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    binCount: bins.length,
  })
})

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "BIN Lookup API",
    endpoints: [
      { path: "/api/lookup/:bin", description: "Look up BIN information" },
      { path: "/api/health", description: "API health check" },
    ],
  })
})

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

// Export for Vercel
module.exports = app
