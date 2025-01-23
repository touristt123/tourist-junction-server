const { ratingMessages } = require("../constants/constants");
const technician = require("../models/technician");
const { user, agency } = require("../models/user");
const { sendSms } = require("../utils/sms");

async function handleCreateTechnician(req, res) {
    try {
        const { technicianType, name, mobileNumber, alternateNumber, vehicleType, state, city } = req.body
        if (!technicianType || !name || !mobileNumber || !alternateNumber || !vehicleType || !state || !city) {
            return res.status(400).json({
                success: false,
                message: "Please provide all the fields"
            })
        }

        if (mobileNumber.length < 10 || mobileNumber.length > 12 || alternateNumber.length < 10 || alternateNumber.length > 12) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid Number"
            })
        }

        if (!["MECHANIC", "ELECTRICIAN", "SPAREPARTSHOP", "SPRINGWORK", "BATTERYSERVICES", "VEHICLEBODYREPAIR", "CRANESERVICES"].includes(technicianType)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid technician type"
            })
        }
        if (!["ALL", "CAR", "BUS", "TRUCK", "TAMPO"].includes(vehicleType)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid vehicle type"
            })
        }

        const createdTechnician = await technician.create({ technicianType, name, mobileNumber, alternateNumber, vehicleType, state, city })
        const updatedUser = await user.findByIdAndUpdate(req.data._id, { $push: { technicians: createdTechnician } }, { new: true })
        const smsResponse = await sendSms(createdTechnician?.mobileNumber, `Tourist Junction mein aapka swagat hai! Dear ${createdTechnician.name}, We are delighted to welcome you as a registered technician on Tourist Junction! Your expertise in [Service Type: ${createdTechnician.technicianType}] is now part of our platform, supporting vehicle owners across India whenever needed. With your successful registration, you are now connected to a trusted network of service providers, always ready to assist our users. Thank you for joining us and becoming a valuable part of our journey. Lets work together to make a difference! If, for any reason, you do not wish to work with us, please WhatsApp us at 77448 04213. Warm regards, Team Tourist Junction`, process.env.DLT_TECHNICIAN_CREATION_TEMPLATE_ID)

        return res.status(201).json({
            success: true,
            data: createdTechnician,
            smsResponse
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleGetAllTechnicians(req, res) {
    try {
        const { page = 1, vehicleType, city, state, technicianType } = req.query; 
        const pageSize = 100; 

        
        let filter = {};

        if (vehicleType) {
            filter.vehicleType = vehicleType;
        }
        if (city) {
            filter.city = { $regex: city, $options: 'i' };
        }
        if (state) {
            filter.state = { $regex: state, $options: 'i' }; 
        }
        if (technicianType) {
            filter.technicianType = { $regex: technicianType, $options: 'i' }
        }

        const foundTechnicians = await technician.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * pageSize)
            .limit(pageSize);

        
        return res.status(200).json({
            success: true,
            count: foundTechnicians.length,
            data: foundTechnicians
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleDeleteTechnician(req, res) {
    try {
        const { technicianId } = req.query
        if (!technicianId) {
            return res.status(400).json({
                success: false,
                message: "Provide ID of technician to delete"
            })
        }
        const foundTechnician = await technician.findById(technicianId)
        if (!foundTechnician) {
            return res.status(400).json({
                success: false,
                message: "Provide a valid technician ID"
            })
        }
        await technician.findByIdAndDelete(technicianId)
        await user.findByIdAndUpdate(req.data._id, { $pull: { technician: technicianId } }, { new: true })
        return res.status(200).json({
            success: true,
            message: "Technician Deleted"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

async function handleUpdateTechnician(req, res) {
    try {

        const { technicianId } = req.query
        if (!technicianId) {
            return res.status(400).json({
                success: false,
                message: "Provide the ID of technician to update"
            })
        }
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Provide the updated technician"
            })
        }
        const updatedTechnician = await technician.findByIdAndUpdate(technicianId, req.body, { new: true })
        const smsResponse = await sendSms(updatedTechnician?.mobileNumber, `Tourist Junction mein aapka swagat hai! Dear ${updatedTechnician.name}, We are delighted to welcome you as a registered technician on Tourist Junction! Your expertise in [Service Type: ${updatedTechnician.technicianType}] is now part of our platform, supporting vehicle owners across India whenever needed. With your successful registration, you are now connected to a trusted network of service providers, always ready to assist our users. Thank you for joining us and becoming a valuable part of our journey. Lets work together to make a difference! If, for any reason, you do not wish to work with us, please WhatsApp us at 77448 04213. Warm regards, Team Tourist Junction`, process.env.DLT_TECHNICIAN_CREATION_TEMPLATE_ID)

        return res.status(200).json({
            success: true,
            data: updatedTechnician,
            smsResponse,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleGetTechnicianById(req, res) {
    try {
        const { technicianId } = req.params
        if (!technicianId) {
            return res.status(400).json({
                success: false,
                message: "Provide the technician Id to find the technician"
            })
        }
        if (req.data.role === "AGENCY" || "MANAGER" || "OFFICE-BOY") {
            const foundUser = await user.findById(req.data._id).populate("technicians")
            const filteredTechnician = foundUser?.technicians.filter(technician => technician._id.toString() === technicianId)[0]
            return res.status(200).json({
                success: true,
                data: filteredTechnician
            })
        }
        const foundTechnician = await technician.findById(technicianId)
        return res.status(200).json({
            success: true,
            data: foundTechnician
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


async function handleGiveRating(req, res) {
    try {
        const { rating } = req.body
        const { technicianId } = req.query
        if (!technicianId) {
            return res.status(400).json({
                success: false,
                message: "Please provide the ID of technician to give rating"
            })
        }
        if (!rating) {
            return res.status(400).json({
                success: false,
                message: "Provide all the fields"
            })
        }

        const foundAgency = await agency.findById(req.data._id)
        const ratingObj = ratingMessages.filter((ele) => ele.rating === Number(rating))[0]
        const foundTechnician = await technician.findById(technicianId)

        foundTechnician.avgRating = foundTechnician.ratings.length > 0 ? (foundTechnician.ratings.length * foundTechnician.avgRating + Number(rating)) / (foundTechnician.ratings.length + 1) : Number(rating)
        foundTechnician.ratings.push({ ...ratingObj, agency: foundAgency })
        await foundTechnician.save()

        return res.status(200).json({
            success: true,
            data: foundTechnician
        })


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = {
    handleGetAllTechnicians,
    handleCreateTechnician,
    handleDeleteTechnician,
    handleUpdateTechnician,
    handleGetTechnicianById,
    handleGiveRating
}