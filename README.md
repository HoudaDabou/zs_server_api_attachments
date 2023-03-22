# zs_server_api_attachments
This repository contains some node scripts that helps to delete all attachments associated with test results in a given test run, using the REST API: https://support.smartbear.com/zephyr-scale-server/api-docs/v1/


## Requirements
NodeJs 14.x

## How to use

### Install node dependencies with:

```
npm install
```

### Get all test runs from a given subfolder
This uses ```GET /testrun/search``` REST API endpoint: https://support.smartbear.com/zephyr-scale-server/api-docs/v1/

Run the script with:

```
AUTH=username:password BASE_URL=localhost PROJECT_KEY=project_key SUBFOLDER_NAME='the name of the subfolder' node zs_get_testruns.js
```
Please note that the value of ```BASE_URL``` should be set without ```https://```


### Get all attachments associated with test results of a given test run key
This uses ```GET /testresult/{testResultId}/attachments``` REST API endpoint: https://support.smartbear.com/zephyr-scale-server/api-docs/v1/

Run the script with:

```
AUTH=username:password BASE_URL=https://localhost PROJECT_KEY=project_key TEST_RUN_KEY=your_test_run_key node zs_attachments_test_results.js
```
Please note that the value of ```BASE_URL``` should be set with ```https://```


### Delete all attachments associated with those test results

This uses ```DELETE /attachments/{id}``` REST API endpoint: https://support.smartbear.com/zephyr-scale-server/api-docs/v1/

Run the script with:

```
AUTH=username:password BASE_URL=localhost node zs_delete_attachments.js
```

Please note that the value of ```BASE_URL``` should be set without ```https://```
