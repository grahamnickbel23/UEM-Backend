import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";

// get dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function adminInfoEmail(email, userEmail, info) {
    const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD
        }
    });

    const templatePath = path.join(__dirname, "./email UI/admin email.html");
    let template = fs.readFileSync(templatePath, "utf-8");

    // replace placeholders
    template = template
        .replace("{{ADMIN_NAME}}", email || "Admin")
        .replace("{{CREATED_AT}}", info.createdAt || new Date().toISOString())
        .replace("{{USER_FULL_NAME}}", info.firstName || "")
        .replace(/{{\s*EMPLOYEE_ID\s*}}/g, info.employeeId || "")
        .replace("{{PRIMARY_EMAIL}}", userEmail || "")
        .replace("{{FIRST_NAME}}", info.firstName || "")
        .replace("{{MIDDLE_NAME}}", info.middleName || "")
        .replace("{{LAST_NAME}}", info.lastName || "")
        .replace("{{GENDER}}", info.gender || "")
        .replace("{{DATE_OF_BIRTH}}", info.dateOfBirth || "")
        .replace("{{DEPARTMENT}}", info.department || "")
        .replace("{{ROLE}}", info.role || "")
        .replace("{{EMAILS_LIST}}", (info.email || []).join(", "))
        .replace("{{PHONES_LIST}}", (info.phone.map(p => `+${p.countryCode} ${p.mobileNumber}`).join(", ")))
        .replace("{{ADDRESSES_LIST}}", ((info.address || []).map(addr =>`${addr.address_line_one || ""}, ${addr.address_line_two || ""}, ${addr.address_line_three || ""}, ${addr.district}, ${addr.state}, ${addr.country}`.replace(/,\s*,/g, ",") .replace(/^,\s*|\s*,\s*$/g, "")).join(" | ")))
        .replace("{{GITHUB_URL}}", info.githubUrl || "#")
        .replace("{{LINKEDIN_URL}}", info.linkedinUrl || "#")
        .replace("{{PROFILE_PIC_URL}}", info.profilePicUrl || "#")
        .replace("{{ID_CARD_URL}}", info.idCardUrl || "#")
        .replace("{{ACHIEVEMENTS_COUNT}}", info.achievements ? info.achievements.length : 0)
        .replace("{{ACHIEVEMENTS_LIST}}", (info.achievements || []).join("<br/>"))
        .replace("{{CREATED_BY}}", info.createdBy || "")
        .replace("{{UPDATED_AT}}", info.updatedAt || new Date().toISOString())
        .replace("{{YEAR}}", new Date().getFullYear());

    await transport.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "📋 User Creation Receipt (Admin Copy)",
        html: template
    });
}