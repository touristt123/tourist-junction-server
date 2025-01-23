const tourRequest = require("../models/tourRequest")
const tour = require("../models/tour")
const { user } = require("../models/user")
const { sendSms } = require("../utils/sms")

async function handleCreateTourRequest(req, res) {
    try {
        const { numberOfPeople, passengerGender } = req.body
        const { tourId } = req.query

        if (!numberOfPeople || !passengerGender) {
            return res.status(400).json({
                success: false,
                message: "Kindly fill all the fields"
            })
        }

        if (!tourId) {
            return res.status(400).json({
                success: false,
                message: "Provide the Route ID to request tour"
            })
        }
        const foundCustomer = await user.findById(req.data._id)
        const foundTour = await tour.findById(tourId)

        if (!foundTour) {
            return res.status(400).json({
                success: false,
                message: "Provide a valid tour ID"
            })
        }

        const createdTourRequest = await tourRequest.create({ numberOfPeople, passengerGender, customer: foundCustomer, tour: foundTour })
        const foundAgency = await user.findOne({ tours: tourId })
        if (!foundAgency) {
            return res.status(400).json({
                success: false,
                message: "Could not find the agency"
            })
        }
        foundAgency.tourRequests.push(createdTourRequest)
        await foundAgency.save()

        const smsResponse = await sendSms(foundAgency.mobileNumber, `"Dear ${foundAgency?.mobileNumber}, You have received a tour inquiry from the customer. Details are as follows: Customer Name: ${foundCustomer.userName} Contact Number: ${foundCustomer?.mobileNumber} City: ${foundTour?.location} Selected Tour: ${foundTour?.name} Please contact the customer to assist them further with their inquiry. Thank you!" Tourist Junction Team`, process.env.DLT_TOUR_REQUEST_TEMPLATE_ID)

        return res.status(201).json({
            success: true,
            data: createdTourRequest,
            smsResponse
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


async function handleGetAllTourRequests(req, res) {
    try {
        const foundUser = await user.findById(req.data._id).populate({
            path: "tourRequests",
            options: { sort: { createdAt: -1 } },
            populate: [
                { path: "customer", model: "user" },
                { path: "tour", model: "tour" },
            ]
        })

        if (!foundUser.tourRequests) {
            return res.status(500).json({
                success: false,
                message: "Could not fetch the tour requests"
            })
        }

        return res.status(200).json({
            success: true,
            data: foundUser.tourRequests
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

module.exports = {
    handleCreateTourRequest,
    handleGetAllTourRequests
}