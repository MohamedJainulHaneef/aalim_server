const mongoose = require('mongoose');

const substitutionSchema = new mongoose.Schema({
    absentStaffId: { type: String, required: true, trim: true },
    replacementStaffId: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    year: { type: String, required: true },
    session: { type: String, required: true }, 
}, { timestamps: false }); 


module.exports = mongoose.model('Substitution', substitutionSchema);
