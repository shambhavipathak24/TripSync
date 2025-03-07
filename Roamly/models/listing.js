const mongoose = require("mongoose");

// Correct the typo from `mongoose.schema` to `mongoose.Schema`
const schema = mongoose.Schema;


const listingSchema = new schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: Object,
        default: "https://unsplash.com/photos/two-chairs-sitting-in-front-of-a-swimming-pool-k_My4rXk4Lc",  // Default image URL
    },
    price: Number,
    location: String,
    country: String,
    
});

// Create the Listing model using the listingSchema
const Listing = mongoose.model("Listing", listingSchema);


module.exports = Listing;
