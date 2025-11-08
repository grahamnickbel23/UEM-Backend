import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { Readable } from "stream";
import userSchema from "../../models/userSchema.js";
import achivementSchema from "../../models/achivementSchema.js";
import genaralResponse from "../../utils/genaralResponse utils.js";

export default class download {

    static async downloadExcel(req, res) {
        const { type, order = "decreasing" } = req.body;

        // Error if no type given
        const info = "Missing achievement type";
        genaralResponse.genaral400Error(!type, info, res);

        // Step 1: get all users
        const users = await userSchema.find().lean();
        const userData = [];

        // Step 2: get achievements of requested type
        for (const user of users) {
            const achievements = await achivementSchema.find({
                person: user._id,
                achivementType: type,
                isDeleted: false
            }).lean();

            if (achievements.length > 0) {
                userData.push({
                    user,
                    count: achievements.length,
                    achievements
                });
            }
        }

        // Step 3: sort users by count
        userData.sort((a, b) =>
            order === "increasing" ? a.count - b.count : b.count - a.count
        );

        // Step 4: create workbook and sheet
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(`${type.toUpperCase()} Report`);

        // Step 5: Define columns
        sheet.columns = [
            { header: "Name", key: "name", width: 25 },
            { header: "Employee ID", key: "employeeId", width: 15 },
            { header: "Department", key: "department", width: 15 },
            { header: "Email", key: "email", width: 25 },
            { header: "Phone", key: "phone", width: 20 },
            { header: `No. of ${type}`, key: "count", width: 15 },
            { header: `${type} Titles`, key: "titles", width: 40 },
            { header: `${type} Organizers`, key: "organizers", width: 35 },
            { header: `PDF URLs`, key: "pdfUrls", width: 50 },
            { header: `Image URLs`, key: "imageUrls", width: 50 },
        ];

        // Step 6: Add data rows
        for (const { user, count, achievements } of userData) {
            const allPdfUrls = [];
            const allImageUrls = [];

            achievements.forEach(a => {
                // Extract from docURL (only PDFs)
                if (a.docURL && typeof a.docURL === "object") {
                    for (const [key, value] of a.docURL.entries ? a.docURL.entries() : Object.entries(a.docURL)) {
                        if (typeof value === "string" && value.toLowerCase().endsWith(".pdf")) {
                            allPdfUrls.push(value);
                        }
                    }
                }

                // Extract from imageURL (jpg, jpeg, png)
                if (a.imageURL && typeof a.imageURL === "object") {
                    for (const [key, value] of a.imageURL.entries ? a.imageURL.entries() : Object.entries(a.imageURL)) {
                        if (typeof value === "string" && /\.(jpg|jpeg|png|gif|webp)$/i.test(value)) {
                            allImageUrls.push(value);
                        }
                    }
                }
            });

            sheet.addRow({
                name: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" "),
                employeeId: user.employeeId,
                department: user.department,
                email: user.email?.[0],
                phone: user.phone?.[0]?.mobileNumber,
                count,
                titles: achievements.map(a => a.title).join(", "),
                organizers: achievements.map(a => a.organizer).join(", "),
                pdfUrls: allPdfUrls.join(", "),
                imageUrls: allImageUrls.join(", ")
            });
        }

        // Step 7: Make headers bold
        sheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true };
        });

        // Step 8: Send Excel file
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${type}-achievement-report.xlsx`
        );
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        await workbook.xlsx.write(res);
        res.end();
    }

    static async downloadAchievement(req, res) {

        const { id } = req.body;

        // fetch achievement
        const achievement = await achivementSchema.findById(id)
            .populate("person", "firstName middleName lastName employeeId department")
            .lean();

        if (!achievement) {
            return res.status(404).json({
                success: false,
                message: "Achievement not found"
            });
        }

        // create PDF
        const doc = new PDFDocument({ margin: 50 });
        const stream = new Readable().wrap(doc);

        // headers for browser download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${achievement.title}.pdf`
        );

        // use built-in Times font
        doc.font("Times-Roman");

        // ===== TITLE =====
        doc.font("Times-Bold")
            .fontSize(20)
            .text(achievement.title, { align: "center" });
        doc.moveDown();

        // ===== BASIC DETAILS =====
        const ownerName = [achievement.person.firstName, achievement.person.middleName, achievement.person.lastName]
            .filter(Boolean)
            .join(" ");

        doc.fontSize(12);
        doc.font("Times-Bold").text("Issued to: ", { continued: true });
        doc.font("Times-Roman").text(ownerName);

        doc.font("Times-Bold").text("Employee ID: ", { continued: true });
        doc.font("Times-Roman").text(achievement.person.employeeId);

        doc.font("Times-Bold").text("Department: ", { continued: true });
        doc.font("Times-Roman").text(achievement.person.department);

        doc.font("Times-Bold").text("Organizer / Authority: ", { continued: true });
        doc.font("Times-Roman").text(achievement.organizer);

        if (achievement.location) {
            doc.font("Times-Bold").text("Location: ", { continued: true });
            doc.font("Times-Roman").text(achievement.location);
        }

        if (achievement.eventDate) {
            doc.font("Times-Bold").text("Event Date: ", { continued: true });
            doc.font("Times-Roman").text(
                new Date(achievement.eventDate).toLocaleDateString()
            );
        }

        doc.moveDown();

        // ===== DESCRIPTION =====
        doc.font("Times-Bold").fontSize(14).text("Description:");
        doc.font("Times-Roman")
            .fontSize(12)
            .text(achievement.description || "No description provided.", {
                align: "justify",
                lineGap: 4,
            });
        doc.moveDown();

        // ===== LINKS =====
        doc.font("Times-Bold").fontSize(14).text("Related Documents & Links:");
        const docUrls = achievement.docURL || {};
        const links = Object.entries(docUrls);

        if (links.length > 0) {
            links.forEach(([key, value]) => {
                doc.font("Times-Bold").fontSize(12).text(`${key}: `, { continued: true });
                doc.font("Times-Roman").text(value);
            });
        } else {
            doc.font("Times-Roman").fontSize(12).text("No linked documents available.");
        }

        doc.end();
        doc.pipe(res);
    }

}
