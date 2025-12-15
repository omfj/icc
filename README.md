# ICC - ID-card checker

A Deno cron job that checks the Norwegian Police booking system for available ID card appointments occasionally. Sends an email notification via AWS SES when appointments become available within the next week at configured locations.

## Motivation

The big cities mostly have waiting lines for 4 or more months, but they do sometimes put out available time slots for the current or coming week. This tool helps you catch those last-minute openings by automatically checking and notifying you when slots become available.

## Configuration

The following environment variables are required:

- `AWS_SES_ACCESS_KEY_ID`: The access key ID for the AWS SES service.
- `AWS_SES_SECRET_ACCESS_KEY`: The secret access key for the AWS SES service.
- `FROM_EMAIL`: The email address to send the notification from.
- `TO_EMAIL`: The email address to send the notification to.
