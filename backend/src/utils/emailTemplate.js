const YEAR = new Date().getFullYear();
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@pulseiq.ai";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const palette = {
  bg: "#07111d",
  panel: "#0d1726",
  panelSoft: "#111d2f",
  border: "#1c2a42",
  text: "#e8f1ff",
  muted: "#8ba3c7",
  soft: "#5f7aa0",
  green: "#10d990",
  cyan: "#00d6ff",
  pink: "#ff4d8d",
  amber: "#f7b84b",
  red: "#ef4444",
};

const layout = ({ accent = palette.green, eyebrow, title, subtitle, body }) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${palette.bg};font-family:Segoe UI,Arial,sans-serif;color:${palette.text};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 14px;background:${palette.bg};">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:${palette.panel};border:1px solid ${palette.border};border-radius:24px;overflow:hidden;box-shadow:0 20px 70px rgba(0,0,0,.45);">
            <tr>
              <td style="height:4px;background:linear-gradient(90deg,${accent},${palette.cyan},${palette.pink});"></td>
            </tr>
            <tr>
              <td style="padding:28px 28px 22px;background:radial-gradient(circle at top right, rgba(0,214,255,.10), transparent 32%), radial-gradient(circle at top left, rgba(16,217,144,.12), transparent 28%), ${palette.panel};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <div style="display:inline-block;padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${palette.text};">
                        PulseIQ
                      </div>
                      <p style="margin:18px 0 8px;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:${accent};font-weight:700;">
                        ${escapeHtml(eyebrow)}
                      </p>
                      <h1 style="margin:0 0 10px;font-size:30px;line-height:1.15;color:${palette.text};font-weight:800;">
                        ${escapeHtml(title)}
                      </h1>
                      <p style="margin:0;font-size:14px;line-height:1.7;color:${palette.muted};">
                        ${subtitle}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 24px;border-top:1px solid ${palette.border};background:${palette.panelSoft};">
                <p style="margin:0 0 6px;font-size:12px;color:${palette.soft};">
                  PulseIQ is an AI-based analytics SaaS platform for user behavior intelligence, funnel analysis, retention insights, and executive reporting.
                </p>
                <p style="margin:0;font-size:12px;color:${palette.soft};">
                  Need help? <a href="mailto:${SUPPORT_EMAIL}" style="color:${palette.cyan};text-decoration:none;">${SUPPORT_EMAIL}</a>
                </p>
                <p style="margin:10px 0 0;font-size:11px;color:${palette.soft};">
                  Copyright ${YEAR} PulseIQ. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const infoCard = (content, borderColor = palette.border, bg = "rgba(255,255,255,.02)") => `
  <div style="margin:18px 0;padding:18px 18px;border-radius:18px;border:1px solid ${borderColor};background:${bg};">
    ${content}
  </div>`;

const button = (label, href, accent = palette.green) => `
  <div style="margin:22px 0 18px;">
    <a href="${href}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:linear-gradient(135deg,${accent},${palette.cyan});color:#04101c;font-size:14px;font-weight:800;text-decoration:none;letter-spacing:.04em;">
      ${escapeHtml(label)}
    </a>
  </div>`;

const badge = (label, color) => `
  <span style="display:inline-block;padding:5px 12px;border-radius:999px;border:1px solid ${color};background:${color}1a;color:${color};font-size:11px;font-weight:700;letter-spacing:.10em;text-transform:uppercase;">
    ${escapeHtml(label)}
  </span>`;

const statRow = (label, value, valueColor = palette.text) => `
  <tr>
    <td style="padding:8px 0;font-size:12px;color:${palette.soft};font-weight:600;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:8px 0;font-size:12px;color:${valueColor};font-weight:700;text-align:right;">${value}</td>
  </tr>`;

const listItems = (items, tone = "neutral") => {
  const borderColor =
    tone === "success" ? "rgba(16,217,144,.18)" :
    tone === "danger" ? "rgba(255,77,141,.18)" :
    tone === "warning" ? "rgba(247,184,75,.18)" :
    palette.border;

  return items
    .map(
      (item) => `
        <div style="padding:11px 12px;border-radius:14px;border:1px solid ${borderColor};background:rgba(255,255,255,.02);margin-bottom:8px;font-size:13px;line-height:1.65;color:${palette.muted};">
          ${escapeHtml(item)}
        </div>`
    )
    .join("");
};

export const getVerificationTemplate = ({ name, email, otp, link }) =>
  layout({
    accent: palette.green,
    eyebrow: "Email Verification",
    title: "Confirm your PulseIQ account",
    subtitle: `Hello ${escapeHtml(name || "there")}, your analytics workspace is almost ready. Verify this email address to activate secure access for ${escapeHtml(email)}.`,
    body: `
      ${infoCard(`
        <p style="margin:0 0 10px;font-size:13px;color:${palette.muted};line-height:1.7;">
          PulseIQ helps organizations understand what users do, where they struggle, and which journey steps need improvement. Verification protects your workspace before data starts flowing.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${statRow("Account", escapeHtml(email))}
          ${statRow("OTP validity", "10 minutes", palette.green)}
        </table>
      `, "rgba(16,217,144,.22)")}
      ${button("Verify Email", link, palette.green)}
      ${infoCard(`
        <p style="margin:0 0 10px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${palette.green};font-weight:700;">One-time verification code</p>
        <div style="padding:16px 18px;border-radius:16px;border:1px dashed rgba(16,217,144,.35);background:rgba(16,217,144,.06);text-align:center;font-size:30px;font-weight:900;letter-spacing:.34em;color:${palette.text};">
          ${escapeHtml(otp)}
        </div>
      `)}
      <p style="margin:0;font-size:12px;line-height:1.7;color:${palette.soft};">
        For security, never share this code with anyone. PulseIQ will never ask for your password or verification code outside the product.
      </p>
    `,
  });

export const getForgotPasswordTemplate = ({ name, email, link, otp }) =>
  layout({
    accent: palette.pink,
    eyebrow: "Password Reset",
    title: "Reset your PulseIQ password",
    subtitle: `Hello ${escapeHtml(name || "there")}, we received a password reset request for ${escapeHtml(email)}. Use the secure link or the one-time code below.`,
    body: `
      ${infoCard(`
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${statRow("Account", escapeHtml(email))}
          ${statRow("Reset code validity", "10 minutes", palette.pink)}
        </table>
      `, "rgba(255,77,141,.22)")}
      ${button("Reset Password", link, palette.pink)}
      ${infoCard(`
        <p style="margin:0 0 10px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${palette.pink};font-weight:700;">One-time reset code</p>
        <div style="padding:16px 18px;border-radius:16px;border:1px dashed rgba(255,77,141,.35);background:rgba(255,77,141,.06);text-align:center;font-size:30px;font-weight:900;letter-spacing:.34em;color:${palette.text};">
          ${escapeHtml(otp)}
        </div>
      `)}
      <p style="margin:0;font-size:12px;line-height:1.7;color:${palette.soft};">
        If you did not request a password reset, you can safely ignore this email and your current password will remain unchanged.
      </p>
    `,
  });

export const getLoginAlertTemplate = ({ name, email, ip, device, location, blockLink }) =>
  layout({
    accent: palette.cyan,
    eyebrow: "Security Alert",
    title: "A new login was detected",
    subtitle: `Hello ${escapeHtml(name || "there")}, PulseIQ noticed a fresh sign-in on your account. Review the details below and secure the account immediately if this activity was not yours.`,
    body: `
      ${infoCard(`
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${statRow("Account", escapeHtml(email))}
          ${statRow("IP address", escapeHtml(ip || "Unknown"))}
          ${statRow("Device", escapeHtml(device || "Unknown"))}
          ${location ? statRow("Location", escapeHtml(location)) : ""}
          ${statRow("Detected at", escapeHtml(new Date().toLocaleString()))}
        </table>
      `, "rgba(0,214,255,.22)")}
      ${button("Secure This Account", blockLink, palette.cyan)}
      <p style="margin:0;font-size:12px;line-height:1.7;color:${palette.soft};">
        If this was your login, no action is required. If not, change your password immediately and review your recent activity.
      </p>
    `,
  });

export const getWelcomeTemplate = ({ name, email }) =>
  layout({
    accent: palette.green,
    eyebrow: "Welcome",
    title: "Your PulseIQ workspace starts here",
    subtitle: `Hello ${escapeHtml(name || "there")}, your account for ${escapeHtml(email || "")} is ready. You can now start building a complete user behavior intelligence workflow.`,
    body: `
      ${infoCard(`
        <p style="margin:0 0 12px;font-size:13px;color:${palette.muted};line-height:1.7;">
          PulseIQ is built for modern analytics teams that need real-time tracking, funnel analysis, retention intelligence, AI-generated recommendations, and dashboard-driven decision making.
        </p>
        ${listItems([
          "Create secure workspaces and projects for each company or product.",
          "Generate tracking keys and connect your website or application in minutes.",
          "Track user journeys such as page views, clicks, form submissions, exam attempts, and payments.",
          "Use AI insights and chat to detect drop-offs, low-conversion journeys, and growth opportunities."
        ], "success")}
      `, "rgba(16,217,144,.22)")}
      <p style="margin:0;font-size:12px;line-height:1.7;color:${palette.soft};">
        Recommended first step: create your first workspace, generate a project key, and connect the PulseIQ tracking script to your site.
      </p>
    `,
  });

export const getNewAdminTemplate = ({ name, email, password, createdBy }) =>
  layout({
    accent: palette.pink,
    eyebrow: "Admin Access",
    title: "You have been added as a PulseIQ administrator",
    subtitle: `${escapeHtml(createdBy || "A super admin")} granted elevated access to your PulseIQ account. Use the credentials below to sign in.`,
    body: `
      ${infoCard(`
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${statRow("Name", escapeHtml(name))}
          ${statRow("Email", escapeHtml(email), palette.cyan)}
          ${statRow("Temporary password", `<span style="font-family:Consolas,monospace;color:${palette.green};">${escapeHtml(password)}</span>`, palette.green)}
          ${statRow("Role", badge("Super Admin", palette.pink), palette.pink)}
        </table>
      `, "rgba(255,77,141,.22)")}
      <p style="margin:0;font-size:12px;line-height:1.7;color:${palette.soft};">
        This email contains sensitive credentials. Sign in as soon as possible and replace the temporary password with a personal one.
      </p>
    `,
  });

export const getAdminRemovedTemplate = ({ name, email, removedBy, reason }) =>
  layout({
    accent: palette.amber,
    eyebrow: "Access Updated",
    title: "Your PulseIQ admin role was removed",
    subtitle: `Hello ${escapeHtml(name || "there")}, your account is still active but elevated administration privileges are no longer assigned.`,
    body: `
      ${infoCard(`
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${statRow("Name", escapeHtml(name))}
          ${statRow("Email", escapeHtml(email))}
          ${statRow("Changed by", escapeHtml(removedBy || "PulseIQ administrator"), palette.amber)}
          ${statRow("Current role", badge("User", palette.soft), palette.soft)}
          ${statRow("Updated at", escapeHtml(new Date().toLocaleString()))}
        </table>
      `, "rgba(247,184,75,.22)")}
      ${
        reason
          ? infoCard(`
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${palette.amber};font-weight:700;">Reason provided</p>
              <p style="margin:0;font-size:13px;line-height:1.7;color:${palette.muted};">${escapeHtml(reason)}</p>
            `, "rgba(247,184,75,.22)")
          : ""
      }
      <p style="margin:0;font-size:12px;line-height:1.7;color:${palette.soft};">
        You can still sign in and use PulseIQ features available to standard users. Contact support if you believe this change was made in error.
      </p>
    `,
  });

export const getWorkspaceInviteTemplate = ({
  userName,
  inviterName,
  workspaceName,
  role,
  acceptUrl,
  signupUrl,
}) =>
  layout({
    accent: palette.green,
    eyebrow: "Workspace Invitation",
    title: "You were invited to collaborate",
    subtitle: `${escapeHtml(inviterName || "A teammate")} invited ${escapeHtml(userName || "you")} to join ${escapeHtml(workspaceName)} on PulseIQ. Accept the invitation to access shared analytics, projects, and team workflows.`,
    body: `
      ${infoCard(`
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${statRow("Workspace", escapeHtml(workspaceName))}
          ${statRow("Assigned role", badge(role || "Member", palette.cyan), palette.cyan)}
          ${statRow("Invited by", escapeHtml(inviterName || "PulseIQ team"))}
        </table>
      `, "rgba(16,217,144,.22)", "rgba(16,217,144,.05)")}
      ${infoCard(`
        <p style="margin:0 0 10px;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:${palette.green};font-weight:700;">Accept invitation</p>
        <p style="margin:0;font-size:13px;line-height:1.75;color:${palette.muted};">
          This invitation works like a collaboration request. Sign in with the invited email address and PulseIQ will attach this workspace to your account automatically.
        </p>
      `)}
      ${button("Accept Invitation", acceptUrl, palette.green)}
      ${signupUrl ? `
        <div style="margin-top:12px;">
          <a href="${signupUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;border:1px solid ${palette.border};background:rgba(255,255,255,.02);color:${palette.text};font-size:13px;font-weight:700;text-decoration:none;">
            Create Account to Accept
          </a>
        </div>
      ` : ""}
      <p style="margin:0;font-size:12px;line-height:1.7;color:${palette.soft};">
        If you were not expecting this invitation, you can ignore this email. No access will be granted until the invitation is accepted.
      </p>
    `,
  });

export const getProjectCreatedTemplate = ({
  ownerName,
  projectName,
  workspaceName,
  allowedDomains = [],
  categoryLabel,
  createdBy,
  projectUrl,
}) =>
  layout({
    accent: palette.green,
    eyebrow: "Project Created",
    title: `${projectName} is ready for tracking`,
    subtitle: `Hello ${escapeHtml(ownerName || "there")}, a new PulseIQ project was created in ${escapeHtml(workspaceName || "your workspace")}. You can now connect the SDK and start sending real events.`,
    body: `
      ${infoCard(`
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${statRow("Project", escapeHtml(projectName))}
          ${statRow("Workspace", escapeHtml(workspaceName || "—"))}
          ${statRow("Category", escapeHtml(categoryLabel || "General Web App"), palette.cyan)}
          ${statRow("Created by", escapeHtml(createdBy || "PulseIQ user"), palette.green)}
          ${statRow("Created at", escapeHtml(new Date().toLocaleString()))}
        </table>
      `, "rgba(16,217,144,.22)")}
      ${
        allowedDomains.length
          ? infoCard(`
              <p style="margin:0 0 10px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${palette.green};font-weight:700;">Allowed domains</p>
              ${listItems(allowedDomains.map((domain) => `Tracking allowed for ${domain}`), "success")}
            `)
          : ""
      }
      ${button("Open Projects Dashboard", projectUrl, palette.green)}
      <p style="margin:0;font-size:12px;line-height:1.7;color:${palette.soft};">
        Next step: open the SDK setup guide, paste the snippet or install the package SDK, then verify the first live event.
      </p>
    `,
  });

export const getProjectDeletedTemplate = ({
  ownerName,
  projectName,
  workspaceName,
  deletedBy,
  deletedAt,
  totalEvents,
  lastEventAt,
}) =>
  layout({
    accent: palette.red,
    eyebrow: "Project Deleted",
    title: `${projectName} was permanently deleted`,
    subtitle: `Hello ${escapeHtml(ownerName || "there")}, a PulseIQ project was removed from ${escapeHtml(workspaceName || "your workspace")}. This action also removed the project analytics data stored for that project.`,
    body: `
      ${infoCard(`
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${statRow("Project", escapeHtml(projectName))}
          ${statRow("Workspace", escapeHtml(workspaceName || "—"))}
          ${statRow("Deleted by", escapeHtml(deletedBy || "PulseIQ user"), palette.red)}
          ${statRow("Deleted at", escapeHtml(new Date(deletedAt || Date.now()).toLocaleString()))}
          ${statRow("Deleted events", escapeHtml(totalEvents || 0), palette.amber)}
          ${statRow("Last event received", escapeHtml(lastEventAt ? new Date(lastEventAt).toLocaleString() : "No event captured"), palette.soft)}
        </table>
      `, "rgba(239,68,68,.22)", "rgba(239,68,68,.06)")}
      <p style="margin:0;font-size:12px;line-height:1.7;color:${palette.soft};">
        This deletion is permanent. If you still need tracking for this product, create a new project and reconnect the SDK with a fresh API key.
      </p>
    `,
  });

export const getWeeklyPerformanceTemplate = ({
  ownerName,
  projectName,
  workspaceName,
  score,
  label,
  summary,
  metrics,
  recommendations = [],
}) =>
  layout({
    accent: palette.cyan,
    eyebrow: "Weekly Performance Report",
    title: `${projectName} is now rated ${label}`,
    subtitle: `Hello ${escapeHtml(ownerName || "there")}, your weekly PulseIQ intelligence report for ${escapeHtml(projectName)} in ${escapeHtml(workspaceName || "your workspace")} is ready.`,
    body: `
      ${infoCard(`
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${statRow("Health score", `<span style="font-size:22px;color:${palette.green};font-weight:900;">${escapeHtml(score)}/100</span>`)}
          ${statRow("Status", badge(label, score >= 70 ? palette.green : score >= 40 ? palette.amber : palette.pink), score >= 70 ? palette.green : score >= 40 ? palette.amber : palette.pink)}
          ${statRow("Events in last 7 days", escapeHtml(metrics?.totalEvents ?? 0))}
          ${statRow("Unique users", escapeHtml(metrics?.uniqueUsers ?? 0))}
          ${statRow("Bounce rate", `${escapeHtml(metrics?.bounceRate ?? 0)}%`, palette.amber)}
          ${statRow("DAU today", escapeHtml(metrics?.dauToday ?? 0), palette.cyan)}
          ${statRow("Latest event", escapeHtml(metrics?.lastEventName || "No recent event"), palette.soft)}
        </table>
      `, "rgba(0,214,255,.22)")}
      ${infoCard(`
        <p style="margin:0 0 8px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${palette.cyan};font-weight:700;">Executive summary</p>
        <p style="margin:0;font-size:13px;line-height:1.75;color:${palette.muted};">${escapeHtml(summary)}</p>
      `)}
      ${recommendations.length ? infoCard(`
        <p style="margin:0 0 10px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${palette.green};font-weight:700;">Recommended next moves</p>
        ${listItems(recommendations, "success")}
      `) : ""}
    `,
  });

export const getLowHealthAlertTemplate = ({
  ownerName,
  projectName,
  workspaceName,
  score,
  label,
  summary,
  recommendations = [],
}) =>
  layout({
    accent: palette.pink,
    eyebrow: "Health Alert",
    title: `${projectName} needs immediate attention`,
    subtitle: `Hello ${escapeHtml(ownerName || "there")}, PulseIQ detected a low performance score for ${escapeHtml(projectName)} in ${escapeHtml(workspaceName || "your workspace")}.`,
    body: `
      ${infoCard(`
        <div style="font-size:32px;font-weight:900;color:${palette.pink};margin-bottom:8px;">${escapeHtml(score)}/100</div>
        <div style="margin-bottom:12px;">${badge(label, palette.pink)}</div>
        <p style="margin:0;font-size:13px;line-height:1.75;color:${palette.muted};">${escapeHtml(summary)}</p>
      `, "rgba(255,77,141,.22)", "rgba(255,77,141,.06)")}
      ${recommendations.length ? infoCard(`
        <p style="margin:0 0 10px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${palette.pink};font-weight:700;">Priority actions</p>
        ${listItems(recommendations, "danger")}
      `, "rgba(255,77,141,.22)") : ""}
      <p style="margin:0;font-size:12px;line-height:1.7;color:${palette.soft};">
        Recommended next step: review the affected flow in PulseIQ, inspect top pages and event trends, and act on the highest-impact recommendation first.
      </p>
    `,
  });

export const getVerificationGraceAlertTemplate = ({
  ownerName,
  projectName,
  workspaceName,
  graceDaysLeft,
  summary,
}) =>
  layout({
    accent: palette.amber,
    eyebrow: "Verification Reminder",
    title: `${graceDaysLeft} day(s) left to verify the SDK`,
    subtitle: `Hello ${escapeHtml(ownerName || "there")}, ${escapeHtml(projectName)} in ${escapeHtml(workspaceName || "your workspace")} is still inside the SDK verification grace period.`,
    body: `
      ${infoCard(`
        <div style="font-size:28px;font-weight:900;color:${palette.amber};margin-bottom:8px;">${escapeHtml(graceDaysLeft)} day(s) remaining</div>
        <p style="margin:0;font-size:13px;line-height:1.75;color:${palette.muted};">${escapeHtml(summary)}</p>
      `, "rgba(247,184,75,.22)", "rgba(247,184,75,.06)")}
      ${infoCard(`
        <p style="margin:0 0 10px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${palette.amber};font-weight:700;">Why this matters</p>
        ${listItems([
          "Verified data keeps dashboards, funnels, retention reports, and AI recommendations trustworthy.",
          "Completing SDK verification before the grace period ends prevents blind spots in your analytics workflow.",
          "PulseIQ can generate stronger weekly reports and health alerts once live events are consistently flowing."
        ], "warning")}
      `)}
    `,
  });
