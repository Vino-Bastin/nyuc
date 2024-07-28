const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        interaktId: {
            type: String,
            required: true,
        },
        headerType: {
            type: String,
        },
        headerText: {
            type: String,
        },
        imageUrl: {
            type: String,
        },
        bodyVariables: [
            {
                type: String,
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

const Template = mongoose.model("Template", templateSchema);
module.exports = Template;
