const { user } = require("../models/user");
const { subscriptionPlans } = require("../constants/constants");
const jwt = require("jsonwebtoken");

const checkVehicleLimit = (item) => {
    return async (req, res, next) => {
        try {
            const { authtoken } = req.headers;
            if (!authtoken) {
                return res.status(400).json({
                    success: false,
                    message: "Login with correct credentials",
                });
            }

            const data = jwt.verify(authtoken, process.env.JWT_SECRET);
            const foundUser = await user.findById(data._id).populate("subscription");

            if (!foundUser) {
                return res.status(400).json({
                    success: false,
                    message: "User not found",
                });
            }

            // Check trial period validity
            if (
                Date.now() <= new Date(foundUser?.trialValidTill).getTime() &&
                foundUser.vehicles.length <= 4
            ) {
                return next();
            }

            if (item === "vehicle") {
                if (!foundUser.subscription || !foundUser.subscription.plan) {
                    return res.status(400).json({
                        success: false,
                        message: "No active subscription found",
                    });
                }

                const subscriptionPlan = subscriptionPlans[foundUser.subscription.plan];

                if (foundUser.vehicles.length >= subscriptionPlan.noOfVehicles) {
                    return res.status(400).json({
                        success: false,
                        message: "You have reached your vehicle limit",
                    });
                }
            }

            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    };
};

module.exports = {
    checkVehicleLimit,
};
