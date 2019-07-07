var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var data = [
  {
    name: "Cloud Rest",
    image:
      "https://concepto.de/wp-content/uploads/2018/08/monta%C3%B1as-e1533762816593.jpg",
    description: "Belleza Extrema"
  },
  {
    name: "The Fall",
    image:
      "https://miviaje.com/wp-content/uploads/2017/02/shutterstock_554412640.jpg",
    description: "La caida"
  }
];

function seedDB() {
  //REMOVE ALL CAMPGROUNDS
  Campground.remove({}, function(err) {
    if (err) {
      console.log(err);
    }
    console.log("Removed Campgrounds!");
    //ADD A FEW CAMPGROUNDS
    data.forEach(function(seed) {
      Campground.create(seed, function(err, campground) {
        if (err) {
          console.log(err);
        } else {
          console.log("added a campground");
          //CREATE A COMMENT
          Comment.create(
            {
              text: "this place is great",
              author: "Homer"
            },
            function(err, comment) {
              if (err) {
                console.log(err);
              } else {
                campground.comments.push(comment);
                campground.save();
                console.log("CREATED NEW COMMENT!");
              }
            }
          );
        }
      });
    });
  });

  // ADD A FEW COMMENTS
}

module.exports = seedDB;
