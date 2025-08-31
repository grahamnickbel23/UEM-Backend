import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

// get dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class sendEmail {

    // function for congratulatory email
    static async congratEmail(email, info) {

        // let us define transport 1st
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD
            }
        });

        // load congratulatory template
        const templatePath = path.join(__dirname, "./email UI/congrats email.html");
        let template = fs.readFileSync(templatePath, "utf-8");

        // replace placeholders
        template = template
            .replace("{{EMAIL}}", info.email)
            .replace("{{PASSWORD}}", info.password)
            .replace("{{YEAR}}", new Date().getFullYear());

        // send email
        await transport.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Welcome 🎉 Your Account Has Been Created",
            html: template
        });
    }

    // function for otp email
    static async deliveryOTP(email, otp) {
        // let us define transport 1st
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD
            }
        });

        // load html template
        const templatePath = path.join(__dirname, "./email UI/otp email.html");
        let template = fs.readFileSync(templatePath, "utf-8");

        // replace placegholder
        template = template
            .replace("{{OTP}}", otp)
            .replace("{{YEAR}}", new Date().getFullYear());

        await transport.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'OTP for login',
            html: template
        })
    }

    // function for alert email alerting if user changes any critical info
    static async alertEmailUpdate(email, fieldChanged) {
        // transport
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD
            }
        });

        // load HTML template
        const templatePath = path.join(__dirname, "./email UI/alert email.html");
        let template = fs.readFileSync(templatePath, "utf-8");

        // replace placeholders
        template = template
            .replace("{{FIELD}}", fieldChanged)
            .replace("{{YEAR}}", new Date().getFullYear());

        // send email
        await transport.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "⚠️ Security Alert: Account information changed",
            html: template
        });
    }

    // function for account deleted email
    static async accountDeletedEmail(email) {

        // define transport
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD
            }
        });

        // load deleted account template
        const templatePath = path.join(__dirname, "./email UI/deletedAccount email.html");
        let template = fs.readFileSync(templatePath, "utf-8");

        // replace placeholders
        template = template.replace("{{YEAR}}", new Date().getFullYear());

        // send email
        await transport.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "⚠️ Your Account Has Been Deleted",
            html: template
        });
    }

    // function for account deleted email
    static async accountDeletedAdminEmail(userEmail, adminEmail) {

        // define transport
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD
            }
        });

        // load deleted account template
        const templatePath = path.join(__dirname, "./email UI/deletedAccount admin email.html");
        let template = fs.readFileSync(templatePath, "utf-8");

        // replace placeholders
        template = template
            .replace("{{USER_EMAIL}}", userEmail)
            .replace("{{YEAR}}", new Date().getFullYear());

        // send email to admin
        await transport.sendMail({
            from: process.env.EMAIL,
            to: adminEmail,
            subject: `⚠️ User Account Soft Deleted: ${userEmail}`,
            html: template
        });
    }

    // function to alert user about new achievement
    static async achievementAddedEmail(email, username, achievementTitle, achievementType) {
        // create transport
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD
            }
        });

        // load HTML template
        const templatePath = path.join(__dirname, "./email UI/achivement email.html");
        let template = fs.readFileSync(templatePath, "utf-8");

        // replace placeholders
        template = template
            .replace("{{USERNAME}}", username)
            .replace("{{ACHIEVEMENT_TITLE}}", achievementTitle)
            .replace("{{ACHIEVEMENT_TYPE}}", achievementType)
            .replace("{{YEAR}}", new Date().getFullYear());

        // send email
        await transport.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "🎉 New Achievement Added to Your Profile",
            html: template
        });
    }

    // function to alert user about deleted achievement
    static async achievementDeletedEmail(email, username, achievementTitle, achievementType) {
        // create transport
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD
            }
        });

        // load HTML template
        const templatePath = path.join(__dirname, "./email UI/delted achivement email.html");
        let template = fs.readFileSync(templatePath, "utf-8");

        // replace placeholders
        template = template
            .replace("{{USERNAME}}", username)
            .replace("{{ACHIEVEMENT_TITLE}}", achievementTitle)
            .replace("{{ACHIEVEMENT_TYPE}}", achievementType)
            .replace("{{YEAR}}", new Date().getFullYear());

        // send email
        await transport.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "⚠️ Achievement Removed from Your Profile",
            html: template
        });
    }
}