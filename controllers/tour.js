const tour = require("../models/tour")
const { user, customer } = require("../models/user")

async function handleCreateTour(req, res) {
    try {
        if (req.files) {
            for (const key of Object.keys(req.files)) {
                if (req.files[key] && req.files[key].length > 0) {
                    req.body[key] = [];
                    for (const file of req.files[key]) {
                        if (file.location) {
                            req.body[key].push(file.location);
                        }
                    }
                }
            }
        }
        const { name, location, departureDate, arrivalDate, description, amenities, travellingWith, lastDateToBook, experience, mobileNumbers, acceptedCities, officeAddress, price, photos } = req.body;
        const foundAgency = await user.findById(req.data._id)
        const createdTour = await tour.create({ name, location, departureDate, arrivalDate, description, amenities, travellingWith, lastDateToBook, experience, mobileNumbers, acceptedCities, officeAddress, price, photos, agencyName: foundAgency.companyName })

        foundAgency.tours.push(createdTour)
        await foundAgency.save()

        return res.status(201).json({
            success: true,
            data: createdTour
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleGetAllTours(req, res) {
    try {
        const foundUser = await user.findById(req.data._id).populate({
            path: "tours",
            options: { sort: { createdAt: -1 } }
        })
        if (!foundUser.tours) {
            return res.status(400).json({
                success: false,
                message: "Could not find tours of this agency"
            })
        }
        return res.status(200).json({
            success: true,
            data: foundUser.tours
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleUpdateTour(req, res) {
    try {
        const { tourId } = req.query
        if (!tourId) {
            return res.status(400).json({
                success: false,
                message: "Provide the ID of tour to update it"
            })
        }
        if (req.files) {
            for (const key of Object.keys(req.files)) {
                if (req.files[key] && req.files[key].length > 0) {
                    req.body[key] = [];
                    for (const file of req.files[key]) {
                        if (file.location) {
                            req.body[key].push(file.location);
                        }
                    }
                }
            }
        }
        const updatedTour = await tour.findByIdAndUpdate(tourId, req.body, { new: true })


        return res.status(200).json({
            success: true,
            data: updatedTour
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleDeleteTour(req, res) {
    try {
        const { tourId } = req.query
        if (!tourId) {
            return res.status(400).json({
                success: false,
                message: "Provide tour ID to Delete"
            })
        }

        await tour.findByIdAndDelete(tourId)
        return res.status(200).json({
            success: true,
            message: "Tour deleted"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleGetTourByID(req, res) {
    try {
        const { tourId } = req.params
        if (!tourId) {
            return res.status(400).json({
                success: false,
                message: "Provide tour ID to Delete"
            })
        }

        const foundTour = await tour.findById(tourId)
        return res.status(200).json({
            success: true,
            data: foundTour
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleGetAllAgenciesTours(req, res) {
    try {
        const foundTours = await tour.find({}).sort({ createdAt: -1 })
        if (!foundTours) {
            return res.status(400).json({
                success: false,
                message: "Could not find tours"
            })
        }
        const customer = await user.findById(req.data._id)
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: "Customer not found",
            });
        }

        // Default to an empty array if favouriteTours is undefined
        const favoriteTourIds = new Set((customer?.favouriteTours || []).map(tour => tour.toString()));



        // Map tours and add `isFavorite` field based on the presence in customer's favorite tours
        const toursWithFavorite = foundTours.map(tour => ({
            ...tour.toObject(),
            isFavorite: favoriteTourIds.has(tour._id.toString())
        }));

        return res.status(200).json({
            success: true,
            data: toursWithFavorite
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleAddTourToFavourite(req, res) {
    try {
        const { tourId } = req.query
        if (!tourId) {
            return res.status(400).json({
                success: false,
                message: "Please provide the ID of tour to add to favourites"
            })
        }
        const foundCustomer = await user.findById(req.data._id)
        if (!foundCustomer) {
            return res.status(400).json({
                success: false,
                message: "Login creds not valid"
            })
        }
        const isAlreadyInFavourites = foundCustomer.favouriteTours.filter((ele) => {
            return ele._id.toString() === tourId
        })
        if (isAlreadyInFavourites.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Tour already Favourite"
            })
        }
        foundCustomer.favouriteTours.push(tourId)
        await foundCustomer.save()

        return res.status(200).json({
            success: true,
            data: foundCustomer.favouriteTours
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleGetAllFavouriteTours(req, res) {
    try {
        const foundUser = await customer.findById(req.data._id).populate("favouriteTours")
        if (!foundUser.favouriteTours) {
            return res.status(400).json({
                success: false,
                message: "Could not get the favourite tours"
            })
        }
        return res.status(200).json({
            success: true,
            data: foundUser.favouriteTours
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

async function handleRemoveTourFromFavourite(req, res) {
    try {
        const { tourId } = req.query
        if (!tourId) {
            return res.status(400).json({
                success: false,
                message: "Please provide the ID of tour to add to favourites"
            })
        }
        const foundCustomer = await customer.findById(req.data._id)
        if (!foundCustomer) {
            return res.status(400).json({
                success: false,
                message: "Login creds not valid"
            })
        }
        const updatedFavouriteTours = foundCustomer.favouriteTours.filter((ele) => {
            return ele._id.toString() !== tourId
        })
        foundCustomer.favouriteTours = updatedFavouriteTours
        await foundCustomer.save()

        return res.status(200).json({
            success: true,
            data: foundCustomer.favouriteTours
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


module.exports = {
    handleCreateTour,
    handleGetAllTours,
    handleUpdateTour,
    handleDeleteTour,
    handleGetTourByID,
    handleGetAllAgenciesTours,
    handleAddTourToFavourite,
    handleGetAllFavouriteTours,
    handleRemoveTourFromFavourite
}