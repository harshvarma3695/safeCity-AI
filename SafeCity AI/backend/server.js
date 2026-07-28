const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const { getPrediction } = require("./model/predictor");

app.use(cors());
app.use(express.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});

// Prediction API
app.post("/predict", (req, res) => {
  const { area, time, previousCrime, populationDensity } = req.body;

  if (!area || !time) {
    return res.status(400).json({
      error: "Area and time are required",
    });
  }

  const inputData = {
    area,
    time,
    previousCrime: previousCrime || 0,
    populationDensity: populationDensity || 0,
  };

  console.log("Prediction Request:", inputData);

  const result = getPrediction(inputData);

  let action = "Normal Monitoring";
  let reason = [];

  if (result.risk > 70) {
    action = "🚔 Increase Police Patrol";
    reason.push("High combined risk factors");
  } else if (result.risk > 40) {
    action = "👮 Keep Surveillance";
    reason.push("Moderate crime indicators");
  } else {
    reason.push("Low risk indicators");
  }

  res.json({
    ...result,
    action,
    reason: reason.join(", "),
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
