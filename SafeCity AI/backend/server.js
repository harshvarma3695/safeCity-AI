const express = require('express');
const cors = require('cors');

const app = express();

//  Import AI logic
const { getPrediction } = require('./model/predictor');

app.use(cors());
app.use(express.json());

app.post('/predict', (req, res) => {
    const { area, time, previousCrime, populationDensity } = req.body;

    //  Validation
    if (!area || !time) {
        return res.status(400).json({ error: "Area and time are required" });
    }

    // Clean input
    const inputData = {
        area,
        time,
        previousCrime: previousCrime || 0,
        populationDensity: populationDensity || 0
    };

    console.log("Prediction Request:", inputData);

    // Use model
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
        reason: reason.join(", ")
    });
});

// ✅ Server start
app.listen(4000, () => {
    console.log(" Server running on http://localhost:4000");
});
