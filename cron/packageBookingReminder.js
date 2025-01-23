const cron = require('node-cron');
const { agency } = require("../models/user");
const { sendSms } = require('../utils/sms');
const packageBooking = require('../models/packageVehicleBooking');


module.exports = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            const currentDate = new Date();
            const twoDaysLater = new Date();
            twoDaysLater.setDate(currentDate.getDate() + 2);

            const bookingsWithLessThanTwoDaysOfDepartureDate = await packageBooking.find({
                departureDate: {
                    $lt: twoDaysLater,
                    $gt: currentDate
                },
                isNotified : false
            });
            // console.log("cron running");
            if (bookingsWithLessThanTwoDaysOfDepartureDate.length < 1) {
                return;
            }
            // console.log(expiredSubscriptions);
            bookingsWithLessThanTwoDaysOfDepartureDate.forEach(async (booking) => {
                // handle expired subscription (e.g., deactivate agency)
                booking.isNotified = true
                await sendSms(booking.mobileNumber, `"Dear ${booking.customerName}, Reminder: Your upcoming journey is scheduled soon. Agency: ${booking?.agencyName} Route: ${booking?.departurePlace} to ${booking?.destinationPlace} Departure Date: ${booking?.departureDate}, Time: ${booking?.departureTime} Kindly be ready for your trip. If there is any pending payment, please visit ${booking?.officeAddress} office to clear it before departure. Wishing you a safe and pleasant journey!" Tourist junction team`, process.env.DLT_PACKAGE_BOOKING_REMINDER_TEMPLATE_ID)
                await booking.save()
            });
        } catch (error) {
            console.error("Error in cron job:", error.message);
        }
    });
}



