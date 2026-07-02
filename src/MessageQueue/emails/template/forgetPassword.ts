import { IPayload_forgetPassword } from "./@types"
import { escapeHtml } from "../../../utils/escapeHtml"

export const forgetPasswordTemp = (payload: IPayload_forgetPassword) => {
  const firstName = escapeHtml(payload.firstName)
  const device = escapeHtml(payload.device)
  const location = escapeHtml(payload.location)
  const ipAddress = escapeHtml(payload.ipAddress)

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Reset your SRVJ password</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root { color-scheme: dark; supported-color-schemes: dark; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a { text-decoration: none; }
    [data-ogsc] .body-bg { background-color: #0a0a0b !important; }
    [data-ogsc] .card-bg { background-color: #141416 !important; }
    [data-ogsc] .meta-bg { background-color: #1c1c1f !important; }
    [data-ogsc] .text-primary { color: #f4f4f5 !important; }
    [data-ogsc] .text-secondary { color: #a1a1aa !important; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .px { padding-left: 24px !important; padding-right: 24px !important; }
    }
  </style>
</head>
<body class="body-bg" style="margin:0; padding:0; background-color:#0a0a0b;">
  <img src="${process.env.API_LINK}/api/v1/emails/opened?uuid=${payload.uuid}" width="1" height="1" alt="" style="display:none;">

  <div style="display:none; font-size:1px; color:#0a0a0b; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    Reset the password for your SRVJ account. This link expires soon, so use it right away.&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table role="presentation" class="body-bg" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0b;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px;">

          <!-- Brand -->
          <tr>
            <td align="center" style="padding:0 0 28px 0;">
              <!-- Inline SVG: renders in browser preview + Apple Mail. Gmail / Outlook strip it, so the SRVJ wordmark stays as fallback. -->
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;">
                <tr>
                  <td style="vertical-align:middle; padding-right:12px; line-height:0; font-size:0;">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="SRVJ">
                      <rect x="3" y="3" width="6" height="6" rx="1" />
                      <rect x="15" y="15" width="6" height="6" rx="1" />
                      <path d="M9 6h6a3 3 0 0 1 3 3v6" />
                    </svg>
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-family:'Helvetica Neue',Arial,sans-serif; font-size:22px; font-weight:700; letter-spacing:6px; color:#fafafa;">SRVJ</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td class="card-bg" style="background-color:#141416; border:1px solid #2a2a2e; border-radius:14px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

                <tr>
                  <td class="px" style="padding:40px 40px 0 40px;">
                    <h1 class="text-primary" style="margin:0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:24px; line-height:32px; font-weight:600; color:#f4f4f5;">
                      Reset your password
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td class="px" style="padding:16px 40px 0 40px;">
                    <p class="text-secondary" style="margin:0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:15px; line-height:24px; color:#a1a1aa;">
                      Hi ${firstName}, we received a request to reset the password for your SRVJ account. Click the button below to choose a new one. If you didn't make this request, you can safely ignore this email.
                    </p>
                  </td>
                </tr>

                <!-- Request details -->
                <tr>
                  <td class="px" style="padding:24px 40px 0 40px;">
                    <table role="presentation" class="meta-bg" width="100%" cellpadding="0" cellspacing="0" style="background-color:#1c1c1f; border:1px solid #2a2a2e; border-radius:10px;">
                      <tr>
                        <td style="padding:18px 20px;">
                          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding:6px 0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:13px; color:#71717a;">Device</td>
                              <td align="right" style="padding:6px 0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:13px; color:#e4e4e7;">${device}</td>
                            </tr>
                            <tr>
                              <td style="padding:6px 0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:13px; color:#71717a;">Location</td>
                              <td align="right" style="padding:6px 0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:13px; color:#e4e4e7;">${location}</td>
                            </tr>
                            <tr>
                              <td style="padding:6px 0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:13px; color:#71717a;">IP address</td>
                              <td align="right" style="padding:6px 0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:13px; color:#e4e4e7;">${ipAddress}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Bulletproof button -->
                <tr>
                  <td class="px" style="padding:24px 40px 8px 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" bgcolor="#6366f1" style="border-radius:10px;">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${payload.resetUrl}" style="height:48px;v-text-anchor:middle;width:200px;" arcsize="20%" strokecolor="#6366f1" fillcolor="#6366f1">
                            <w:anchorlock/>
                            <center style="color:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;font-weight:600;">Reset password</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="${payload.resetUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-family:'Helvetica Neue',Arial,sans-serif; font-size:15px; font-weight:600; color:#ffffff; background-color:#6366f1; border-radius:10px;">
                            Reset password
                          </a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td class="px" style="padding:16px 40px 0 40px;">
                    <p class="text-secondary" style="margin:0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:14px; line-height:22px; color:#a1a1aa;">
                      For your security, this link expires in ${payload.expiresIn}.
                    </p>
                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td class="px" style="padding:32px 40px 0 40px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr><td style="border-top:1px solid #2a2a2e; font-size:0; line-height:0;">&nbsp;</td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 24px 0 24px;">
              <p style="margin:0 0 6px 0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:12px; line-height:18px; color:#52525b; text-align:center;">
                This is a security notification and cannot be unsubscribed from.
              </p>
              <p style="margin:0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:12px; line-height:18px; color:#52525b; text-align:center;">
                &copy; ${new Date().getFullYear()} SRVJ. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!--[if mso]></td></tr></table><![endif]-->

      </td>
    </tr>
  </table>

</body>
</html>`
}
