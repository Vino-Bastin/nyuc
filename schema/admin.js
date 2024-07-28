const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                delete ret.__v;
                ret.id = ret._id;
                return ret;
            },
        },
    }
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
