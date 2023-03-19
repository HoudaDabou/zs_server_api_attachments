# zs_server_api_attachments
This repository contains some node scripts that helps to delete all attachments associated with test results in a given test run, using the REST API: https://support.smartbear.com/zephyr-scale-server/api-docs/v1/


# Requirements
NodeJs 14.x
# How to use

Install node dependencies:

```
npm install
```

Delete all attachments associated with test results of a given test run key. The following script catches the attachments linked to each test result in the test run, it returns a Json ouptput, which is reused to identify the attachments to delete while the second process. 

```
node main.js
```
