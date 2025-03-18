const Notification = require("../models/Notification");

exports.getUserNotifications = async (req, res) => {
    try {
      const userId = req.user.userId;
      
      const notifications = await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(20);
        
      res.json(notifications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  exports.markNotificationAsRead = async (req, res) => {
    try {
      const { notificationId } = req.params;
      
      const notification = await Notification.findById(notificationId);
      
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      // Check if notification belongs to user
      if (notification.user.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      notification.read = true;
      await notification.save();
      
      res.json({ message: 'Notification marked as read' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };