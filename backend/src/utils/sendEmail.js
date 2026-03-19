import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",

      // ✅ ALWAYS USE 587 (BEST FOR RENDER)
      port: 587,
      secure: false, // ❗ MUST be false for 587

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      // ✅ TIMEOUT FIX (IMPORTANT)
      connectionTimeout: 10000, // 10 sec
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const info = await transporter.sendMail({
      from: `"PulseIQ 🚀" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent:", info.messageId);

    return true;
  } catch (err) {
    console.log("❌ Email failed:", err.message);

    // ❗ IMPORTANT: error throw mat karo
    // warna API fail ho jayega
    return false;
  }
};