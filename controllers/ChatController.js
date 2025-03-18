const Chat = require('../models/Chat');


exports.createChat = async (req, res) => {
    try {
        const { firstId, secondId } = req.body;
        
        // Validation
        if (!firstId || !secondId) {
            console.log("Missing IDs:", { body: req.body, firstId, secondId });
            return res.status(400).json({ message: "Both user IDs are required" });
        }
        
        // Convert to strings just to be safe
        const firstIdStr = String(firstId);
        const secondIdStr = String(secondId);
        
        console.log("Creating chat with members:", firstIdStr, secondIdStr);
        
        // Check if chat already exists
        const existingChat = await Chat.findOne({
            members: { $all: [firstIdStr, secondIdStr] }
        });
        
        if (existingChat) {
            return res.status(200).json(existingChat);
        }
        
        // Create new chat
        const newChat = new Chat({
            members: [firstIdStr, secondIdStr]
        });
        
        const savedChat = await newChat.save();
        res.status(201).json(savedChat);
    } catch (error) {
        console.error("Error creating chat:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
exports.findUserChat = async (req,res) => {
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: 'Unauthorized - User not found' });
    }
    const userId = req.user.userId
    try {
        const chats = await Chat.find({
            members: {$in: [userId]}
        })
        res.status(200).json(chats)
    }catch(error){
        res.status(500).json(error)
    }
}

exports.findChat = async (req,res) => {
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ error: 'Unauthorized - User not found' });
    }
    const {firstId, secondId} = req.params
    try {
        const chat = await Chat.find({
            members: {$all: [firstId,secondId]}
        })
        res.status(200).json(chat)
    }catch(error){
        res.status(500).json(error)
    }
}