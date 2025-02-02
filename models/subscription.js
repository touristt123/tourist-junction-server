const mongoose = require("mongoose")

const subscriptionSchema = mongoose.Schema({
    agency: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    plan: {
        type: String,
        enum: ['BASIC', 'STANDARD', 'PREMIUM'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    monthlyRenewals: {
        type: Number,
        default: 0
    },
    yearlyRenewals: {
        type: Number,
        default: 0  
    },
    isValid: {
        type: Boolean,
        default: true
    },
    razorpaySubscriptionId: { 
        type: String,
        required: true
    },
});

const subscription = mongoose.model('subscription', subscriptionSchema);
module.exports = subscription