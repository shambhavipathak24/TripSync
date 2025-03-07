const mongoose = require('mongoose');

// Define the review schema
const reviewSchema = new mongoose.Schema({
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true }, // Reference to the Listing
    name: { type: String, required: true },
    image: { type: String, required: true },
    reviewText: { type: String, required: true },
    date: { type: Date, default: Date.now },
});

// Create and export the Review model
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
