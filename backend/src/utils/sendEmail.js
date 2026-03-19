import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",

    // 🔥 PORT CONFIG (AUTO HANDLE)
    port: process.env.EMAIL_PORT || 465,

    secure: process.env.EMAIL_PORT == 465, // true for 465, false for 587

    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"PulseIQ" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};