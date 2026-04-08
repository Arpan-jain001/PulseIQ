import { Resend } from "resend";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY missing");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      cc: ["arpanjain00123@gmail.com"],
      subject,
      html,
    });

    if (data.error) {
      console.log("Resend error:", data.error);
      return false;
    }

    console.log("Email sent:", data.id);
    return true;
  } catch (error) {
    console.log("Email failed:", error.message);
    return false;
  }
};
