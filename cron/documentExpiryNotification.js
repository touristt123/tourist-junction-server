const cron = require('node-cron');
const { vehicle } = require('../models/vehicle');
const { sendSms } = require('../utils/sms');

module.exports = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      const currentDate = new Date();
      const tenDaysLater = new Date();
      tenDaysLater.setDate(currentDate.getDate() + 10);

      const vehicles = await vehicle.find({
        $or: [
          { "RC.expiry": { $gt: currentDate, $lt: tenDaysLater }, "RC.isNotified": false },
          { "Insurance.expiry": { $gt: currentDate, $lt: tenDaysLater }, "Insurance.isNotified": false },
          { "Permit.expiry": { $gt: currentDate, $lt: tenDaysLater }, "Permit.isNotified": false },
          { "Fitness.expiry": { $gt: currentDate, $lt: tenDaysLater }, "Fitness.isNotified": false },
          { "Tax.expiry": { $gt: currentDate, $lt: tenDaysLater }, "Tax.isNotified": false },
          { "PUC.expiry": { $gt: currentDate, $lt: tenDaysLater }, "PUC.isNotified": false },
        ]
      });

      for (const v of vehicles) {
        const documentFields = ['RC', 'Insurance', 'Permit', 'Fitness', 'Tax', 'PUC'];

        let updated = false;

        for (const field of documentFields) {
          const doc = v[field];

          if (
            doc?.expiry &&
            !doc?.isNotified &&
            new Date(doc.expiry) > currentDate &&
            new Date(doc.expiry) < tenDaysLater
          ) {
            await sendSms(
              v.contactNumber,
              `Reminder: Your vehicle document (${field}) for vehicle number ${v.number} is expiring soon on ${new Date(doc.expiry).toDateString()}. Kindly renew it to avoid issues.`,
              process.env.DLT_VEHICLE_DOCUMENT_EXPIRY_REMINDER_TEMPLATE_ID
            );

            v[field].isNotified = true;
            updated = true;
          }
        }

        if (updated) await v.save();
      }
    } catch (err) {
      console.error('Error in vehicle document expiry cron job:', err.message);
    }
  });
};
