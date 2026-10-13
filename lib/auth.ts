
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";
import { after } from "next/server";

const smtpUser = process.env.SMTP_USER;
const smtpAppPassword = process.env.SMTP_APP_PASSWORD;

const transporter =
  smtpUser && smtpAppPassword
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpAppPassword.replace(/\s/g, ""),
        },
      })
    : null;


export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL!,
  ],


  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,

    sendResetPassword: async ({ user, url }) => {
      after(async () => {
        try {
          if (!transporter || !smtpUser) {
            throw new Error(
              "SMTP_USER and SMTP_APP_PASSWORD must be configured."
            );
          }

          const safeUrl = url
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;");

          await transporter.sendMail({
            from: `"Portfolio Builder" <${smtpUser}>`,
            to: user.email,
            subject: "Reset your Portfolio Builder password",

            text: [
              "We received a request to reset your Portfolio Builder password.",
              "",
              "Use this link to choose a new password:",
              url,
              "",
              "If you did not request this, you can ignore this email.",
            ].join("\n"),

            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Reset your Portfolio Builder password</h2>
                <p>We received a request to reset your password.</p>
                <p><a href="${safeUrl}">Reset your password</a></p>
                <p>If the button doesn't work, copy this link:</p>
                <p>${safeUrl}</p>
                <p>If you did not request this, you can ignore this email.</p>
              </div>
            `,
          });

          console.info("Password-reset email sent successfully.");
        } catch (error) {
          console.error("Password-reset email delivery failed:", error);
        }
      });
    },

    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,
  },
});
