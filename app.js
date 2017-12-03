var express = require("express");
var app = express();
var body_parser = require("body-parser");
var firebase = require("firebase");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var authRoute = require("./routes/authroutes");
var parkingspotRoute = require("./routes/parkingspotroutes");
var user = require("./models/user");
var parkingspot = require("./models/parkingspot");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/parkplace", { useMongoClient: true });



app.set("view engine", "ejs");
app.use(body_parser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));

var config = {
    apiKey: "AIzaSyCWGqR2wOzUk3Y6yrydYrjz1ORrLKK0rVQ",
    authDomain: "parkplacetest-4ea5f.firebaseapp.com",
    databaseURL: "https://parkplacetest-4ea5f.firebaseio.com",
    storageBucket: "parkplacetest-4ea5f.appspot.com",
};
firebase.initializeApp(config);


app.use(authRoute);
app.use(parkingspotRoute);

app.get("/", function(req, res) {
    res.redirect("/home");
});

app.get("/home", function(req, res) {
    var user = null;
    res.render("home", { user, user });
});

app.get("/main", function(req, res) {
    var userEmail = firebase.auth().currentUser.email;
    user.find({ "email": userEmail }, function(err, foundUser) {
        if (err) {
            console.log(err);
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
});


app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server started");
});
