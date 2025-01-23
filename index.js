const express = require("express")
const cors = require("cors")
require("dotenv").config()
const data = require("./data")
const subscriptionCronJob = require("./cron/subscription")
const packageBookingCronJob = require("./cron/packageBookingReminder")
const packageBookingCronJobForAgency = require("./cron/packageBookingReminderForAgency")
const packageBookingCronJobForDriver = require("./cron/packageBookingReminderForDriver")

const driverRoute = require("./routes/driver")
const cleanerRoute = require("./routes/cleaner")
const employeeRoute = require("./routes/employee")
const authRoute = require("./routes/user")
const technicianRoute = require("./routes/technician")
const dailyRouteRoute = require("./routes/dailyRoute")
const vehicleRoute = require("./routes/vehicle")
const packageBookingRoute = require("./routes/packageBooking")
const serviceRoute = require("./routes/vehicleService")
const subscriptionRoute = require("./routes/subscription")
const emptyVehicleRoute = require("./routes/emptyVehicle")
const busRouteRoute = require("./routes/busRoute")
const tourRoute = require("./routes/tour")
const ticketRequestRoute = require("./routes/ticketRequest")
const tourRequestRoute = require("./routes/tourRequest")

const { handleGetUserByAuthToken, handleAuthorizeUserByRole } = require("./middlewares/auth")
const { connectToMongo } = require("./connections")
const technician = require("./models/technician")

// Connections
const PORT = process.env.PORT || 5000
const app = express()
connectToMongo(process.env.MONGO_URL)
    .then(console.log("Mongo Connected"))
    .catch(err => console.log(err.message))

// Middlewares
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())

// For Testing
app.get("/", async (req, res) => {
    res.send("Home page of tourist wheel")
})


app.post("/addBulkTechnicians", async (req, res) => {
    try {
        const bulkOps = data.map(doc => ({
            insertOne: {
                document: doc
            }
        }));

        const result = await technician.bulkWrite(bulkOps);
        res.send(`Inserted ${result.insertedCount} documents successfully`);
    } catch (err) {
        console.error('Error inserting data:', err);
        res.status(500).json({ error: err.message });
    }
})

// Routes
app.use("/api/driver", driverRoute);
app.use("/api/cleaner", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER"]), cleanerRoute);
app.use("/api/employee", handleGetUserByAuthToken, handleAuthorizeUserByRole(["AGENCY", "ADMIN", "DRIVER", "MANAGER", "OFFICE-BOY", "CUSTOMER", "HR"]), employeeRoute);
app.use("/api/user", authRoute);
app.use("/api/technician", technicianRoute);
app.use("/api/dailyRoute", dailyRouteRoute);
app.use("/api/vehicle", vehicleRoute);
app.use("/api/packageBooking", packageBookingRoute)
app.use("/api/service", serviceRoute);
app.use("/api/subscription", subscriptionRoute);
app.use("/api/emptyVehicle", emptyVehicleRoute);

app.use("/api/busRoute", busRouteRoute);
app.use("/api/tour", tourRoute)
app.use("/api/ticketRequest", ticketRequestRoute)
app.use("/api/tourRequest", tourRequestRoute)


app.listen(PORT, () => {
    console.log("Server is running on " + PORT);
    subscriptionCronJob()
    packageBookingCronJob()
    packageBookingCronJobForAgency()
    packageBookingCronJobForDriver()
})




