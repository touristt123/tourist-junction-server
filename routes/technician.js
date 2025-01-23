const express = require("express")
const { handleGetAllTechnicians, handleCreateTechnician, handleDeleteTechnician, handleUpdateTechnician, handleGetTechnicianById, handleGiveRating } = require("../controllers/technician")
const { handleGetUserByAuthToken, handleAuthorizeUserByRole } = require("../middlewares/auth")
const router = express.Router()

router.post("/",handleGetUserByAuthToken, handleCreateTechnician)
router.get("/", handleGetAllTechnicians)
router.get("/:technicianId",handleGetUserByAuthToken, handleGetTechnicianById)
router.delete("/",handleGetUserByAuthToken, handleDeleteTechnician)
router.patch("/",handleGetUserByAuthToken, handleUpdateTechnician)
router.patch("/rating", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "MANAGER", "OFFICE-BOY"]), handleGiveRating)

module.exports = router