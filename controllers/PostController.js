const mongoose = require('mongoose');
const Post = require('../models/Post');
const Organization = require('../models/Organization');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const moment = require('moment'); // Thêm moment.js để tính thời gian tương đối

// Cấu hình multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Create a new post với upload hình ảnh
exports.createPost = async (req, res) => {
    try {
        if (!req.body.title || !req.body.content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const authorId = req.body.author;
        if (authorId && !mongoose.Types.ObjectId.isValid(authorId)) {
            return res.status(400).json({ message: 'Invalid author ID' });
        }

        const organizationId = req.body.organization;
        if (organizationId && !mongoose.Types.ObjectId.isValid(organizationId)) {
            return res.status(400).json({ message: 'Invalid organization ID' });
        }

        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            organization: organizationId || null,
            author: authorId || null,
            image: req.file ? `/uploads/${req.file.filename}` : null
        });
        await post.save();
        const populatedPost = await Post.findById(post._id)
            .populate('organization')
            .populate('author')
            .populate('comments.author');
        console.log('Created post:', populatedPost);
        res.status(201).json(populatedPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all posts
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find({ trashed: false }) // Chỉ lấy bài chưa trong thùng rác
            .populate('organization')
            .populate('author')
            .populate('comments.author');
        console.log('Fetched posts:', posts);
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('organization')
            .populate('author')
            .populate('comments.author');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        console.log('Fetched post:', post);
        res.status(200).json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: error.message });
    }
};

// Update a post by ID (hỗ trợ update ảnh)
exports.updatePost = async (req, res) => {
    try {
        const updateData = {
            title: req.body.title,
            content: req.body.content,
            organization: req.body.organization,
            author: req.body.author
        };
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }
        const post = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
            .populate('organization')
            .populate('author')
            .populate('comments.author');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        console.log('Updated post:', post);
        res.status(200).json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete a post by ID
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        // Đánh dấu bài post là trashed thay vì xóa
        post.trashed = true;
        await post.save();

        console.log('Post moved to trash:', post); // Debug
        res.status(200).json({ message: 'Post moved to trash successfully' });
    } catch (error) {
        console.error('Error moving post to trash:', error);
        res.status(500).json({ message: error.message });
    }
};

// Like a post
exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = req.body.userId;
        console.log('Received like request:', { postId: req.params.id, userId });
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const objectId = new mongoose.Types.ObjectId(userId);
        if (post.likes.some(id => id.equals(objectId))) {
            post.likes = post.likes.filter(id => !id.equals(objectId)); // Unlike
        } else {
            post.likes.push(objectId); // Like
        }
        await post.save();
        const populatedPost = await Post.findById(post._id)
            .populate('organization')
            .populate('author')
            .populate('comments.author');
        console.log('Liked post:', populatedPost);
        res.status(200).json(populatedPost);
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: error.message });
    }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = req.body.userId;
        const content = req.body.content;
        console.log('Received comment request:', { postId: req.params.id, userId, content });
        if (!userId) {
            return res.status(400).json({ message: 'userId is required' });
        }
        if (!content) {
            return res.status(400).json({ message: 'Comment content is required' });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId format' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const comment = {
            content,
            author: userId,
            createdAt: new Date(),
            relativeTime: moment().fromNow() // Thêm thời gian tương đối
        };
        post.comments.push(comment);
        await post.save();
        const populatedPost = await Post.findById(post._id)
            .populate('organization')
            .populate('author')
            .populate('comments.author');
        console.log('Commented post:', populatedPost);
        res.status(201).json(populatedPost);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.editComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const commentId = req.params.commentId;
        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const userId = req.body.userId || comment.author.toString();
        if (comment.author.toString() !== userId) {
            return res.status(403).json({ message: 'You can only edit your own comments' });
        }

        comment.content = req.body.content;
        comment.relativeTime = moment().fromNow();
        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate('organization')
            .populate('author')
            .populate('comments.author');
        res.status(200).json(populatedPost);
    } catch (error) {
        console.error('Error editing comment:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const commentId = req.params.commentId;
        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const userId = req.body.userId || comment.author.toString();
        const userRole = req.body.role || 'Guest'; // Lấy role từ request (nếu có)

        if (comment.author.toString() !== userId && userRole !== 'Organization') {
            return res.status(403).json({ message: 'You can only delete your own comments or if you are an Organization' });
        }

        post.comments = post.comments.filter(c => c._id.toString() !== commentId);
        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate('organization')
            .populate('author')
            .populate('comments.author');
        res.status(200).json(populatedPost);
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: error.message });
    }
};

// Export middleware upload để dùng trong routes
module.exports.upload = upload;