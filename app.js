const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const passport= require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User=require("./models/user.js");

const listingsRoutes = require("./routes/listings");
const reviewsRoutes = require("./routes/reviews");
const userRoutes = require("./routes/user");

const app = express();

// Middleware to parse urlencoded request bodies
app.use(express.urlencoded({ extended: true }));

// Database connection
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
main()
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.error("Error connecting to MongoDB:", err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
}

// Setting up ejs and view engine
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware for method override
app.use(methodOverride("_method"));

// Middleware to serve static files from the public directory
app.use(express.static('public'));

// Session configuration
const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

// Home route
app.get("/", (req, res) => {
    console.log("GET request received at /");
    res.send("Request is working");
});

// Use session and flash middleware before routes
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
// LocalStrategy setup
passport.use(new LocalStrategy(User.authenticate()));

// Serialize and deserialize user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to set flash messages in response locals
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error=req.flash("error");
    next();
});

// Route handlers
app.use("/listings", listingsRoutes);
app.use("/listings/:id/reviews",reviewsRoutes);
app.use("/", userRoutes);


// 404 Error handling
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error", { message });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
