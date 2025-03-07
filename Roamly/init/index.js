const mongoose=require("mongoose");
const Listing=require("../models/listing.js");
const initData=require("./data.js");
const MONGO_URL="mongodb://127.0.0.1:27017/Roomly";

main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);;
})
async function main(){
    await mongoose.connect(MONGO_URL);
}
const initDb = async () => {
    try {
        console.log("Clearing old data...");
        await Listing.deleteMany({});
        console.log("Inserting new data...");
        console.log("Data to be inserted:", initData.data);  // Log the data to be inserted
        const result = await Listing.insertMany(initData.data);
        console.log("Data was initialized");
        console.log("Inserted documents:", result.length);  // Log number of inserted documents
    } catch (err) {
        console.error("Error inserting data:", err);  // Log any errors
    }
};

initDb();

//console.log(initData.data);