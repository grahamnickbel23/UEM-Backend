import mongoose from "mongoose";

const achivementSchema = new mongoose.Schema({
    achivementType: {
        type: String,
        enum: ["degree", "book", "talk", "certification", "patent", "publication", "awards"],
        required: true
    },

    person: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
        required: true
    },

    title: {
        type: String,
        unique: true,
        required: true
    },

    description: String,
    organizer: String,
    location: String,
    identification_number: String,
    currentStatus: String,
    eventDate: Date,
    imageURL: {
        type: Map,
        of: String,
        default: {}
    },

    docURL: {
        type: Map,
        of: String,
        default: {}
    },

    extra: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
    },

    isDeleted: {
        type: Boolean,
        default: false
    },

    deletedAt: {
        type: Date,
        default: null
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add reference to user after saving
achivementSchema.post("save", async function (doc, next) {
    try {
        await mongoose.model("userModel").findByIdAndUpdate(
            doc.person,
            { $addToSet: { 
                   achivementSchema : { 
                      title: doc.title, 
                      url: doc._id }  
            } }
        );
        next();
    } catch (err) {
        next(err);
    }
});

export default mongoose.model("achivementModel", achivementSchema);