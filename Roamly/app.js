const express=require("express");
const app=express();
const mongoose=require("mongoose");
const MONGO_URL="mongodb://127.0.0.1:27017/Roomly";
const Listing=require("./models/listing.js");
const bodyParser = require('body-parser');
const path=require("path");
const methodOverride=require("method-override");
const ejsMate=require('ejs-mate');
const Review = require('./models/review.js');
const axios = require('axios');
const WeatherAPI_KEY = '35626c4ee83670122b634c660b4986fa';  // Import the Review model

main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);;
})
async function main(){
    await mongoose.connect(MONGO_URL);
}
app.set("view engine","ejs");
app.engine('ejs', ejsMate);
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"/public")));
app.listen(8080,()=>{
    console.log("app is listening at 8080");
});

app.get('/Listings', async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
});
//new route
app.get('/Listings/new',(req,res)=>{
    res.render("listings/new.ejs");
});
//show route
app.get('/listings/:id', async (req, res) => {
     // Use the correct method to find by id
    try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        return res.status(404).render('error', { message: 'Listing not found' });
    }
    res.render("listings/show.ejs", { listing });
} catch (err) {
    res.status(500).render('error', { message: 'Something went wrong' });
}
// Pass the listing data to the view
});
//create route
app.post('/Listings', async (req, res) => {
    const { title, description, imageUrl, price, country, location } = req.body;

    try {
        const newListing = new Listing({
            title,
            description,
            imageUrl,
            price,
            country,
            location
        });

        await newListing.save(); // Save the new listing to the database

        res.redirect('/Listings'); // Redirect to the listings page after success
    } catch (error) {
        console.error("Error saving listing:", error);
        res.status(500).send("Error creating listing");
    }
});
//edit route
app.get('/Listings/:id/edit', async (req, res) => {
    let { id } = req.params; // Corrected destructuring
    const listing = await Listing.findById(id,{...req.body.listing}); // Corrected variable name
    if (!listing) {
        return res.status(404).send("Listing not found");
    }
    res.render("listings/edit.ejs", { listing }); // Pass the listing data to the edit form
});
// Update Listing (PUT)
app.put('/Listings/:id', async (req, res) => {
    let { id } = req.params; // Corrected destructuring
    try {
        await Listing.findByIdAndUpdate(id, req.body); // Updated data (no need for `listing` inside `req.body`)
        res.redirect('/Listings'); // Redirect after updating
    } catch (error) {
        console.error("Error updating listing:", error);
        res.status(500).send("Error updating listing");
    }
});
app.get('/testListing',async(req,res)=>{
	let sampleListing=new Listing({
		title: "My new villa",
		description:"by the beech",
		price: 1900,
		location: "kerala",
		country: "india",
	});
	await sampleListing.save();
	console.log("sample was saved");
});

// Define the search route
app.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.query; // Capture the search term from the query string
    if (!searchTerm) {
      return res.redirect('/Listings'); // Redirect to home if no search term is entered
    }

    // Use MongoDB's .find() with a regular expression to search by name or category
    const destinations = await Listing.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } }, // Search by name (case-insensitive)
        { location: { $regex: searchTerm, $options: 'i' } },
        { country: { $regex: searchTerm, $options: 'i' } },
        // Search by category (case-insensitive)
      ],
    });

    // Render the results in a view (pass destinations to EJS template)
    console.log("listings ",{destinations})
    res.render('listings/searchResults.ejs', { destinations });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
//review page 


// Route to render the add review form
app.get('/listings/:id/add-review', async (req, res) => {
    const { id } = req.params;
    try{
    const listing = await Listing.findById(id);

    if (!listing) {
        return res.status(404).render('error', { message: 'Listing not found' });
    }

    // Render the review form
    res.render('listings/review.ejs', { listing });
}
catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to handle review form submission
app.post('/listings/:id/review', async (req, res) => {
    const { id } = req.params;
    const { name, reviewText } = req.body;

    try {
        // Create and save the new review
        const newReview = new Review({
            listing: id,  // The listing this review belongs to
            name,
            image,
            reviewText,

        });

        await newReview.save();  // Save the review

        // Redirect to the listings page
        res.redirect("/Listings");

    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).send("Error adding review");
    }
});
// Route to display all reviews on a separate page
app.get('/listings/:id/review', async (req, res) => {
    try {
        const reviews = await Review.find().populate('listing'); // Populate the listing info for each review
        res.render('listings/showReview.ejs', { reviews });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Something went wrong' });
    }
});


// Show weather route

// Your WeatherAPI key (ensure this is stored securely in environment variables or other safe methods)
 // Replace with your key

// The location you want to fetch weather data for (can be a city, postal code, or coordinates)
app.get('/listings/:id/weather', async (req, res) => {
  const {listingId} = req.params; // Get the listing ID from the URL

  try {
    // Retrieve the listing from the database (e.g., MongoDB)
    //console.log('Listing ID:', {listingId});
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).send('Listing not found');
    }

    // Fetch weather data using WeatherAPI
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        key: WeatherAPI_KEY,
        q: listing.location, // Use the location of the listing
      }
    });

    // Pass the weather data along with the listing data to the EJS template
    res.render('listings/weather.ejs', {
      listing: listing,
      weather: response.data
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).send('Error fetching weather data');
  }
});




