const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    refreshToken: { type: String, default:'' },
    accessToken: { type: String, default:'' },
    role: { type: String, default: 'unverified' }
})

const User = mongoose.model('User', userSchema);

module.exports = User;