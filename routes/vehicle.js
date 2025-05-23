const express = require("express")
const { handleCreateVehicle, handleGetAllVehicles, handleDeleteVehicle, handleUpdateVehicle, handleUpdateTruck, handleGetAllVehiclesByVehicleType, handleGetRentVehicles, handleGetSellVehicles, handleAddDocuments, handleGetVehicleById, handleDeleteDocuments, handleGetAllVehiclesImages, handleAddVehicleToFavourite, handleGetAllFavouriteVehicles, handleRemoveVehicleFromFavourite } = require("../controllers/vehicle")
const { upload } = require("../middlewares/upload")
const { handleGetUserByAuthToken, handleAuthorizeUserByRole } = require("../middlewares/auth")
const { checkVehicleLimit } = require("../middlewares/subscriptionLimits")
const router = express.Router()

router.post("/",handleGetUserByAuthToken, upload.fields([{ name: "photos", maxCount: 5 }]), checkVehicleLimit("vehicle"), handleCreateVehicle)
router.get("/:vehicleType",handleGetUserByAuthToken, handleGetAllVehiclesByVehicleType)
router.get("/purpose/RENT", handleGetRentVehicles)
router.get("/purpose/SELL", handleGetSellVehicles)
router.get("/", handleGetUserByAuthToken, handleGetAllVehicles)
router.get("/all/photos",handleGetUserByAuthToken, handleGetAllVehiclesImages)
router.get("/id/:vehicleId",handleGetUserByAuthToken, handleGetVehicleById)
router.delete("/",handleGetUserByAuthToken, handleDeleteVehicle),
router.patch("/",handleGetUserByAuthToken, upload.fields([{ name: "photos", maxCount: 5 }]), handleUpdateVehicle)
router.patch("/addDocuments",handleGetUserByAuthToken, upload.fields([{ name: "RC", maxCount: 1 }, { name: "Permit", maxCount: 1 }, { name: "Fitness", maxCount: 1 }, { name: "Tax", maxCount: 1 }, { name: "Insurance", maxCount: 1 } ,{ name: "PUC", maxCount: 1 }]), handleAddDocuments)
router.delete("/deleteDocuments",handleGetUserByAuthToken, handleDeleteDocuments)
router.patch("/truck",handleGetUserByAuthToken, upload.fields([{ name: "photos", maxCount: 5 }]), handleUpdateTruck)
router.patch("/addToFavourite", handleGetUserByAuthToken, handleAuthorizeUserByRole(["CUSTOMER"]), handleAddVehicleToFavourite)
router.get("/customer/favouriteVehicles", handleGetUserByAuthToken, handleAuthorizeUserByRole(["CUSTOMER"]), handleGetAllFavouriteVehicles)
router.delete("/removeFromFavourite", handleGetUserByAuthToken, handleAuthorizeUserByRole(["CUSTOMER"]), handleRemoveVehicleFromFavourite)

module.exports = router