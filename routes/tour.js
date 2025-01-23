const express = require("express")
const { handleCreateTour, handleGetAllTours, handleUpdateTour, handleDeleteTour, handleGetTourByID, handleGetAllAgenciesTours, handleAddTourToFavourite, handleGetAllFavouriteTours, handleRemoveTourFromFavourite } = require("../controllers/tour")
const { upload } = require("../middlewares/upload")
const { handleAuthorizeUserByRole, handleGetUserByAuthToken } = require("../middlewares/auth")
const router = express.Router()

router.post("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), upload.fields([{ name: "photos", maxCount: 5 }]), handleCreateTour)
router.get("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), handleGetAllTours)
router.get("/:tourId", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), handleGetTourByID)
router.patch("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), upload.fields([{ name: "photos", maxCount: 5 }]), handleUpdateTour)
router.delete("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), handleDeleteTour)
router.get("/agency/all", handleGetUserByAuthToken, handleAuthorizeUserByRole(["CUSTOMER"]), handleGetAllAgenciesTours)
router.patch("/addToFavourite", handleGetUserByAuthToken, handleAuthorizeUserByRole(["CUSTOMER"]), handleAddTourToFavourite)
router.get("/customer/favouriteTours", handleGetUserByAuthToken, handleAuthorizeUserByRole(["CUSTOMER"]), handleGetAllFavouriteTours)
router.delete("/removeFromFavourite", handleGetUserByAuthToken, handleAuthorizeUserByRole(["CUSTOMER"]), handleRemoveTourFromFavourite)

module.exports = router