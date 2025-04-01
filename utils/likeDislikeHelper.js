const toggleLikeDislike = async (doc, userId, type) => {
  if (!doc || typeof doc.save !== "function") {
    throw new Error("Invalid document provided");
  }
  if (!userId) {
      throw new Error("Invalid userId");
  }
    const opposite = type === "like" ? "dislikedBy" : "likedBy"
    const current = type === "like" ? "likedBy" : "dislikedBy"
  
    // 👇 Đảm bảo các mảng luôn tồn tại
    doc[current] = doc[current] || [];
    doc[opposite] = doc[opposite] || [];
  
    const userIdStr = userId.toString()
  
    const hasAlready = doc[current].some((id) => id.toString() === userIdStr)
    const hasOpposite = doc[opposite].some((id) => id.toString() === userIdStr)
  
    if (hasAlready) {
      doc[current] = doc[current].filter((id) => id.toString() !== userIdStr)
    } else {
      doc[current].push(userId)
      if (hasOpposite) {
        doc[opposite] = doc[opposite].filter((id) => id.toString() !== userIdStr)
      }
    }
  
    try {
      await doc.save();
    } catch (err) {
      throw new Error(`Failed to save document: ${err.message}`);
    }
  
    return await doc.constructor.findById(doc._id);
};

module.exports = { toggleLikeDislike };