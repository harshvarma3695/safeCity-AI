// MAP
let map = L.map('map').setView([28.61, 77.23], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
.addTo(map);

let marker;

// Map click
map.on('click', function(e) {
    if (marker) map.removeLayer(marker);
    marker = L.marker(e.latlng).addTo(map);
});

//  Auto Location
navigator.geolocation.getCurrentPosition((pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    map.setView([lat, lon], 14);
    L.marker([lat, lon]).addTo(map);
});

//  Heat Zone
L.circle([28.61, 77.23], {
    color: 'red',
    radius: 500
}).addTo(map);

// PREDICT FUNCTION
async function predict() {
    const area = document.getElementById('area').value;
    const time = document.getElementById('time').value;
    const crime = document.getElementById('crime').value;
    const population = document.getElementById('population').value;

    try {
        const res = await fetch('http://localhost:4000/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                area,
                time,
                previousCrime: Number(crime),
                populationDensity: Number(population)
            })
        });

        const data = await res.json();

        // RESULT
       document.getElementById('result').innerText =
`Risk: ${data.risk}% - ${data.message}
Crime Type: ${data.crimeType}
Reason: ${data.reason}`;

        // ACTION
        document.getElementById('action').innerText =
        `Action: ${data.action}`;

        //  EXTRA SAFETY MESSAGE
        if (data.risk > 70) {
            document.getElementById('action').innerText += "\nAvoid this area at night 🚫";
            document.body.style.background = "#ffcccc";
        } else if (data.risk > 40) {
            document.body.style.background = "#fff3cd";
        } else {
            document.body.style.background = "#d4edda";
        }

    } catch (err) {
        console.error(err);
        alert("Backend connect nahi ho raha!");
    }
}

//  SEARCH LOCATION
async function searchLocation() {
    const query = document.getElementById('search').value;

    if (!query) return;

    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
    const data = await res.json();

    if (data.length > 0) {
        const lat = data[0].lat;
        const lon = data[0].lon;

        map.setView([lat, lon], 14);

        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lon]).addTo(map);
    } else {
        alert("Location not found");
    }
}

//  SUGGESTIONS
async function getSuggestions() {
    const query = document.getElementById('search').value;

    if (query.length < 3) {
        document.getElementById('suggestions').innerHTML = "";
        return;
    }

    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
    const data = await res.json();

    let list = "";

    data.slice(0, 5).forEach(place => {
        list += `<li onclick="selectLocation('${place.lat}', '${place.lon}', '${place.display_name}')">
            ${place.display_name}
        </li>`;
    });

    document.getElementById('suggestions').innerHTML = list;
}

//  SELECT LOCATION
function selectLocation(lat, lon, name) {
    lat = Number(lat);
    lon = Number(lon);

    map.setView([lat, lon], 14);

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lon]).addTo(map);

    document.getElementById('search').value = name;
    document.getElementById('suggestions').innerHTML = "";

    predict(); // auto predict
}

// ENTER KEY SUPPORT
document.getElementById("search").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        const first = document.querySelector("#suggestions li");
        if (first) {
            first.click();
        }
    }
});
