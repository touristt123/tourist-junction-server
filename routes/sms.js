const express = require("express")
const { handleGetUserByAuthToken } = require("../middlewares/auth")
const { handleSendCustomerInterestSmsToAgency, handleSendInterestSmsToDriverOrTechnician } = require("../controllers/sms")
const router = express.Router()

router.post("/customerInterest", handleGetUserByAuthToken, handleSendCustomerInterestSmsToAgency)
router.post("/driverTechnicianInterest", handleGetUserByAuthToken, handleSendInterestSmsToDriverOrTechnician)

module.exports = router