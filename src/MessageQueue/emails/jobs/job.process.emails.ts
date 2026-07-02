import { Job } from "bullmq";
import { loginTemp } from "../template/login";
import { registerTemp } from "../template/register";
import { resendFunction } from "../../../MessageQueue/provider/resend";
import { generateUUID } from "../../../utils/uuid";
import { inviteTemp } from "../template/invite";
import { forgetPasswordTemp } from "../template/forgetPassword";
import { verifyEmailTemp } from "../template/verifyEmail";

export const sendEmail = async (data: any) => {
     try {
          const uuid = generateUUID()
          data.uuid = uuid

          switch (data.type) {
               case "login":
                    await resendFunction(data.email, loginTemp(data.emailBody), data.subject, uuid, "auth")
                    break;
               case "register":
                    await resendFunction(data.email, registerTemp(data.emailBody), data.subject, uuid, "auth")
                    break;
               case "invite":
                    await resendFunction(data.email, inviteTemp(data.emailBody), data.subject, uuid, "invite")
                    break;
               case "forgatePassword":
                    await resendFunction(data.email, forgetPasswordTemp(data.emailBody), data.subject, uuid, "auth")
                    break;
               case "verifyEmail":
                    await resendFunction(data.email, verifyEmailTemp(data.emailBody), data.subject, uuid, "auth")
                    break;
          }
     }
     catch (err) {
          console.error(`[sendEmail] Failed to send email type "${data.type}":`, err);
          throw err;
     }
}

export const jobProcessor = async (job: Job): Promise<any> => {
     await sendEmail(job.data);
};
