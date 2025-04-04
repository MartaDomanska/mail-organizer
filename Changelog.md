# Changelog

## [1.2.1] - 2025-04-04
- Fixed `invalid_grant` error by supporting refresh token updates in Gmail API integration
- Improved error handling for expired or revoked OAuth tokens
- Updated token refresh logic and added DynamoDB update mechanism
- Verified token scope configuration via Google OAuth Playground


## [1.2.0] - 2025-03-19
- Refactored `insertData` into `getDynamoDbData()` for retrieving configuration from DynamoDB  
- Improved Gmail API integration: fetching messages and handling credentials from DynamoDB  
- Implemented OpenAI message rating functionality  
- Updated `.gitignore` to exclude `src/config.js`  
- Fixed module import paths in `index.js`

## [1.1.0] - 2025-03-11
- Refactored project structure into 'src' and 'datasources' folders
- Added new datasource files: dynamoDbDatasource.js, openaiDatasource.js, gmailApiDatasource.js
- Updated `index.js` to reflect new file structure
- Added `README.md` and `Changelog.md` for documentation
- Updated `.gitignore` to exclude unnecessary files

## [1.0.0] - 2025-03-10
- Initial release
- Integrated DynamoDB, OpenAI, and Gmail APIs