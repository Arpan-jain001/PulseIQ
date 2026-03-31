import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });

    if (data.error) {
      console.log("❌ Resend error:", data.error);
      return false;
    }

    console.log("📧 Email sent:", data.id);
    return true;
  } catch (err) {
    console.log("❌ Email failed:", err.message);
    return false;
  }
};