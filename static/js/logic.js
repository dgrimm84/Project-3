const apiKey = 'Z4ZXb0nUnTMOq6cljxbN1cFD0mk6kLaQBzkqehf3'; // Replace with your actual API key
const parksUrl = `https://developer.nps.gov/api/v1/parks?api_key=${apiKey}`;
//const feesUrl = `https://developer.nps.gov/api/v1/feespasses?api_key=${apiKey}`;
const coord = [41.517202, -97.193072]; // Default coordinates for map center
const map = L.map('map').setView(coord, 3);

// Define tile layers (base maps)
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map); // Add tile layer to map

const topo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Source: Esri, Maxar, NOAA, USGS, and others'
});

// Define custom icon using the evergreen tree SVG
const treeIcon = L.icon({
  iconUrl: 'https://www.svgrepo.com/show/312123/evergreen-tree.svg', // URL of the SVG
  iconSize: [32, 32], // Set the size of the icon (width, height)
  iconAnchor: [16, 32], // Anchor the icon at its base
  popupAnchor: [0, -32] // Position of the popup relative to the icon
});

// Create a layer group for park data
const parkLayer = L.layerGroup();

// Fetch park data from NPS API
fetch(parksUrl)
  .then(response => response.json())
  .then(data => {
    // Ensure that you check the structure of the data before attempting to access it
    if (data.data && Array.isArray(data.data)) {
      // Loop through each park in the response and add markers to the layer group
      data.data.forEach(park => {
        const lat = park.latitude;
        const lon = park.longitude;
        const parkName = park.fullName;
        const entranceFee = park.entranceFees.map(fee => fee.cost)
        const entrancePass = park.entrancePasses.map(fee => fee.cost)
        const parkEmail = park.contacts.emailAddresses[0].emailAddress

        // Add marker for each park if coordinates exist
        if (lat && lon) {
          L.marker([lat, lon], { icon: treeIcon }) // Use the custom icon here
            .bindPopup(`
            <h3>${parkName}</h3>
            <br>Entrance fees: ${entranceFee[0] || "None"}</b>
            <br>Annual Pass fee: ${entrancePass[0] || "None"}</b>
            <br>Park Email Address: ${parkEmail || "None"}</b>
            `)
            .addTo(parkLayer); // Add to the park layer group
        }
      });
    } else {
      console.error('Invalid data structure:', data);
    }
  })
  .catch(error => console.error('Error fetching data:', error));

// Add the park layer to the map
parkLayer.addTo(map);

// Add layer control to toggle layers
const baseMaps = {
  "Simple Map": osm,
  "Topographical Map": topo,
  "Satellite Map": satellite
};

const overlayMaps = {
  'National Parks': parkLayer // Add the park layer to the overlay maps
};

L.control.layers(baseMaps, overlayMaps).addTo(map);