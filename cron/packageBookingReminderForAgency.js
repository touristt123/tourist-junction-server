const cron = require('node-cron');
const { agency } = require("../models/user");
const { sendSms } = require('../utils/sms');
const packageBooking = require('../models/packageVehicleBooking');


module.exports = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            const currentDate = new Date();
            const threeDaysLater = new Date();
            threeDaysLater.setDate(currentDate.getDate() + 3);

            const bookingsWithLessThanThreeDaysOfDepartureDate = await packageBooking.find({
                departureDate: {
                    $lt: threeDaysLater,
                    $gt: currentDate
                },
                isAgencyNotified : false
            }).populate('vehicle');
            // console.log("cron running");
            if (bookingsWithLessThanThreeDaysOfDepartureDate.length < 1) {
                // console.log("No booking found");
                return;
            }
            // console.log(expiredSubscriptions);
            bookingsWithLessThanThreeDaysOfDepartureDate.forEach(async (booking) => {
                // handle expired subscription (e.g., deactivate agency)
                
                booking.isAgencyNotified = true
                await sendSms(booking?.mobileNumber, `"Dear ${booking?.agencyNo}, Reminder: An upcoming trip is scheduled in 3 days. Please ensure all arrangements are in order. Customer: ${booking?.customerName} Route: ${booking?.departurePlace} to ${booking?.destinationPlace} Departure Date: ${booking?.departureDate}, Time: ${booking?.departureTime} Kindly check and prepare the assigned vehicle ${booking?.vehicle.number} to ensure it is in proper condition for the journey. For any updates, coordinate with the customer and team. Thank you!" Tourist junction team`, process.env.DLT_AGENCY_PACKAGE_REMINDER_TEMPLATE_ID)
                await booking?.save()
            });
        } catch (error) {
            console.error("Error in cron job:", error.message);
        }
    });
}



