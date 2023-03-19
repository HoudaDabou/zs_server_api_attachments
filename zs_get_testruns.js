#!/usr/bin/env node

const fs = require('fs');
const https = require('https');

// this script searches for all test runs in a given subfolder 
// it generates the zephyr_scale_testRuns.json as an output
// that includes test run keys and names

const auth = process.env.AUTH;
const authToken = Buffer.from(auth).toString('base64');
const baseUrl = process.env.BASE_URL;

// const search = `projectKey = "${process.env.PROJECT_KEY}" AND folder = ${process.env.SUBFOLDER_NAME}`;
const search = `projectKey = "AUT" AND folder = "/${process.env.SUBFOLDER_NAME}"`;



// const search = 'projectKey = "AUT" AND folder = "/my first subfolder"'; // add your project token and subfolder name 
const query = `query=${encodeURIComponent(search)}`;

const options = {
  hostname: `${baseUrl}`, // replace this with your Jira URL without https
  path: `/rest/atm/1.0/testrun/search?${query}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${authToken}`,
  }
};

const req = https.request(options, res => {
    let data = '';
  
    res.on('data', chunk => {
      data += chunk;
    });
  
    res.on('end', () => {
      const testRuns = JSON.parse(data).map(testRun => {
        const { key, name } = testRun;
        return { testRun: {key, name} };
      });
  
      const output = JSON.stringify(testRuns);

      fs.writeFile('zephyr_scale_testRuns.json', output, err => {
        if (err) throw err;
        console.log('Results written to zephyr_scale_testRuns.json');
      });
    });
  });

req.on('error', error => {
console.error(error);
});

req.end();