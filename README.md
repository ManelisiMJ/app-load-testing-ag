# app-load-testing-ag
Solution for the Allan Gray coding challenge

## Context
Load testing is a type of performance testing that invloves simulating a high number of concurrent users or transactions to asses system response times, resource utilization and overall stability.\
It helps identify bottlenecks, vulnerabilities and performance issues, ensuring that the system can handle the expected load without compromising its functionality and user experience.

## Task 
Create an application to hit a supplied HTTP endpoint a variable number of times, returning information and statistics about response times, bytes sent, and so on\
Additionally, provide an easy way to view the output of this application in a manner that is easy to read and interpret.

## Running the program
In the root directory, use a terminal to run server.py (python server.py)\
Once that is running, on the terminal you will see *Running on http://127.0.0.1:8080* - this is url to use in your browser.\
However if you wish to connect to the server from a different device, on the terminal you will see another url just below *http://127.0.0.1:8080*, copy that url, go to the static/js/config.js file and you will see a line like this\
*const SERVER_IP = "http://127.0.0.1:8080"* \
Replace the *http://127.0.0.1:8080* with the url you just copied. Now enter the url in a browser on a different device.
