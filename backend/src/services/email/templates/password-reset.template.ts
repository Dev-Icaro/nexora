interface PasswordResetEmailOptions {
  userName: string;
  resetLink: string;
  expiresIn: string;
  year: string;
  baseUrl: string;
}

export function buildPasswordResetEmailHtml({
  userName,
  resetLink,
  expiresIn,
  year,
  baseUrl,
}: PasswordResetEmailOptions): string {
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Nexora — Reset Password Email</title>
</head>
<body>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1c1917; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;">
  <tbody><tr>
    <td align="center" style="padding: 0;">

      <!-- ═══ WRAPPER ═══ -->
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:100%;">

        <!-- ── TOP SPACER ── -->
        <tbody><tr><td height="40" style="font-size:0; line-height:0;">&nbsp;</td></tr>

        <!-- ════════════════════════
             HEADER — Logo + brand
        ════════════════════════ -->
        <tr>
          <td style="padding: 0 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tbody><tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tbody><tr>
                      <td valign="middle" style="padding-right: 10px;">
                        <img src="${baseUrl}/logo.png" alt="Nexora" width="36" height="36" style="display:block;">
                      </td>
                      <td valign="middle">
                        <span style="font-size: 18px; font-weight: 700; color: #f5f5f5; letter-spacing: -0.3px;">Nexora</span>
                      </td>
                    </tr>
                  </tbody></table>
                </td>
              </tr>
            </tbody></table>
          </td>
        </tr>

        <!-- ── SPACER ── -->
        <tr><td height="32" style="font-size:0; line-height:0;">&nbsp;</td></tr>

        <!-- ════════════════════════
             CARD — Main content
        ════════════════════════ -->
        <tr>
          <td style="padding: 0 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#242420; border-radius:16px; border:1px solid rgba(255,255,255,0.07);">

              <!-- Top accent bar -->
              <tbody><tr>
                <td height="4" style="background: linear-gradient(90deg, #e06820 0%, #e8954a 60%, #d4782a 100%);
                  border-radius: 16px 16px 0 0; font-size:0; line-height:0;">&nbsp;</td>
              </tr>

              <!-- Card body -->
              <tr>
                <td style="padding: 36px 40px 40px;">

                  <!-- Lock icon circle -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                    <tbody><tr>
                      <td style="width:52px; height:52px; background-color:rgba(232,149,74,0.12);
                        border-radius:9999px; text-align:center; vertical-align:middle;">
                        <img src="${escapeHtml(baseUrl)}/lock-icon.png" alt="" width="24" height="24" style="display:block; margin: 14px auto 0;">
                      </td>
                    </tr>
                  </tbody></table>

                  <!-- Heading -->
                  <h1 style="font-size:24px; font-weight:700; color:#f5f5f5;
                    margin:0 0 8px; line-height:1.2; letter-spacing:-0.4px;">
                    Reset your password
                  </h1>

                  <!-- Subheading -->
                  <p style="font-size:14px; color:#888; margin:0 0 28px; line-height:1.6;">
                    Hi <strong style="color:#d4d4d0; font-weight:500;">${escapeHtml(userName)}</strong>,
                    we received a request to reset the password for your Nexora account.
                  </p>

                  <!-- Body text -->
                  <p style="font-size:14px; color:#a0a09a; margin:0 0 28px; line-height:1.7;">
                    Click the button below to choose a new password. This link is valid for
                    <strong style="color:#d4d4d0; font-weight:500;">${escapeHtml(expiresIn)}</strong>
                    and can only be used once.
                  </p>

                  <!-- CTA BUTTON -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                    <tbody><tr>
                      <td style="border-radius:10px; background-color:#d4782a;">
                        <a href="${escapeHtml(resetLink)}" style="display:inline-block; padding:12px 28px;
                            font-size:14px; font-weight:600; color:#fff;
                            text-decoration:none; border-radius:10px;
                            letter-spacing:0.1px; line-height:1;">
                          Reset password
                        </a>
                      </td>
                    </tr>
                  </tbody></table>

                  <!-- Divider -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                    <tbody><tr>
                      <td height="1" style="background-color:rgba(255,255,255,0.07); font-size:0; line-height:0;">&nbsp;</td>
                    </tr>
                  </tbody></table>

                  <!-- Link fallback -->
                  <p style="font-size:12px; color:#666; margin:0 0 8px; line-height:1.5;">
                    If the button doesn't work, copy and paste this link into your browser:
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                    <tbody><tr>
                      <td style="background-color:rgba(255,255,255,0.04);
                        border:1px solid rgba(255,255,255,0.08);
                        border-radius:8px; padding:10px 14px;">
                        <a href="${escapeHtml(resetLink)}" style="font-size:12px; color:#e8954a; text-decoration:none;
                            font-family: 'Courier New', 'Lucida Console', monospace;
                            word-break:break-all; line-height:1.5;">
                          ${escapeHtml(resetLink)}
                        </a>
                      </td>
                    </tr>
                  </tbody></table>

                  <!-- Divider -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                    <tbody><tr>
                      <td height="1" style="background-color:rgba(255,255,255,0.07); font-size:0; line-height:0;">&nbsp;</td>
                    </tr>
                  </tbody></table>

                  <!-- Security notice -->
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tbody><tr>
                      <td width="20" valign="top" style="padding-top:1px; padding-right:10px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </td>
                      <td>
                        <p style="font-size:12px; color:#555; margin:0; line-height:1.6;">
                          If you didn't request a password reset, you can safely ignore this email —
                          your password won't change and no action is needed.
                        </p>
                      </td>
                    </tr>
                  </tbody></table>

                </td>
              </tr>
            </tbody></table>
          </td>
        </tr>

        <!-- ── SPACER ── -->
        <tr><td height="32" style="font-size:0; line-height:0;">&nbsp;</td></tr>

        <!-- ════════════════════════
             FOOTER
        ════════════════════════ -->
        <tr>
          <td style="padding: 0 40px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">

              <!-- Footer divider -->
              <tbody><tr>
                <td height="1" style="background-color:rgba(255,255,255,0.06); font-size:0; line-height:0;">&nbsp;</td>
              </tr>

              <tr><td height="20" style="font-size:0; line-height:0;">&nbsp;</td></tr>

              <!-- Footer links -->
              <tr>
                <td align="center" style="padding-bottom:12px;">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tbody><tr>
                      <td style="padding:0 10px;">
                        <a href="#" style="font-size:12px; color:#555; text-decoration:none;">Help center</a>
                      </td>
                      <td style="color:#333; font-size:12px;">·</td>
                      <td style="padding:0 10px;">
                        <a href="#" style="font-size:12px; color:#555; text-decoration:none;">Privacy policy</a>
                      </td>
                      <td style="color:#333; font-size:12px;">·</td>
                      <td style="padding:0 10px;">
                        <a href="#" style="font-size:12px; color:#555; text-decoration:none;">Unsubscribe</a>
                      </td>
                    </tr>
                  </tbody></table>
                </td>
              </tr>

              <!-- Copyright -->
              <tr>
                <td align="center">
                  <p style="font-size:11px; color:#444; margin:0; line-height:1.6;">
                    © ${escapeHtml(year)} Nexora. All rights reserved.<br>
                    <span style="color:#3a3a3a;">This is an automated message — please don't reply to this email.</span>
                  </p>
                </td>
              </tr>

            </tbody></table>
          </td>
        </tr>

      </tbody></table>
      <!-- ═══ END WRAPPER ═══ -->

    </td>
  </tr>
</tbody></table>
</body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
