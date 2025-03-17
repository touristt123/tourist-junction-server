const express = require("express")
const { upload } = require("../middlewares/upload")
const { handleAuthorizeUserByRole, handleGetUserByAuthToken } = require("../middlewares/auth")
const { handleCreateAgent, handleGetAllAgents, handleDeleteAgent, handleUpdateAgent, handleGetAllAvailableAgents } = require("../controllers/agent")
const router = express.Router()

router.post("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), upload.fields([{name : "coverPhotos", maxCount : 5}, {name : "profilePhoto", maxCount : 1}]), handleCreateAgent)
router.get("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), handleGetAllAgents)
router.get("/all", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), handleGetAllAvailableAgents)
router.delete("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), handleDeleteAgent)
router.patch("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), upload.fields([{name : "coverPhotos", maxCount : 5}, {name : "profilePhoto", maxCount : 1}]), handleUpdateAgent)

module.exports = router