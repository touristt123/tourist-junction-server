const express = require("express")
const { upload } = require("../middlewares/upload")
const { handleCreateService, handleUpdateService, handleGetAllServices, handleDeleteService } = require("../controllers/vehicleService")
const { handleGetUserByAuthToken, handleAuthorizeUserByRole } = require("../middlewares/auth")
const router = express.Router()

router.post("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), upload.fields([{ name: "bill", maxCount: 5 }]), handleCreateService)
router.get("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), handleGetAllServices)
router.delete("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), handleDeleteService)
router.patch("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), upload.fields([{ name: "bill", maxCount: 5 }]), handleUpdateService)

module.exports = router