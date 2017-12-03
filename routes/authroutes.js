var express = require("express");
var firebase = require("firebase");
var user = require("../models/user");
var parkingspot = require("../models/parkingspot");
var router = express.Router();

router.get("/register", function(req, res) {
    res.render("register");
});

router.post("/register", function(req, res) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var birthdate = req.body.birthdate;
    var address = req.body.address;
    var city = req.body.city;
    var state = req.body.state;
    var zip = req.body.zip;
    var email = req.body.email;
    var password = req.body.password;
    var userObj = { firstname: firstname, lastname: lastname, birthdate: birthdate, address: address, city: city, state: state, zip: zip, email: email };
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
        console.log("You have succesfully registered for parkplace");
        user.create(userObj, function(err, newlyCreatedUser) {
            if (err) {
                console.log(err);
            }
            else {
                parkingspot.find({}, function(err, foundspots) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        parkingspot.find({}).limit(18).exec(function(err, foundspots) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                res.render("mainpage", { user: newlyCreatedUser, parkingspots: foundspots });
                            }
                        });
                    }
                });

            }
        });
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
        // ...
    });

});

router.post("/login", function(req, res) {
    var email = req.body.emailId;
    var password = req.body.userpassword;
    firebase.auth().signInWithEmailAndPassword(email, password).then(function() {
        user.find({ "email": email }, function(err, foundUser) {
            if (err) {
                console.log("Could not find user");
            }
            else {
                parkingspot.find({}).limit(18).exec(function(err, foundspots) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        res.render("mainpage", { user: foundUser[0], parkingspots: foundspots });
                    }
                });
            }
        });
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
        res.redirect("/");
    });
});


router.get("/logout", function(req, res) {
    firebase.auth().signOut().then(function() {
        console.log("User succesfully signed out");
        res.redirect("/");
    }).catch(function(error) {
        console.log("Could not sign-out user");
    });
});



module.exports = router;