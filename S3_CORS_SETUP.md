# S3/DigitalOcean Spaces CORS Configuration

For presigned URL uploads to work properly, you need to configure CORS on your DigitalOcean Spaces bucket.

## Required CORS Configuration

Add this CORS configuration to your DigitalOcean Spaces bucket:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:4200", "https://yourdomain.com"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

## How to Configure CORS on DigitalOcean Spaces

### Option 1: Using DigitalOcean Control Panel
1. Go to your DigitalOcean Spaces bucket
2. Navigate to Settings > CORS
3. Add a new CORS configuration with the settings above

### Option 2: Using AWS CLI with DigitalOcean Spaces
```bash
# Install AWS CLI if not already installed
# Configure for DigitalOcean Spaces
aws configure --profile digitalocean
# AWS Access Key ID: Your DigitalOcean Spaces Access Key
# AWS Secret Access Key: Your DigitalOcean Spaces Secret Key  
# Default region name: sgp1 (or your region)
# Default output format: json

# Create cors.json file with the configuration above
# Apply CORS configuration
aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration file://cors.json --endpoint-url https://sgp1.digitaloceanspaces.com --profile digitalocean
```

## Important Notes

- Replace `http://localhost:4200` with your frontend URL
- Replace `https://yourdomain.com` with your production domain
- The CORS configuration must allow PUT requests for presigned uploads
- Make sure to include all necessary headers like `Content-Type`

## Testing CORS Configuration

After configuring CORS, test the upload again. You can also check browser developer tools Network tab to see if there are any CORS errors.