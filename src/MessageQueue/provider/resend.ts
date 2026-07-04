import { Resend } from 'resend';

type formType = "auth" | "invite" | "user"

export const resendFunction = async (to: string, html: string, subject: string, _uuid: string, type: formType) => {
     const resend = new Resend(process.env.RESEND_API as string);
     try {
          const { data, error } = await resend.emails.send({
               from: `SwakipOS <SwakipOS${type == "auth" ? ".auth" : type == "invite" ? ".invite" : type == "user" ? ".user" : ""}@elrefai.me>`,
               to,
               subject,
               html,
          });

          if (error) {
               console.error("❌ Resend error:", error);
               throw error;
          }
          console.log("✅ Email sent successfully via Resend:", data?.id);
          return;
     } catch (error) {
          console.error("❌ Failed to send email via Resend:", error);
          throw error;
     }
}
