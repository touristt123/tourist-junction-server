const express = require("express")
const { handleGetUserByAuthToken, handleAuthorizeUserByRole } = require("../middlewares/auth")
const { handleGetAllTicketRequests, handleCreateTicketRequest } = require("../controllers/ticketRequest")
const router = express.Router()

router.post("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["CUSTOMER"]), handleCreateTicketRequest)
router.get("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY"]), handleGetAllTicketRequests)

module.exports = router