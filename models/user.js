const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    userName: {
        type: String,
        unique: false,
        required: true
    },
    companyName: {
        type: String,
        // required: true
    },
    mobileNumber: {
        type: String,
        required: true
    },
    whatsappNumber: {
        type: String,
    },
    state: {
        type: String,
    },
    city: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["ADMIN", "AGENCY", "CUSTOMER"]
    },
    drivers: {
        type: [{ type: mongoose.Types.ObjectId, ref: "driver" }],
    },
    employees: {
        type: [{ type: mongoose.Types.ObjectId, ref: "employee" }],
    },
    technicians: {
        type: [{ type: mongoose.Types.ObjectId, ref: "technician" }],
    },
    cleaners: {
        type: [{ type: mongoose.Types.ObjectId, ref: "cleaner" }],
    },
    vehicles: {
        type: [{ type: mongoose.Types.ObjectId, ref: "vehicle" }],
    },
    dailyRoutes: {
        type: [{ type: mongoose.Types.ObjectId, ref: "dailyRoute" }],
    },
    busRoutes: {
        type: [{ type: mongoose.Types.ObjectId, ref: "busRoute" }],
    },
    ticketRequests: {
        type: [{ type: mongoose.Types.ObjectId, ref: "ticketRequest" }]
    },
    tourRequests: {
        type: [{ type: mongoose.Types.ObjectId, ref: "tourRequest" }]
    },
    packageBookings: {
        type: [{ type: mongoose.Types.ObjectId, ref: "packageBooking" }],
    },
    services: {
        type: [{ type: mongoose.Types.ObjectId, ref: "service" }],
    },
    tours: {
        type: [{ type: mongoose.Types.ObjectId, ref: "tour" }]
    },
    emptyVehicles: {
        type: [{ type: mongoose.Types.ObjectId, ref: "emptyVehicle" }]
    },
    isVerified: {
        type: Boolean,
    },
    verificationOtp: {
        type: String,
    },
    resetPasswordOtp: {
        type: String,
    },
    isResetPasswordOtpVerified: {
        type: Boolean,
    },
}, { timestamps: true })

const agencySchema = mongoose.Schema({
    isSubsciptionValid: {
        type: Boolean,
        default: false
    },
    subscription: {
        type: mongoose.Types.ObjectId,
        ref: 'subscription',
    },
    trialValidTill: Date,
})

const customerSchema = mongoose.Schema({
    favouriteTours: {
        type: [{ type: mongoose.Types.ObjectId, ref: "tour" }],
        default: [],
    },
    favouriteBusRoutes: {
        type: [{ type: mongoose.Types.ObjectId, ref: "busRoute" }],
        default: [],
    },
    favouriteVehicles: {
        type: [{ type: mongoose.Types.ObjectId, ref: "vehicle" }],
        default: [],
    }
})

userSchema.set("discriminatorKey", "type")

const user = mongoose.model("user", userSchema);
const agency = user.discriminator("AGENCY", agencySchema)
const admin = user.discriminator("ADMIN", userSchema)
const customer = user.discriminator("CUSTOMER", customerSchema)

module.exports = {
    user,
    agency,
    admin,
    customer
}