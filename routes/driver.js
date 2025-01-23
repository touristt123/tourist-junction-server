const express = require("express")
const { handleCreateDriver, handleGetAllDrivers, handleDeleteDriver, handleUpdateDriver, handleGetAllAvailableDrivers } = require("../controllers/driver")
const { upload } = require("../middlewares/upload")
const { handleAuthorizeUserByRole, handleGetUserByAuthToken } = require("../middlewares/auth")
const router = express.Router()

router.post("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), upload.fields([{name : "license", maxCount : 1}, {name : "photo", maxCount : 1}, {name : "aadharCard", maxCount : 1}]), handleCreateDriver)
router.get("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), handleGetAllDrivers)
router.delete("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), handleDeleteDriver)
router.patch("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]),  upload.fields([{name : "license", maxCount : 1}, {name : "photo", maxCount : 1}, {name : "aadharCard", maxCount : 1}]), handleUpdateDriver)
router.get("/all", handleGetAllAvailableDrivers)

module.exports = router


