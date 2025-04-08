const cron = require('node-cron');
const { agency } = require("../models/user");
const subscription = require('../models/subscription');
const busRoute = require('../models/busRoute');


module.exports = () => {
    cron.schedule('0 1 * * *', async () => {
        try {
            const now = new Date();
            const expiredSubscriptions = await subscription.find({ endDate: { $lt: now }, isValid: true });
            // console.log("cron running");
            if (expiredSubscriptions.length < 1) {
                return;
            }
            // console.log(expiredSubscriptions);
            expiredSubscriptions.forEach(async (subscription) => {
                // handle expired subscription (e.g., deactivate agency)
                await handleExpiredSubscription(subscription);
            });

            const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));

            const expiredTrialAgencies = await agency.find({
                subscription: { $exists: false },
                trialValidTill: { $lte: now, $gte: twoDaysAgo },
            });

            if (expiredTrialAgencies.length > 0) {
                expiredTrialAgencies.forEach(async (trialAgency) => {
                    await handleDeActivateBusRoutes(trialAgency.busRoutes);
                });
            }
        } catch (error) {
            console.error("Error in cron job:", error.message);
        }
    });
}

async function handleExpiredSubscription(subscription) {
    const foundAgency = await agency.findById(subscription.agency._id);
    if (foundAgency) {
        console.log(foundAgency.isSubsciptionValid);
        foundAgency.isSubsciptionValid = false;
        await foundAgency.save();
        await handleDeActivateBusRoutes(foundAgency.busRoutes)
    }
    subscription.isValid = false
    await subscription.save()
}

async function handleDeActivateBusRoutes(routeIds) {
    if (routeIds.length < 1) {
        return;
    }
    routeIds.map(async (id) => {
        await busRoute.findByIdAndUpdate(id, { isActive: false })
    })
}

