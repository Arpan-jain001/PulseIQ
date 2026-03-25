// import nodemailer from "nodemailer";

// export const sendEmail = async ({ to, subject, html }) => {
//   try {
//     // 🔥 TRANSPORTER (RENDER SAFE + IPV4 FIX)
//     const transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",

//       // ✅ USE 465 (MORE STABLE THAN 587 ON RENDER)
//       port: 465,
//       secure: true, // MUST true for 465

//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },

//       // 🔥 IMPORTANT FIXES
//       tls: {
//         family: 4, // ✅ FORCE IPv4 (fix ENETUNREACH)
//       },

//       connectionTimeout: 10000,
//       greetingTimeout: 10000,
//       socketTimeout: 10000,
//     });

//     // 🔥 VERIFY CONNECTION (OPTIONAL BUT GOOD)
//     await transporter.verify();

//     // 📧 SEND MAIL
//     const info = await transporter.sendMail({
//       from: `"PulseIQ 🚀" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     });

//     console.log("📧 Email sent:", info.messageId);

//     return true;
//   } catch (err) {
//     console.log("❌ Email failed:", err.message);

//     // ❗ NEVER THROW ERROR (app crash avoid)
//     return false;
//   }
// };

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM, // Gmail verified as sender
      to,
      subject,
      html,
    });

    console.log("📧 Email sent via Resend:", response.id);
    return true;
  } catch (err) {
    console.log("❌ Resend email failed:", err.message);
    return false; // app crash avoid
  }
};