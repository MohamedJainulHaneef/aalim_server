const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    staffId: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true },
    password: { type: String, required: true
    }
}, { timestamps: false });

module.exports = mongoose.model('Staff', userSchema);