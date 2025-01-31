const express = require("express");
const router = express.Router()
const { handleCreateSubscription, handleRenewSubcription, handleVerifyOrder, handleCreateOrder, handleCreateRazorPaySubscription, handleRenew, handleFailure } = require("../controllers/subscription");
const { handleGetUserByAuthToken } = require("../middlewares/auth");


router.post('/', handleGetUserByAuthToken, handleCreateSubscription);
router.patch("/:subscriptionId", handleGetUserByAuthToken, handleRenewSubcription)
router.post('/verify', handleGetUserByAuthToken, handleVerifyOrder);
router.post("/createOrder", handleGetUserByAuthToken, handleCreateOrder)
router.post("/createSubscription", handleGetUserByAuthToken, handleCreateRazorPaySubscription)

router.post("/webhook-renew", handleGetUserByAuthToken, handleRenew);
router.post("/webhook-failure", handleGetUserByAuthToken, handleFailure);


module.exports = router