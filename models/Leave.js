const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    leaveFromDate: { type: Date, required: true },
    leaveToDate: { type: Date, required: true },
    reason: { type: String, required: true },
}, { timestamps: false });

module.exports = mongoose.model('Leave', leaveSchema);

