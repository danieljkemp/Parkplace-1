var express = require("express");
var paypal = require("paypal-rest-sdk");
var parkingspot = require("../models/parkingspot");
var router = express.Router();

router.get('/parkingspot/payment/:id', (req, res) => {
    var id = req.params.id;
    parkingspot.findById(id, function(err, foundSpot) {
        if (err) {
            console.log(err);
        }
        else {
            var create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "/parkingspot/payment/success/".concat(foundSpot._id),
                    "cancel_url": "/parkingspot/payment/cancel"
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
                    throw error;
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
                    console.log(JSON.stringify(payment));
                    res.send('success');
                }
            });
        }
    });
});

router.get('/parkingspot/payment/cancel', (req, res) => res.send('Cancelled'));

module.exports = router;
