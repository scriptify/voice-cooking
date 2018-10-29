const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100
    },
    image: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 1,
        max: 10000
    },
    description: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 2000
    },
    ingredients: [
        {
            name: {
                type: String,
                required: true
            },
            amount: {
                unit: {
                    type: String,
                    required: true,
                    enum: [
                        'G',
                        'L',
                        'ML',
                        'MG',
                        'KG',
                        'CUP',
                        'TSP',
                        'TBSP',
                        'UNIT',
                        'PINCH'
                    ]
                },
                value: {
                    type: Number,
                    required: true
                }
            }
        }
    ],
    steps: [
        {
            text: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 150
            },
            coverImage: String,
            setTimer: {
                duration: Number,
                name: String,
                stopText: String
            }
        }
    ],
    diets: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Diet'
        }
    ],
    categories: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Category'
        }
    ]
});

module.exports = recipeSchema;