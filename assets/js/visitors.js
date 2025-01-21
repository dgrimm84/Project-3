document.addEventListener('DOMContentLoaded', (event) => {
    // Function to read CSV file
    function fetchCSV(file, callback) {
        fetch(file)
            .then(response => response.text())
            .then(text => {
                const rows = text.split('\n');
                const headers = rows[0].split(',');
                const parksData = rows.slice(1).map(row => {
                    const values = row.split(',');
                    return headers.reduce((obj, header, index) => {
                        obj[header] = values[index];
                        return obj;
                    }, {});
                }).filter(row => row.ParkName && row.Year && row.RecreationVisitors); // Filter out any rows with missing data
                callback(parksData);
            });
    }

    // Function to group data by park and year
    function groupByParkYear(data) {
        const grouped = {};
        data.forEach(park => {
            const parkName = park.ParkName;
            if (!grouped[parkName]) grouped[parkName] = [];
            grouped[parkName].push({
                year: park.Year,
                visitors: parseInt(park.RecreationVisitors) || 0
            });
        });
        return grouped;
    }

    // Fetch CSV and process data
    fetchCSV('assets/Resources/allParksVisits.csv', (parksData) => {
        const groupedData = groupByParkYear(parksData);

        // Get all park names
        const parkNames = Object.keys(groupedData);

        // Populate dropdown with park names
        const dropdown = document.getElementById('parkSelector');
        if (dropdown) {
            parkNames.forEach(park => {
                const option = document.createElement('option');
                option.value = park;
                option.text = park;
                dropdown.appendChild(option);
            });

            // Function to update plot
            function updatePlot(parkName) {
                const parkData = groupedData[parkName];
                const years = parkData.map(d => d.year);
                const visitors = parkData.map(d => d.visitors);

                const data = [{
                    type: 'scatter',
                    mode: 'lines+markers',
                    x: years,
                    y: visitors,
                    line: { color: 'teal' },
                    marker: { size: 8 }
                }];

                const layout = {
                    title: `Visitors Over Years for ${parkName}`,
                    xaxis: {
                        title: 'Year'
                    },
                    yaxis: {
                        title: 'Number of Visitors',
                        tickformat: ','
                    },
                    autosize: true
                };

                Plotly.newPlot('plotDiv', data, layout);
            }

            // Event listener for park selection change
            dropdown.addEventListener('change', function() {
                updatePlot(this.value);
            });

            // Show initial plot
            if (parkNames.length > 0) {
                updatePlot(parkNames[0]); // Default to the first park
            }
        } else {
            console.error("Dropdown element not found!");
        }
    });
});