# Google Cloud Credentials Setup

## Overview
This project uses Google Cloud services for AI features. You need to set up your own Google Cloud credentials to run the application.

## Setup Instructions

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Required APIs**
   - Enable the following APIs in your project:
     - Google Cloud Speech-to-Text API
     - Google Cloud Text-to-Speech API
     - Any other AI services you plan to use

3. **Create a Service Account**
   - Go to "IAM & Admin" > "Service Accounts"
   - Click "Create Service Account"
   - Give it a name (e.g., "intellivibe-ai")
   - Grant appropriate roles (e.g., "Cloud Speech-to-Text Admin", "Cloud Text-to-Speech Admin")

4. **Generate Credentials**
   - Click on your service account
   - Go to the "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON" format
   - Download the JSON file

5. **Set Up Credentials File**
   - Rename the downloaded file to `google-credentials.json`
   - Place it in the `server/` directory
   - **IMPORTANT**: Never commit this file to version control!

## File Structure
```
server/
├── google-credentials.json          # Your actual credentials (not in git)
├── google-credentials.template.json # Template showing required format
└── CREDENTIALS_SETUP.md            # This file
```

## Security Notes
- The `google-credentials.json` file is ignored by git
- Never share your credentials publicly
- Consider using environment variables for production deployments
- Rotate your service account keys regularly

## Troubleshooting
If you encounter authentication errors:
1. Verify your credentials file is in the correct location
2. Check that your service account has the necessary permissions
3. Ensure the required APIs are enabled in your Google Cloud project 