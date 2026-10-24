const cron = require("node-cron");
const Complaint = require("../models/Complaint");
const createNotifications = require("../utils/createNotification");

const startComplaintReminderJob = () => cron.schedule("0 * * * *", async () => {
  const now = new Date();
  const complaints = await Complaint.find({
    $and: [
      {
        $or: [
          { status: "PENDING", createdAt: { $lt: new Date(now - 24 * 60 * 60 * 1000) } },
          { status: "IN_PROGRESS", updatedAt: { $lt: new Date(now - 72 * 60 * 60 * 1000) } }
        ]
      },
      {
        $or: [
          { lastReminderAt: { $exists: false } },
          { lastReminderAt: { $lt: new Date(now - 24 * 60 * 60 * 1000) } }
        ]
      }
    ]
  }).populate("block", "manager");

  for (const complaint of complaints) {
    const recipients = [complaint.block?.manager, complaint.assignedTo];
    if (recipients.some(Boolean)) {
      await createNotifications({
        recipients,
        type: "COMPLAINT_UPDATE",
        title: `Complaint ${complaint.ticketId} reminder`,
        message: `${complaint.ticketId} has remained ${complaint.status} and needs attention.`,
        relatedId: complaint._id
      });
      complaint.lastReminderAt = now;
      await complaint.save();
    }
  }
});

module.exports = startComplaintReminderJob;
