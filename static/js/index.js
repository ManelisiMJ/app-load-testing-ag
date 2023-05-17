'Use strict'

import SERVER_IP from './config.js' //Server's IP address
const testButton = document.getElementById("start-test")
const visualizeButton = document.getElementById("visualize")
const url = `${SERVER_IP}/load-test`    //API endpoint in flask server
let minRequests = 10    //Start number of requests
let maxRequests = 15    //End number of requests
let interval = 1        //Interval to increment requests
let data = []

function loadTest(endpointUrl){
    //Loop through the range [minRequests, maxRequests] incrementing by interval
    for (let numRequests = minRequests; numRequests<=maxRequests; numRequests+=interval){
        let responseTimes = [];     //Records the response time for each request sent
        let bytes = [];             //Stores number of bytes sent from server

        // Send multiple requests and time them using the PerformanceTiming API
        for (let i = 0; i < numRequests; i++) {
            let startTime = performance.now();
            
            fetch(endpointUrl)
                .then(response => response.json())
                .then(json => {
                    let endTime = performance.now();
                    let responseTime = endTime - startTime;     //Calculate response time
                    responseTimes.push(responseTime);     //Add response time to array

                    let byteCount = new TextEncoder().encode(JSON.stringify(json)).length;  //Bytes sent by server
                    bytes.push(byteCount);

                    // If all requests have completed, calculate statistics for the No. of requests
                    if (responseTimes.length === numRequests) {
                        let avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / numRequests;
                        let maxResponseTime = Math.max(...responseTimes);
                        let minResponseTime = Math.min(...responseTimes);
                        let totalbytes = bytes.reduce((a, b) => a + b, 0);
                        
                        //Store statistics in dataPoint object
                        let dataPoint = {
                            "numRequests": numRequests,
                            "avgResponseTime": avgResponseTime,
                            "maxResponseTime": maxResponseTime,
                            "minResponseTime": minResponseTime,
                            "bytesSent": totalbytes
                        }
                        data.push(dataPoint)    //Add dataPoint to data array
                    }
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }  
    }
}

function visualize(){
    // Extracting the data points
    const plotData = data.map((obj, index) => ({
        x: obj.numRequests,
        y: obj.avgResponseTime,
    }));
    
    // Printing the extracted data for verification
    console.log(plotData);

    // Setting up the SVG container dimensions
    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const svgWidth = width + margin.left + margin.right;
    const svgHeight = height + margin.top + margin.bottom;

    // Creating the SVG container
    const svg = d3
    .select("body")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    // Setting up scales for x and y axes
    const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(plotData, (d) => d.x)])
    .range([0, width]);

    const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(plotData, (d) => d.y)])
    .range([height, 0]);

    // Adding x-axis
    svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

    // Adding y-axis
    svg.append("g").call(d3.axisLeft(yScale));

    // Adding the data points as circles
    svg
    .selectAll("circle")
    .data(plotData)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.x))
    .attr("cy", (d) => yScale(d.y))
    .attr("r", 4)
    .style("fill", "steelblue");

}

testButton.addEventListener("click", ()=>{
    loadTest(url)
    console.log("data =", data)
})

visualizeButton.addEventListener("click", ()=>{
    visualize()
})






