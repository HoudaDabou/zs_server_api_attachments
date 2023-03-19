#!/usr/bin/env node
const { fs, https, path, authToken } = require('./main');

// this script gets all *.json files in output_attachments folder
// it extracts the Attachment IDs from those *.json files 
// and deletes each attachment based on its ID

const outputFolder = path.join(__dirname, 'output_attachments');

function deleteAttachment(attachmentId) {
  const options = {
    hostname: 'localhost:8080', // replace this with your Jira URL without https
    path: `/rest/atm/1.0/attachments/${attachmentId}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authToken}`,
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {output_attachments
      if (res.statusCode === 204) {
        console.log(`Attachment with ID ${attachmentId} was deleted successfully.`);
        resolve();
      } else if (res.statusCode === 404) {
        reject(`Attachment with ID ${attachmentId} does not exist, or it has already been deleted`);
      } else {
        reject(`Failed to delete attachment with ID ${attachmentId}: ${res.statusCode}`);
      }
    });

    req.on('error', (error) => {
      reject(`Error deleting attachment with ID ${attachmentId}: ${error}`);
    });

    req.end();
  });
}

async function processAttachment(attachment) {
  const { testResultIDs } = attachment;
  for (const result of testResultIDs) {
    const { attachmentId } = result;
    try {
      await deleteAttachment(attachmentId);
    } catch (error) {
      console.warn(error);
    }
  }
}

async function processFile(filePath) {
  try {
    const attachments = JSON.parse(await fs.promises.readFile(filePath));
    for (const attachment of attachments) {
      await processAttachment(attachment);
    }
  } catch (error) {
    console.warn(`Error parsing JSON file ${filePath}: ${error}`);
  }
}

async function processFolder(folderPath) {
  try {
    const files = await fs.promises.readdir(folderPath);
    for (const file of files) {
      const filePath = `${folderPath}/${file}`;
      const stats = await fs.promises.stat(filePath);
      if (stats.isDirectory()) {
        await processFolder(filePath);
      } else if (stats.isFile() && file.endsWith('.json')) {
        await processFile(filePath);
      }
    }
  } catch (error) {
    console.warn(`Error processing folder ${folderPath}: ${error}`);
  }
}

processFolder(outputFolder).catch((error) => {
  console.error(`Error deleting attachments: ${error}`);
});