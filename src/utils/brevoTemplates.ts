/**
 * Oddspira Dark-Terminal HTML Email Templates for Brevo (Sendinblue)
 * Palette: Slate Background (#0b0f19), Card Surface (#0f172a), Emerald Accent (#10b981 / #43f08a)
 */

export interface DigestMatchItem {
  fixture: string;
  competition: string;
  selection: string;
  marketOdds: number;
  fairOdds: number;
  edgePercent: number;
  kellyStakePct: number;
}

export function buildWelcomeEmailHtml(userName: string, appUrl: string = 'https://oddspira.com'): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Oddspira Quant Terminal</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0f19;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f19;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;background-color:#080c14;border-bottom:1px solid #1e293b;">
              <span style="display:inline-block;padding:4px 10px;border-radius:6px;background-color:#062e22;border:1px solid #10b981;color:#10b981;font-family:monospace;font-size:11px;font-weight:700;letter-spacing:1px;">
                ODDSPIRA QUANT TERMINAL v2.1
              </span>
              <h1 style="margin:12px 0 0 0;font-size:24px;font-weight:800;color:#ffffff;">
                Welcome to Oddspira, ${userName}
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;font-size:14px;line-height:1.65;color:#cbd5e1;">
              <p style="margin:0 0 16px 0;">
                Your quantitative betting intelligence account is now <strong style="color:#10b981;">ACTIVE</strong>. You now have access to our institutional stochastic modeling suite:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;background-color:#0b0f19;border:1px solid #1e293b;border-radius:12px;padding:16px;">
                <tr>
                  <td style="padding:6px 0;font-family:monospace;font-size:13px;color:#e2e8f0;">
                    <span style="color:#10b981;font-weight:700;">[01]</span> 9-Panel Bloomberg-Style Master Analysis Terminal (/analysis)
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-family:monospace;font-size:13px;color:#e2e8f0;">
                    <span style="color:#10b981;font-weight:700;">[02]</span> Bivariate Poisson + Dixon-Coles Low-Score Correlation Engine
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-family:monospace;font-size:13px;color:#e2e8f0;">
                    <span style="color:#10b981;font-weight:700;">[03]</span> Dropping Odds &amp; Steam Move Radar + Multi-Bookmaker Matrix
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-family:monospace;font-size:13px;color:#e2e8f0;">
                    <span style="color:#10b981;font-weight:700;">[04]</span> 0.25x Fractional Kelly Bankroll &amp; Monte Carlo Stress Testing
                  </td>
                </tr>
              </table>
              <div style="margin:28px 0;text-align:center;">
                <a href="${appUrl}/analysis" style="display:inline-block;padding:14px 28px;background-color:#10b981;color:#04130a;font-family:monospace;font-size:13px;font-weight:800;text-decoration:none;border-radius:10px;text-transform:uppercase;letter-spacing:0.5px;">
                  Launch Master Terminal &rarr;
                </a>
              </div>
              <p style="margin:0;font-size:12px;color:#64748b;">
                Discipline over emotion. Always verify positive mathematical expectation (+EV) and Closing Line Value (CLV) before committing capital.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:18px 32px;background-color:#080c14;border-top:1px solid #1e293b;font-family:monospace;font-size:11px;color:#64748b;text-align:center;">
              &copy; 2026 Oddspira Quantitative Intelligence (${appUrl}) • Verified Quant Terminal
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildPasswordResetEmailHtml(
  userName: string,
  resetToken: string,
  appUrl: string = 'https://oddspira.com'
): string {
  const resetLink = `${appUrl}/?reset_token=${encodeURIComponent(resetToken)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Oddspira Password Reset Security Token</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0f19;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f19;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:24px 32px;background-color:#080c14;border-bottom:1px solid #1e293b;">
              <span style="display:inline-block;padding:4px 10px;border-radius:6px;background-color:#062e22;border:1px solid #10b981;color:#10b981;font-family:monospace;font-size:11px;font-weight:700;">
                SECURITY PROTOCOL • PASSWORD RESET
              </span>
              <h1 style="margin:12px 0 0 0;font-size:22px;font-weight:800;color:#ffffff;">
                Reset Your Oddspira Password
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;font-size:14px;line-height:1.65;color:#cbd5e1;">
              <p style="margin:0 0 16px 0;">
                Hello <strong>${userName}</strong>, we received a request to reset the password for your Oddspira Quant Terminal account.
              </p>
              <div style="margin:20px 0;padding:16px;background-color:#0b0f19;border:1px solid #10b981;border-radius:10px;text-align:center;">
                <div style="font-family:monospace;font-size:11px;color:#94a3b8;text-transform:uppercase;margin-bottom:6px;">
                  One-Time Security Reset Code (Valid 30 Minutes)
                </div>
                <div style="font-family:monospace;font-size:20px;font-weight:800;color:#10b981;letter-spacing:2px;">
                  ${resetToken}
                </div>
              </div>
              <div style="margin:24px 0;text-align:center;">
                <a href="${resetLink}" style="display:inline-block;padding:13px 26px;background-color:#10b981;color:#04130a;font-family:monospace;font-size:13px;font-weight:800;text-decoration:none;border-radius:10px;text-transform:uppercase;">
                  Reset Password Now &rarr;
                </a>
              </div>
              <p style="margin:0;font-size:12px;color:#64748b;">
                If you did not request a password reset, you can safely ignore this message. Your account credentials remain encrypted.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background-color:#080c14;border-top:1px solid #1e293b;font-family:monospace;font-size:11px;color:#64748b;text-align:center;">
              &copy; 2026 Oddspira Security Desk • HMAC-SHA256 Token Verification
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildEvDigestEmailHtml(
  picks: DigestMatchItem[],
  appUrl: string = 'https://oddspira.com'
): string {
  const rowsHtml = picks
    .map(
      (p) => `
      <tr>
        <td style="padding:12px 10px;border-bottom:1px solid #1e293b;font-size:13px;color:#ffffff;font-weight:600;">
          ${p.fixture}
          <div style="font-family:monospace;font-size:10px;color:#64748b;">${p.competition}</div>
        </td>
        <td style="padding:12px 10px;border-bottom:1px solid #1e293b;font-family:monospace;font-size:12px;color:#10b981;font-weight:700;">
          ${p.selection}
        </td>
        <td style="padding:12px 10px;border-bottom:1px solid #1e293b;font-family:monospace;font-size:12px;color:#e2e8f0;text-align:right;">
          ${p.marketOdds.toFixed(2)} <span style="color:#64748b;">(Fair ${p.fairOdds.toFixed(2)})</span>
        </td>
        <td style="padding:12px 10px;border-bottom:1px solid #1e293b;font-family:monospace;font-size:12px;color:#10b981;font-weight:800;text-align:right;">
          +${p.edgePercent.toFixed(2)}%
        </td>
        <td style="padding:12px 10px;border-bottom:1px solid #1e293b;font-family:monospace;font-size:12px;color:#f8fafc;text-align:right;">
          ${p.kellyStakePct.toFixed(2)}%
        </td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Oddspira Daily +EV Quant Digest</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0f19;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f19;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background-color:#0f172a;border:1px solid #1e293b;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:24px 32px;background-color:#080c14;border-bottom:1px solid #1e293b;">
              <span style="display:inline-block;padding:4px 10px;border-radius:6px;background-color:#062e22;border:1px solid #10b981;color:#10b981;font-family:monospace;font-size:11px;font-weight:700;">
                DAILY +EV QUANT DIGEST • DIXON-COLES &amp; MONTE CARLO VERIFIED
              </span>
              <h1 style="margin:12px 0 0 0;font-size:22px;font-weight:800;color:#ffffff;">
                High-Edge Institutional Value Angles
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;">
              <p style="margin:0 0 16px 0;font-size:13px;color:#cbd5e1;">
                The following fixtures passed our 10,000-run Monte Carlo survival gate (&gt;80% survival) and show confirmed positive mathematical expectation (+EV):
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0f19;border:1px solid #1e293b;border-radius:10px;border-collapse:collapse;">
                <thead>
                  <tr style="background-color:#080c14;font-family:monospace;font-size:10px;color:#94a3b8;text-transform:uppercase;">
                    <th align="left" style="padding:10px;">Match</th>
                    <th align="left" style="padding:10px;">Pick</th>
                    <th align="right" style="padding:10px;">Odds (Fair)</th>
                    <th align="right" style="padding:10px;">Edge %</th>
                    <th align="right" style="padding:10px;">Kelly</th>
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
              <div style="margin:26px 0 10px 0;text-align:center;">
                <a href="${appUrl}/analysis" style="display:inline-block;padding:13px 26px;background-color:#10b981;color:#04130a;font-family:monospace;font-size:13px;font-weight:800;text-decoration:none;border-radius:10px;text-transform:uppercase;">
                  Open Full Decision Passports &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background-color:#080c14;border-top:1px solid #1e293b;font-family:monospace;font-size:11px;color:#64748b;text-align:center;">
              Oddspira Quant Engine (${appUrl}) • Unsubscribe anytime in Profile
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
