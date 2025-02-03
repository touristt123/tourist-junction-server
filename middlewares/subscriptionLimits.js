const { user } = require("../models/user")
const { subscriptionPlans } = require("../constants/constants")
const jwt = require("jsonwebtoken")


const checkVehicleLimit = item => {

    return async (req, res, next) => {
        try {
            const { authtoken } = req.headers
            if (!authtoken) {
                return res.status(400).json({
                    success: false,
                    message: "Login with correct creds"
                })
            }
            const data = jwt.verify(authtoken, process.env.JWT_SECRET)
            const foundUser = await user.findById(data._id).populate("subscription")
            console.log("bahir");
            
            
            if (item === "vehicle") {
                const subscriptionPlan = subscriptionPlans[foundUser.subscription.plan]
                if (foundUser.vehicles.length >= subscriptionPlan.noOfVehicles) {
                    return res.status(400).json({
                        success: false,
                        message: "You have reached your vehicle limit"
                    })
                }
            }

            next()
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            })
        }
    }
}

module.exports = {
    checkVehicleLimit
}