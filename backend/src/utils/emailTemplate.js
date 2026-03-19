// ✅ ULTRA PREMIUM EMAIL TEMPLATE (LINK + OTP + USER DETAILS)

export const getVerificationTemplate = ({ name, email, otp, link }) => {
  return `
  <div style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          
          <!-- MAIN CARD -->
          <table width="100%" style="max-width:520px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.08);">
            
            <!-- HEADER -->
            <tr>
              <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4);padding:30px;text-align:center;color:white;">
                
                <img src="https://cdn-icons-png.flaticon.com/512/5968/5968672.png" width="50" style="margin-bottom:10px;" />
                
                <h1 style="margin:0;font-size:22px;font-weight:700;">PulseIQ</h1>
                <p style="margin:5px 0 0;font-size:13px;opacity:0.9;">Secure Email Verification</p>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:30px;">
                
                <h2 style="margin:0 0 10px;color:#0f172a;font-size:20px;">
                  Hey ${name || "User"} 👋
                </h2>

                <p style="color:#475569;font-size:14px;line-height:1.6;margin-bottom:20px;">
                  Welcome to <b>PulseIQ</b> 🚀<br/>
                  Please verify your email to activate your account.
                </p>

                <!-- USER INFO -->
                <div style="
                  background:#f8fafc;
                  border:1px solid #e2e8f0;
                  padding:12px 16px;
                  border-radius:10px;
                  margin-bottom:25px;
                  font-size:13px;
                  color:#334155;
                ">
                  <strong>Email:</strong> ${email}
                </div>

                <!-- VERIFY BUTTON -->
                <div style="text-align:center;margin:30px 0;">
                  <a href="${link}" 
                    style="display:inline-block;padding:14px 28px;
                    background:linear-gradient(135deg,#6366f1,#8b5cf6);
                    color:#ffffff;font-weight:600;
                    border-radius:999px;
                    text-decoration:none;
                    font-size:14px;
                    box-shadow:0 8px 20px rgba(99,102,241,0.3);">
                    Verify Email
                  </a>
                </div>

                <!-- DIVIDER -->
                <div style="text-align:center;margin:25px 0;color:#94a3b8;font-size:12px;">
                  OR USE OTP
                </div>

                <!-- OTP BOX -->
                <div style="text-align:center;margin:20px 0;">
                  <div style="
                    display:inline-block;
                    padding:16px 24px;
                    background:#f8fafc;
                    border:1px dashed #cbd5f5;
                    border-radius:12px;
                    font-size:26px;
                    font-weight:bold;
                    letter-spacing:8px;
                    color:#1e293b;
                  ">
                    ${otp}
                  </div>
                </div>

                <!-- NOTE -->
                <p style="text-align:center;font-size:12px;color:#64748b;margin-top:10px;">
                  OTP valid for <b>10 minutes</b>
                </p>

                <!-- WARNING -->
                <p style="font-size:12px;color:#ef4444;text-align:center;margin-top:15px;">
                  ⚠️ Do not share this code with anyone
                </p>

              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background:#f8fafc;padding:20px;text-align:center;font-size:12px;color:#64748b;">
                
                <p style="margin:0;">
                  © ${new Date().getFullYear()} PulseIQ. All rights reserved.
                </p>

                <p style="margin:8px 0;">
                  This email was sent to <b>${email}</b>
                </p>

                <p style="margin:8px 0;">
                  Need help? 
                  <a href="mailto:support@pulseiq.com" style="color:#6366f1;text-decoration:none;">
                    Contact Support
                  </a>
                </p>

                <p style="margin:0;color:#94a3b8;font-size:11px;">
                  If you didn’t request this, you can ignore this email.
                </p>

              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>
  `;
};



// ✅ Forgot Password

export const getForgotPasswordTemplate = ({ name, email, link }) => {
  return `
  <div style="background:#f1f5f9;padding:40px;font-family:sans-serif;">
    <table width="100%" style="max-width:520px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.08);">

      <tr>
        <td style="background:linear-gradient(135deg,#ef4444,#f97316);padding:25px;text-align:center;color:#fff;">
          <h2 style="margin:0;">Reset Your Password 🔐</h2>
        </td>
      </tr>

      <tr>
        <td style="padding:30px;">
          <h3>Hey ${name || "User"} 👋</h3>
          <p>You requested a password reset for:</p>

          <div style="background:#f8fafc;padding:10px;border-radius:8px;margin:10px 0;">
            <b>${email}</b>
          </div>

          <div style="text-align:center;margin:25px 0;">
            <a href="${link}" style="padding:12px 24px;background:#ef4444;color:white;border-radius:999px;text-decoration:none;">
              Reset Password
            </a>
          </div>

          <p style="font-size:12px;color:#64748b;">
            This link is valid for 10 minutes.
          </p>

          <p style="color:#ef4444;font-size:12px;">
            ⚠️ If you didn’t request this, ignore this email.
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#f8fafc;padding:15px;text-align:center;font-size:12px;">
          © ${new Date().getFullYear()} PulseIQ
        </td>
      </tr>

    </table>
  </div>
  `;
};

// Login Alert

export const getLoginAlertTemplate = ({ name, email, ip, device }) => {
  return `
  <div style="background:#f1f5f9;padding:40px;font-family:sans-serif;">
    <table width="100%" style="max-width:520px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.08);">

      <tr>
        <td style="background:linear-gradient(135deg,#06b6d4,#3b82f6);padding:25px;text-align:center;color:#fff;">
          <h2 style="margin:0;">New Login Detected 🔐</h2>
        </td>
      </tr>

      <tr>
        <td style="padding:30px;">
          <h3>Hey ${name || "User"} 👋</h3>

          <p>We detected a new login to your account:</p>

          <div style="background:#f8fafc;padding:15px;border-radius:10px;">
            <p><b>Email:</b> ${email}</p>
            <p><b>IP:</b> ${ip || "Unknown"}</p>
            <p><b>Device:</b> ${device || "Unknown"}</p>
          </div>

          <p style="margin-top:20px;">
            If this was you, no action needed.
          </p>

          <p style="color:#ef4444;font-size:13px;">
            ⚠️ If not, please reset your password immediately.
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#f8fafc;padding:15px;text-align:center;font-size:12px;">
          © ${new Date().getFullYear()} PulseIQ Security Team
        </td>
      </tr>

    </table>
  </div>
  `;
};

// Welcome Email

export const getWelcomeTemplate = ({ name, email }) => {
  return `
  <div style="background:#f1f5f9;padding:40px;font-family:sans-serif;">
    <table width="100%" style="max-width:520px;margin:auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.08);">

      <tr>
        <td style="background:linear-gradient(135deg,#10b981,#06b6d4);padding:25px;text-align:center;color:#fff;">
          <h2 style="margin:0;">Welcome to PulseIQ 🚀</h2>
        </td>
      </tr>

      <tr>
        <td style="padding:30px;">
          <h3>Hey ${name || "User"} 👋</h3>

          <p>🎉 Your account has been successfully created!</p>

          <div style="background:#f8fafc;padding:12px;border-radius:8px;">
            <b>${email}</b>
          </div>

          <p style="margin-top:20px;">
            You can now explore all features of PulseIQ:
          </p>

          <ul style="font-size:14px;color:#475569;">
            <li>📊 Analytics Dashboard</li>
            <li>🔐 Secure Authentication</li>
            <li>⚡ Real-time Insights</li>
          </ul>

          <p style="margin-top:20px;">
            Let's get started 🚀
          </p>
        </td>
      </tr>

      <tr>
        <td style="background:#f8fafc;padding:15px;text-align:center;font-size:12px;">
          © ${new Date().getFullYear()} PulseIQ Team
        </td>
      </tr>

    </table>
  </div>
  `;
};