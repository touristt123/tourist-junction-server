const mongoose = require("mongoose")

// const tourSchema = mongoose.Schema({
//     name: String,
//     location: String,
//     officeAddress: String,
//     agencyName: String,
//     primaryMobileNumber: String,
//     secondaryMobileNumber: String,
//     photos: [String],
// }, { timestamps: true })

const tourSchema = mongoose.Schema({
    name: String,
    location: String,
    agencyName: String,
    departureDate: Date,
    arrivalDate: Date,
    description: String,
    amenities: {
        type: [String],
    },
    travellingWith: {
        type: [String],
    },
    lastDateToBook: Date,
    experience: String,
    mobileNumbers: [String],
    officeAddress: String,
    price: {
        forPerson: Number,
        forCouple: Number,
    },
    acceptedCities: [String],
    photos: [String],

}, { timestamps: true })

const tour = mongoose.model("tour", tourSchema)
module.exports = tour