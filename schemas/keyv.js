const mongoose = require('mongoose');

const keyvSchema = new mongoose.Schema({
    key: String,
    value: mongoose.Schema.Types.Mixed,
});

module.exports = mongoose.model('Key value', keyvSchema);