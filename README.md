# Mail-Organizer

## Project Description

The goal of this project is to create an application that fetches emails from the user's Gmail account for the last 24 hours, categorizes them based on content, and moves them to the appropriate folders.

## Requirements

### Features

1. **Fetching emails**:
   - The application fetches emails from the Gmail account once a day, retrieving emails from the last 24 hours.

2. **Creating folders**:
   - The application creates folders based on the category the emails will be assigned to (e.g., folders like "Spam", "Work", "Family" etc.).

3. **Categorizing emails**:
   - The application categorizes emails based on content using the OpenAI model.

4. **Spam list**:
   - A list of users marked as spam is maintained. Emails from these users are automatically marked as spam and moved to the appropriate folder.

## Architecture

1. **DynamoDB**:
   - Stores configurations, including API keys for OpenAI and Gmail.
   - The `Config` table contains:
     - Primary key: `current`
     - Maps:
       - `OpenAi`:
         - `accessKey`
         - `secretKey`
       - `Gmail`:
         - `accessKey`
         - `secretKey`

2. **Lambda Function**:
   - Stores the application logic, responsible for interacting with the Gmail API, OpenAI, and DynamoDB.
   
3. **CloudWatch Events**:
   - A cron job that triggers the Lambda function once a day.

4. **JavaScript Application**:
   - The application is written in JavaScript using AWS SDK to interact with DynamoDB and Gmail API, and Axios for sending HTTP requests to OpenAI.

## Application Logic

### 1. **Configuring Gmail API and OpenAI**

To use the Gmail API, the user needs to create a Google account and generate access keys.

#### Step 1: Generating access keys
- The user generates access keys for Gmail API and OpenAI (accessKey and secretKey).
  
#### Step 2: Storing keys in DynamoDB
- The access keys for OpenAI (Map type: `accessKey`, `secretKey`) and Gmail (Map type: `accessKey`, `secretKey`) are stored in the `Config` table in DynamoDB.

### 2. **Fetching messages from Gmail**

- Using the Gmail API, the application fetches messages from the last 24 hours.
- Initially, it fetches all emails and then narrows the query to emails from the last month.

### 3. **Categorizing messages**

- The application sends each email to OpenAI (one email = one HTTP request).
- OpenAI analyzes the content of the email and assigns it to an appropriate category (e.g., "Spam", "Work", "Family" etc.).

#### Example request to OpenAI:

```json
{
  "id": "123",
  "content": "Lorem ipsum",
  "destinationFolder": "Spam"
}
```

### 4. **Moving messages to folders**

- Based on the results of the analysis, the application moves emails to the appropriate folders such as "Spam", "Work", "Family".
- Emails are deleted from the main folder after being moved to their respective folders.

---

## Installation

### Requirements:

- Node.js (>= v14.0)
- AWS CLI configured on your account
- Google account and access to Gmail API
- OpenAI account and access to the API

### Step 1: Install dependencies

```bash
npm install
```

### Step 2: Configure AWS

1. Set up access to AWS (access to DynamoDB, Lambda, CloudWatch Events).
2. Create the `Config` table in DynamoDB according to the requirements.

### Step 3: Configure access keys

1. Generate access keys for the Gmail API and OpenAI.
2. Store these keys in the `Config` table in DynamoDB.

### Step 4: Deploy Lambda

1. Install AWS SDK and configure the Lambda function.
2. Set up CloudWatch Events to trigger the Lambda function once a day.

---

## Usage

1. The Lambda function is triggered daily at a scheduled time by CloudWatch Events.
2. The Lambda function fetches emails from Gmail, analyzes their content using OpenAI, categorizes them, and moves them to the appropriate folders.

---

## Summary

The project aims to automate the management of email messages by fetching them from a Gmail account, categorizing them based on their content, and organizing them into appropriate folders. With the integration of OpenAI and AWS, the application allows for easy email management without the need for manual intervention.