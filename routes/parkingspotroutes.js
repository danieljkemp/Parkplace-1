var express=require("express");
var firebase=require("firebase");
var user=require("../models/user");
var parkingspot=require("../models/parkingspot");
var geocoder=require("geocoder");
var router=express.Router();




router.get("/parkingspot/new",function(req,res){
    var userEmail=firebase.auth().currentUser.email;
    user.find({"email":userEmail},function(err,foundUser){
      if(err){
          console.log(err);
      }
      else{
          res.render("publishspot",{user:foundUser[0]});
      }
  });
   
});

router.post("/parkingspot",function(req, res){
  var author={};
  var address1 = req.body.address1;
  var address2=req.body.address2
  var fulladdress=address1.concat(address2);
  var city=req.body.city;
  var state=req.body.state;
  var zip=req.body.zip;
  var phone=req.body.phone;
  var enteredEmail=req.body.email;
  var image = req.body.image;
  var numSpots=req.body.numberOfSpots;
  var price=req.body.price;
  var userEmail=firebase.auth().currentUser.email;
  console.log("User email is"+userEmail);
  user.find({"email":userEmail},function(err,foundUser){
      if(err){
          console.log(err);
      }
      else{
          author = {
            id:foundUser[0]._id,
            name:foundUser[0].firstname
            }
             geocoder.geocode(fulladdress, function (err, data) {
                if(err){
                    console.log(err);
                   }
                 else{
                    var lat = data.results[0].geometry.location.lat;
                    var lng = data.results[0].geometry.location.lng;
                    var location = data.results[0].formatted_address;
                    var newParkingSpot = {author:author,
                          firstname:foundUser[0].firstname,
                          lastname:foundUser[0].lastname,
                          address1:address1,
                          address2:address2,
                          city:city,
                          state:state,
                          zip:zip,
                          phone:phone,
                          email:enteredEmail,
                          image:image,
                          location:location,
                          lat:lat, 
                          lng:lng, 
                          numberOfSpots:numSpots, 
                          price:price};
    // Create a new campground and save to DB
    parkingspot.create(newParkingSpot, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
           //************FETCH PARKING SPOT DATA FROM DB AND POPULATE****************
            res.render("mainpage",{user:foundUser[0]});
          }
        });
      }
    });
    }
  });
});


router.get("/parkingspot/:id",function(req, res){
    var id=req.params.id;
    parkingspot.findById(req.params.id,function(err, foundParkingSpot){
       if(err){
           console.log("Could not display parkingspot page");
       } 
       else{
           res.render("parkingspotpage",{parkingspot:foundParkingSpot});
       }
    });
});


//Edit ParkingSpot route
router.get("parkingspot/:id/edit",function(req, res){
    parkingspot.findById(req.params.id,function(err, foundParkingSpot){
        if(err){
            console.log(err);
        }
        else{
            res.render("edit",{parkingspot:foundParkingSpot});
        }
    });
});



//Update ParkingSpot  route
router.put("/parkingspot/:id",function(req, res){
    geocoder.geocode(req.body.location, function (err, data) {
    if(err){
        console.log(err);
    }
    else{
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {address:req.body.address, image:req.body.image, location:req.body.location, lat:lat, lng:lng, numberOfSpots:req.body.numSpots, price:req.body.price, description:req.body.desc};
    parkingspot.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, hikesite){
        if(err){
           console.log(err);
        } else {
            res.redirect("/parkingspot/" + parkingspot._id);
        }
    });
   }
  });
});


//Delete Parking Spot
router.delete("/parkingspot/:id",function(req, res){
    var id=req.params.id;
    parkingspot.findByIdAndRemove(id,function(err){
       if(err){
           res.redirect("/hikespots");
       } 
       else{
           res.redirect("/hikespots")
       }
    });
});

module.exports=router;