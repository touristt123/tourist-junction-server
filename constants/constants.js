const ratingMessages = [
    {
        rating: 1,
        message: "very bad"
    },
    {
        rating: 2,
        message: "bad"
    },
    {
        rating: 3,
        message: "average"
    },
    {
        rating: 4,
        message: "good"
    },
    {
        rating: 5,
        message: "very good"
    },
]

const subscriptionPlans = {
    BASIC: {
        duration: 2592000, // seconds
        price: 499, // price in your INR
        noOfVehicles: 4,
        id: process.env.RAZORPAY_BASIC_PLAN_ID
    },
    STANDARD: {
        duration: 2592000, // seconds
        price: 999, // price in your INR
        noOfVehicles: 8,
        id: process.env.RAZORPAY_STANDARD_PLAN_ID
    },
    PREMIUM: {
        duration: 2592000, // seconds
        price: 1999, // price in your INR
        noOfVehicles: 16,
        id: process.env.RAZORPAY_PREMIUM_PLAN_ID
    }
};

module.exports = {
    ratingMessages,
    subscriptionPlans
}