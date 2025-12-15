# ICC - ID-card checker

A Deno cron job that checks the Norwegian Police booking system for available ID card appointments occasionally. Sends an email notification via AWS SES when appointments become available within the next week at configured locations.

## Configuration

The following environment variables are required:

- `AWS_SES_ACCESS_KEY_ID`: The access key ID for the AWS SES service.
- `AWS_SES_SECRET_ACCESS_KEY`: The secret access key for the AWS SES service.
- `FROM_EMAIL`: The email address to send the notification from.
- `TO_EMAIL`: The email address to send the notification to.
