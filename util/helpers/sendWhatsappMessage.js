const axios = require("axios");
const ExcelJS = require("exceljs");

const logger = require("../logger");

module.exports = async (users, template, templateName) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${templateName} - Campaign Status`);
    worksheet.columns = [
        { header: "Name", key: "name", width: 20 },
        { header: "Email", key: "email", width: 20 },
        { header: "Country Code", key: "countryCode", width: 20 },
        { header: "Phone", key: "phone", width: 20 },
        { header: "Status", key: "status", width: 20 },
        { header: "Message", key: "message", width: 20 },
        { header: "Interakt ID", key: "InteraktId", width: 20 },
    ];
    try {
        for (const user of users) {
            const response = await sendWhatsAppMessage(user, template, templateName);
            if (response.ok) {
                worksheet.addRow({
                    name: user.profile.firstName + " " + user.profile.lastName,
                    email: user.email,
                    countryCode: user.metaData.countryCode,
                    phone: user.phone,
                    status: "Success",
                    message: response.data.message,
                    InteraktId: response.data.id,
                });
            } else {
                worksheet.addRow({
                    name: user.profile.firstName + " " + user.profile.lastName,
                    email: user.email,
                    countryCode: user.metaData.countryCode,
                    phone: user.phone,
                    status: "Failed",
                    message: response.msg,
                    InteraktId: "",
                });
            }
            await Timer(2000);
        }

        // * save file under /public/whatsapp-logs
        const fileName = `${templateName}-${new Date().getTime()}.xlsx`;
        const filePath = `public/whatsapp-logs/${fileName}`;
        await workbook.xlsx.writeFile(filePath);
    } catch (err) {
        logger.error("Errored Happened while sending whatsapp message");
        logger.error(err.message);
    }
};

const Timer = (ms) => new Promise((res) => setTimeout(res, ms));

// * sending whatsapp message
const sendWhatsAppMessage = async (user, template, templateName) => {
    if (!user?.metaData?.countryCode)
        return {
            ok: false,
            msg: "Country Code not found",
        };
    if (!user?.metaData?.phone)
        return {
            ok: false,
            msg: "Phone Number not found",
        };

    let phoneNumber = user?.metaData?.countryCode + user?.metaData?.phone;
    if (!phoneNumber.includes("+")) phoneNumber = "+" + phoneNumber;

    let bodyValues = [];
    let headerValues = [];

    if (template.headerType == "text") headerValues.push(template.headerText);
    else if (template.headerType == "image") headerValues.push(template.imageUrl);

    template.bodyVariables.map(function (key) {
        let keys = key.split(".");
        let value = user;
        for (let i = 0; i < keys.length; i++) {
            value = value[keys[i]];
        }
        bodyValues.push(value);
    });

    const body = {
        fullPhoneNumber: phoneNumber,
        callbackData: "callback Data",
        type: "Template",
        template: {
            name: templateName,
            languageCode: "en_US",
        },
    };

    if (template.headerType == "text") body.template.headerValues = headerValues;
    else if (template.headerType == "image") body.template.headerValues = [headerValues];
    if (bodyValues.length > 0) body.template.bodyValues = bodyValues;

    const url = "https://api.interakt.ai/v1/public/message/";
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Basic ${process.env.INTERACT_KEY}`,
    };
    try {
        logger.info("Sending Whatsapp Message to " + phoneNumber + " " + JSON.stringify(body));
        const bodyData = JSON.stringify(body);
        const response = await axios.post(url, bodyData, { headers });
        const data = response.data;
        logger.info("Whatsapp Message Sent" + phoneNumber + " " + JSON.stringify(data));
        if (data.result)
            return {
                ok: true,
                data,
            };
        else
            return {
                ok: false,
                msg: data.message,
            };
    } catch (err) {
        logger.error("Errored " + phoneNumber + " " + err);
        return {
            ok: false,
            msg: err.message,
        };
    }
};
