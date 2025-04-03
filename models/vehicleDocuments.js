const mongoose = require("mongoose")

const documentSchema = mongoose.Schema({
    document: {
        type: String,
        required: true,
        trim: true
    },
    expiry: {
        type: Date
    }
}, { _id: false });

const vehicleDocumentsSchema = mongoose.Schema({
    vehicleNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    RC: documentSchema,
    Insurance: documentSchema,
    Permit: documentSchema,
    Fitness: documentSchema,
    Tax: documentSchema,
    PUC: documentSchema
}, { timestamps: true })

const vehicleDocuments = mongoose.model("vehicleDocuments", vehicleDocumentsSchema)
module.exports = vehicleDocuments