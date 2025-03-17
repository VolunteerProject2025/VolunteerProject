const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    location: { type: String },
    categories: { type: String }, // Sửa lỗi chính tả từ "catefories" thành "categories"
    image: { type: String }, // Thêm trường image, có thể lưu URL ảnh
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Completed'], 
        default: 'Pending' 
    },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }], // Danh sách tình nguyện viên
    volunteerNumber: { type: Number, default: 0, min: 0 }, // Số lượng thành viên tham gia thực tế
    
});

module.exports = mongoose.model('Project', ProjectSchema);
