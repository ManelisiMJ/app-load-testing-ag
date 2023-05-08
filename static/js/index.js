'Use strict'

import SERVER_IP from './config.js' //Server's IP address
const testButton = document.getElementById("start-test")
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

testButton.addEventListener("click", ()=>{
    loadTest(url)
    console.log("data =", data)
})






