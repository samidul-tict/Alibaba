const controller = require('../controller/DriverserviceController');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer  = require('multer');
const upload = multer({dest: __dirname + '/uploads'});

//* JWT auth Gurd *//
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

router.route('/')
		.get(authenticationToken(),controller.driverservice);

/*  API Route For Driver Login */ 
router.route('/login')
	.post(controller.DriverLogin);

router.route('/driverdetails')
	.post(authenticationToken(),controller.DriverInformation)

/*  API Route For Driver Validate */ 
router.route('/drivervalidate')
	.post(authenticationToken(),controller.DriverValidate);

/*  API Route For Driver profile Update */ 
router.route('/profileupdate')
	 .post(authenticationToken(),upload.single('myFile'),controller.DriverProfileUpdate);

/*  API Route For Pending Order List For Driver */
router.route('/pendingorderlist')
	  .post(authenticationToken(),controller.PendingOrderListForDriver);

/*  API Route For Completed Order List For Driver */
router.route('/completedorderlist')
	.post(authenticationToken(),controller.CompletedOrderListForDriver);

/*  API Route For  Order Detail By Id  */
router.route('/orderdetailbyid')
	.post(authenticationToken(),controller.OrderDetailId);
	 	 
/*  API Route For  Order Update By Driver  */
router.route('/orderupdate')
    .post(authenticationToken(),controller.OrderUpdate);
 
router.route('/driverstatusupdate')
 	.post(authenticationToken(),controller.DriverMasterIsOnlineStatus)



module.exports = router;