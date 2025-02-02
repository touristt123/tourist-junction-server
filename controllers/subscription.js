const crypto = require('crypto');
const { subscriptionPlans } = require("../constants/constants");
const subscription = require("../models/subscription");
const { agency } = require("../models/user");

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZOR_PAY_API_KEY,
    key_secret: process.env.RAZOR_PAY_SECRET
});


async function handleCreateSubscription(req, res) {
    try {
        const { plan, subscriptionId } = req.body;

        const subscriptionPlan = subscriptionPlans[plan];
        if (!subscriptionPlan) {
            return res.status(400).json({
                success: false,
                message: "Provide a valid plan"
            });
        }

        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setSeconds(endDate.getSeconds() + subscriptionPlan.duration);

        const foundAgency = await agency.findById(req.data._id)
        if (!foundAgency) {
            return res.status(400).json({
                success: false,
                message: "Could not find agency with these creds"
            })
        }

        const createdSubscription = await subscription.create({
            agency: foundAgency,
            plan,
            startDate,
            endDate,
            // monthlyRenewals: plan === 'MONTHLY' ? 1 : 0,
            // yearlyRenewals: plan === 'YEARLY' ? 1 : 0,
            isValid: true,
            subscriptionId
        });
        if (!createdSubscription) {
            return res.status(400).json({
                success: false,
                message: "Could not create subscription"
            })
        }
        await agency.findByIdAndUpdate(req.data._id, { isSubsciptionValid: true, subscription: createdSubscription }, { new: true })

        return res.status(201).json({
            success: true,
            data: createdSubscription
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// async function handleCreateOrder(req, res) {
//     try {
//         const { amount, currency, receipt, notes } = req.body;

//         if (!amount || !currency || !receipt) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Provide all the required fields"
//             })
//         }

//         const razorpayOrderOptions = {
//             amount: amount * 100,
//             currency,
//             receipt,
//             notes
//         };
//         const createdOrder = await razorpay.orders.create(razorpayOrderOptions);

//         if (!createdOrder) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Could not create razor pay order"
//             })
//         }
//         return res.status(201).json({
//             success: true,
//             data: createdOrder
//         })

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error
//         })
//     }
// }

// async function handleVerifyOrder(req, res) {
//     try {
//         const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
//         if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Provide all the required fields"
//             })
//         }

//         const body = razorpay_order_id + '|' + razorpay_payment_id;

//         const expectedSignature = crypto
//             .createHmac('sha256', process.env.RAZOR_PAY_SECRET)
//             .update(body.toString())
//             .digest('hex');

//         if (expectedSignature === razorpay_signature) {
//             res.status(200).json({ success: true, message: "Payment Verified" });
//         } else {
//             res.status(400).json({ success: false, message: "Payment Failed" });
//         }
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

async function handleVerifySubscription(req, res) {
    try {
        const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Provide all the required fields: subscription_id, payment_id, and signature."
            });
        }

        // Create a body string for verification
        const body = razorpay_payment_id + "|" + razorpay_subscription_id

        // Generate the expected signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZOR_PAY_SECRET)
            .update(body.toString())
            .digest('hex');

        // Compare the expected signature with the received signature
        if (expectedSignature === razorpay_signature) {
            res.status(200).json({ success: true, message: "Subscription Payment Verified" });
        } else {
            res.status(400).json({ success: false, message: "Subscription Payment Verification Failed" });
        }
    } catch (error) {
        console.error("Error verifying subscription:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during subscription verification. Please try again.",
            error: error.message
        });
    }
}

// async function handleRenewSubcription(req, res) {
//     try {
//         const { plan } = req.body;
//         const { subscriptionId } = req.params

//         const subscriptionPlan = subscriptionPlans[plan];
//         if (!subscriptionPlan) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Provide a Invalid plan"
//             });
//         }

//         const foundSubscription = await subscription.findById(subscriptionId);
//         if (!foundSubscription) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Provide a valid subscription ID"
//             });
//         }
//         const foundAgency = await agency.findById(req.data._id)
//         if (foundAgency.subscription.toString() !== foundSubscription._id.toString()) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Provide a valid subscription id"
//             })
//         }



//         const newEndDate = new Date(foundSubscription.endDate.getTime() + subscriptionPlan.duration * 1000);
//         foundSubscription.endDate = newEndDate;

//         // Track renewals for each plan type

//         // foundSubscription.monthlyRenewals = (plan === 'MONTHLY') ? foundSubscription.monthlyRenewals + 1 : foundSubscription.monthlyRenewals
//         // foundSubscription.yearlyRenewals = (plan === 'YEARLY') ? foundSubscription.yearlyRenewals + 1 : foundSubscription.yearlyRenewals


//         // Update the plan to the new plan
//         foundSubscription.plan = plan;
//         foundAgency.isSubsciptionValid = true

//         await foundAgency.save();
//         await foundSubscription.save();


//         res.status(200).json({
//             success: true,
//             data: foundSubscription
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

// async function handleCreateRazorPaySubscription(req, res) {
//     try {
//         const subOptions = {
//             plan_id: process.env.RAZOR_PAY_TEST_PLAN_ID,
//             customer_notify: 1,
//             total_count: 12,
//         }

//         const createdRazorPaySubscription = await razorpay.subscriptions.create(subOptions);
//         if (!createdRazorPaySubscription) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Could not subscribe to plan"
//             })
//         }

//         return res.status(201).json({
//             success: true,
//             data: createdRazorPaySubscription
//         })

//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

async function handleCreateRazorPaySubscription(req, res) {
    try {
        const { plan } = req.body;
        const foundAgency = await agency.findById(req.data._id);
        const subscriptionPlan = subscriptionPlans[plan]

        if (!foundAgency) {
            return res.status(400).json({ success: false, message: "Agency not found" });
        }

        // Define Razorpay plan ID based on selected plan
        // const razorpayPlanId = plan === 'MONTHLY' ? process.env.RAZORPAY_MONTHLY_PLAN_ID : process.env.RAZORPAY_YEARLY_PLAN_ID;

        // Create a Razorpay subscription
        const razorpaySubscription = await razorpay.subscriptions.create({
            plan_id: subscriptionPlan.id,
            customer_notify: 1,
            total_count: 12,  // Auto-renew for 12 months if monthly, else 1 year
        });

        console.log("Razorpay Subscription Response:", razorpaySubscription);


        if (!razorpaySubscription) {
            return res.status(400).json({ success: false, message: "Could not create Razorpay subscription" });
        }

        // Store subscription in DB
        const createdSubscription = await subscription.create({
            agency: foundAgency,
            plan,
            startDate: new Date(),
            endDate: new Date(Date.now() + subscriptionPlan.duration * 1000),
            razorpaySubscriptionId: razorpaySubscription.id,
            isValid: true
        });

        // Update agency model with the subscription
        await agency.findByIdAndUpdate(req.data._id, { isSubsciptionValid: true, subscription: createdSubscription._id });

        return res.status(201).json({ success: true, data: razorpaySubscription });
    } catch (error) {
        console.log("Error in handleCreateRazorPaySubscription:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}


async function handleRenew(req, res) {
    try {
        const event = req.body;

        if (event.event === "subscription.charged") {
            const { subscription_id } = event.payload.subscription.entity;

            // Fetch the subscription based on Razorpay subscription_id
            const foundSubscription = await subscription.findOne({ razorpaySubscriptionId: subscription_id });

            if (foundSubscription) {
                const subscriptionPlan = subscriptionPlans[foundSubscription.plan];
                foundSubscription.isActive = true;
                foundSubscription.expiryDate = new Date(Date.now() + subscriptionPlan.duration * 1000); // Extend expiry
                await foundSubscription.save();

                // Optionally, update the user's `isSubscriptionValid` field
                await user.findByIdAndUpdate(foundSubscription.userId, { isSubscriptionValid: true });
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
async function handleFailure(req, res) {
    try {
        const event = req.body;

        if (event.event === "subscription.payment_failed") {
            const { subscription_id } = event.payload.subscription.entity;

            // Fetch the subscription
            const foundSubscription = await subscription.findOne({ razorpaySubscriptionId: subscription_id });

            if (foundSubscription) {
                foundSubscription.isActive = false; // Mark as inactive
                await foundSubscription.save();

                // Update the user's `isSubscriptionValid` field
                await user.findByIdAndUpdate(foundSubscription.userId, { isSubscriptionValid: false });
            }
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports = {
    handleCreateSubscription,
    // handleRenewSubcription,
    handleVerifySubscription,
    // handleCreateOrder,
    handleCreateRazorPaySubscription,
    handleRenew,
    handleFailure
}
