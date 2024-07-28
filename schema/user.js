const mongoose = require("mongoose");
const moment = require("moment");

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        profile: {
            firstName: {
                type: String,
                required: true,
            },
            lastName: {
                type: String,
                required: true,
            },
        },
        metaData: {
            countryCode: {
                type: String,
                default: "+91",
            },
            phone: {
                type: String,
                default: "",
            },
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        lastLoginAt: {
            type: Date,
            default: moment().format(),
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
