//================================================
//          SET UP EXPRESS-ROUTER.
//================================================

var express = require("express");
var Campground = require("../models/campground");
var router = express.Router();
var middleware = require("../middleware");
var NodeGeocoder = require("node-geocoder");

var options = {
  provider: "opencage",
  httpAdapter: "https",
  apiKey: process.env.GEO_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);

// ===============================================
//      INDEX - show all campgrounds
//================================================

router.get("/", function(req, res) {
  if (req.query.search) {
    // regular exp to the query gi is g global i ignore case
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    // Get all campgrounds from DB
    Campground.find({ name: regex }, function(err, allCampgrounds) {
      //buscar la base de datos y lanzar las variables al ejs de campgrounds
      if (err) {
        console.log(err);
      } else {
        //Verifica en la DB si
        if (allCampgrounds.length < 1) {
          req.flash(
            "error",
            "No Campgrounds match that query, plase try again"
          );
          res.redirect("/campgrounds");
        } else {
          res.render("campgrounds/index", {
            campgrounds: allCampgrounds,
            page: "campgrounds"
          });
        }
      }
    });
  } else {
    Campground.find({}, function(err, allCampgrounds) {
      if (err) {
        console.log(err);
      } else {
        res.render("campgrounds/index", {
          campgrounds: allCampgrounds,
          page: "campgrounds"
        });
      }
    });
  }
});

//================================================
//      CREATE - add new campground to DB
//================================================

router.post("/", middleware.isLoggedIn, function(req, res) {
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var cost = req.body.cost;
  var locUser = req.body.location;
  var author = {
    id: req.user._id,
    username: req.user.username
  };

  geocoder.geocode(req.body.location, function(err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {
      name: name,
      image: image,
      description: desc,
      author: author,
      location: location,
      lat: lat,
      lng: lng,
      cost: cost,
      locUser: locUser
    };
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated) {
      if (err) {
        console.log(err);
      } else {
        //redirect back to campgrounds page
        console.log(newlyCreated);
        res.redirect("/campgrounds");
      }
    });
  });
});

//=================================================
//      NEW - show form to create new compground
//=================================================

router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("campgrounds/new");
});

//===================================================
//      SHOW -show more info about one campground
//===================================================

router.get("/:id", function(req, res) {
  //find the campground with provided ID //usando el req param para linkear
  Campground.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundCampground) {
      if (err || !foundCampground) {
        req.flash("error", "Campground Not Found");
        res.redirect("back");
      } else {
        console.log(foundCampground);
        // render show template with that campground
        res.render("campgrounds/show", { campground: foundCampground });
      }
    });
});

//EDIT CAMPGROUNDS
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(
  req,
  res
) {
  // is user logged in?
  Campground.findById(req.params.id, function(err, foundCampground) {
    res.render("campgrounds/edit", { campground: foundCampground });
  });
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res) {
  console.log("body req :", req.body);
  console.log("location del body", req.body.location);
  console.log("req.body.campground ", req.body.campground);

  req.body.campground.locUser = req.body.campground.location;

  geocoder.geocode(req.body.campground.location, function(err, data) {
    if (err || !data.length) {
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(
      err,
      campground
    ) {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        req.flash("success", "Successfully Updated!");
        res.redirect("/campgrounds/" + campground._id);
        console.log(location);
      }
    });
  });
});
//DESTROY CAMPGROUND ROUTE

router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds");
    }
  });
});

//============== Function TO PROTECT REGEX DDoS ATTACKs  ===================

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

//-----------------EXPORT ROUTER------------------------
module.exports = router;
