import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    // Create a transporter using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sss.satyaprakash9621@gmail.com',
        pass: 'zhxv nlnn cjrk wogf'
      }
    });

    // Admin notification email
    const adminMailOptions = {
      from: 'sss.satyaprakash9621@gmail.com',
      to: 'sss.satyaprakash9621@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    };

    // User confirmation email
    const userMailOptions = {
      from: 'sss.satyaprakash9621@gmail.com',
      to: email,
      subject: 'Thank you for contacting us',
      html: `
        <h3>Thank you for reaching out!</h3>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you shortly.</p>
        <p>Here's a copy of your message:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <p>${message}</p>
        </div>
        <p>Best regards,<br>Team AptoWorks</p>
      `
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 