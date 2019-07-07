var Campground = require("../models/campground");
var Comment = require("../models/comment");

// all the middleare goes here
var middlewareObj = {};
// ------- CHECK IF USER OWNS THE CAMPGROUND
middlewareObj.checkCampgroundOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, function(err, foundCampground) {
      if (err || !foundCampground) {
        req.flash("error", "Campground Not Found");
        res.redirect("back");
      } else {
        // does user own the campground?
        if (foundCampground.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You Dont Have Permission To Do That");
          res.redirect("back");
        }
      }
    });
  } else {
    res.redirect("back");
  }
};
//----- CHECK IF USER OWNS THE COMMENT
middlewareObj.checkCommentOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err || !foundComment) {
        req.flash("error", "Comment Not Found");
        res.redirect("back");
      } else {
        // does user own the comment?
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "You Dont Have Permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to login first");
    res.redirect("back");
  }
};
//----- CHECK IS USER IS LOGGED -----
middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You Need To Be Logged In");
  res.redirect("/login");
};

module.exports = middlewareObj;
