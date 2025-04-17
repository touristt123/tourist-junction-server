const mongoose = require("mongoose");
const { customer, agency, user } = require("../models/user");
const { sendSms } = require("../utils/sms");
const driver = require("../models/driver");
const technician = require("../models/technician");

async function handleSendCustomerInterestSmsToAgency(req, res) {
    try {
        const { serviceId, title } = req.body;

        if (!serviceId || !title) {
            return res.status(400).json({
                success: false,
                message: "Fill all the fields"
            })
        }

        const foundCustomer = await customer.findById(req.data._id);

        const serviceIdObj = new mongoose.Types.ObjectId(serviceId);
        const foundAgency = await agency.findOne({
            $or: [
                { busRoutes: { $in: [serviceIdObj] } },
                { tours: { $in: [serviceIdObj] } }
            ]
        });

        if (!foundAgency) {
            return res.status(400).json({
                success: false,
                message: "No agency found with this service"
            });
        }

        const smsResponse = await sendSms(foundAgency.mobileNumber,
            `Dear ${foundAgency.userName}, A customer has shown interest in your travel services. Customer Name: ${foundCustomer.userName} Phone Number: ${foundCustomer.mobileNumber} Clicked On: ${title} Best regards, Tourist Junction Pvt. Ltd.`,
            process.env.DLT_CUSTOMER_INTEREST_IN_TRAVEL_SERVICE,
            8,
            1
        );

        return res.status(200).json({
            success: true,
            smsResponse,
            message: "SMS sent to agency successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
}

async function handleSendInterestSmsToDriverOrTechnician(req, res) {
    try {
        const { id } = req.body;

        let person = await driver.findById(id);

        if (!person) {
            person = await technician.findById(id);
        }

        if (!person) {
            return res.status(404).json({
                success: false,
                message: "Driver or Technician not found"
            });
        }
        const foundUser = await user.findById(req.data._id)

        const smsResponse = await sendSms(person.mobileNumber,
            `Hello ${person.name}, Someone has requested your contact through the Tourist Junction app. Name: ${foundUser.userName} Phone Number: ${foundUser.mobileNumber} Clicked on: ${"you card"} Regards, Tourist Junction Pvt. Ltd.`,
            process.env.DLT_USER_INTEREST_IN_DRIVER_TECHNICIAN,
            8,
            1
        );

        return res.status(200).json({
            success: true,
            smsResponse,
            message: `Person found and SMS sent successfully`
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
}

module.exports = {
    handleSendCustomerInterestSmsToAgency,
    handleSendInterestSmsToDriverOrTechnician
};
