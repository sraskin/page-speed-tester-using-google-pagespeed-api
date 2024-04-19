# pagespeed-test

This is a simple Node.js application named "pagespeed-test".

## Description

This application is designed to test the page speed of a website. 

## Installation

Before you start, make sure you have Node.js and npm installed on your machine.

1. Clone this repository:
2. Run `npm install` to install the dependencies.
3. Create a `.env` file in the root directory and add the following:
```
PORT=3300
MONGODB_URI=

#Google API Configuration
PAGE_SPEED_API_KEY=
```
4. Run `npm start` to start the server.
5. Open your browser and navigate to `<IP>:3300/api/v1/automation/checkPerformance?testUrl=https://example.com` to test the page speed of a website.

