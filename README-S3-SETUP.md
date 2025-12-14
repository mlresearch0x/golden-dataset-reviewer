# S3 Storage Setup Guide

This application uses AWS S3 for persistent storage of ground truth datasets. Follow these steps to set up S3 storage:

## Prerequisites

- AWS Account
- AWS IAM user with S3 access

## Step 1: Create an S3 Bucket

1. Log in to AWS Console
2. Navigate to S3 service
3. Click "Create bucket"
4. Choose a unique bucket name (e.g., `ground-truth-datasets`)
5. Select your preferred region (e.g., `us-east-1`)
6. Keep default settings for Block Public Access (recommended)
7. Click "Create bucket"

## Step 2: Create IAM User with S3 Access

1. Navigate to IAM service in AWS Console
2. Click "Users" → "Add users"
3. Enter username (e.g., `ground-truth-app`)
4. Select "Access key - Programmatic access"
5. Click "Next: Permissions"
6. Choose "Attach existing policies directly"
7. Search and select `AmazonS3FullAccess` (or create a custom policy for your specific bucket)
8. Complete the user creation
9. **Important**: Save the Access Key ID and Secret Access Key (you won't see the secret again!)

### Recommended Custom IAM Policy (More Secure)

Instead of full S3 access, create a custom policy for your specific bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:HeadObject"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
    }
  ]
}
```

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key-id-here
   AWS_SECRET_ACCESS_KEY=your-secret-access-key-here
   S3_BUCKET_NAME=your-bucket-name-here
   ```

3. Never commit `.env.local` to git (it's already in `.gitignore`)

## Step 4: Deploy to Production

### For Vercel:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add the following variables:
   - `AWS_REGION`
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `S3_BUCKET_NAME`

### For Other Platforms:

Add the same environment variables to your hosting platform's configuration.

## How It Works

- The application stores the dataset as `current-dataset.json` in your S3 bucket
- All reads/writes go through the S3 API
- Data persists across deployments and server restarts
- Automatic backups via S3 versioning (optional - can be enabled in bucket settings)

## Optional: Enable S3 Versioning

To keep a history of dataset changes:

1. Go to your S3 bucket
2. Click "Properties" tab
3. Find "Bucket Versioning"
4. Click "Edit"
5. Select "Enable"
6. Save changes

This will keep previous versions of your dataset file, allowing you to recover from accidental changes.

## Troubleshooting

### "Access Denied" errors
- Check that your IAM user has the correct permissions
- Verify bucket name is correct in `.env.local`
- Ensure AWS credentials are valid

### "Region mismatch" errors
- Make sure `AWS_REGION` matches your bucket's region

### Data not persisting
- Check Vercel/hosting platform environment variables are set
- Verify S3 bucket exists and is accessible
- Check application logs for S3 errors

## Security Notes

- Never commit AWS credentials to git
- Use IAM policies with minimal required permissions
- Consider using AWS IAM roles if deploying to AWS infrastructure
- Regularly rotate access keys
- Enable S3 bucket encryption for sensitive data
