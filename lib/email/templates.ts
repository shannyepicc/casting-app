const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const base = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f2ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1a1a1a;padding:24px 32px;">
              <span style="font-size:1.2rem;font-weight:700;color:#fff;letter-spacing:-0.5px;">Slate</span>
              <span style="font-size:0.75rem;color:rgba(255,255,255,0.5);margin-left:8px;text-transform:uppercase;letter-spacing:1px;">Platform</span>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f0ece6;">
              <p style="margin:0;font-size:0.78rem;color:#a09890;">
                You received this email because of activity on your Slate account.
                <a href="${APP_URL}" style="color:#b65a31;text-decoration:none;">Visit Slate</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#fff;border-radius:100px;font-size:0.9rem;font-weight:600;text-decoration:none;margin-top:20px;">${label}</a>`;

// ─── Email 1: Actor confirmation ──────────────────────────────────────────────

export function actorApplicationConfirmation({
  actorName,
  roleTitle,
  projectName,
  roleId,
}: {
  actorName: string;
  roleTitle: string;
  projectName: string | null;
  roleId: string;
}) {
  const subject = `You applied to "${roleTitle}"`;
  const html = base(`
    <h2 style="margin:0 0 8px;font-size:1.4rem;color:#1a1a1a;">Application submitted</h2>
    <p style="margin:0 0 20px;color:#666;font-size:0.95rem;line-height:1.6;">
      Hey ${actorName}, your application for <strong>${roleTitle}</strong>${projectName ? ` on <em>${projectName}</em>` : ""} has been received. The casting director will review it and reach out if there's a match.
    </p>
    <table width="100%" cellpadding="16" cellspacing="0" style="background:#f5f2ee;border-radius:12px;margin-bottom:8px;">
      <tr>
        <td>
          <p style="margin:0;font-size:0.82rem;color:#a09890;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Role</p>
          <p style="margin:4px 0 0;font-size:1rem;color:#1a1a1a;font-weight:600;">${roleTitle}</p>
          ${projectName ? `<p style="margin:2px 0 0;font-size:0.88rem;color:#666;">${projectName}</p>` : ""}
        </td>
      </tr>
    </table>
    ${btn(`${APP_URL}/roles/${roleId}`, "View role →")}
  `);
  return { subject, html };
}

// ─── Email 2: Creator new-applicant notification ──────────────────────────────

export function creatorNewApplicant({
  creatorName,
  actorName,
  actorUsername,
  roleTitle,
  roleId,
}: {
  creatorName: string;
  actorName: string;
  actorUsername: string | null;
  roleTitle: string;
  roleId: string;
}) {
  const actorProfileUrl = actorUsername ? `${APP_URL}/actors/${actorUsername}` : null;
  const subject = `New applicant for "${roleTitle}"`;
  const html = base(`
    <h2 style="margin:0 0 8px;font-size:1.4rem;color:#1a1a1a;">New application</h2>
    <p style="margin:0 0 20px;color:#666;font-size:0.95rem;line-height:1.6;">
      Hey ${creatorName}, <strong>${actorName}</strong> just applied to your role <strong>${roleTitle}</strong>.
    </p>
    <table width="100%" cellpadding="16" cellspacing="0" style="background:#f5f2ee;border-radius:12px;margin-bottom:8px;">
      <tr>
        <td>
          <p style="margin:0;font-size:0.82rem;color:#a09890;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Applicant</p>
          <p style="margin:4px 0 0;font-size:1rem;color:#1a1a1a;font-weight:600;">${actorName}</p>
          ${actorProfileUrl ? `<a href="${actorProfileUrl}" style="font-size:0.88rem;color:#b65a31;text-decoration:none;">View profile →</a>` : ""}
        </td>
      </tr>
    </table>
    ${btn(`${APP_URL}/roles/${roleId}/applicants`, "Review all applicants →")}
  `);
  return { subject, html };
}
