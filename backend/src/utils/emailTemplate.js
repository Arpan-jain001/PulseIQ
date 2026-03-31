// backend/src/utils/emailTemplates.js — REPLACE existing file

const YEAR = new Date().getFullYear();
const BRAND_COLOR = "#10d990";
const SUPPORT_EMAIL = "arpanjain00123@gmail.com";

// ── Shared layout wrapper ─────────────────────────────
const layout = (headerBg, headerContent, bodyContent) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:540px;background:#060d18;border-radius:20px;overflow:hidden;border:1px solid #1a2a4a;box-shadow:0 24px 80px rgba(0,0,0,0.6);">

        <!-- RAINBOW TOP BAR -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#10d990,#00e5ff,#a855f7,#f43f8e);"></td></tr>

        <!-- HEADER -->
        <tr>
          <td style="background:${headerBg};padding:32px 30px;text-align:center;">
            <!-- Logo -->
            <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:16px;">
              <div style="width:40px;height:40px;background:linear-gradient(135deg,#10d990,#00e5ff);border-radius:10px;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:20px;font-weight:900;color:#020408;">⚡</span>
              </div>
              <span style="font-size:22px;font-weight:900;color:#e8f4ff;letter-spacing:0.1em;text-transform:uppercase;">PulseIQ</span>
            </div>
            ${headerContent}
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:32px 30px;">
            ${bodyContent}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#04080f;padding:20px 30px;border-top:1px solid #1a2a4a;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;color:#3d6080;">© ${YEAR} PulseIQ Analytics. All rights reserved.</p>
            <p style="margin:0;font-size:11px;color:#3d6080;">
              Need help? <a href="mailto:${SUPPORT_EMAIL}" style="color:#10d990;text-decoration:none;">${SUPPORT_EMAIL}</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ── Info box ──────────────────────────────────────────
const infoBox = (content, color = "#1a2a4a") =>
  `<div style="background:#04080f;border:1px solid ${color};border-radius:12px;padding:16px 20px;margin:16px 0;font-size:13px;color:#8ab4d4;">${content}</div>`;

// ── Badge ─────────────────────────────────────────────
const badge = (text, color) =>
  `<span style="display:inline-block;padding:4px 14px;background:${color}20;border:1px solid ${color}40;border-radius:999px;font-size:11px;font-weight:700;color:${color};letter-spacing:0.1em;text-transform:uppercase;">${text}</span>`;

// ── CTA Button ────────────────────────────────────────
const btn = (text, href, color = "#10d990") =>
  `<div style="text-align:center;margin:28px 0;">
    <a href="${href}" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,${color},${color}cc);color:#020408;font-weight:900;border-radius:999px;text-decoration:none;font-size:14px;letter-spacing:0.05em;box-shadow:0 8px 24px ${color}44;">${text} →</a>
  </div>`;

// ── Row item ──────────────────────────────────────────
const row = (label, value, valueColor = "#e8f4ff") =>
  `<tr>
    <td style="padding:8px 0;font-size:12px;color:#3d6080;font-weight:600;white-space:nowrap;padding-right:16px;">${label}</td>
    <td style="padding:8px 0;font-size:12px;color:${valueColor};font-weight:700;">${value}</td>
  </tr>`;


// ══════════════════════════════════════════════════════
// 1. EMAIL VERIFICATION
// ══════════════════════════════════════════════════════
export const getVerificationTemplate = ({ name, email, otp, link }) => layout(
  "linear-gradient(135deg,#0a1628 0%,#0d1f3c 100%)",
  `<p style="margin:0;font-size:12px;color:#10d990;text-transform:uppercase;letter-spacing:0.3em;">Email Verification</p>
   <h1 style="margin:8px 0 0;font-size:24px;font-weight:900;color:#e8f4ff;">Verify Your Account</h1>`,
  `<h2 style="margin:0 0 12px;color:#e8f4ff;font-size:18px;font-weight:700;">Hey ${name || "there"} 👋</h2>
   <p style="color:#8ab4d4;font-size:14px;line-height:1.7;margin-bottom:20px;">
     Welcome to <strong style="color:#10d990;">PulseIQ</strong> — your analytics platform. 
     Please verify your email address to activate your account.
   </p>
   ${infoBox(`<strong style="color:#3d6080;">Email:</strong> <span style="color:#e8f4ff;">${email}</span>`)}
   ${btn("Verify Email Address", link, "#10d990")}
   <div style="text-align:center;margin:20px 0;">
     <p style="font-size:12px;color:#3d6080;margin-bottom:12px;">OR enter this OTP manually</p>
     <div style="display:inline-block;padding:18px 32px;background:#04080f;border:2px dashed #10d99040;border-radius:16px;font-size:32px;font-weight:900;letter-spacing:12px;color:#10d990;">${otp}</div>
     <p style="font-size:11px;color:#3d6080;margin-top:10px;">⏱ Valid for <strong>10 minutes</strong></p>
   </div>
   <p style="text-align:center;font-size:12px;color:#f43f8e;">⚠️ Never share this code with anyone — PulseIQ will never ask for it.</p>`
);


// ══════════════════════════════════════════════════════
// 2. FORGOT PASSWORD
// ══════════════════════════════════════════════════════
export const getForgotPasswordTemplate = ({ name, email, link, otp }) => layout(
  "linear-gradient(135deg,#1a0a0a 0%,#2d0f0f 100%)",
  `<p style="margin:0;font-size:12px;color:#f43f8e;text-transform:uppercase;letter-spacing:0.3em;">Password Reset</p>
   <h1 style="margin:8px 0 0;font-size:24px;font-weight:900;color:#e8f4ff;">Reset Your Password</h1>`,

  `<h2 style="margin:0 0 12px;color:#e8f4ff;font-size:18px;font-weight:700;">Hey ${name || "there"} 👋</h2>

   <p style="color:#8ab4d4;font-size:14px;line-height:1.7;margin-bottom:20px;">
     You can reset your password using the button below OR by entering the OTP.
   </p>

   ${btn("Reset via Link", link, "#f43f8e")}

   <div style="text-align:center;margin:25px 0;">
     <p style="font-size:12px;color:#3d6080;margin-bottom:10px;">OR use this OTP</p>

     <div style="display:inline-block;padding:18px 32px;background:#04080f;border:2px dashed #f43f8e40;border-radius:16px;font-size:32px;font-weight:900;letter-spacing:12px;color:#f43f8e;">
       ${otp}
     </div>

     <p style="font-size:11px;color:#3d6080;margin-top:10px;">⏱ Valid for 10 minutes</p>
   </div>

   <p style="text-align:center;font-size:12px;color:#f43f8e;">
     ⚠️ Never share this code
   </p>`
);


// ══════════════════════════════════════════════════════
// 3. LOGIN ALERT
// ══════════════════════════════════════════════════════
export const getLoginAlertTemplate = ({
  name,
  email,
  ip,
  device,
  location,
  blockLink,
}) =>
  layout(
    "linear-gradient(135deg,#0a1020 0%,#0d1830 100%)",

    // 🔹 HEADER
    `<p style="margin:0;font-size:12px;color:#00e5ff;text-transform:uppercase;letter-spacing:0.3em;">
      Security Alert
    </p>
     <h1 style="margin:8px 0 0;font-size:26px;font-weight:900;color:#e8f4ff;">
      New Login Detected 🔐
    </h1>`,

    // 🔹 BODY
    `<h2 style="margin:0 0 12px;color:#e8f4ff;font-size:18px;font-weight:700;">
      Hey ${name || "there"} 👋
    </h2>

    <p style="color:#8ab4d4;font-size:14px;line-height:1.7;margin-bottom:20px;">
      We noticed a new login to your <b>PulseIQ</b> account.  
      If this was you, you can safely ignore this message.
    </p>

    ${infoBox(
      `<table style="width:100%;border-collapse:collapse;font-size:13px;">
        ${row("👤 Account", email)}
        ${row("🌐 IP Address", ip || "Unknown")}
        ${row("💻 Device", device || "Unknown")}
        ${location ? row("📍 Location", location) : ""}
        ${row("⏰ Time", new Date().toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }))}
      </table>`,
      "#00e5ff40"
    )}

    <!-- 🔥 BUTTONS -->
    <div style="margin-top:20px;text-align:center;">
      
      

      <a href="${blockLink}" 
         style="display:inline-block;padding:12px 20px;margin:6px;border-radius:10px;
                background:linear-gradient(135deg,#ef4444,#dc2626);
                color:white;font-weight:700;text-decoration:none;font-size:13px;">
        ❌ This wasn't me
      </a>

    </div>

    <p style="text-align:center;font-size:13px;color:#8ab4d4;margin-top:12px;">
      If you don't recognize this activity, please take action immediately.
    </p>

    <p style="text-align:center;font-size:11px;color:#3d6080;margin-top:12px;">
      PulseIQ Security System • Keeping your account safe 🔐
    </p>`
  );

// ══════════════════════════════════════════════════════
// 4. WELCOME EMAIL
// ══════════════════════════════════════════════════════
export const getWelcomeTemplate = ({ name, email }) => layout(
  "linear-gradient(135deg,#061a0f 0%,#0a2015 100%)",
  `<p style="margin:0;font-size:12px;color:#10d990;text-transform:uppercase;letter-spacing:0.3em;">Welcome Aboard</p>
   <h1 style="margin:8px 0 0;font-size:24px;font-weight:900;color:#e8f4ff;">You're In! 🎉</h1>`,
  `<h2 style="margin:0 0 12px;color:#e8f4ff;font-size:18px;font-weight:700;">Welcome to PulseIQ, ${name || "there"}! 🚀</h2>
   <p style="color:#8ab4d4;font-size:14px;line-height:1.7;margin-bottom:20px;">
     Your account has been successfully created. You now have access to powerful analytics tools to track and grow your product.
   </p>
   ${infoBox(`<strong style="color:#3d6080;">Account:</strong> <span style="color:#e8f4ff;">${email}</span>`, "#10d99040")}
   <div style="margin:20px 0;">
     <p style="font-size:13px;color:#8ab4d4;margin-bottom:12px;font-weight:600;">What you can do with PulseIQ:</p>
     ${["📊 Track real-time events & user behavior", "🔐 Secure API key per project", "⚡ DAU, funnels, top events & more", "👥 Invite team members to workspaces"].map(f =>
       `<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:#04080f;border-radius:10px;margin-bottom:8px;font-size:13px;color:#8ab4d4;">${f}</div>`
     ).join("")}
   </div>
   <p style="text-align:center;font-size:13px;color:#3d6080;">Get started by creating your first workspace and project.</p>`
);


// ══════════════════════════════════════════════════════
// 5. NEW ADMIN CREDENTIALS  ← NEW
// ══════════════════════════════════════════════════════
export const getNewAdminTemplate = ({ name, email, password, createdBy }) => layout(
  "linear-gradient(135deg,#1a0a1a 0%,#200a2a 100%)",
  `<p style="margin:0;font-size:12px;color:#f43f8e;text-transform:uppercase;letter-spacing:0.3em;">Admin Access Granted</p>
   <h1 style="margin:8px 0 0;font-size:24px;font-weight:900;color:#e8f4ff;">You're Now an Admin ⚡</h1>`,
  `<h2 style="margin:0 0 12px;color:#e8f4ff;font-size:18px;font-weight:700;">Hey ${name} 👋</h2>
   <p style="color:#8ab4d4;font-size:14px;line-height:1.7;margin-bottom:20px;">
     <strong style="color:#f43f8e;">${createdBy || "Super Admin"}</strong> has granted you 
     <strong style="color:#f43f8e;">Super Admin</strong> access on PulseIQ. 
     Use the credentials below to log in.
   </p>

   <!-- Credentials Card -->
   <div style="background:#04080f;border:1px solid #f43f8e30;border-radius:16px;padding:20px;margin:16px 0;">
     <p style="margin:0 0 14px;font-size:11px;color:#f43f8e;text-transform:uppercase;letter-spacing:0.2em;font-weight:700;">🔐 Your Login Credentials</p>
     <table style="width:100%;border-collapse:collapse;">
       ${row("Name",     name,     "#e8f4ff")}
       ${row("Email",    email,    "#00e5ff")}
       ${row("Password", `<code style="background:#0a0f1a;padding:3px 10px;border-radius:6px;font-size:13px;color:#10d990;letter-spacing:0.05em;">${password}</code>`, "#10d990")}
       ${row("Role",     badge("SUPER_ADMIN", "#f43f8e"), "#f43f8e")}
     </table>
   </div>

   <div style="background:#f43f8e08;border:1px solid #f43f8e30;border-radius:12px;padding:14px 18px;margin:16px 0;">
     <p style="margin:0;font-size:12px;color:#f43f8e;">
       ⚠️ <strong>Important:</strong> Change your password immediately after your first login for security.
     </p>
   </div>
   <p style="text-align:center;font-size:12px;color:#3d6080;">This email contains sensitive information — do not share it.</p>`
);


// ══════════════════════════════════════════════════════
// 6. ADMIN REMOVED  ← NEW
// ══════════════════════════════════════════════════════
export const getAdminRemovedTemplate = ({ name, email, removedBy, reason }) => layout(
  "linear-gradient(135deg,#1a1008 0%,#251508 100%)",
  `<p style="margin:0;font-size:12px;color:#f59e0b;text-transform:uppercase;letter-spacing:0.3em;">Admin Access Revoked</p>
   <h1 style="margin:8px 0 0;font-size:24px;font-weight:900;color:#e8f4ff;">Access Removed</h1>`,
  `<h2 style="margin:0 0 12px;color:#e8f4ff;font-size:18px;font-weight:700;">Hey ${name} 👋</h2>
   <p style="color:#8ab4d4;font-size:14px;line-height:1.7;margin-bottom:20px;">
     Your <strong style="color:#f43f8e;">Super Admin</strong> privileges on PulseIQ have been revoked by 
     <strong style="color:#f59e0b;">${removedBy || "Super Admin"}</strong>.
     Your account still exists as a regular USER.
   </p>

   <div style="background:#04080f;border:1px solid #f59e0b30;border-radius:16px;padding:20px;margin:16px 0;">
     <p style="margin:0 0 14px;font-size:11px;color:#f59e0b;text-transform:uppercase;letter-spacing:0.2em;font-weight:700;">📋 Details</p>
     <table style="width:100%;border-collapse:collapse;">
       ${row("Name",       name,                         "#e8f4ff")}
       ${row("Email",      email,                        "#8ab4d4")}
       ${row("Removed By", removedBy || "Super Admin",  "#f59e0b")}
       ${row("New Role",   badge("USER", "#3d6080"),     "#3d6080")}
       ${row("Date",       new Date().toLocaleString(),  "#3d6080")}
     </table>
   </div>

   ${reason ? `
   <div style="background:#f59e0b08;border:1px solid #f59e0b30;border-radius:12px;padding:16px 20px;margin:16px 0;">
     <p style="margin:0 0 8px;font-size:11px;color:#f59e0b;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;">Reason</p>
     <p style="margin:0;font-size:13px;color:#8ab4d4;line-height:1.6;">${reason}</p>
   </div>` : ""}

   <p style="font-size:13px;color:#8ab4d4;line-height:1.7;margin-top:16px;">
     Your account remains active. You can still log in and use PulseIQ as a regular user. 
     If you believe this was a mistake, please contact your system administrator.
   </p>
   <p style="text-align:center;font-size:12px;color:#3d6080;margin-top:8px;">
     Questions? <a href="mailto:${SUPPORT_EMAIL}" style="color:#10d990;text-decoration:none;">Contact Support</a>
   </p>`
);


// ══════════════════════════════════════════════════════
// 7. WORKSPACE INVITE (existing — upgraded)
// ══════════════════════════════════════════════════════
export const getWorkspaceInviteTemplate = ({ userName, userEmail, inviterName, workspaceName, role, frontendUrl }) => layout(
  "linear-gradient(135deg,#061a0f 0%,#0a2015 100%)",
  `<p style="margin:0;font-size:12px;color:#10d990;text-transform:uppercase;letter-spacing:0.3em;">Workspace Invite</p>
   <h1 style="margin:8px 0 0;font-size:24px;font-weight:900;color:#e8f4ff;">You're Invited! 🎉</h1>`,
  `<h2 style="margin:0 0 12px;color:#e8f4ff;font-size:18px;font-weight:700;">Hey ${userName} 👋</h2>
   <p style="color:#8ab4d4;font-size:14px;line-height:1.7;margin-bottom:20px;">
     <strong style="color:#10d990;">${inviterName}</strong> has invited you to collaborate on a workspace.
   </p>
   <div style="background:#04080f;border:1px solid #10d99030;border-radius:16px;padding:20px;margin:16px 0;text-align:center;">
     <p style="margin:0 0 6px;font-size:11px;color:#3d6080;text-transform:uppercase;letter-spacing:0.2em;">Workspace</p>
     <p style="margin:0 0 12px;font-size:22px;font-weight:900;color:#e8f4ff;">${workspaceName}</p>
     ${badge(role || "MEMBER", "#a855f7")}
   </div>
   ${btn("Open Workspace", frontendUrl || "https://pulseiq.io/dashboard", "#10d990")}
   <p style="text-align:center;font-size:12px;color:#3d6080;">Log in to your PulseIQ account to access this workspace.</p>`
);