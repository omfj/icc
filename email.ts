import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

interface EmailOptions {
  subject: string;
  body: string;
  isHtml?: boolean;
}

export class EmailService {
  private client: SESClient;
  private fromEmail: string;
  private toEmail: string;

  constructor() {
    const region = Deno.env.get("AWS_REGION") || "eu-north-1";
    const accessKeyId = Deno.env.get("AWS_SES_ACCESS_KEY_ID");
    const secretAccessKey = Deno.env.get("AWS_SES_SECRET_ACCESS_KEY");
    this.fromEmail = Deno.env.get("FROM_EMAIL") || "";
    this.toEmail = Deno.env.get("TO_EMAIL") || "";

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        "AWS credentials not found. Please set AWS_SES_ACCESS_KEY_ID and AWS_SES_SECRET_ACCESS_KEY environment variables."
      );
    }

    if (!this.toEmail) {
      throw new Error("EMAIL environment variable not set.");
    }

    if (!this.fromEmail) {
      throw new Error("FROM_EMAIL environment variable not set.");
    }

    // Initialize SES client
    this.client = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    const { subject, body, isHtml = false } = options;

    const params = {
      Source: this.fromEmail,
      Destination: {
        ToAddresses: [this.toEmail],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: "UTF-8",
        },
        Body: isHtml
          ? {
              Html: {
                Data: body,
                Charset: "UTF-8",
              },
            }
          : {
              Text: {
                Data: body,
                Charset: "UTF-8",
              },
            },
      },
    };

    try {
      const command = new SendEmailCommand(params);
      const response = await this.client.send(command);
      console.log(`Email sent successfully! MessageId: ${response.MessageId}`);
    } catch (error) {
      console.error("Failed to send email:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const emailService = new EmailService();
