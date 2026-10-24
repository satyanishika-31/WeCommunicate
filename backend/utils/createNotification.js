const Notification = require("../models/Notification");

const createNotifications = async ({ recipients, type, title, message, relatedId }) => {
  const recipientIds = [...new Set((recipients || []).filter(Boolean).map((id) => id.toString()))];
  if (!recipientIds.length) return [];
  return Notification.insertMany(
    recipientIds.map((recipient) => ({ recipient, type, title, message, relatedId }))
  );
};

module.exports = createNotifications;
