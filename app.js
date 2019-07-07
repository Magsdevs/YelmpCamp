require("dotenv").config();
var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  Campground = require("./models/campground"),
  seedDB = require("./seeds");
(Comment = require("./models/comment")),
  (User = require("./models/user")),
  (methodOverride = require("method-override"));

//REQURING ROUTES
var commentRoutes = require("./routes/comments"),
  campgroundRoutes = require("./routes/campgrounds"),
  indexRoutes = require("./routes/index");

//seedDB(); //SEED DATABASE

// ========== Variables de entorno ()  ============

var urls = {
  DB: process.env.DB_TEST || "mongodb://localhost:27017/yelp_camp"
};

//PASSPORT CONFIGURATION

app.use(
  require("express-session")({
    secret: "Once Again Rusty Wins cutests Dog!",
    resave: false,
    saveUninitialized: false
  })
);

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
mongoose.connect(urls["DB"], {
  useNewUrlParser: true
});
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

var server = app.listen(process.env.PORT, process.env.IP, function() {
  console.log("APP IS RUNNING");
  console.log(urls);
  console.log(process.env.IP);
});
