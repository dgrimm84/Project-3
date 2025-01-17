// Grant CesiumJS access to your ion assets
Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYTgyNjM5Ny0wOTc3LTQ2MzQtYmZhOC04YjkzMTgwNTkwODUiLCJpZCI6MjY5MzE3LCJpYXQiOjE3MzY5OTI1NDV9.BhvC1tYcm7aMtL-Etf7E1lxuT7VmTBgZoY1w8I_wI5E"; // Replace with your actual Cesium ion token

// Initialize Cesium viewer
const viewer = new Cesium.Viewer("cesiumContainer", {
  terrainProvider: Cesium.createWorldTerrain(),
  baseLayerPicker: false, // Disable base layer picker
  timeline: false,
  animation: false,
});

// API and data setup
const apiKey = 'Z4ZXb0nUnTMOq6cljxbN1cFD0mk6kLaQBzkqehf3'; // Replace with your actual API key
const parksUrl = `https://developer.nps.gov/api/v1/parks?limit=500&api_key=${apiKey}`;

// Fetch park data from NPS API
fetch(parksUrl)
  .then((response) => response.json())
  .then((data) => {
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((park) => {
        const lat = parseFloat(park.latitude);
        const lon = parseFloat(park.longitude);
        const parkName = park.fullName;
        const entranceFee = park.entranceFees.map((fee) => fee.cost);
        const entrancePass = park.entrancePasses.map((fee) => fee.cost);
        const parkUrl = park.url;
        const parkCode = park.parkCode;

        // Parse entrance fee (ensure it's a valid number)
        const feeAmount = parseFloat(entranceFee[0]) || 0;

        // Determine the icon filter based on the fee amount
        let parkIconUrl;
        if (feeAmount === 0) {
          parkIconUrl = 'static/Images/tree-green.svg';
        } else if (feeAmount > 0 && feeAmount <= 10) {
          parkIconUrl = 'static/Images/tree-yellow.svg';
        } else if (feeAmount > 10 && feeAmount <= 20) {
          parkIconUrl = 'static/Images/tree-orange.svg';
        } else if (feeAmount > 20) {
          parkIconUrl = 'static/Images/tree-red.svg';
        }

        let monumentIconUrl;
        if (feeAmount === 0) {
          monumentIconUrl = 'static/Images/monument-green.svg';
        } else if (feeAmount > 0 && feeAmount <= 10) {
          monumentIconUrl = 'static/Images/monument-yellow.svg';
        } else if (feeAmount > 10 && feeAmount <= 20) {
          monumentIconUrl = 'static/Images/monument-orange.svg';
        } else if (feeAmount > 20) {
          monumentIconUrl = 'static/Images/monument-red.svg';
        }

        let memorialIconUrl;
        if (feeAmount === 0) {
          memorialIconUrl = 'static/Images/memorial-green.svg';
        } else if (feeAmount > 0 && feeAmount <= 10) {
          memorialIconUrl = 'static/Images/memorial-yellow.svg';
        } else if (feeAmount > 10 && feeAmount <= 20) {
          memorialIconUrl = 'static/Images/memorial-orange.svg';
        } else if (feeAmount > 20) {
          memorialIconUrl = 'static/Images/memorial-red.svg';
        }

        // Add marker to Cesium globe
        if (!park.designation.includes('Monument') && park.designation.includes('Park')) {
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat),
            billboard: {
              image: parkIconUrl,
              width: 32,
              height: 32
            },
            description: `
              <h3>${parkName}</h3>
              <p>Entrance fee: ${entranceFee[0] || "None"}</p>
              <p>Annual Pass fee: ${entrancePass[0] || "None"}</p>
              <a href="${parkUrl}" target="_blank">Location Website</a>
              <br><br><a href="table.html?parkCode=${parkCode}" target="_blank">View Location Details</a>
            `
          });
        }

        if (park.designation.includes('Monument')) {
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat),
            billboard: {
              image: monumentIconUrl,
              width: 32,
              height: 32
            },
            description: `
              <h3>${parkName}</h3>
              <p>Entrance fee: ${entranceFee[0] || "None"}</p>
              <p>Annual Pass fee: ${entrancePass[0] || "None"}</p>
              <a href="${parkUrl}" target="_blank">Location Website</a>
              <br><br><a href="table.html?parkCode=${parkCode}" target="_blank">View Location Details</a>
            `
          });
        }

        if (park.designation.includes('Memorial') && !park.designation.includes('Monument')) {
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(lon, lat),
            billboard: {
              image: memorialIconUrl,
              width: 32,
              height: 32
            },
            description: `
              <h3>${parkName}</h3>
              <p>Entrance fee: ${entranceFee[0] || "None"}</p>
              <p>Annual Pass fee: ${entrancePass[0] || "None"}</p>
              <a href="${parkUrl}" target="_blank">Location Website</a>
              <br><br><a href="table.html?parkCode=${parkCode}" target="_blank">View Location Details</a>
            `
          });
        }
      });
    } else {
      console.error("Invalid data structure:", data);
    }
  })
  .catch((error) => console.error("Error fetching data:", error));

// Add a simple legend to the viewer
const legendContainer = document.createElement("div");
legendContainer.style.position = "absolute";
legendContainer.style.bottom = "10px";
legendContainer.style.left = "10px";
legendContainer.style.padding = "10px";
legendContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
legendContainer.style.border = "1px solid #ccc";
legendContainer.innerHTML = `
  <h4>Legend</h4>
  <div style="display: flex; align-items: center; margin-bottom: 8px;">
    <img src="static/Images/tree-green.svg" style="width: 16px; height: 16px; margin-right: 8px;" />
    Free ($0)
  </div>
  <div style="display: flex; align-items: center; margin-bottom: 8px;">
    <img src="static/Images/tree-yellow.svg" style="width: 16px; height: 16px; margin-right: 8px;" />
    $1 - $10
  </div>
  <div style="display: flex; align-items: center; margin-bottom: 8px;">
    <img src="static/Images/tree-orange.svg" style="width: 16px; height: 16px; margin-right: 8px;" />
    $11 - $20
  </div>
  <div style="display: flex; align-items: center;">
    <img src="static/Images/tree-red.svg" style="width: 16px; height: 16px; margin-right: 8px;" />
    $21 and above
  </div>
`;
document.body.appendChild(legendContainer);