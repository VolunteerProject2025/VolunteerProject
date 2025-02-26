const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    issued_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Certificate', CertificateSchema);
