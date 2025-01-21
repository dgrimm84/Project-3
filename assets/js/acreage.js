async function readExcelFile(filePath) {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    // Assuming data is in the first sheet
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    return sheetData;
}

function processData(data) {
    // Group by state and sum Gross Area Acres
    const stateTotals = {};

    data.forEach(row => {
        if (row.State && row["Gross Area Acres"]) {
            const state = row.State.trim();
            const acres = parseFloat(row["Gross Area Acres"]) || 0;
            stateTotals[state] = (stateTotals[state] || 0) + acres;
        }
    });

    // Sort states by total acres
    const sortedStates = Object.entries(stateTotals)
        .sort(([, acresA], [, acresB]) => acresB - acresA)
        .slice(0, 5); // Top 5 states

    // Prepare data for chart
    const states = sortedStates.map(([state]) => state);
    const acres = sortedStates.map(([, totalAcres]) => totalAcres);

    return { states, acres };
    console.log(states);
}

async function renderChart() {
    const filePath = "assets/Resources/NPSAcreage-09-30-2024.xlsx";
    const rawData = await readExcelFile(filePath);
    const { states, acres } = processData(rawData);

    // Plot the data using Plotly
    const plotData = [{
        x: states,
        y: acres,
        type: "bar",
        marker: { color: "teal" }
    }];

    const layout = {
        title: "Top 5 States by Total National Park Acres",
        xaxis: { title: "State", tickangle: 45 },
        yaxis: { title: "Total Acres", tickformat: ",d" },
        margin: { t: 50, b: 100 },
        height: 500
    };

    Plotly.newPlot("plot", plotData, layout);
}

// Initialize chart rendering
renderChart();