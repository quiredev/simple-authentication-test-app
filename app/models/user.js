var mongoose = require('mongoose');
var crypto = require('crypto');

var userSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, index: { unique: true }, lowercase: true, trim: true },
    password: { type: String, required: true },
    salt: { type: String }
});
userSchema.pre('save', function (next) {
    this.salt = Math.round(new Date().valueOf()*Math.random()).toString();
    this.password = this.encryptPassword(this.password);
    next();
});
userSchema.methods.encryptPassword = function (password) {
    return crypto.createHmac('md5', this.salt).update(password).digest('hex');
};

module.exports = mongoose.model('User', userSchema);
