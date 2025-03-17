const mongoose = require("mongoose")

const agenntSchema = mongoose.Schema({
    name: String,
    city: String,
    state: String,
    ticketsAvailable: [],
    otherServices: [],
    caption: String,
    mobileNumbers: [],
    officeAddress: String,
    coverPhotos: [],
    profilePhoto: String,
}, {timestamps: true})

const agent = mongoose.model("agent", agenntSchema)
module.exports = agent