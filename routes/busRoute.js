const express = require("express")
const { handleCreateBusRoute, handleGetAllBusRoutes, handleFinalizeBusRoute, handleDeleteBusRoute, handleStartBusRoute, handleUpdateBusRoute, handleGetDriverBusRoutes, handleCompleteBusRoute, handleToggleIsActive, handleGetAllAgenciesBusRoutes, handleBusRouteAddToFavourite, handleGetAllFavouriteBusRoutes, handleBusRouteRemoveFromFavourite } = require("../controllers/busRoute")
const { upload } = require("../middlewares/upload")
const { handleAuthorizeUserByRole, handleGetUserByAuthToken } = require("../middlewares/auth")
const router = express.Router()

router.post("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), upload.fields([{ name: "busPhotos", maxCount: 5 }, { name: "seatingArrangement", maxCount: 1 }, { name: "QR", maxCount: 1 }]), handleCreateBusRoute)
router.get("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), handleGetAllBusRoutes)

// To Test
router.patch("/finalize", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), handleFinalizeBusRoute)
router.patch("/toggleIsActive", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), handleToggleIsActive)
router.delete("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), handleDeleteBusRoute)
router.patch("/", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), upload.fields([{ name: "busPhotos", maxCount: 5 }, { name: "seatingArrangement", maxCount: 1 }, { name: "QR", maxCount: 1 }]), handleUpdateBusRoute)
router.patch("/start", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), upload.fields([{ name: "beforeJourneyPhotos", maxCount: 5 }]), handleStartBusRoute)
router.patch("/complete", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), upload.fields([, { name: "afterJourneyPhotos", maxCount: 5 }]), handleCompleteBusRoute)
router.get("/driver/:driverId", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), handleGetDriverBusRoutes)
router.get("/all", handleGetAllAgenciesBusRoutes)
router.patch("/addToFavourite", handleGetUserByAuthToken, handleAuthorizeUserByRole(["CUSTOMER"]), handleBusRouteAddToFavourite)
router.get("/favouriteBusRoutes", handleGetUserByAuthToken, handleAuthorizeUserByRole(["CUSTOMER"]), handleGetAllFavouriteBusRoutes)
router.delete("/removeFromFavourite", handleGetUserByAuthToken, handleAuthorizeUserByRole(["CUSTOMER"]), handleBusRouteRemoveFromFavourite)


module.exports = router