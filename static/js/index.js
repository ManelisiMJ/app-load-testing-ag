'Use strict'

import SERVER_IP from './config.js' //Server's IP address
const testButton = document.getElementById("start-test")
const visualizeButton = document.getElementById("visualize")
visualizeButton.disabled = true     //Disable the visualize button for now
const startBox = document.getElementById("start")
const endBox = document.getElementById("end")
const intervalBox = document.getElementById("interval")
const loader = document.getElementById("loader")
const url = `${SERVER_IP}/load-test`    //API endpoint in flask server
let data = []       //Array to hold all the collected data

/**
 * Sends a variable number of http requests to the server
 * @param {*} endpointUrl the localhost url of the server
 */
function loadTest(endpointUrl){
    visualizeButton.disabled = true
    let minRequests =  Number.parseInt(startBox.value) || 10    //Start number of requests
    let maxRequests = Number.parseInt(endBox.value) || 100    //End number of requests
    let interval = Number.parseInt(intervalBox.value) || 10        //Interval to increment requests
        
    if (maxRequests < minRequests){
        alert("Max requests cannot be less than Min requests")
    }
    else{
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
                            //data array has been completed, hide the loader
                            if (data.length === Number.parseInt((maxRequests-minRequests+interval)/interval)){
                                loader.classList.add("loader--hidden")
                                visualizeButton.disabled = false
                            }
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching data:', error);
                    });
            }  
        }
    }
}

/**
 * Creates a scatter plot to visualize the average response times
 * Uses the d3.js library
 */
function visualizeResponseTimes(){
    try {
        d3.select("#graph-response").remove()
    } catch (error) {
        console.log("graph not yet there")
    }

    // Extracting the data points
    const plotData = data.map((obj, index) => ({
        x: obj.numRequests,
        y: obj.avgResponseTime,
    }));

    // SVG container dimensions
    const svgWidth = 600;
    const svgHeight = 400;
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Create the SVG container for the scatter plot
    const scatterPlotContainer = d3
    .select("#response")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("id", "graph-response")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    // Adding the graph title
    scatterPlotContainer
    .append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "22px")
    .text("Number of Requests vs Average response time");

    //Adding the x-axis title
    scatterPlotContainer
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .attr("text-anchor", "middle")
    .style("font-size", "17px")
    .text("Number of Requests");

    // Adding y-axis title
    scatterPlotContainer
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .style("font-size", "17px")
    .text("Response Time (ms)");

    // Setting up scales for x and y axes
    const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(plotData, (d) => d.x)])
    .range([0, width]);

    const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(plotData, (d) => d.y)])
    .range([height, 0]);

    // Adding x-axis to the scatter plot
    scatterPlotContainer
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

    // Adding y-axis to the scatter plot
    scatterPlotContainer.append("g").call(d3.axisLeft(yScale));

    // Adding circles as data points to the scatter plot
    scatterPlotContainer
    .selectAll("circle")
    .data(plotData)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.x))
    .attr("cy", (d) => yScale(d.y))
    .attr("r", 4)
    .style("fill", "steelblue");
}

/**
 * Creates a line chart to visualize the total bytes sent
 * Uses the d3.js library to draw the line chart
 */
function visualizeBytesSent(){
    try {
        d3.select("#graph-bytes").remove()
    } catch (error) {
        console.log("graph not yet there")
    }

    // Extracting the data points
    const plotData = data.map((obj, index) => ({
        x: obj.numRequests,
        y: obj.bytesSent,
    }));

    // Setting up the SVG container dimensions
    
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };
    const svgWidth = 600
    const svgHeight = 400
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Creating the SVG container
    const lineContainer = d3
    .select("#bytes")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("id", "graph-bytes")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    // Adding the graph title
    lineContainer
    .append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "22px")
    .text("Number of Requests vs Bytes sent");

    // Adding the x-axis title
    lineContainer
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .attr("text-anchor", "middle")
    .style("font-size", "17px")
    .text("Number of Requests");

    // Adding y-axis title
    lineContainer
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .style("font-size", "17px")
    .text("Bytes sent");

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
    lineContainer
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

    // Adding y-axis
    lineContainer.append("g").call(d3.axisLeft(yScale));

    // Creating the line generator
    const line = d3
    .line()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));

    // Adding the line
    lineContainer
    .append("path")
    .datum(plotData)
    .attr("fill", "none")
    .attr("stroke", "orange")
    .attr("stroke-width", 2)
    .attr("d", line);
}

/**
 * Creates a bar chart to visualize the minimum response times
 * Uses the d3.js library
 */
function visualizeMinTime(){
    try {
        d3.select("#graph-min").remove();
    } catch (error) {
        console.log("graph not yet there")
    }

    // Setting up the SVG container dimensions
    
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };
    const svgWidth = 600
    const svgHeight = 400
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Creating the SVG container
    const svg = d3.select("#min")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("id", "graph-min")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    // Adding the graph title
    svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "25px")
    .text("Minimum response times");

    svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Number of Requests");

    // Adding y-axis title
    svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Response time (ms)");

    // Setting up scales for x and y axes
    const xScale = d3
    .scaleBand()
    .domain(data.map((obj) => obj.numRequests.toString()))
    .range([0, width])
    .padding(0.1);

    const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (obj) => obj.minResponseTime)])
    .range([height, 0]);

    // Adding x-axis
    svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

    // Adding y-axis
    svg.append("g").call(d3.axisLeft(yScale));

    // Adding the bars
    svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.numRequests.toString()))
    .attr("y", (d) => yScale(d.minResponseTime))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => height - yScale(d.minResponseTime))
    .attr("fill", "steelblue");
}

/**
 * Creates a bar chart to visualize the maximum response times
 * Uses the d3.js library to draw the bar chart
 */
function visualizeMaxTime(){
    try {
        d3.select("#graph-max").remove()
    } catch (error) {
        console.log("graph not yet there")
    }

    // Setting up the SVG container dimensions
    
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };
    const svgWidth = 600
    const svgHeight = 400
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Creating the SVG container
    const svg = d3.select("#max")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("id", "graph-max")
    .attr("transform", `translate(${margin.left},${margin.top})`);

    // Adding the graph title
    svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "22px")
    .text("Maximum response times");

    svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .attr("text-anchor", "middle")
    .style("font-size", "17px")
    .text("Number of Requests");

    // Adding y-axis title
    svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -margin.left)
    .attr("dy", "1em")
    .attr("text-anchor", "middle")
    .style("font-size", "17px")
    .text("Response time (ms)");

    // Setting up scales for x and y axes
    const xScale = d3
    .scaleBand()
    .domain(data.map((obj) => obj.numRequests.toString()))
    .range([0, width])
    .padding(0.1);

    const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (obj) => obj.minResponseTime)])
    .range([height, 0]);

    // Adding x-axis
    svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));

    // Adding y-axis
    svg.append("g").call(d3.axisLeft(yScale));

    // Adding the bars
    svg
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.numRequests.toString()))
    .attr("y", (d) => yScale(d.minResponseTime))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => height - yScale(d.minResponseTime))
    .attr("fill", "orange");
}

testButton.addEventListener("click", ()=>{
    loader.classList.remove("loader--hidden")   //Show the loader
    data = []
    loadTest(url)       //Start test
    console.log("data =", data)
})

/**
 * Draws the different graphs to represent the data
 */
visualizeButton.addEventListener("click", ()=>{
    visualizeResponseTimes()
    visualizeBytesSent()
    visualizeMinTime()
    visualizeMaxTime()
    visualizeButton.disabled = true
})






