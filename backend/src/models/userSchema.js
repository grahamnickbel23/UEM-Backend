import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import { redisConnect } from "../../connectRedis.js";
import cryptoRandomString from "crypto-random-string";

const userSchema = new mongoose.Schema({

    email: [{
        type: String,
        required: true
    }],

    phone: [{
        countryCode: {
            type: Number,
            default: 91
        },
        mobileNumber: {
            type: Number,
            required: true
        }
    }],

    password: String,

    refreshTokenString: String,

    otpString: String,

    firstName: {
        type: String,
        default: "Guest"
    },

    middleName: String,

    lastName: {
        type: String,
        default: "User"
    },

    gender: {
        type: String,
        enum: ["male", "female", "other", "prefer-not-say"],
        default: "prefer-not-say"
    },

    date_of_birth: Date,

    address: [{
        address_line_one: {
            type: String,
            trim: true,
            required: true,
        },
        address_line_two: {
            type: String,
            trim: true
        },
        address_line_three: {
            type: String,
            trim: true
        },
        district: {
            type: String,
            trim: true,
            required: true
        },
        state: {
            type: String,
            trim: true,
            default: "West Bengal"
        },
        country: {
            type: String,
            trim: true,
            default: "India"
        }
    }],

    employeeId: {
        type: String,
        required: true
    },
    department: String,

    profilePicURL: String,
    idCardUrl: String,

    githubURL: String,
    linkdinURL: String,

    achivementSchema: [{
        achievementId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "achivementModel" 
        },
        title: String,
        url: String
    }],

    role: {
        type: String,
        enum: ["admin", "faculty"],
        default: "faculty"
    },

    createdBy: {
        type: mongoose.Schema.Types.Mixed,
        ref: "userModel",
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    updatedAt: {
        type: Date,
        default: Date.now,
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
})

// mongoose pre hook for email formatting
userSchema.pre('validate', function (next) {
    const emailRegex = /^\S+@\S+\.\S+$/;

    for (let email of this.email) {
        if (!emailRegex.test(email)) {
            return next(new Error(`Invalid email format: ${email}`));
        }
    }

    next();
});

// Mongoose pre hook to validate 10-digit mobile numbers
userSchema.pre('validate', function (next) {
    for (let phone of this.phone) {
        const numStr = phone.mobileNumber?.toString();
        if (!numStr || !/^\d{10}$/.test(numStr)) {
            return next(new Error(`Invalid mobile number: ${phone.mobileNumber}`));
        }
    }
    next();
});

// mongoose pre hook for automatic password setup
userSchema.pre('save', async function (next) {
    if (!this.password && this.isNew) {

        const password = cryptoRandomString({ length: 10, type: 'alphanumeric' });

        // save this password in redis for a short preod of time
        await redisConnect.set(this.email.toString(), password, { EX: 120 });

        // hash and save the password in mongo now
        const hashedPassword = await bcrypt.hash(password, 10);
        this.password = hashedPassword;

    }
    next();
})

export default mongoose.model("userModel", userSchema);