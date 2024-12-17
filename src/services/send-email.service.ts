import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { config } from 'dotenv';
import { InternalServerErrorException } from '@nestjs/common';
config();

export const sendEmail = async (
  email: string,
  subject: string,
  message: string,
) => {
  try {
    // Validate required environment variables
    if (
      !process.env.MAIL_HOST ||
      !process.env.MAIL_PORT ||
      !process.env.MAIL_USERNAME ||
      !process.env.MAIL_PASSWORD
    ) {
      throw new Error('Email configuration environment variables are missing.');
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465, // Use secure for port 465
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
      logger: true,
      debug: true,
    } as SMTPTransport.Options);

    const mailOptions = {
      from: process.env.MAIL_USERNAME,
      to: email,
      subject,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);

    return info.response;
  } catch (error: any) {
    console.error('Failed to send email:', error.message);
    throw new Error('Unable to send email. Please check the configuration.');
  }
};
