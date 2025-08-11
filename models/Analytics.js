const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    // Use a singleton pattern - only one document
    _id: {
        type: String,
        default: 'global_analytics'
    },
    pageViews: {
        type: Number,
        default: 0
    },
    assessmentStarts: {
        type: Number,
        default: 0
    },
    assessmentCompletions: {
        type: Number,
        default: 0
    },
    leadCaptures: {
        type: Number,
        default: 0
    },
    conversionRate: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Static method to get or create analytics
AnalyticsSchema.statics.getGlobalAnalytics = async function() {
    let analytics = await this.findById('global_analytics');
    if (!analytics) {
        analytics = new this({});
        await analytics.save();
    }
    return analytics;
};

// Method to update conversion rate
AnalyticsSchema.methods.updateConversionRate = function() {
    if (this.assessmentStarts > 0) {
        this.conversionRate = ((this.leadCaptures / this.assessmentStarts) * 100);
    }
    this.lastUpdated = new Date();
};

module.exports = mongoose.model('Analytics', AnalyticsSchema);
