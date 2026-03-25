function getPrediction({ area, time, previousCrime = 0, populationDensity = 0 }) {
    let score = 0;

    const weights = {
        time: { night: 30, day: 10 },
        area: { urban: 25, rural: 10 },
        crimeFactor: 0.4,
        populationFactor: 0.2
    };

    score += weights.time[time] || 0;
    score += weights.area[area] || 0;

    const crime = Math.min(previousCrime, 100);
    const population = Math.min(populationDensity, 100);

    score += crime * weights.crimeFactor;
    score += population * weights.populationFactor;

    let risk = Math.min(Math.round(score), 100);

    let message = "Low Risk Area";
    if (risk > 70) message = "High Crime Risk 🚨";
    else if (risk > 40) message = "Moderate Risk ⚠️";

    // 🔥 NEW: Crime Type Logic
    let crimeType = "Petty Theft";

    if (risk > 70 && time === "night") {
        crimeType = "Robbery / Assault";
    } else if (risk > 50 && area === "urban") {
        crimeType = "Chain Snatching / Theft";
    } else if (risk < 40) {
        crimeType = "Minor Incidents";
    }

    return { risk, message, crimeType };
}

module.exports = { getPrediction };