import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !user || !pass) {
      throw new Error(
        "SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables must be set."
      );
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      // Port 587 uses STARTTLS (secure: false, upgraded after connecting);
      // port 465 is implicit TLS from the start.
      secure: port === 465,
      auth: { user, pass },
    });
  }
  return transporter;
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    throw new Error("EMAIL_FROM environment variable must be set.");
  }

  await getTransporter().sendMail({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    replyTo: input.replyTo,
  });
}
