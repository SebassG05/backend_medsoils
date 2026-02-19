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

/**
 * Sends a confirmation email to the user who submitted the contact form.
 */
export const sendContactConfirmationEmail = async (toEmail, userName) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"MedSoils" <${config.email.user}>`,
    to: toEmail,
    subject: 'We received your message — MedSoils',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Message Received — MedSoils</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f0f9ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

          <!-- Outer wrapper with soft background -->
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:linear-gradient(160deg,#e0f2fe 0%,#f0fdf4 50%,#fef3c7 100%);padding:28px 16px;">
            <tr><td align="center">

              <!-- Card -->
              <table width="480" cellpadding="0" cellspacing="0"
                style="background:#ffffff;border-radius:16px;overflow:hidden;
                       box-shadow:0 4px 24px rgba(14,165,233,0.10),0 2px 8px rgba(0,0,0,0.05);">

                <!-- ── HEADER ── -->
                <tr>
                  <td style="background:linear-gradient(135deg,#fb923c,#f97316);padding:20px 32px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">MedSoils</h1>
                    <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:12px;letter-spacing:0.5px;text-transform:uppercase;">Message Received ✓</p>
                  </td>
                </tr>

                <!-- ── GREETING ── -->
                <tr>
                  <td style="padding:24px 32px 0;">
                    <p style="margin:0 0 4px;color:#111827;font-size:18px;font-weight:700;line-height:1.3;">
                      Hi, ${userName || 'there'}! 👋
                    </p>
                    <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.65;">
                      Thank you for reaching out to <strong style="color:#f97316;">MedSoils</strong>.
                      We have received your message and our team will review it shortly.
                    </p>
                  </td>
                </tr>

                <!-- ── STATUS BANNER ── -->
                <tr>
                  <td style="padding:18px 32px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="background:#fff7ed;border-radius:12px;overflow:hidden;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="vertical-align:middle;padding-right:12px;">
                                <div style="width:36px;height:36px;background:linear-gradient(135deg,#fb923c,#f97316);
                                            border-radius:50%;text-align:center;line-height:36px;">
                                  <span style="color:white;font-size:16px;line-height:36px;">✓</span>
                                </div>
                              </td>
                              <td style="vertical-align:middle;">
                                <p style="margin:0;color:#9a3412;font-size:14px;font-weight:700;">Your message is in our inbox!</p>
                                <p style="margin:2px 0 0;color:#c2410c;font-size:12px;">We'll get back to you <strong>as soon as possible</strong>.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- ── WHAT HAPPENS NEXT ── -->
                <tr>
                  <td style="padding:18px 32px 0;">
                    <p style="margin:0 0 10px;color:#374151;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;">What happens next?</p>
                    <!-- Step 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                      <tr>
                        <td style="vertical-align:middle;width:30px;padding-right:10px;">
                          <div style="width:22px;height:22px;background:#fed7aa;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#9a3412;">1</div>
                        </td>
                        <td><p style="margin:0;color:#374151;font-size:13px;">Our team reviews your inquiry and prepares a response.</p></td>
                      </tr>
                    </table>
                    <!-- Step 2 -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
                      <tr>
                        <td style="vertical-align:middle;width:30px;padding-right:10px;">
                          <div style="width:22px;height:22px;background:#fed7aa;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#9a3412;">2</div>
                        </td>
                        <td><p style="margin:0;color:#374151;font-size:13px;">You'll receive a reply at <strong style="color:#ea580c;">${toEmail}</strong>.</p></td>
                      </tr>
                    </table>
                    <!-- Step 3 -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:middle;width:30px;padding-right:10px;">
                          <div style="width:22px;height:22px;background:#fed7aa;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;color:#9a3412;">3</div>
                        </td>
                        <td><p style="margin:0;color:#374151;font-size:13px;">For urgent matters, contact us during working hours.</p></td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- ── WORKING HOURS ── -->
                <tr>
                  <td style="padding:16px 32px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="background:#f0f9ff;border-radius:10px;">
                      <tr>
                        <td style="padding:14px 18px;">
                          <p style="margin:0 0 8px;color:#0369a1;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;">🕐 Working Hours</p>
                          <table cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td style="color:#0c4a6e;font-size:12px;padding:2px 0;font-weight:600;">Mon – Thu</td>
                              <td style="color:#0369a1;font-size:12px;padding:2px 0;text-align:right;">9:00 – 16:00</td>
                            </tr>
                            <tr>
                              <td style="color:#0c4a6e;font-size:12px;padding:2px 0;font-weight:600;">Fri – Sat</td>
                              <td style="color:#0369a1;font-size:12px;padding:2px 0;text-align:right;">9:00 – 15:00</td>
                            </tr>
                            <tr>
                              <td style="color:#94a3b8;font-size:12px;padding:2px 0;font-weight:600;">Sunday</td>
                              <td style="color:#94a3b8;font-size:12px;padding:2px 0;text-align:right;">Closed</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- ── FOOTER ── -->
                <tr>
                  <td style="padding:20px 32px 24px;">
                    <!-- Divider -->
                    <div style="height:1px;background:#e5e7eb;margin-bottom:16px;"></div>

                    <!-- Social / contact row -->
                    <p style="margin:0 0 6px;text-align:center;color:#9ca3af;font-size:12px;">
                      Need help sooner? Email us at
                      <a href="mailto:medsoilchallenge@gmail.com"
                         style="color:#f97316;text-decoration:none;font-weight:600;">medsoilchallenge@gmail.com</a>
                    </p>
                    <p style="margin:0;text-align:center;color:#d1d5db;font-size:11px;">
                      © ${new Date().getFullYear()} MedSoils Challenge · All rights reserved
                    </p>
                  </td>
                </tr>

              </table>
              <!-- End card -->

            </td></tr>
          </table>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Sends the contact form details to the three admin emails.
 */
export const sendContactFormToAdmins = async ({ name, email, subject, message, country, enquiryType }) => {
  const transporter = createTransporter();

  const adminEmails = [
    'medsoilchallenge@gmail.com',
    'informacion@evenor-tech.com',
    'info@evenor-tech.com',
  ];

  const mailOptions = {
    from: `"MedSoils Contact" <${config.email.user}>`,
    to: adminEmails.join(', '),
    replyTo: email,
    subject: `[Contact Form] ${enquiryType || 'New message'} — from ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 0;">
            <tr><td align="center">
              <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                <tr>
                  <td style="background:linear-gradient(135deg,#1e293b,#334155);padding:28px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">📬 New Contact Form Submission</h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:12px;">MedSoils Website</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                          <span style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Name</span><br/>
                          <span style="color:#111827;font-size:15px;font-weight:500;">${name}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                          <span style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Email</span><br/>
                          <a href="mailto:${email}" style="color:#ea580c;font-size:15px;font-weight:500;text-decoration:none;">${email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                          <span style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Country</span><br/>
                          <span style="color:#111827;font-size:15px;font-weight:500;">${country || '—'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                          <span style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Type of Enquiry</span><br/>
                          <span style="color:#111827;font-size:15px;font-weight:500;">${enquiryType || '—'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
                          <span style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Subject</span><br/>
                          <span style="color:#111827;font-size:15px;font-weight:500;">${subject || '(no subject)'}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 0;">
                          <span style="color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Message</span><br/>
                          <p style="margin:8px 0 0;color:#374151;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 40px;background:#f8fafc;border-top:1px solid #f1f5f9;">
                    <p style="margin:0;color:#94a3b8;font-size:11px;text-align:center;">
                      Reply directly to this email to respond to ${name}.<br/>
                      Submitted on ${new Date().toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
