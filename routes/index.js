//=====================================================
//          SET UP EXPRESS-ROUTER.
//=====================================================

var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//======================================================
//                  ROOT ROUTE
//======================================================

router.get("/", function(req, res) {
  res.render("landing");
});

//======================================================
//                  AUTH ROUTES
//======================================================

//======================================================
// SHOW AND HANDLE SIGN UP LOGIC - REGISTER
//======================================================


// show register form
router.get("/register", function(req, res){
  res.render("register", {page: 'register'}); 
});

// Handle sign up logic
router.post("/register", function(req, res) {
  var newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password, function(err, user) {
    // store creazy HASHHH! <3
    if (err) {
      req.flash("error", err.message);
      return res.redirect("register");
    }
    passport.authenticate("local")(req, res, function() {
      req.flash("success", "Welcome To yelpCamp " + user.username);
      res.redirect("/campgrounds");
    });
  });
});

//======================================================
//      SHOW AND HANDLE LOGIN LOGIC - LOGIN
//======================================================
//show login form
router.get("/login", function(req, res){
  res.render("login", {page: 'login'}); 
})

// handliong login logic
router.post(
  "/login",
  passport.authenticate(
    "local",
    //middleware
    {
      successRedirect: "/campgrounds",
      failureRedirect: "/login"
    }
  ),
  function(req, res) {}
);
//======================================================
//                  LOGOUT ROUTE
//======================================================

router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "Logged Out");
  res.redirect("/campgrounds");
});

//-----------------EXPORT ROUTER------------------------
module.exports = router;
