const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
    leadId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    assessmentAnswers: {
        type: Object,
        default: {}
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'converted', 'inactive'],
        default: 'new'
    },
    source: {
        type: String,
        default: 'funnelmind'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for faster queries
LeadSchema.index({ email: 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ status: 1 });

module.exports = mongoose.model('Lead', LeadSchema);
