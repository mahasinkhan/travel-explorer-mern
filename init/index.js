const mongoose = require("mongoose");
const async = require('async'); // Import async library
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"; // Define your MongoDB URL

main().then(() => {
    console.log("Connected to MongoDB");
    initDB(); // Start initializing data after successful connection
}).catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});

async function main() {
    await mongoose.connect(MONGO_URL, { bufferCommands: false }); // Connect to MongoDB with bufferCommands set to false
}

const initDB = async () => {
    async.retry({ times: 3, interval: 1000 }, async () => {
        console.log("Initializing data...");
        await Listing.deleteMany({});
        await Listing.insertMany(initData.data);
        console.log("Data was initialized");
    }, (err) => {
        if (err) {
            console.error("Failed to initialize data:", err);
        } else {
            console.log("Data initialization completed successfully");
        }
    });
};
