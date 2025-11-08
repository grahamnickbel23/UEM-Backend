import logger from "../../logger/log logger.js";
import userSchema from "../../models/userSchema.js";

export default class search {

    // basic search
    static async searchUser(req, res) {

        // get the info from request
        const { query } = req.body;

        // return error if no input at all
        if (!query || !query.trim()) {
            return res.json({ success: true, results: [] });
        }

        const regex = new RegExp(query.trim(), "i");

        // find users matching email or employeeId (string fields)
        const users = await userSchema.find({
            isDeleted: false,
            deletedAt: null,
            $or: [
                { email: { $elemMatch: { $regex: regex } } },
                { employeeId: { $regex: regex } },
                { "phone.mobileNumber": { $exists: true } } // just ensure phone exists
            ]
        })
            .select("firstName lastName email phone employeeId")
            .limit(20); // fetch extra to account for filtering

        const employeeMatches = [];
        const emailMatches = [];
        const phoneMatches = [];

        for (const user of users) {
            const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();

            // employeeId match → highest priority
            if (regex.test(user.employeeId)) {
                employeeMatches.push({
                    name,
                    matchedField: "employeeId",
                    matchedValue: user.employeeId
                });
                continue; // skip lower priority fields
            }

            // email match → medium priority
            if (Array.isArray(user.email)) {
                const matchedEmail = user.email.find(e => regex.test(e));
                if (matchedEmail) {
                    emailMatches.push({
                        name,
                        matchedField: "email",
                        matchedValue: matchedEmail
                    });
                    continue;
                }
            }

            // phone match → lowest priority
            if (Array.isArray(user.phone)) {
                const matchedPhone = user.phone.find(p => regex.test(p.mobileNumber?.toString()));
                if (matchedPhone) {
                    phoneMatches.push({
                        name,
                        matchedField: "phone",
                        matchedValue: matchedPhone.mobileNumber.toString()
                    });
                }
            }
        }

        // combine in priority order and cap at 5
        const results = [...employeeMatches, ...emailMatches, ...phoneMatches].slice(0, 5);

        // create logger
        const safeResults = results.map(r => ({
            matchedField: r.matchedField,
            matchedValue: r.matchedValue
        }));

        // Log summary
        logger.info(`${req.requestId} SEARCH_LOG input: ${query} output: ${JSON.stringify(safeResults)}`);

        // return info in prority order
        return res.json({
            success: true,
            message: results
        });
    }

    // show all current user
    static async getAllUser(req, res) {

        // get alll the user with limited field
        const user = await userSchema.find({}, "firstName middleName lastName employeeId department");

        // map to clear format
        const formatUser = user.map(user => ({
            name: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" "),
            employeeId: user.employeeId,
            department: user.department
        }));

        // return info
        return res.json({
            success: true,
            message: formatUser
        })
    }

    // show all deleted users
    static async getAllDeletedUser(req, res) {
        
        // fetch users marked as deleted
        const deletedUsers = await userSchema.find(
            { isDeleted: true },
            "firstName middleName lastName employeeId department deletedAt"
        );

        // if none found
        if (deletedUsers.length === 0) {
            return res.json({
                success: true,
                message: "No deleted users found",
                data: []
            });
        }

        // map into formatted response
        const formattedDeletedUsers = deletedUsers.map(user => ({
            name: [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" "),
            employeeId: user.employeeId,
            department: user.department,
            deletedAt: user.deletedAt
        }));

        // send formatted JSON
        return res.json({
            success: true,
            message: "Deleted users fetched successfully",
            data: formattedDeletedUsers
        });
    }

}