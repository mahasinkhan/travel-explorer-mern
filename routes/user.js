const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");

// GET request to render signup form
router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

// POST request to handle signup form submission
router.post("/signup", wrapAsync(async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser); // Optional: Log the registered user
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
    } catch (err) {
        console.error("Error registering user:", err);
        req.flash("error", "Failed to register user. Please try again.");
        res.redirect("/signup"); // Redirect back to signup page on error
    }
}));

module.exports = router;
