const mongoose = require("mongoose")

const tourRequestSchema = mongoose.Schema({
    customer: {
        userName: String,
        mobileNumber: String
    },
    // dateOfJourney: {
    //     type: Date,
    //     required: true      
    // },
    numberOfPeople: {
        type: Number,
        required: true
    },
    passengerGender: {
        type: String,
        enum: ["MALE", "FEMALE", "FAMILY"],
    },
    tour: {
        type: mongoose.Types.ObjectId,
        ref: "tour",
        required: true
    }
}, { timestamps: true })

const tourRequest = mongoose.model("tourRequest", tourRequestSchema)
module.exports = tourRequest