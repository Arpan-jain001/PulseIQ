// // import nodemailer from "nodemailer";

// // export const sendEmail = async ({ to, subject, html }) => {
// //   try {
// //     // 🔥 TRANSPORTER (RENDER SAFE + IPV4 FIX)
// //     const transporter = nodemailer.createTransport({
// //       host: "smtp.gmail.com",

// //       // ✅ USE 465 (MORE STABLE THAN 587 ON RENDER)
// //       port: 465,
// //       secure: true, // MUST true for 465

// //       auth: {
// //         user: process.env.EMAIL_USER,
// //         pass: process.env.EMAIL_PASS,
// //       },

// //       // 🔥 IMPORTANT FIXES
// //       tls: {
// //         family: 4, // ✅ FORCE IPv4 (fix ENETUNREACH)
// //       },

// //       connectionTimeout: 10000,
// //       greetingTimeout: 10000,
// //       socketTimeout: 10000,
// //     });

// //     // 🔥 VERIFY CONNECTION (OPTIONAL BUT GOOD)
// //     await transporter.verify();

// //     // 📧 SEND MAIL
// //     const info = await transporter.sendMail({
// //       from: `"PulseIQ 🚀" <${process.env.EMAIL_USER}>`,
// //       to,
// //       subject,
// //       html,
// //     });

// //     console.log("📧 Email sent:", info.messageId);

// //     return true;
// //   } catch (err) {
// //     console.log("❌ Email failed:", err.message);

// //     // ❗ NEVER THROW ERROR (app crash avoid)
// //     return false;
// //   }
// // };

// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export const sendEmail = async ({ to, subject, html }) => {
//   try {
//     const response = await resend.emails.send({
//       from: process.env.EMAIL_FROM, // Gmail verified as sender
//       to,
//       subject,
//       html,
//     });

//     console.log("📧 Email sent via Resend:", response.id);
//     return true;
//   } catch (err) {
//     console.log("❌ Resend email failed:", err.message);
//     return false; // app crash avoid
//   }
// };
// backend/src/utils/sendEmail.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// 🔹 Retry helper
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Send email with retry logic via Resend
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @returns {string|boolean} messageId if sent, false if failed
 */
export const sendEmail = async ({ to, subject, html }) => {
  const MAX_RETRIES = 2;       // number of retries
  const RETRY_DELAY = 2000;    // 2 seconds delay between retries

  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const response = await resend.emails.send({
        from: process.env.EMAIL_FROM, // must be verified sender
        to,
        subject,
        html,
      });

      // 🔹 Log full response
      console.log(`📧 Attempt ${attempt}: Email response:`, response);

      // 🔹 Log status if available
      if (response.status) {
        console.log(`✅ Attempt ${attempt}: Email to ${to} is ${response.status}`);
      } else {
        console.log(`⚠️ Attempt ${attempt}: Email to ${to} sent, status unknown`);
      }

      // 🔹 Return messageId for tracking
      return response.id || true;

    } catch (err) {
      console.log(`❌ Attempt ${attempt}: Resend email failed:`, err.message);

      if (attempt <= MAX_RETRIES) {
        console.log(`⏱ Retrying in ${RETRY_DELAY / 1000} seconds...`);
        await sleep(RETRY_DELAY);
      } else {
        console.log(`❌ All attempts failed for ${to}`);
        return false;
      }
    }
  }
};