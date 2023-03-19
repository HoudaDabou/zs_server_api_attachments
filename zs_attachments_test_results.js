#!/usr/bin/env node
// const { fs, https, authToken, promisify } = require('../main');

const fs = require('fs');
const https = require('https');
const { promisify } = require('util');

// this script fetches all test results of a given test run
// and loop into each test result to extract attachments details
// then it generates a Json file in a given directory, like this: input_attachments/attachments-mapping-testrunkey-${testRunKey}.json

// const auth = 'houda:hiptest';

const auth = process.env.AUTH;

const authToken = Buffer.from(auth).toString('base64');

// const baseUrl = 'https://localhost:8080/rest/atm/1.0'; // replace this with your Jira URL

// const baseUrl = 'https://6abf07451cba.ngrok.app/rest/atm/1.0';

const baseUrl = process.env.BASE_URL + '/rest/atm/1.0';

const testRunKey = process.env.TEST_RUN_KEY;

function createInputAttachmentsFolder() {
  const folderName = 'output_attachments';

  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
    console.log(`Folder ${folderName} created successfully!`);
  } else {
    console.log(`Folder ${folderName} already exists!`);
  }
}

createInputAttachmentsFolder();

const getAttachments = async (url, headers) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (err) {
            console.error(`Error parsing JSON data for ${url}: ${err}`);
            reject(err);
          }
        } else {
          console.error(`Error fetching ${url}. Status code: ${res.statusCode}`);
          reject(new Error(`Error fetching ${url}. Status code: ${res.statusCode}`));
        }
      });
    }).on('error', (err) => {
      console.error(`Error fetching ${url}: ${err}`);
      reject(err);
    });
  });
};

const getTestResults = async (testRunKey) => {
  const url = `${baseUrl}/testrun/${testRunKey}/testresults`;
  const headers = {
    'Authorization': `Basic ${authToken}`
  };
  try {
    const testResults = await getAttachments(url, headers);   
    return testResults;
  } catch (err) {
    console.error(`Error fetching test results. ${err.message}`);
    throw err;
  }
};


const getTestResultAttachments = async (testResultId) => {
  const url = `${baseUrl}/testresult/${testResultId}/attachments`;
  const headers = {
    'Authorization': `Basic ${authToken}`
  };
  try {
    const attachments = await getAttachments(url, headers) ?? [];

    if (attachments.length === 0) {
      console.error(`There are no attachments associated with test result ${testResultId} in test run key: ${testRunKey}`);
      return null;
    } else {
      return attachments;
    }
  } catch (err) {
    console.error(`Error fetching attachments for test result ${testResultId}. ${err.message}`);
    throw err;
  }
};

const attachmentMapping = [];

(async () => {
  try {
    const testResults = await getTestResults(testRunKey);
    
    await Promise.all(testResults.map(async (testResult) => {
      try {
        const attachments = await getTestResultAttachments(testResult.id);
        
        if (!attachments[0] || attachments[0] === undefined) {
          console.error(`There are no attachments associated with test result ${testResult.id} in test run key: ${testRunKey}`);
          return;
        }
        
        const testResultAttachments = {
          testResultId: testResult.id,
          attachmentId: attachments[0].id,
          fileName: attachments[0].filename,
          fileSize: attachments[0].filesize,
          fileUrl: attachments[0].url
        };
        attachmentMapping.push({
          testRunKey: testRunKey,
          testResultIDs: [testResultAttachments]
        });
      } catch (err) {
        console.error(`Error fetching attachments for test result ${testResult.id}. ${err.message}`);
      }
    }));
    const fileName = `output_attachments/attachments-mapping-testrunkey-${testRunKey}.json`;
    await promisify(fs.writeFile)(fileName, JSON.stringify(attachmentMapping, null, 2));
    console.log(`Attachment mapping written to file "${fileName}"`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
})();
