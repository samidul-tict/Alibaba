const controller = require('../controller/AppserviceController');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer  = require('multer');
const upload = multer({dest: __dirname + '/uploads'});

//* JWT auth Gurd *//
function authenticationToken(){
    return function (req,res,next) {
    const authHeader = req.headers["authorization"]
    if( authHeader !== undefined){
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
     .get(controller.main);

router.route('/parentcategory')
      .post(controller.ParentChildBannerListView);

router.route('/categorywiselist')
      .post(controller.CategoryWiseSelectView);
      
router.route('/productmasterfeautredlist')
      .post(controller.ProductMasterSelectFeatureList);

router.route('/profileupdate')
      .post(authenticationToken(),controller.CustomerProfileUpdate);


router.route('/customercartproductquantityupdate')
      .post(authenticationToken(),controller.CustomerCartProductQuantityUpdate);

router.route('/addtocart')
      .post(authenticationToken(),controller.CustomerAddCart);
      
router.route('/customercartdelete')
      .post(authenticationToken(),controller.CustomerCartDelete);

router.route('/login')
      .post(controller.UserLogin);

router.route('/customervalidate')
      .post(controller.CustomerValidate);

/* API Route For Customer Cart Listing */
router.route('/customercartlist')
    .post(authenticationToken(),controller.CustomerCartList);

/* API Route For Customer Address Add Edit */
router.route('/customeraddressinsertupdate')
    .post(authenticationToken(),controller.CustomerAddressAddEdit);

/* API Route For Customer Address Listing */
router.route('/customeraddresslist')
    .post(authenticationToken(),controller.CustomerAddressListByCustomer);

router.route('/productlistbycategory')
      .post(controller.GetProductsById);

router.route('/govtidtypelist')
      .post(authenticationToken(),controller.GovtIdTypeList);

router.route('/retaileractivelist')
      .post(authenticationToken(),controller.RetailActiveStatus);

router.route('/parentcategorybyid')
      .post(authenticationToken(),controller.ParentCategoryById);

router.route('/retailermasterstatus')
      .post(authenticationToken(),controller.ReatailerMasterStatus);

router.route('/activepincode')
      .post(authenticationToken(),controller.PincodeSelectActiveAll);

router.route('/adderssdelete')
      .post(authenticationToken(),controller.CustomerAdderssDelete);

router.route('/bankaccountupdate')
      .post(authenticationToken(),controller.CustomerBankAccountUpdate);

router.route('/customeraccount')
      .post(authenticationToken(),controller.CustomerAccountSelectCategoryWiseList);

router.route('/accountdelete')
      .post(authenticationToken(),controller.CustomerAccountDelete);

router.route('/retailerwiseproduct')
      .post(authenticationToken(),controller.RetailerWiseProducts);

router.route('/retailerwisecategory')
      .post(authenticationToken(),controller.RetailerWiseCategory);

router.route('/orderinsertbeforepayment')
      .post(authenticationToken(),controller.OrderInsertBeforePayment);
router.route('/mischarges') 
      .post(controller.MisChargeSettings);
router.route('/getpaymentmode')
      .post(authenticationToken(),controller.GetPaymentMode);

router.route('/customercartcount')
      .post(authenticationToken(),controller.CustomerCartCount);

router.route('/ccavRequestHandler')
      .get(controller.CcavRequestHandler);
      
router.route('/ccavResponseHandler')
      .post(controller.CcavResponseHandler);
    
router.route('/uploadimg')
      .post(authenticationToken(),controller.UploadBase64Img);

router.route('/customer')
      .post(authenticationToken(),controller.CsutomerListByid)
router.route('/cancelredirectpayment')
      .post(controller.CancelResponseHandler);

router.route('/paymentresponse')
      .post(authenticationToken(),controller.PaymentResponse);
router.route('/orderlist')
      .post(authenticationToken(),controller.OrderListByCustomerId);

router.route('/ordercancel')
      .post(authenticationToken(),controller.OrderCancelByOrderId);

router.route('/orderrefund')
      .post(authenticationToken(),controller.OrderRefundByOrderId);

router.route('/customerwallet')
      .post(authenticationToken(),controller.CustomerWallet);

router.route('/orderdetailsbyid')
      .post(authenticationToken(),controller.OrderDetailsById);

router.route('/addfavoritebycustomer')
      .post(authenticationToken(),controller.AddFavoriteByCustomer);

router.route('/favoriteproductdeletebycustomer')
      .post(authenticationToken(),controller.FavoriteProductDeleteByCustomer)

router.route('/favoriteproductlisting')
      .post(authenticationToken(),controller.FavoriteProductSelectedByCustomer);

router.route('/orderratingbycustomer')
      .post(authenticationToken(),controller.OrderRatingByCustomerId);

router.route('/bestsellingfoodview')
      .post(authenticationToken(),controller.BestSellingFoodListView);

router.route('/bestsellinggrocerylistview')
      .post(authenticationToken(),controller.BestSellingGroceryListView);

router.route('/bestsellingfrozenlistview')
      .post(authenticationToken(),controller.BestSellingFrozenListView);

router.route('/reorder')
      .post(authenticationToken(),controller.ReOrder);
router.route('/productdetailsbyid')
      .post(controller.ProductDetailsById)

router.route('/medicineproductserachList')
      .post(controller.MedicineProductSerachList)

router.route('/cmsbykey')
      .post(controller.CmsSelectByKey)
      
router.post('/search-bar',controller.backendSearchBar)

router.post('/commission-breakup',controller.commissionBreakup)


router.post('/save-payment',authenticationToken(),controller.savePayment)

router.post('/delete-cart-value',controller.deleteCartValue)

router.post('/refund',controller.refundPayout)

router.post('/product-delter-cart-by-id',authenticationToken(),controller.productDeleterCart)

router.post('/payment-status',authenticationToken(),controller.paymentStatus)


module.exports = router;