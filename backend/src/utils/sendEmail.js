import { Resend } from "resend";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY); // 🔥 yaha shift kiya

    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY missing");
    }

    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      cc: ["arpanjain00123@gmail.com"],
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