const express = require('express');
const router = express.Router();
const { getPrediction } = require('../model/predictor');

router.post('/', (req, res) => {
    const { area, time, previousCrime, populationDensity } = req.body;

    // Validation
    if (!area || !time) {
        return res.status(400).json({ error: "Area and time are required" });
    }

    // Default safe values
    const inputData = {
        area,
        time,
        previousCrime: previousCrime || 0,
        populationDensity: populationDensity || 0
    };

    console.log("Prediction Request:", inputData);

    const result = getPrediction(inputData);

    res.json(result);
});

module.exports = router;