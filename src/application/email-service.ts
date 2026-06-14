import nodemailer from "nodemailer";

let transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "noreply.notifycations@gmail.com",
    pass: "gtsdasurflxfcelq",
  },
});

export const emailService = {
  async sendEmail(to: string, subject: string, html: string) {
    const info = await transport.sendMail({
      from: "BLOGGERS <noreply.notifications@gmail.com>",
      to,
      subject,
      html,
    });

    return info;
  },
  async sendConfirmEmailForRegistration(
    login: string,
    email: string,
    confirmationCode: string,
  ) {
    const SUBJECT = "Confirm your Email to complete registration.";
    const HTML = ` 
    <p>Hello, dear ${login}!</p>
    <p>Please, finish your registration by <a href="${confirmationCode}"> confirming your email</a>!</p>
    <p>And enjoy our service</p>
    `.trim();
    const info = await this.sendEmail(email, SUBJECT, HTML);
    return info;
  },
};
