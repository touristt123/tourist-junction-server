const driver = require("../models/driver");
const employee = require("../models/employee");
const { user } = require("../models/user");
const { sendSms } = require("../utils/sms");

async function handleCreateDriver(req, res) {
    try {

        if (req.files) {
            for (const key of Object.keys(req.files)) {
                if (req.files[key][0] && req.files[key][0].location) {
                    req.body[key] = req.files[key][0].location; // Add the URL to req.body
                }
            }
        }

        const { name, password, vehicleType, mobileNumber, city, state, license, photo, aadharCard } = req.body

        if (!name || !password || !vehicleType || !mobileNumber || !city || !state) {
            return res.status(400).json({
                success: false,
                message: "Provide all the fields"
            })
        }
        const alreadyEmployeeWithMobileNumber = await employee.findOne({ mobileNumber })
        const alreadyDriverWithMobileNumber = await driver.findOne({ mobileNumber })
        if (alreadyEmployeeWithMobileNumber || alreadyDriverWithMobileNumber) {
            return res.status(400).json({
                success: false,
                message: "Driver with this phone number already exists"
            })
        }
        if (password.length < 5) {
            return res.status(400).json({
                success: false,
                message: "Password must contain atleast 5 Characters"
            })
        }

        if (!["ALL", "CAR", "BUS", "TRUCK", "TAMPO"].includes(vehicleType)) {
            return res.status(400).json({
                success: false,
                message: "Provide a valid Vehicle Type"
            })
        }
        if (mobileNumber.length < 10 || mobileNumber.length > 12) {
            return res.status(400).json({
                success: false,
                message: "number should be less than 10 and greater than 11"

            })
        }
        const createdDriver = await driver.create({
            name, password, vehicleType, mobileNumber, city, state, license, photo, aadharCard
        })

        const updatedUser = await user.findByIdAndUpdate(req.data._id, { $push: { drivers: createdDriver } }, { new: true })
        const smsResponse = await sendSms(createdDriver.mobileNumber, `Dear ${createdDriver.name}, Aapko ${updatedUser.companyName} ke through Tourist Junction Driver App me register kiya gaya hai. Aapke Login Details: User ID: ${createdDriver.mobileNumber} Password: ${password} Ab aap kya kar sakte hain? 1. Trip Details Access Karein: Aap apni sambandhit agency ke saari trips ke details dekh sakte hain. 2. Trip Management: Har trip ka hisaab rakhein aur uske status ko update karein. 3. Real-Time Updates: Aapko agency ke taraf se mile sabhi updates ka access milega. Login Kaise Karein? 1. Tourist Junction Driver App download karein https://play.google.com/store/apps/details?id=com.touristsjunctions.travel. 2. Apne user ID aur password ka use karke login karein. Ab Apna kaam shuru karein! Aapka, Team Tourist Junction`, process.env.DLT_DRIVER_CREATION_TEMPLATE_ID)

        return res.status(201).json({
            success: true,
            data: createdDriver
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleGetAllDrivers(req, res) {
    
    try {
        if (req.data.role === "AGENCY" || "MANAGER" || "OFFICE-BOY") {
            const foundDrivers = await user.findById(req.data._id).populate({
                path: "drivers",
                options: { sort: { createdAt: -1 } }
            })

            if (!foundDrivers) {
                return res.status(400).json({
                    success: false,
                    message: "Could find drivers"
                })
            }
            return res.status(200).json({
                success: true,
                data: foundDrivers.drivers
            })
        }
        else {
            const foundDrivers = await driver.find({}).sort({ createdAt: -1 })

            if (!foundDrivers) {
                return res.status(400).json({
                    success: false,
                    message: "Could find drivers"
                })
            }
            return res.status(200).json({
                success: true,
                data: foundDrivers
            })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


async function handleDeleteDriver(req, res) {
    try {
        const { driverId } = req.query
        if (!driverId) {
            return res.status(400).json({
                success: false,
                message: "Provide the ID of driver to delete"
            })
        }
        const foundDriver = await driver.findById(driverId)
        if (!foundDriver) {
            return res.status(400).json({
                success: false,
                message: "Provide a valid driver ID"
            })
        }
        await driver.findByIdAndDelete(driverId)
        await user.findByIdAndUpdate(req.data._id, { $pull: { drivers: driverId } }, { new: true })
        return res.status(200).json({
            success: true,
            message: "Driver Deleted"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

async function handleUpdateDriver(req, res) {
    try {
        if (req.files) {
            for (const key of Object.keys(req.files)) {
                if (req.files[key][0] && req.files[key][0].location) {
                    req.body[key] = req.files[key][0].location; // Add the URL to req.body
                }
            }
        }

        const { driverId } = req.query
        // const { updatedDriver } = req.body
        console.log({ bo: req.body });
        if (!driverId) {
            return res.status(400).json({
                success: false,
                message: "Provide the ID of driver to update"
            })
        }
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Provide the updated driver"
            })
        }
        const updatedDriver = await driver.findByIdAndUpdate(driverId, req.body)
        return res.status(200).json({
            success: true,
            data: updatedDriver
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


async function handleGetAllAvailableDrivers(req, res) {
    try {
        const foundDrivers = await driver.find({}).sort({ createdAt: 1 })

        if (!foundDrivers) {
            return res.status(400).json({
                success: false,
                message: "Could find drivers"
            })
        }
        return res.status(200).json({
            success: true,
            count: foundDrivers.length,
            data: foundDrivers
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = {
    handleCreateDriver,
    handleGetAllDrivers,
    handleDeleteDriver,
    handleUpdateDriver,
    handleGetAllAvailableDrivers
}


