#!/usr/bin/env node
const { execFileSync } = require('child_process');

const fs = require('fs');
const https = require('https');
const path = require('path');
const { promisify } = require('util');

const auth = 'username:password';
const authToken = Buffer.from(auth).toString('base64');

module.exports = {
  fs,
  https,
  path,
  auth,
  authToken
};

// Run the first Node.js file synchronously
execFileSync('node', ['./zs_attachments_test_results.js']);

// Run the second Node.js file synchronously
execFileSync('node', ['./zs_delete_attachments.js']);

// Print a message when both processes have finished
console.log('Both processes have finished!');
