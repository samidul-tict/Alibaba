const controller = require('../controller/VendorsController');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer  = require('multer');
const upload = multer({dest: __dirname + '/uploads'});

function authenticationToken(){
    return function (req,res,next) {
    const authHeader = req.headers["authorization"]
    if(authHeader !== undefined){
        const Bearer = authHeader.split(" ")
        const BearerToken = Bearer[1]
        req.token = BearerToken;
        next();


    }else{
       res.json({'status':'400','error': 'JsonWebTokenError','message':'invalid signature'});
    
    }
}
}

router.route('/login')
		.post(controller.RetailerLogin);

router.route('/retailervalidate')
		.post(authenticationToken(),controller.RetailerValidate)

router.route('/retailerprofileupdate')
		.post(authenticationToken(),controller.RetailerProfileUpdate)

router.route('/retailer')
		.post(authenticationToken(),controller.RetailerInformation)

router.route('/pendingorderlistbyretailer')
		.post(authenticationToken(),controller.PendingOrderListForRetailer)

router.route('/completeorderlistbyretailer')
		.post(authenticationToken(),controller.CompletedOrderListForRetailer)

router.route('/orderselectbyretailer')
		.post(authenticationToken(),controller.OrderSelectByRetailer)

router.route('/ordersupplybyretailer')
		.post(authenticationToken(),controller.OrderSupplyByRetailer)

module.exports = router;