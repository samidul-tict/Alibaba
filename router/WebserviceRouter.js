const controller = require('../controller/WebserviceController');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer  = require('multer');
const connection = require('../config/db');
const upload = multer({dest: __dirname + '/uploads'});

//* JWT auth Gurd *//
function authenticationToken(){
    return function (req,res,next) {
    const authHeader = req.headers["authorization"]
    if( authHeader !== undefined){
        const Bearer = authHeader.split(' ')
        const BearerToken = Bearer[1]
        req.token = BearerToken;
        next();


    }else{

       res.json({'status':'400','error': 'JsonWebTokenError','message':'invalid signature'});
    
    }
}
} 
// a

//* URL Design *//
router.route('/')
      .get(controller.main);

router.route('/users')
      .post(authenticationToken(),controller.UserGet)

router.route('/users/login')
      .post(controller.UserLogin);

router.route('/forgetpassword')
      .post(controller.ForgotPassword);




/*######### CATEGORY ##############*/

router.route('/parentcategorylist')
      .post(authenticationToken(),controller.ListParentCategory);

router.route('/addeditcategory')
      .post(authenticationToken(),controller.AddCategory);

router.route('/category')
      .post(authenticationToken(),controller.ListCategory);

router.route('/category/:id')
      .get(authenticationToken(),controller.ListCategoryById);

router.route('/uploadcategory')
      .post(authenticationToken(),upload.single('myFile'),controller.UploadCategory);

router.route('/deletecategory/:id')
      .post(authenticationToken(),controller.DeleteCategory);

router.route('/categorystatus')
      .post(authenticationToken(),controller.CategoryStatus);

router.route('/categoryactiveparentlist')
      .post(authenticationToken(),controller.CategoryActiveParentList);

router.route('/categoryactivechildlist')
      .post(authenticationToken(),controller.CategoryActiveEndChildList);


/*######### CATEGORY ##############*/  



/*######### PRODUCT ##############*/
router.route('/addeditproduct')
      .post(authenticationToken(),controller.AddProduct);

router.route('/products')
      .post(authenticationToken(),controller.GetProducts);

router.route('/products/:id')
      .get(authenticationToken(),controller.ListProductById);      
      
router.route('/uploadproductimg')
      .post(authenticationToken(),upload.single('myFile'),controller.UploadProductImage);

router.route('/uploadproductvideo')
      .post(authenticationToken(),upload.single('myFile'),controller.UploadProductVideo);
      
router.route('/deleteproduct/:id')
      .post(authenticationToken(),controller.DeleteProduct)

router.route("/productstatus")
      .post(authenticationToken(),controller.ProductStatus);

router.route('/deleteproductbulkprice/:id')
      .post(authenticationToken(),controller.DeleteProductBulkPrice)

/*######### PRODUCT ##############*/

/*######### BANNER ##############*/   
router.route('/bannerlist')
      .post(authenticationToken(),controller.BannerListView);

router.route('/banner/:id')
      .get(authenticationToken(),controller.ListBannerById)      
      
router.route('/uploadbanner')
      .post(authenticationToken(),upload.single('myFile'),controller.UploadBanner)

router.route('/addeditbanner')
      .post(authenticationToken(),controller.Addbanner);

router.route('/deletebanner/:id')
      .post(authenticationToken(),controller.DeleteBanner);

router.route('/bannerstatus')
      .post(authenticationToken(),controller.BannerStatus);

/*######### BANNER ##############*/  

/*######### DRIVER ##############*/

/* API Route For Driver Add Edit */
router.route('/uploaddriverlicenseimage')
      .post(authenticationToken(),controller.UploadDriverLicenseImage)

router.route('/driveraddedit')
    .post(authenticationToken(),controller.DriverAddEdit);

/* API Route For Driver Upload Image */
router.route('/uploaddriverimage')
      .post(authenticationToken(),upload.single('myFile'),controller.UploadDriverImage)

/* API Route For Driver Activate Deactivate */
router.route('/driverstatus')
.post(authenticationToken(),controller.DriverActiveDeactive);

/* API Route For Driver Select By ID */
router.route('/driverselectrow/:id')
    .post(authenticationToken(),controller.DriverSelectRowById);

/* API Route For Driver Delete */
router.route('/deletedriver/:id')
      .post(authenticationToken(),controller.DeleteDriver);

/* API Route For Driver Search */
router.route('/driver')
      .post(authenticationToken(),controller.DriverSearch);

/*######### DRIVER ##############*/

/*######### CUSTOMER ##############*/
router.route('/customerlist')
      .post(authenticationToken(),controller.CustomerSelectSearchResult);
      
router.route('/customeraddedit')
      .post(authenticationToken(),controller.CustomerMasterInsertUpdate);

router.route('/customer')
      .post(authenticationToken(),controller.CustomeSelectParticularRow);
      
router.route('/customerslistview')
      .post(authenticationToken(),controller.CustomerListing);

router.route('/customerstatus')
      .post(authenticationToken(),controller.CustomerMasterActiveDeactive);

router.route('/uploadcustomer')
      .post(authenticationToken(),controller.UploadCustomer);

router.route('/deletecustomer/:id')
      .post(authenticationToken(),controller.DeleteCustomer);

/*######### CUSTOMER ##############*/

/*######### RETAILER ##############*/

/* API Route For Retailer List */
router.route('/retailerlist')
      .post(authenticationToken(),controller.RetailerSelectSearchResult);

/* API Route For Retailer Add Edit */
router.route('/retaileraddedit')
      .post(authenticationToken(),controller.RetailerMasterInsertUpdate);

     /* API Route For Retailer Detail By ID */ 
router.route('/retailer')
      .post(authenticationToken(),controller.RetailerSelectParticularRow);

      /* API Route For Retailer Status Change */
router.route('/retailerstatus')
      .post(authenticationToken(),controller.RetailerMasterActiveDeactive);

       /* API Route For Retailer Image Upload */
router.route('/uploadretailer')
      .post(authenticationToken(),upload.single('myFile'),controller.UploadRetailer);

      /* API Route For Retailer  Contact Person Image Upload */
router.route('/uploadretailercontactperson')
.post(authenticationToken(),upload.single('myFile'),controller.UploadRetailerContactperson);

      /* API Route For Retailer Delete */
router.route('/deleteretailer/:id')
      .post(authenticationToken(),controller.DeleteRetailer);
/*######### RETAILER ##############*/


/*######### RETAILER PRODUCT ##############*/

/* API Route For Retailer Product Add Edit */
router.route('/retailerproductaddedit')
      .post(authenticationToken(),controller.RetailerProductInsertUpdate);

/* API Route For Retailer Product Status Change */
router.route('/retailerproductstatus')
      .post(authenticationToken(),controller.RetailerProductActiveDeactive);

      /* API Route For Retailer Product List For Add Product */
router.route('/retailerproductlist')
      .post(authenticationToken(),controller.RetailerProductListById);

/* API Route For Retailer Product Detail For Edit/Delete Product */
router.route('/retailerproductdetail')
      .post(authenticationToken(),controller.RetailerProductDetailById);

/*######### RETAILER PRODUCT ##############*/

/*######### CUSTOMER ADDERSS ##############*/
router.route('/customeradersslist')
      .post(authenticationToken(),controller.CustomerAddressListByCustomer);

router.route('/customeradderssaddedit')
      .post(authenticationToken(),controller.CustomerAddressAddEdit);

router.route('/cutomeradderssdelete')
      .post(authenticationToken(),controller.CustomerAdderssDelete);

router.route('/customeradderss/:id')
      .post(authenticationToken(),controller.CustomerAdderssById);


/*######### CUSTOMER ADDERSS ##############*/





/*######### ORDER ##############*/

router.route('/orderlist')
      .post(authenticationToken(),controller.OrderListing);

// router.route('/mischargesupdate')
//       .post(controller.MischargeSettingUpdate);

router.route('/driverlist')
      .post(authenticationToken(),controller.DriverMasterListing);

router.route('/activedriverlist')
      .post(authenticationToken(),controller.ActiveDriverMasterListing);

router.route('/ordermastermapping')
      .post(authenticationToken(),controller.OrderMasterDriverMapping);

router.route('/customercart')
      .post(authenticationToken(),controller.CustomerCartCount);

router.route('/orderlistbycustomerid')
      .post(authenticationToken(),controller.OrderListByCustomerId);

      /*  API Route For Pending Order List For Driver */
router.route('/pendingorderlist')
	    .post(authenticationToken(),controller.PendingOrderListForDriver);

	  /*  API Route For Completed Order List For Driver */
router.route('/completedorderlist')
	     .post(authenticationToken(),controller.CompletedOrderListForDriver);

router.route('/ordercancel')
      .post(authenticationToken(),controller.CancelOrder);

      
router.route('/orderrefundlist')
      .get(authenticationToken(),controller.OrderRefundList);
      
router.route('/orderrefundaccepted')
      .post(authenticationToken(),controller.OrderRefundAccepted);

/*######### ORDER ##############*/
 
/*######### COUNT ##############*/

router.route('/productcount')
      .post(authenticationToken(),controller.TotalProductCount);
router.route('/categorycount')
      .post(authenticationToken(),controller.TotalCategoryCount);

router.route('/customercount')
      .post(authenticationToken(),controller.TotalCustomerCount);

router.route('/drivercount')
      .post(authenticationToken(),controller.TotalDriverCount);

router.route('/ordercount')
      .post(authenticationToken(),controller.TotalOrderCount)

 /*######### COUNT ##############*/     

router.route('/taxselect')
      .post(authenticationToken(),controller.TaxSelectAll);

router.route('/ordercancelbyadmin')
      .post(authenticationToken(),controller.OrderMasterCancel);

router.route('/addeditpincode')
      .post(authenticationToken(),controller.PincodeInsertUpdate);

router.route('/pincodelistbyid')
      .post(authenticationToken(),controller.PincodeListing);

router.route('/pincodesearchlist')
      .post(authenticationToken(),controller.PincodeSearchList);

router.route('/pincodestatusupdate')
      .post(authenticationToken(),controller.PincodeStatus);

router.route('/mischargesettingupdate')
      .post(authenticationToken(),controller.MischargeSettingUpdate)

router.route('/mischargelisting')
      .post(authenticationToken(),controller.MischargeSelete);

router.route('/cmslisting')
      .post(authenticationToken(),controller.CmsMasterSelectAll)
router.route('/cmsbyid')
      .post(authenticationToken(),controller.CmsSelectById)

router.route('/customerwallet')
      .post(authenticationToken(),controller.CustomerWallet)

router.route('/cmsupdate')
      .post(authenticationToken(),controller.CmsUpdate)

router.route('/drivercompletedorder')
      .post(authenticationToken(),controller.OrderMasterSelectCompletedDriver)

router.route('/driverpendingorder')
      .post(authenticationToken(),controller.OrderMasterSelectPendingDriver)

router.route('/dashboardcount')
      .post(authenticationToken(),controller.DashboardCount)

router.route('/cmsimageupload')
      .post(authenticationToken(),controller.CmsPictureUpload)

router.route('/customeradderssbyid')
      .post(authenticationToken(),controller.CustomerAdderssById)

router.route('/bannerdisplayorderupdate')
      .post(authenticationToken(),controller.BannerDisplayUpdate)

router.route('/customeradderssupdate')
      .post(authenticationToken(),controller.CustomerAdderssUpdate)

router.route('/cutomerwalletupdate')
      .post(authenticationToken(),controller.CustomerWalletInsert)

router.route('/customeraccount')
      .post(authenticationToken(),controller.CustomerAccounts)

router.route('/customerall')
      .post(authenticationToken(),controller.CustomerAll)
router.route('/orderfulldetailsbyid')
      .post(authenticationToken(),controller.OrderDetailsForOrderMaster)

router.route('/taxall')
      .post(authenticationToken(),controller.TexSelectAll)

router.route('/taxstatusupdate')
      .post(authenticationToken(),controller.TexCategoryActiveDeactive)
router.route('/taxaddedit')
      .post(authenticationToken(),controller.TaxmasterInsertUpdate)

router.route('/vehiclelistall')
  .post(authenticationToken(),controller.VehicleListingAll)

router.route('/vehiclelistactive')
  .post(authenticationToken(),controller.VehicleActiveListing)

router.route('/vehicleselectbyrow')
  .post(authenticationToken(),controller.VehicleSelectParticularRow)

router.route('/vechiclestatusupdate')
    .post(authenticationToken(),controller.VehicleMasterStatusUpdate)

router.route('/uploadvehicleimage')
      .post(authenticationToken(),upload.single('myFile'),controller.UploadVehicle)

router.route('/vechicleinsertupdate')
      .post(authenticationToken(),controller.VehicleInsertUpdate)

router.route('/pendingorderserachbyvehiclemapping')
      .post(authenticationToken(),controller.OrderSearchMasterVehicleMapping)

router.route('/vehicleordermapping')
      .post(authenticationToken(),controller.OrderMasterVehicleMapping)
router.route('/ordermasterdrivervehiclemapping')
      .post(authenticationToken(),controller.OrderMasterDriverVehicleMapping)


router.route('/ordermasterdrivervehiclebulkmapping')
      .post(authenticationToken(),controller.OrdermasterDriverVehicleBulkMapping)

router.route('/ordermasterpendingselectroute')
      .post(authenticationToken(),controller.OrderasterPendingSelectRoute)

router.route('/ordermastercurrentdayreview')
      .post(authenticationToken(),controller.OrdermasterCurrentDayReview)      

router.post('/daliy-sale-register',authenticationToken(),controller.DailySaleRegister)

router.post('/commission-payable',authenticationToken(),controller.commissionPayable)

router.post('/agent-tree-traking',authenticationToken(),controller.agenTreeTraking)

router.post('/payment-payable-receipt',authenticationToken(),controller.paymentReceiptAndPayable)

router.post('/payment-payable-commission-receipt',authenticationToken(),controller.commissionPayableForpaymentReceipt)

router.post('/performance-tracking',authenticationToken(),controller.perFormanceTracking)

router.post('/expected-delivery-time-update',authenticationToken(),controller.ExpectedDeliveryTime)

router.get('/driver-listing',controller.SelectAllDrivers)

router.post('/payouts',controller.payoutList)

router.post('/payout-selected',controller.payoutSelected)

router.post('/widthdrawals-requests',authenticationToken(),controller.widthdrawalsRequests)

router.get('/customer-list-payout',controller.CustomerListForPayout)

router.post('/past-refund',controller.PastRefund)

router.post('/orderStatusByBank',controller.OrderStatusByBank)

router.post('/payment-list',controller.OrderFullDatails)

module.exports = router;

// https://apitest.ccavenue.com/apis/servlet/DoWebTrans