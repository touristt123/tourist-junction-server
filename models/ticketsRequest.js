const mongoose = require("mongoose")

const ticketRequestSchema = mongoose.Schema({
    customer: {
        type: mongoose.Types.ObjectId,
        ref: "user",
        required: true
    },
    dateOfJourney: {
        type: Date,
        required: true      
    },
    numberOfPeople: {
        type: Number,
        required: true
    },
    passengerGender: {
        type: String,
        enum: ["MALE", "FEMALE", "FAMILY"],
    },
    route: {
        type: mongoose.Types.ObjectId,
        ref: "busRoute",
        required: true
    }

}, { timestamps: true })

const ticketRequest = mongoose.model("ticketRequest", ticketRequestSchema)
module.exports = ticketRequest