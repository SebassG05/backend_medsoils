import nodemailer from 'nodemailer';
import config from '../config/index.js';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
};

/**
 * Sends a password reset email with a button linking to the reset page.
 * @param {string} toEmail - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} userName - Recipient's name
 */
export const sendPasswordResetEmail = async (toEmail, resetToken, userName) => {
  const transporter = createTransporter();

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"MedSoils" <${config.email.user}>`,
    to: toEmail,
    subject: 'Reset your MedSoils password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Reset your password</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="500" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#fb923c,#f97316);padding:32px 40px;text-align:center;">
                      <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">MedSoils</h1>
                      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Password Reset</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 40px 32px;">
                      <p style="margin:0 0 8px;color:#111827;font-size:20px;font-weight:600;">Hi, ${userName || 'there'} 👋</p>
                      <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
                        We received a request to reset the password for your MedSoils account.
                        Click the button below to choose a new password.
                      </p>

                      <!-- Button -->
                      <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                        <tr>
                          <td style="border-radius:12px;background:linear-gradient(135deg,#fb923c,#f97316);">
                            <a href="${resetUrl}"
                               style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:12px;letter-spacing:0.2px;">
                              Reset my password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;">
                        This link will expire in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
                      </p>

                      <!-- Fallback URL -->
                      <p style="margin:24px 0 0;color:#9ca3af;font-size:11px;word-break:break-all;">
                        Or copy and paste this URL into your browser:<br/>
                        <a href="${resetUrl}" style="color:#f97316;">${resetUrl}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
                      <p style="margin:0;color:#d1d5db;font-size:11px;">
                        © ${new Date().getFullYear()} MedSoils Challenge. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
