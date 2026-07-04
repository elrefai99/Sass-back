import { IPayload_verifyEmail } from "./@types"
import { escapeHtml } from "../../../utils/escapeHtml"

export const verifyEmailTemp = (payload: IPayload_verifyEmail) => {
  const firstName = escapeHtml(payload.firstName)
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Verify your SwakipOS email</title>
  <style>
    :root { color-scheme: dark; supported-color-schemes: dark; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a { text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .px { padding-left: 24px !important; padding-right: 24px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#0a0a0b;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0b;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px;">
          <tr>
            <td style="background-color:#141416; border:1px solid #2a2a2e; border-radius:14px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="px" style="padding:40px 40px 0 40px;">
                    <h1 style="margin:0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:24px; line-height:32px; font-weight:600; color:#f4f4f5;">
                      Verify your email, ${firstName}
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td class="px" style="padding:16px 40px 0 40px;">
                    <p style="margin:0; font-family:'Helvetica Neue',Arial,sans-serif; font-size:15px; line-height:24px; color:#a1a1aa;">
                      Confirm this is your email address to finish setting up your account. This link expires in ${escapeHtml(payload.expiresIn)}.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td class="px" style="padding:32px 40px 40px 40px;">
                    <table role="presentation" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" bgcolor="#fafafa" style="border-radius:10px;">
                          <a href="${payload.verifyUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-family:'Helvetica Neue',Arial,sans-serif; font-size:15px; font-weight:600; color:#09090b; background-color:#fafafa; border-radius:10px;">
                            Verify email
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
