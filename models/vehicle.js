const mongoose = require("mongoose")

const documentSchema = mongoose.Schema({
    document: {
        type: String,
        required: true,
        trim: true
    },
    expiry: {
        type: Date
    },
    isNotified: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const vehicleSchema = mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    number: {
        type: String,
        required: true,
        unique: true
    },
    seatingCapacity: {
        type: Number,
    },
    model: {
        type: String,
    },
    bodyType: {
        type: String,
    },
    chassisBrand: {
        type: String,
    },
    location: {
        type: String,
    },

    contactNumber: {
        type: String,
    },
    photos: {
        type: [String]
    },
    isAC: {
        type: Boolean,
        required: true
    },
    isForRent: {
        type: Boolean,
        required: true
    },
    isForSell: {
        type: Boolean,
        required: true
    },
    sellDescription: String,
    type: {
        type: String,
        enum: ["CAR", "TRUCK", "BUS", "TAMPO"]
    },
    RC: documentSchema,
    Insurance: documentSchema,
    Permit: documentSchema,
    Fitness: documentSchema,
    Tax: documentSchema,
    PUC: documentSchema,
    services: {
        type: [{ type: mongoose.Types.ObjectId, ref: "service" }]
    }
}, { timestamps: true })

const truckSchema = mongoose.Schema({
    noOfTyres: {
        type: Number,
    },
    vehicleWeightInKGS: {
        type: Number,
    }
})

const busSchema = mongoose.Schema({
    isSeatPushBack: Boolean,
    isLuggageSpace: Boolean,
    isSleeper: Boolean,
    curtain: Boolean,
    amenities: [],
})

const carSchema = mongoose.Schema({
    name: {
        type: String,
    },
})

vehicleSchema.set("discriminatorKey", "type")

const vehicle = mongoose.model("vehicle", vehicleSchema)
const truck = vehicle.discriminator("TRUCK", truckSchema)
const car = vehicle.discriminator("CAR", carSchema)
const bus = vehicle.discriminator("BUS", busSchema)
const tampo = vehicle.discriminator("TAMPO", vehicleSchema)

module.exports = {
    vehicle,
    truck,
    car,
    bus
}
