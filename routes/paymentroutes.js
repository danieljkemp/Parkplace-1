var express = require("express");
var paypal = require("paypal-rest-sdk");
var firebase = require("firebase");
var parkingspot = require("../models/parkingspot");
var user = require("../models/user");
var router = express.Router();

router.get('/parkingspot/payment/:id', (req, res) => {
    var id = req.params.id;
    parkingspot.findById(id, function(err, foundSpot) {
        if (err) {
            console.log(err);
        }
        else {
            var return_url = "https://parkplace-rvijayde.c9users.io/parkingspot/payment/success/".concat(foundSpot._id);
            var cancel_url = "https://parkplace-rvijayde.c9users.io/parkingspot/payment/cancel";
            var create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": return_url,
                    "cancel_url": cancel_url
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": foundSpot.address1.concat(foundSpot.address2),
                            "sku": "001",
                            "price": foundSpot.price,
                            "currency": "USD",
                            "quantity": foundSpot.numberOfSpots
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": foundSpot.price
                    },
                    "description": "Booking parking spot at address: ".concat(foundSpot.address1.concat(parkingspot.address2))
                }]
            };


            paypal.payment.create(create_payment_json, function(error, payment) {
                if (error) {
                    console.log(error);
                }
                else {

                    for (let i = 0; i < payment.links.length; i++) {
                        if (payment.links[i].rel === 'approval_url') {
                            res.redirect(payment.links[i].href);
                        }
                    }

                }
            });
        }
    });

});

router.get('/parkingspot/payment/success/:id', (req, res) => {
    const spotId = req.params.id;
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const userEmail = firebase.auth().currentUser.email;
    parkingspot.findById(spotId, function(err, foundSpot) {
        if (err) {
            console.log(err);
        }
        else {
            const execute_payment_json = {
                "payer_id": payerId,
                "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": foundSpot.price
                    }
                }]
            };

            paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
                if (error) {
                    console.log(error.response);
                    throw error;
                }
                else {
                    // console.log("Get Payment Response");
                    //console.log(JSON.stringify(payment));
                    var booking = { "booking": { "bookingmail":userEmail, "booked": true } };
                    parkingspot.findByIdAndUpdate(foundSpot._id, {
                        $set: booking
                    }, function(err, updatedSpot) {
                        if (err) {
                            console.log(err);
                        }
                        else {
                           res.redirect("/main");
                            //res.redirect('/parkingspot/booking/bookedspots');
                        }
                    });
                }
            });
        }
    });
});

router.get('/parkingspot/payment/cancel', (req, res) => res.send('Cancelled'));

module.exports = router;
