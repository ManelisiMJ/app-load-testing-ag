'Use strict'

import SERVER_IP from './config.js'
const testButton = document.getElementById("start-test")
const url = `${SERVER_IP}/load-test`
let numRequests = 50;  // number of requests to send

function loadTest(endpointUrl){

    let responseTimes = [];
    let bytesSent = [];
    // Send multiple requests and time them using the PerformanceTiming API
    for (let i = 0; i < numRequests; i++) {
        let startTime = performance.now();
        
        fetch(endpointUrl)
            .then(response => response.json())
            .then(json => {
            let endTime = performance.now();
            let responseTime = endTime - startTime;
            responseTimes.push(responseTime);

            let byteCount = new TextEncoder().encode(JSON.stringify(json)).length;
            bytesSent.push(byteCount);

            // If all requests have completed, calculate and display statistics
            if (responseTimes.length === numRequests) {
                let avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / numRequests;
                let maxResponseTime = Math.max(...responseTimes);
                let minResponseTime = Math.min(...responseTimes);
                let totalBytesSent = bytesSent.reduce((a, b) => a + b, 0);
                
                console.log(`Number of requests: ${numRequests}`);
                console.log(`Average response time: ${avgResponseTime.toFixed(2)} ms`);
                console.log(`Max response time: ${maxResponseTime.toFixed(2)} ms`);
                console.log(`Min response time: ${minResponseTime.toFixed(2)} ms`);
                console.log(`Total bytes sent: ${totalBytesSent} bytes`);
            }
            })
            .catch(error => {
            console.error('Error fetching data:', error);
            });
    }
}

testButton.addEventListener("click", ()=>{
    loadTest(url)
})






