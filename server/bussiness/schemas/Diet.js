const mongoose = require('mongoose');

const dietSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: String
});

module.export = dietSchema;