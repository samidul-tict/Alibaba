const connection  =  require('../config/db');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const multer  = require('multer');
const upload = multer({dest: __dirname + '/uploads'});
var ccav = require('./ccavutil.js');
const ProductImg = "https://api.onlyalibaba.in/product/img/";
const ProductVideo = "https://api.onlyalibaba.in/product/videos/";
const CategoryImg = "https://api.onlyalibaba.in/category/img/";
const CategoryVideos = "https://api.onlyalibaba.in/category/videos/";
const RetailerImg = "https://api.onlyalibaba.in/retailer/img/";
const CustomerImg = "https://api.onlyalibaba.in/customer/img/";
var ccavReqHandler = require('./ccavRequestHandler.js');
var ccavResHandler = require('./ccavResponseHandler.js');
var qs = require('querystring');
const Razorpay = require('razorpay');
const request = require('request');

const razorpay = { key_id: 'rzp_test_OUSW1j56KC15A9', key_secret: 'IYVAwHGdZqE9g6Ria6ebzWCa' };
const instance = new Razorpay({
  key_id: razorpay.key_id,
  key_secret: razorpay.key_secret
})
var fs = require('fs');
var path = require('path');
var base64ToImage = require('base64-to-image');
const Entities = require('html-entities').XmlEntities;
const { del } = require('request');
const entities = new Entities();
var information = [];



function mobileOTP(PhoneNumberSMSGateway,OTPSMSGateway){
var urlencode = require('urlencode');
var request = require('request');
var des = 'destination='+PhoneNumberSMSGateway;
var OTP_msg = `Dear Customer, ${OTPSMSGateway} is your OTP for login to Only Alibaba app.` ;
var new_OTP_msg = urlencode(OTP_msg);
var msg = 'message='+ new_OTP_msg;
// var url ='https://sms6.rmlconnect.net/bulksms/bulksms?username=agroyOTP&password=3aPxS2mk&type=0&dlr=0&'+des+'&source=ALIBBA&'+msg;

request({
    url: 'https://sms6.rmlconnect.net/bulksms/bulksms?username=agroyOTP&password=3aPxS2mk&type=0&dlr=0&'+des+'&source=GRFJPL&'+msg,
   
    method: 'GET',

}, function(error, response, body){
    if(error) {
        console.log(error);
    } else {
        console.log(response.statusCode, body);
    }
});
}




module.exports = {
    main : (req,res)=>{
        res.json("App Service Working");
    },

//*______________Start Of Login_____________________________________________*//
UserLogin :(req,res)=>{
      var phnumber = req.body.phnumber;
      var devicekey =req.body.devicekey;                              
        let sqlInsert ="call customermaster_existance_check  ('"+phnumber+"','"+devicekey+"') ";
          connection.query(sqlInsert,(err,docs)=>{
            if(err){
              res.json({'status':'400','error':err})
              }
             let data = docs;   
              var PhoneNumberSMSGateway = phnumber;
              var OTPSMSGateway = data[0][0].In_OTP;
              mobileOTP(PhoneNumberSMSGateway,OTPSMSGateway)
              res.json({"status":"200","data":data[0]});
          });                                                                                    
    
},

CustomerValidate :(req,res)=>{
var customerid = req.body.CustomerId;
var otp = req.body.OTP;
var refcode =   req.body.RefCode != null ? "'"+req.body.RefCode+"'" : null;
var AddFavorite = req.body.AddFav;
var AddCart = req.body.AddCart;
   connection.query('SELECT * FROM customermaster WHERE CustomerId =? ',[customerid],(err,users,fields)=>{
            if (err){
              res.json({'status':'400','error':err})
            }else{
            if(users.length>0){
                if(otp == users[0].OTP){
                    users.find((u)=>{
                    if(u.CustomerId == customerid && u.OTP == otp){
                    var user = u;
                    jwt.sign({user},'secretkey',(err,token)=>{
                        if(err){
                          res.json({'status':'400','error':err})
                        }else{
                        let new_token = token; 
                var check = "CALL customermaster_otp_check_and_detail ('"+req.body.CustomerId+"','"+req.body.OTP+"',"+refcode+")";
                connection.query(check,(err,docs)=>{
                 if(err){
                   res.json({'error':err})
                 }else{
                  if(docs[0] == ""){
                    res.json({'status':'400','message':'OTP has been expired. Please regenerate.'})
                  }else{
                  var data = docs[0];
                  var value = [];
                  var info = {};
                  info["CustomerId"]=data[0].CustomerId;
                  info["CustomerType"]=data[0].CustomerType;
                  info["Name"]=data[0].Name;
                  info["Phone"]=data[0].Phone;
                  info["DefaultAddress"]=data[0].DefaultAddress;
                  info["Email"]=data[0].Email;
                  info["DefaultLandmark"]=data[0].DefaultLandmark;
                  info["DefaultPincode"]=data[0].DefaultPincode;
                  info["ProfileImage"]=CustomerImg + data[0].ProfileImage;
                  info["DeviceKey"]=data[0].DeviceKey;
                  info["OwnRefCode"]=data[0].OwnRefCode;
                  info["RefCustomerId"]=data[0].RefCustomerId;
                  info["WalletValue"]=data[0].WalletValue;
                  info["CartCount"]=data[0].CartCount;
                  info["TypeName"]=data[0].TypeName;
                  info["OTP"]=data[0].OTP;
                  info["TotalWalletAmt"]=data[0].TotalWalletAmt;
                  value.push(info);
                  var DeviceKeyFire = data[0].DeviceKey;
                  var OTPFire = data[0].OTP;
                  var EmailData = data[0].Email;
       
                  if(data[0].Name == null){
                    info["Name"]="Guest";
                    res.json({'status':'200','data':value,'token':token});
                    if(AddFavorite !==null){
                      for(var i=0; i<AddFavorite.length; i++){
                        connection.query("CALL customerfav_add ("+data[0].CustomerId+","+ AddFavorite[i].ProductId+")",(err,docs)=>{
                          console.log("Sucessfully Updated")
                          
                        })
                      }
                      
                    }
                    if(AddCart !==null){
                      for(var i=0; i<AddCart.length; i++){
                        connection.query("CALL customercart_add ("+data[0].CustomerId+","+ AddCart[i].ProductId+","+AddCart[i].Quantity+")",(err,docs)=>{
                          console.log("Sucessfully Updated")
                         
                        })
                      }
                      
                    }
                   else{
                      console.log("Not-Ok")
                    }
                    
                  }else{
                     
                      res.json({'status':'200','data':value,'token':token});
                      if(AddFavorite !==null){
                        for(var i=0; i<AddFavorite.length; i++){
                          connection.query("CALL customerfav_add ("+data[0].CustomerId+","+ AddFavorite[i].ProductId+")",(err,docs)=>{
                            console.log("Sucessfully Updated")
                            
                          })
                      }
                      }
                      if(AddCart !==null){
                        for(var i=0; i<AddCart.length; i++){
                          connection.query("CALL customercart_add  ("+data[0].CustomerId+","+ AddCart[i].ProductId+","+AddCart[i].Quantity+")",(err,docs)=>{
                            console.log("Sucessfully Updated")
                            
                          })
                        }
                        
                      }
                      else{
                        console.log("Not-Ok")
                      }
                           
                  }

                  }
                 
                 }
              })
              }  
              })
              }
            })          
          }
            else{
                    res.status(404).json({'status':'404',message:'OTP Not Matched'})
                }
            }
            else{
                res.status(404).json({'status':'404',message:'CustomerId Not Matched'});
            }
        }
        })

},


ParentChildBannerListView : (req,res)=>{
        connection.query("CALL categorymaster_select_active_parent_list",(err,docs1)=>{
            if(err){
                res.json({'error':err})
    
            }else{                       
              var sql = "CALL categorymaster_child_list_by_parent ('"+req.body.ParentCategoryId+"')";
              connection.query(sql,(err,docs22)=>{
                if(err){
                  res.json({'error':err})
              }else{
                var docs2 = docs22[0]
                var DocsArr = []
                  for(var i=0 ; i<docs2.length ; i++){
                    if(docs2[i].CoverImage ===null){
                      var DocsObj = {}
                      DocsObj["CategoryId"]=docs2[i].CategoryId
                      DocsObj["ParentCategoryId"]=docs2[i].ParentCategoryId 
                      DocsObj["Category"]=docs2[i].Category
                      DocsObj["CoverImage"]= "no.jpg"
                      DocsObj["CoverVideo"]=docs2[i].CoverVideo
                      DocsObj["Description"]=docs2[i].Description
                      DocsObj["IsActive"]=docs2[i].IsActive
                      DocsObj["CreatedOn"]=docs2[i].CreatedOn
                      DocsObj["CreatedBy"]=docs2[i].CreatedBy
                      DocsObj["ModifiedOn"]=docs2[i].ModifiedOn
                      DocsObj["ModifiedBy"]=docs2[i].ModifiedBy
                      DocsObj["IsFeatured"]=docs2[i].IsFeatured
                      DocsObj["IsSpecial"]=docs2[i].IsSpecial
                      DocsObj["IsParent"]=docs2[i].IsParent
                      DocsObj["DisplayOrder"]=docs2[i].DisplayOrder
                      DocsObj["IsTopMenu"]=docs2[i].IsTopMenu
                      DocsObj["IsEdit"]=docs2[i].IsEdit
                      DocsObj["IsDeleted"]=docs2[i].IsDeleted
                      DocsArr.push(DocsObj)

                    }else{
                      var DocsObj2 = {}
                      DocsObj2["CategoryId"]=docs2[i].CategoryId
                      DocsObj2["ParentCategoryId"]=docs2[i].ParentCategoryId 
                      DocsObj2["Category"]=docs2[i].Category
                      DocsObj2["CoverImage"]= docs2[i].CoverImage
                      DocsObj2["CoverVideo"]=docs2[i].CoverVideo
                      DocsObj2["Description"]=docs2[i].Description
                      DocsObj2["IsActive"]=docs2[i].IsActive
                      DocsObj2["CreatedOn"]=docs2[i].CreatedOn
                      DocsObj2["CreatedBy"]=docs2[i].CreatedBy
                      DocsObj2["ModifiedOn"]=docs2[i].ModifiedOn
                      DocsObj2["ModifiedBy"]=docs2[i].ModifiedBy
                      DocsObj2["IsFeatured"]=docs2[i].IsFeatured
                      DocsObj2["IsSpecial"]=docs2[i].IsSpecial
                      DocsObj2["IsParent"]=docs2[i].IsParent
                      DocsObj2["DisplayOrder"]=docs2[i].DisplayOrder
                      DocsObj2["IsTopMenu"]=docs2[i].IsTopMenu
                      DocsObj2["IsEdit"]=docs2[i].IsEdit
                      DocsObj2["IsDeleted"]=docs2[i].IsDeleted
                      DocsArr.push(DocsObj2)
                      }
                  }
                    connection.query("CALL bannermaster_select_active_list",(err,docs3)=>{
                    if(err){
                             res.json({'error':err})
                    }
                    else{
                          var BannerImg = "https://api.onlyalibaba.in/banner/img/";                    
                          res.json({'status':'200','parent_category':docs1[0],'ParentCategoryImgUrl':CategoryImg,'ParentCategoryVideoUrl':CategoryVideos , 'child_category':DocsArr,'CategoryImgUrl':CategoryImg, 'CategoryVideoUrl':CategoryVideos, 'banner_list':docs3[0],'BannerImgUrl':BannerImg , 'BestSellingImgUrl':ProductImg});
                          }
                      })
                    }
                })
            }
        })
                                   
              
  },

CategoryWiseSelectView : (req,res)=>{  
        connection.query("CALL categorymaster_child_list_by_parent ('"+req.body.CategoryId+"')",(err,categorywise)=>{
            if(err){
                res.json({'error':err})
    
            }else{
              var docs2 = categorywise[0]
                var DocsArr = []
                  for(var i=0 ; i<docs2.length ; i++){
                    if(docs2[i].CoverImage ===null){
                      var DocsObj = {}
                      DocsObj["CategoryId"]=docs2[i].CategoryId
                      DocsObj["ParentCategoryId"]=docs2[i].ParentCategoryId 
                      DocsObj["Category"]=docs2[i].Category
                      DocsObj["CoverImage"]= "no.jpg"
                      DocsObj["CoverVideo"]=docs2[i].CoverVideo
                      DocsObj["Description"]=docs2[i].Description
                      DocsObj["IsActive"]=docs2[i].IsActive
                      DocsObj["CreatedOn"]=docs2[i].CreatedOn
                      DocsObj["CreatedBy"]=docs2[i].CreatedBy
                      DocsObj["ModifiedOn"]=docs2[i].ModifiedOn
                      DocsObj["ModifiedBy"]=docs2[i].ModifiedBy
                      DocsObj["IsFeatured"]=docs2[i].IsFeatured
                      DocsObj["IsSpecial"]=docs2[i].IsSpecial
                      DocsObj["IsParent"]=docs2[i].IsParent
                      DocsObj["DisplayOrder"]=docs2[i].DisplayOrder
                      DocsObj["IsTopMenu"]=docs2[i].IsTopMenu
                      DocsObj["IsEdit"]=docs2[i].IsEdit
                      DocsObj["IsDeleted"]=docs2[i].IsDeleted
                      DocsArr.push(DocsObj)

                    }else{
                      var DocsObj2 = {}
                      DocsObj2["CategoryId"]=docs2[i].CategoryId
                      DocsObj2["ParentCategoryId"]=docs2[i].ParentCategoryId 
                      DocsObj2["Category"]=docs2[i].Category
                      DocsObj2["CoverImage"]= docs2[i].CoverImage
                      DocsObj2["CoverVideo"]=docs2[i].CoverVideo
                      DocsObj2["Description"]=docs2[i].Description
                      DocsObj2["IsActive"]=docs2[i].IsActive
                      DocsObj2["CreatedOn"]=docs2[i].CreatedOn
                      DocsObj2["CreatedBy"]=docs2[i].CreatedBy
                      DocsObj2["ModifiedOn"]=docs2[i].ModifiedOn
                      DocsObj2["ModifiedBy"]=docs2[i].ModifiedBy
                      DocsObj2["IsFeatured"]=docs2[i].IsFeatured
                      DocsObj2["IsSpecial"]=docs2[i].IsSpecial
                      DocsObj2["IsParent"]=docs2[i].IsParent
                      DocsObj2["DisplayOrder"]=docs2[i].DisplayOrder
                      DocsObj2["IsTopMenu"]=docs2[i].IsTopMenu
                      DocsObj2["IsEdit"]=docs2[i].IsEdit
                      DocsObj2["IsDeleted"]=docs2[i].IsDeleted
                      DocsArr.push(DocsObj2)
                  }
                }
            res.json({'status':'200','data':DocsArr,'CategoryWiseProductImg':CategoryImg,'CategoryWiseProductVideo':CategoryVideos});
            }
        })
     
  },

ProductMasterSelectFeatureList :(req,res)=>{ 
        connection.query("CALL productmaster_select_featured_list ("+req.body.CustomerId+") ",(err,docs)=>{
            if(err){
                res.json({'error':err})
    
            }else{
            res.json({'status':'200','data':docs[0],'ProductImg':ProductImg,'ProductVdeo':ProductVideo});
            }
        })
  },

CustomerProfileUpdate : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
        var base64Str = req.body.myFile;
        var Image_null = req.body.myFile != null ? "'"+req.body.myFile+"'" : null;  
        var name =   req.body.name != null ? "'"+req.body.name+"'" : null;
        var email =   req.body.email != null ? "'"+req.body.email+"'" : null;
        var address =   req.body.address != null ? "'"+req.body.address+"'" : null;
        var landmark =   req.body.landmark != null ? "'"+req.body.landmark+"'" : null;
        var pincode =   req.body.pincode != null ? "'"+req.body.pincode+"'" : null;
        var refcode =   req.body.refcode != null ? "'"+req.body.refcode+"'" : null;
        if(Image_null === null){
        var Image_alibaba = "no.jpg";      
        var sql = "CALL customermaster_profile_update ("+req.body.CustomerId+","+req.body.customertype+","+name+","+address+","+email+","+landmark+","+pincode+",'"+Image_alibaba+"',"+refcode+")"; 
        connection.query(sql,(err)=>{
        if(err){
            res.json({'error':err})
        }else{
          res.json({'status':'200',message:'Sucessfully updated'});
        }
      })       
      }else{
        var base64Str = req.body.myFile;
        var path ='uploads/customer/img/';
        var imageFileName = Date.now();
        var imageName = imageFileName.toString();
        var optionalObj = {'fileName': imageName, 'type':'png'};
        var image = base64ToImage(base64Str,path,optionalObj);
        var Image =image.fileName;
         var sql = "CALL customermaster_profile_update ("+req.body.CustomerId+",'"+req.body.customertype+"',"+name+","+address+","+email+","+landmark+","+pincode+",'"+Image+"',"+refcode+")"; 
        connection.query(sql,(err)=>{
        if(err){
            res.json({'error':err})
        }else{
          res.json({'status':'200',message:'Sucessfully updated'});
        }
      })
      }   
    }
  })         
},

CustomerAddCart : (req,res)=>{
	jwt.verify(req.token,'secretkey',(err)=>{
		if(err){
			res.json({'error':err})
		}else{
			var deviceKey = "'"+req.body.deviceId+"'"
			var Quantity = typeof req.body.Quantity != 'undefined' && req.body.Quantity != '' && req.body.Quantity !=null ?  req.body.Quantity : 1;
			
			var sql = `SELECT * FROM productmaster_bulk_price WHERE product_id=${req.body.ItemId} and quantity <= ${Quantity} ORDER BY quantity DESC limit 1;`;
			connection.query(sql,(err,productbulkprice)=>{
				if(err){
					res.json({'error':err})
				}else{
					ret = JSON.stringify(productbulkprice);
					var jsonobj =  JSON.parse(ret);
					//console.log(jsonobj);
					if(jsonobj.length === 0){
						var sql = `SELECT * FROM productmaster WHERE ProductId=${req.body.ItemId};`;
						connection.query(sql,(err,productarr)=>{
							if(err){
								res.json({'error':err})
							}else{
								ret = JSON.stringify(productarr);
								var proddet =  JSON.parse(ret);

								var finalprice = proddet[0].DiscountedPrice;
									
								var sql = `SELECT * FROM customercart WHERE CustomerId=${req.body.CustomerId} AND ProductId=${req.body.ItemId} AND deviceKey=${deviceKey}`;
								connection.query(sql,(err,data)=>{
									if(err){
										res.json({'error':err})
									}else{
										ret = JSON.stringify(data);
										var jsonobj =  JSON.parse(ret);
										// console.log(jsonobj.length === 0);return;
										if(jsonobj.length === 0){
											var sql = `INSERT INTO customercart (CustomerId, ProductId, Quantity, Price, deviceKey) VALUES (${req.body.CustomerId},${req.body.ItemId},${Quantity},${finalprice},${deviceKey})`;
											connection.query(sql,(err)=>{
												if(err){
													res.json({'error':err})
												}else{
													res.json({'status':'200',message:'Cart Added Sucessfully'});
												}
											})
										}else{
                      // console.log(req.body.Quantity);return;
                      var QuantityIncr = jsonobj[0].Quantity + req.body.Quantity;
											var sql = `UPDATE customercart SET Quantity=${QuantityIncr} , Price=${finalprice} WHERE deviceKey=${deviceKey} AND CartId=${jsonobj[0].CartId} `;
											connection.query(sql,(err)=>{
												if(err){
													res.json({'error':err})
												}else{
													res.json({'status':'200',message:'Cart Added Sucessfully'});
												}
											})
										}
									}
								})
							}
						})
					}else{
						// console.log(jsonobj[0].offer_price);
						var sql = `SELECT * FROM productmaster WHERE ProductId=${req.body.ItemId};`;
						connection.query(sql,(err,productarr)=>{
							if(err){
								res.json({'error':err})
							}else{
								ret = JSON.stringify(productarr);
								var proddet =  JSON.parse(ret);

								var finalprice = proddet[0].DiscountedPrice - (proddet[0].DiscountedPrice * jsonobj[0].offer_price/100);
								// console.log(finalprice+" initialize");
									
								var sql = `SELECT * FROM customercart WHERE CustomerId=${req.body.CustomerId} AND ProductId=${req.body.ItemId} AND deviceKey=${deviceKey}`;
								connection.query(sql,(err,data)=>{
									if(err){
										res.json({'error':err})
									}else{
										ret = JSON.stringify(data);
										var jsonobj =  JSON.parse(ret);
										// console.log(jsonobj.length === 0);return;
										if(jsonobj.length === 0){
											var sql = `INSERT INTO customercart (CustomerId, ProductId, Quantity, Price, deviceKey) VALUES (${req.body.CustomerId},${req.body.ItemId},${Quantity},${finalprice},${deviceKey})`;
											connection.query(sql,(err)=>{
												if(err){
													res.json({'error':err})
												}else{
													res.json({'status':'200',message:'Cart Added Sucessfully'});
												}
											})
										}else{
                      // console.log(req.body.Quantity);return;
                      var QuantityIncr = jsonobj[0].Quantity + req.body.Quantity;
											var sql = `UPDATE customercart SET Quantity=${QuantityIncr} , Price=${finalprice} WHERE deviceKey=${deviceKey} AND CartId=${jsonobj[0].CartId} `;
											connection.query(sql,(err)=>{
												if(err){
													res.json({'error':err})
												}else{
													res.json({'status':'200',message:'Cart Added Sucessfully'});
												}
											})
										}
									}
								})
							}
						})
					}
				}
			})
		}
	})
},

//*______________Start Of CustomerAddCart_____________________________________________*//

//*______________Start Of CustomerCartProductQuantityUpdate_____________________________________________*//

CustomerCartProductQuantityUpdate : (req,res)=>{
	jwt.verify(req.token,'secretkey',(err)=>{
		if(err){
			res.json({'error':err})
		}else{

			var sql = `SELECT * FROM customercart WHERE CartId=${req.body.cartid}`;
			connection.query(sql,(err,cartarr)=>{
				if(err){
					res.json({'error':err})
				}else{
					cartar = JSON.stringify(cartarr);
					var jsonobjcartarr =  JSON.parse(cartar);
					// var Quantity = jsonobjcartarr[0].Quantity + req.body.quantity;
					var Quantity = req.body.quantity;
					// console.log(Quantity);return;
 
					var sql = `SELECT * FROM productmaster_bulk_price WHERE product_id=${req.body.productid} and quantity < ${Quantity} ORDER BY quantity DESC limit 1;`;
					connection.query(sql,(err,productbulkprice)=>{
						if(err){
							res.json({'error':err})
						}else{
							ret = JSON.stringify(productbulkprice);
							var jsonobj =  JSON.parse(ret);
							//console.log(jsonobj);
							if(jsonobj.length === 0){
								var sql = `SELECT * FROM productmaster WHERE ProductId=${req.body.productid};`;
								connection.query(sql,(err,productarr)=>{
									if(err){
										res.json({'error':err})
									}else{
										ret = JSON.stringify(productarr);
										var proddet =  JSON.parse(ret);

										var finalprice = proddet[0].DiscountedPrice;
											
										var sql = `UPDATE customercart SET Quantity=${Quantity} , Price=${finalprice} WHERE CartId=${req.body.cartid} `;
										connection.query(sql,(err,cartedet)=>{
											if(err){
												res.json({'error':err})
											}else{
												res.json({'status':'200',message:'Cart Updated Sucessfully'});
											}
										})
									}
								})
							}else{
								// console.log(jsonobj[0].offer_price);
								var sql = `SELECT * FROM productmaster WHERE ProductId=${req.body.productid};`;
								connection.query(sql,(err,productarr)=>{
									if(err){
										res.json({'error':err})
									}else{
										ret = JSON.stringify(productarr);
										var proddet =  JSON.parse(ret);

										var finalprice = proddet[0].DiscountedPrice - (proddet[0].DiscountedPrice * jsonobj[0].offer_price/100);
										// console.log(finalprice+" initialize");
											
										var sql = `UPDATE customercart SET Quantity=${Quantity} , Price=${finalprice} WHERE CartId=${req.body.cartid} `;
										connection.query(sql,(err,cartedet)=>{
											if(err){
												res.json({'error':err})
											}else{
												res.json({'status':'200',message:'Cart Updated Sucessfully'});
											}
										})
									}
								})
							}
						}
					})
				}
			})
			

			// var sql = "CALL customercart_product_quantity_update ('"+req.body.cartid+"','"+req.body.quantity+"') ";
			// connection.query(sql,(err)=>{
			// 	if(err){
			// 		res.json({'error':err})
			// 	}else{
			// 		res.json({'status':'200',message:'Product Quantity Updated..'});
			// 	}
			// })
		}
	})
},
//*______________End Of CustomerCartProductQuantityUpdate_____________________________________________*//

//*______________Start Of CustomerCartDelete_____________________________________________*//
 CustomerCartDelete : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
      var sql = "CALL customercart_delete ('"+req.body.cartid+"')";
      connection.query(sql,(err)=>{
        if(err){
            res.json({'error':err})
        }else{
          res.json({'status':'200',message:'Deleted Sucessfully'});
        }
      })
    }
    })
  },
//*______________Start Of CustomerCartDelete_____________________________________________*//
 /*  API Function For Customer Cart Listing */

CustomerCartList :(req,res)=>{
	jwt.verify(req.token,'secretkey',(err)=>{
		if(err){
			res.json({'error':err})
		}else{
			const id = req.body.CustomerId;
			const deviceKey = "'"+req.body.deviceId+"'"
			var queryString = `CALL customercart_list(${id},${deviceKey})`;
			connection.query(queryString, async(err,docs)=>{
			ret = JSON.stringify(docs[0]);
			var recjsonobj =  JSON.parse(ret);
			// console.log(recjsonobj);
				if(err){
					res.json({'error':err})
				}else{
				if(docs[0].length === 0){
					// console.log(docs[0].length);
					res.status(200).json({'status':'404',message:"Customer Cart Empty",'data':docs[0],'ProductImgUrl':ProductImg});
				}else{
					for(var i=0 ; i<recjsonobj.length ; i++){
					let BulkPriceArr = await new Promise((resolve, reject) => {
						connection.query('SELECT * FROM productmaster_bulk_price WHERE product_id=?',recjsonobj[i].ProductId, (err,result,fields)=>{
						ret = JSON.stringify(result);
						var jsonobj =  JSON.parse(ret);
						
						let newArr = [];
						for(var j=0; j<jsonobj.length ; j++){
							var newobj = {}
							newobj["Quantity"]=jsonobj[j].quantity
							newobj["OfferPrice"]=jsonobj[j].offer_price
							newArr.push(newobj)
						}
						console.log(newArr)
						resolve(newArr);
						reject("Something Went Wrong");
						}) 
					})
					// console.log(BulkPriceArr);
					recjsonobj[i]["Bulkprice"]=BulkPriceArr
					// recjsonobj.push(BulkPriceArr);
					}
					// console.log(recjsonobj);
					// console.log(BulkPriceArr);
					res.status(200).json({'status':'200','data':recjsonobj,'ProductImgUrl':ProductImg});
					// res.status(200).json({'status':'200','data':docs[0],'ProductImgUrl':ProductImg});
				}
				
				}
			})
		}
	})
},


//*--------Product Listing------*//
GetProductsById : (req,res)=>{
var pageNo = req.body.Page;
var deviceKey = "'"+req.body.deviceId+"'";
	var sql = "call productmaster_select_categorywise_list ('"+req.body.CategoryId+"',"+req.body.CustomerId+","+req.body.Page+","+req.body.Size+","+deviceKey+")";
	connection.query(sql, async (err,docs)=>{
		if(err){
			res.json({'error':err})

		}else{
		// console.log(docs)
		// console.log("dfgdf")
		var docs2 = docs[0]
			var DocsArr = []
			for(var i=0 ; i<docs2.length ; i++){
				let BulkPriceArr = await new Promise((resolve, reject) => {
				connection.query('SELECT * FROM productmaster_bulk_price WHERE product_id=?',[docs2[i].ProductId],(err,result,fields)=>{
					// if(err){
					//   console.log(err)
					//   res.json({'error':err})
					// }else{
					ret = JSON.stringify(result);
					var jsonobj =  JSON.parse(ret);
					
					let newArr = [];
					for(var j=0 ; j<jsonobj.length ; j++){
						var newobj = {}
						newobj["Quantity"]=jsonobj[j].quantity
						newobj["OfferPrice"]=jsonobj[j].offer_price
						//console.log(jsonobj)
						newArr.push(newobj)
					}
					resolve(newArr);
					reject("Something Went Wrong");
					// }
				})

				})
				if(docs2[i].CoverImage === null){
					var DocsObj = {}
					DocsObj["Bulkprice"]=BulkPriceArr
					DocsObj["ProductId"]=docs2[i].ProductId
					DocsObj["ProductCode"]=docs2[i].ProductCode 
					DocsObj["IsCombo"]=docs2[i].IsCombo
					DocsObj["Name"]= docs2[i].Name
					DocsObj["ShortDescription"]=docs2[i].ShortDescription
					DocsObj["FullDescription"]=docs2[i].FullDescription
					DocsObj["Pcs"]=docs2[i].Pcs
					DocsObj["StandardPrice"]=docs2[i].StandardPrice
					DocsObj["DiscountedPrice"] = docs2[i].DiscountedPrice
					DocsObj["OldPrice"]=docs2[i].OldPrice
					DocsObj["Cost"]=docs2[i].Cost
					DocsObj["CoverImage"]="no.jpg";
					DocsObj["CoverVideo"]=docs2[i].CoverVideo
					DocsObj["IsFeatured"]=docs2[i].IsFeatured
					DocsObj["IsShowOnHomePage"]=docs2[i].IsShowOnHomePage
					DocsObj["DisplayOrder"]=docs2[i].DisplayOrder
					DocsObj["MetaKeyWords"]=docs2[i].MetaKeyWords
					DocsObj["MetaDescription"]=docs2[i].MetaDescription
					DocsObj["MetaTitle"]=docs2[i].MetaTitle
					DocsObj["Sku"]=docs2[i].Sku
					DocsObj["IsFreeShipping"]=docs2[i].IsFreeShipping
					DocsObj["IsTaxExempt"]=docs2[i].IsTaxExempt
					DocsObj["TaxCategoryId"]=docs2[i].TaxCategoryId
					DocsObj["DisplayStockAvailability"]=docs2[i].DisplayStockAvailability
					DocsObj["DisplayStockQuantity"]=docs2[i].DisplayStockQuantity
					DocsObj["NotReturnable"]=docs2[i].NotReturnable
					DocsObj["Weight"]=docs2[i].Weight
					DocsObj["Length"]=docs2[i].Length
					DocsObj["Width"]=docs2[i].Width
					DocsObj["Height"]=docs2[i].Height
					DocsObj["ProductTags"]=docs2[i].ProductTags
					DocsObj["Manufacturer"]=docs2[i].Manufacturer
					DocsObj["RetailerId"]=docs2[i].RetailerId
					DocsObj["IsActive"]=docs2[i].IsActive
					DocsObj["CreatedOn"]=docs2[i].CreatedOn
					DocsObj["CreatedBy"]=docs2[i].CreatedBy
					DocsObj["ModifiedOn"]=docs2[i].ModifiedOn
					DocsObj["ModifiedBy"]=docs2[i].ModifiedBy
					DocsObj["Brand"]=docs2[i].Brand
					DocsObj["FoodType"]=docs2[i].FoodType
					DocsObj["HSNCode"]=docs2[i].HSNCode
					DocsObj["IsDeleted"]=docs2[i].IsDeleted
					DocsObj["IsAvailable"]=docs2[i].IsAvailable
					DocsObj["RetailerPrice"]=docs2[i].RetailerPrice
					DocsObj["IsAdded"]=docs2[i].IsAdded
					DocsObj["IsSpecial"]=docs2[i].IsSpecial
					DocsObj["IsFav"]=docs2[i].IsFav
					DocsObj["Quantity"]=docs2[i].CartQuantity
					DocsObj["MinOrderQty"] = docs2[i].MinOrderQty
					DocsObj["Percentage"]=docs2[i].Percentage
					DocsArr.push(DocsObj)

				}else{
					var DocsObj2 = {}
					DocsObj2["Bulkprice"]=BulkPriceArr
					DocsObj2["ProductId"]=docs2[i].ProductId
					DocsObj2["ProductCode"]=docs2[i].ProductCode 
					DocsObj2["IsCombo"]=docs2[i].IsCombo
					DocsObj2["Name"]= docs2[i].Name
					DocsObj2["ShortDescription"]=docs2[i].ShortDescription
					DocsObj2["FullDescription"]=docs2[i].FullDescription
					DocsObj2["Pcs"]=docs2[i].Pcs
					DocsObj2["StandardPrice"]=docs2[i].StandardPrice
					DocsObj2["DiscountedPrice"] = docs2[i].DiscountedPrice
					DocsObj2["OldPrice"]=docs2[i].OldPrice
					DocsObj2["Cost"]=docs2[i].Cost
					DocsObj2["CoverImage"]=docs2[i].CoverImage
					DocsObj2["CoverVideo"]=docs2[i].CoverVideo
					DocsObj2["IsFeatured"]=docs2[i].IsFeatured
					DocsObj2["IsShowOnHomePage"]=docs2[i].IsShowOnHomePage
					DocsObj2["DisplayOrder"]=docs2[i].DisplayOrder
					DocsObj2["MetaKeyWords"]=docs2[i].MetaKeyWords
					DocsObj2["MetaDescription"]=docs2[i].MetaDescription
					DocsObj2["MetaTitle"]=docs2[i].MetaTitle
					DocsObj2["Sku"]=docs2[i].Sku
					DocsObj2["IsFreeShipping"]=docs2[i].IsFreeShipping
					DocsObj2["IsTaxExempt"]=docs2[i].IsTaxExempt
					DocsObj2["TaxCategoryId"]=docs2[i].TaxCategoryId
					DocsObj2["DisplayStockAvailability"]=docs2[i].DisplayStockAvailability
					DocsObj2["DisplayStockQuantity"]=docs2[i].DisplayStockQuantity
					DocsObj2["NotReturnable"]=docs2[i].NotReturnable
					DocsObj2["Weight"]=docs2[i].Weight
					DocsObj2["Length"]=docs2[i].Length
					DocsObj2["Width"]=docs2[i].Width
					DocsObj2["Height"]=docs2[i].Height
					DocsObj2["ProductTags"]=docs2[i].ProductTags
					DocsObj2["Manufacturer"]=docs2[i].Manufacturer
					DocsObj2["RetailerId"]=docs2[i].RetailerId
					DocsObj2["IsActive"]=docs2[i].IsActive
					DocsObj2["CreatedOn"]=docs2[i].CreatedOn
					DocsObj2["CreatedBy"]=docs2[i].CreatedBy
					DocsObj2["ModifiedOn"]=docs2[i].ModifiedOn
					DocsObj2["ModifiedBy"]=docs2[i].ModifiedBy
					DocsObj2["Brand"]=docs2[i].Brand
					DocsObj2["FoodType"]=docs2[i].FoodType
					DocsObj2["HSNCode"]=docs2[i].HSNCode
					DocsObj2["IsDeleted"]=docs2[i].IsDeleted
					DocsObj2["IsAvailable"]=docs2[i].IsAvailable
					DocsObj2["RetailerPrice"]=docs2[i].RetailerPrice
					DocsObj2["IsAdded"]=docs2[i].IsAdded
					DocsObj2["IsSpecial"]=docs2[i].IsSpecial
					DocsObj2["IsFav"]=docs2[i].IsFav
					DocsObj2["Quantity"]=docs2[i].CartQuantity
					DocsObj2["MinOrderQty"] = docs2[i].MinOrderQty
					DocsObj2["Percentage"]=docs2[i].Percentage
					DocsArr.push(DocsObj2)
				}
			}
			res.json({'status':'200','data':DocsArr,'ProductImgUrl':ProductImg,'ProductVideoUrl':ProductVideo,'PageNo':pageNo})
		}
	})

},
    
/*  API Function For Customer Address Listing */

CustomerAddressListByCustomer :(req, res) =>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              var sql = "CALL customeraddress_select_customerwise_active_list ('"+req.body.CustomerId+"')";
              connection.query(sql, (err,docs) => {
                  if(err){
                      res.json({'error':err})

                  }else{
              res.json({'status': '200', 'data': docs[0]});
              }
          })
        }
    })
},

/*  API Function For Customer Address Add Edit */

CustomerAddressAddEdit : (req, res) =>
{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var addressid = req.body.addressid ? req.body.addressid : 0;
    var addressname = req.body.addressname != null  ? "'"+req.body.addressname+"'" : null;
    var name = req.body.name != null  ? "'"+req.body.name+"'" : null;
    var phone = req.body.phone != null  ? "'"+req.body.phone+"'" : null;
    var address = req.body.address != null  ? "'"+req.body.address+"'" : null;
    var email = req.body.email != null  ? "'"+req.body.email+"'" : null;
    var landmark = req.body.landmark != null  ? "'"+req.body.landmark+"'" : null;
    var pincode = req.body.pincode != null  ? "'"+req.body.pincode+"'" : null;
    var location = req.body.location != null  ? "'"+req.body.location+"'" : null;
    var lat = req.body.lat != null  ? "'"+req.body.lat+"'" : null;
    var lng = req.body.lng != null  ? "'"+req.body.lng+"'" : null;

    var sql = "CALL customeraddress_insert_update (" + req.body.addressid + ","+ req.body.CustomerId+"," + addressname + "," + name + "," + phone + "," + address + "," + email + "," + landmark + "," + pincode + "," + location + "," + lat + "," + lng + ")";
    connection.query(sql, (err,docs) => {
        if(err){
            res.json({'error':err})
        }else{
            res.json({'status': '200','data':docs[0], message: 'Sucessfully updated' });
        }
      })
    }
  })
},

GovtIdTypeList : (req,res)=>{  
    jwt.verify(req.token,'secretkey',(err)=>{
      if(err){
          res.json({'error':err})
      }else{
      connection.query("CALL govtidmaster_select_active_all",(err,docs)=>{
        if(err){
          res.json({'error':err})
        }else{
          res.json({'status':'200','data':docs[0]});
        }
      })
    }
    })
},
RetailActiveStatus : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
              if(err){
                res.json({'error':err})
              }else{
    connection.query("CALL retailermaster_select_active_all",(err,docs)=>{
      if(err){
        res.json({'error':err})
      }else{
        
        res.json({'status':'200','data':docs[0],'RetailerImgUrl':RetailerImg});
      }
    })
  }
  })
},
ParentCategoryById : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
              if(err){
                res.json({'error':err})
              }else{
    var sql= "CALL categorymaster_select_active_list_parent_category ('"+req.body.ParentCategoryId+"')";
    connection.query(sql,(err,docs)=>{
      if(err){
        res.json({'error':err})
      }else{
        res.json({'status':'200','data':docs[0],'CategoryImgUrl':CategoryImg,'CategoryVideoUrl':CategoryVideos});
      }
    })
  }
  })
},

ReatailerMasterStatus : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
              if(err){
                res.json({'error':err})
              }else{
    connection.query('CALL retailermaster_select_active_all',(err,docs)=>{
      if(err){
        res.json({'error':err})
      }else{
        res.json({'status':'200','data':docs[0],'RetailerImgUrl':RetailerImg})
      }
    })
  }
  })
},

PincodeSelectActiveAll : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
      connection.query('CALL pincodemaster_select_active_all',(err,docs)=>{
        if(err){
          res.json({'error':err})
        }else{
          res.json({'status':'200','data':docs[0]});
        }
      })
    }
    })
},
CustomerAdderssDelete : (req,res)=>{
      jwt.verify(req.token,'secretkey',(err)=>{
                if(err){
                  res.json({'error':err})
                }else{
      var sql ="CALL customeraddress_delete ('"+req.body.AdderssId+"','"+req.body.CreatedBy+"')";
      connection.query(sql,(err,docs)=>{
        if(err){
          res.json({'error':err})
        }else{
          res.json({'status':'200',message:'Adderss Sucessfully Deleted'})
        }
      })
    }
    }) 
},

CustomerBankAccountUpdate :(req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              var CustomerAccountId = typeof req.body.CustomerAccountId != 'undefined' && req.body.CustomerAccountId ? req.body.CustomerAccountId : 0;
              var CreatedBy = typeof req.body.CreatedBy != 'undefined' && req.body.CreatedBy ? req.body.CreatedBy : 0;
              var IsDefault = typeof req.body.IsDefault != 'undefined' && req.body.IsDefault ? req.body.IsDefault : 0;
              var sql = "CALL customeraccount_insert_update ('"+req.body.CustomerId+"',"+CustomerAccountId+",'"+req.body.BankName+"','"+req.body.AccountNo+"','"+req.body.IFSC+"','"+req.body.AccountHolderName+"','"+req.body.AccountHolderPhone+"','"+IsDefault+"',"+CreatedBy+") ";
              connection.query(sql,(err,docs)=>{
                if(err){
                  res.json({'error':err})
                }else{
                  res.json({'status':'200',message:'Bank Account Sucessfully Updated','data':docs[0]})
                }
              })
            }
            })
},
CustomerAccountSelectCategoryWiseList : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
            
  var customerid = req.body.CustomerId
  connection.query("CALL customeraccount_select_customerwise_active_list('"+customerid+"')",(err,docs)=>{
    if(err){
      res.json({'error':err})
    }else{
      connection.query("CALL customerwallet_history ('"+customerid+"')",(err,walletBreak)=>{
        if(err){
          res.json({'status':'400','error':err})
        }else{
      var walletValueFinal = 0.00;     
      for(var i of walletBreak[0]){
        walletValueFinal += i.Amount
      }   

      if(docs[0].length == 0){
        connection.query("SELECT * FROM customermaster WHERE CustomerId = ?",[customerid],(err,docs)=>{
          var data = docs;
          var account = { };
            var accountH = [];
            var name = typeof data[0].Name != 'undefined' && data[0].Name != '' ? data[0].Name: null;
          if(name == "null"){
            account["AccountHolderName"] = "Guest";
            account["AccountHolderPhone"]= data[0].Phone;
            account["WalletBalance"] = walletValueFinal;
            account["CustomerAccountId"]= '',
            account["CustomerId"]= '',
            account["BankName"]= '',
            account["AccountNo"]= '',
            account["IFSC"]= '',
            account["IsDefault"]= '',
            account["IsActive"]= '',
            account["ModifiedOn"]= '',
            account["ModifiedBy"]= '',     
            accountH.push(account); 
            res.json({'status':'200','data':accountH})

          }else{
            account["AccountHolderName"] = data[0].Name;
            account["AccountHolderPhone"]= data[0].Phone;
            account["WalletBalance"] = walletValueFinal;
            account["CustomerAccountId"]= '',
            account["CustomerId"]= '',
            account["BankName"]= '',
            account["AccountNo"]= '',
            account["IFSC"]= '',
            account["IsDefault"]= '',
            account["IsActive"]= '',
            account["ModifiedOn"]= '',
            account["ModifiedBy"]= '',
            accountH.push(account);
             res.json({'status':'200','data':accountH})

          }
        })
      }else{
         connection.query("SELECT * FROM customermaster WHERE CustomerId = ?",[customerid],(err,wallet)=>{
            var info = [];
            var data = docs[0];
            for(var i=0;i<data.length;i++){
              var new_data= {}
              new_data["CustomerAccountId"]= data[i].CustomerAccountId;
              new_data["CustomerId"]= data[i].CustomerId;
              new_data["BankName"]= data[i].BankName;
              new_data["AccountNo"]= data[i].AccountNo;
              new_data["IFSC"]= data[i].IFSC;
              new_data["AccountHolderName"]= data[i].AccountHolderName;
              new_data["AccountHolderPhone"]= data[i].AccountHolderPhone;
              new_data["IsDefault"]= data[i].IsDefault;
              new_data["IsActive"]= data[i].IsActive;
              new_data["ModifiedOn"]= data[i].ModifiedOn;
              new_data["ModifiedBy"]= data[i].ModifiedBy;
              new_data["WalletBalance"]=wallet[0].WalletValue;
              info.push(new_data)

            }
              res.json({'status':'200','data':info,'CustomerBreak':walletBreak[0]})
              })
            }
          }
      })
    }
  })
}
})
},
CustomerAccountDelete : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
  var sql = "CALL customeraccount_delete ('"+req.body.CustomerAccountId+"','"+req.body.CreatedBy+"')";
  connection.query(sql,(err,docs)=>{
    if(err){
      res.json({'error':err})
    }else{
      res.json({'status':'200',message:'Account Delete Sucessfully Completed'})
    }
  })
}
})
},


RetailerWiseProducts : (req,res)=>{
  var RetailerId = typeof req.body.RetailerId != 'undefined' && req.body.RetailerId != '' ? req.body.RetailerId: null;
  var sql = "CALL productmaster_select_retailer_categorywise_list ('"+req.body.CategoryId+"',"+RetailerId+","+req.body.CustomerId+")";
  connection.query(sql,(err,docs)=>{
    if(err){
      res.json({'error':err});
    }else{
      res.json({'status':'200','data':docs[0],'ProductImgUrl':ProductImg,'ProductVideoUrl':ProductVideo})
    }
  })

},
RetailerWiseCategory: (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
  var sql = "CALL categorymaster_retailerwise_select ('"+req.body.RetailerId+"')"
  connection.query(sql,(err,docs)=>{
    if(err){
      res.json({'error':err})
    }else{
      res.json({'status':'200','data':docs[0],'CategoryImgUrl':CategoryImg,'CategoryVideoUrl':CategoryVideos})
    }
  })
}
})
},

OrderInsertBeforePayment :async (req,res)=>{
	jwt.verify(req.token,'secretkey',async(err)=>{
		if(err){
			res.json({'error':err})
		}else{
			var customerId = req.body.CustomerId;
			var query1 = "CALL miscchargesettings_select";
			var deviceKey = "'"+req.body.deviceId+"'";
			var query2 = `CALL customercart_list(${customerId},${deviceKey})`;

			connection.query(query1,async(err,docsDelivery)=>{
				if(err){
					res.json(err) 
				}else{
					connection.query(query2,(err,docsCart)=>{
						if(err){
							res.json(err)
						}else{
							var taxAmount = 0.00;
							var subTotal = 0.00;
							// console.log(docsCart[0])
							// var productId = docsCart[0].ProductId;
							var customerId = docsCart[0][0].CustomerId;
							var deliveryAmount = docsDelivery[0][0].SpecialDeliveryRate;
							var beforediscountAmount = docsDelivery[0][0].SpecialDiscountRate;
							var totalQuantity = docsCart[0].length;
							var subtotalBeforeTax = 0.00;
							var quantityProduct = 0.00
							for(var i of docsCart[0]){
								subtotalBeforeTax += i.DiscountedPrice * i.Quantity;
								var itemTotal = i.DiscountedPrice * i.Quantity;
								taxAmount += (itemTotal * (i.Percentage / 100));
								subTotal +=  itemTotal;
								quantityProduct += i.Quantity
							}
							var beforeDiscountTotal = subTotal+taxAmount+deliveryAmount
							var discountAmount = (beforeDiscountTotal*beforediscountAmount)/100;
							var orderTotal = (beforeDiscountTotal-discountAmount)
							var totalRoundOff = orderTotal
							var roundOffAmount = totalRoundOff - orderTotal;
							var orderTotalInwords = orderTotalInToWords(Math.round(totalRoundOff))
							//res.json(docsCart)

							 console.log("Tax amount " + taxAmount + " sub total " + subTotal + " Deliveryamount " + deliveryAmount + " total round off " + totalRoundOff + "total quantity " + totalQuantity + "order total words " + orderTotalInwords + 
							 " round off amount " + roundOffAmount + " quantity product " + quantityProduct + " cusotmerid " + customerId)

							
							// if(taxAmount == req.body.TaxAmount && subTotal == req.body.SubTotal && deliveryAmount == req.body.DeliveryAmount && totalRoundOff == req.body.OrderTotal && totalQuantity == req.body.TotalQuantity && orderTotalInwords == req.body.TotalAmountInWords && roundOffAmount ==req.body.RoundOff && customerId == req.body.CustomerId){
								// console.log("ok")  
								var CustomerRemarks = req.body.CustomerRemarks != null  ? "'"+req.body.CustomerRemarks+"'" : null;
								if(req.body.PaymentModeId==1){
									var sql = "CALL ordermaster_insert_before_payment ('"+req.body.CustomerId+"','"+req.body.AdderssId+"','"+req.body.PaymentModeId+"','"+req.body.SubTotal+"','"+req.body.TaxRate+"','"+req.body.TaxAmount+"','"+req.body.IsSpecialDelivery+"','"+req.body.DeliveryAmount+"','"+req.body.Discount+"','"+req.body.TotalAmount+"','"+req.body.OrderTotal+"','"+req.body.RoundOff+"','"+req.body.TotalQuantity+"','"+req.body.TotalAmountInWords+"',"+CustomerRemarks+",'"+req.body.contactless+"',"+deviceKey+")";
									connection.query(sql,(err,docs)=>{
										if(err){
											res.json({'status':'400','error':err})
										}else{
											res.json({'status':'200',message:"Sucessfully Saved",'data':docs[0]});
										}  
									});
								}else{
									var OrderTotal = req.body.OrderTotal;
									// var contactless =1;
									var sql = "CALL ordermaster_insert_before_payment ('"+req.body.CustomerId+"','"+req.body.AdderssId+"','"+req.body.PaymentModeId+"','"+req.body.SubTotal+"','"+req.body.TaxRate+"','"+req.body.TaxAmount+"','"+req.body.IsSpecialDelivery+"','"+req.body.DeliveryAmount+"','"+req.body.Discount+"','"+req.body.TotalAmount+"','"+req.body.OrderTotal+"','"+req.body.RoundOff+"','"+req.body.TotalQuantity+"','"+req.body.TotalAmountInWords+"',"+CustomerRemarks+",'"+req.body.contactless+"',"+deviceKey+")";
									connection.query(sql,(err,docs)=>{
										if(err){                                          
											res.json({'status':'400','error':err})
											console.log(err);
										}else{
											// console.log(docs[0][0].Output);
											data = {};                
											data["OrderId"] =docs[0][0].Output ;
											data["OrderTotal"] = OrderTotal; 
											information.push(data);
											// console.log(data); 
											// console.log("PaymentMode Netbanking")
											res.json({'status':'200',message:"Sucessfully Saved",'data':docs[0] ,"URL":'https://api.onlyalibaba.in/appservice/ccavRequestHandler'});
										}
									})
								} 
							// }else{ 
							// //	console.log(docsCart[0][0].CartId)
							// 	res.json({'status':'400','message':"Please contact with admin !!!"})
							// }
						}
					})
				}
			});
		}
	})
},

savePayment:(req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
      res.json({'error':err})
    }else{
      console.log(req.body)
  request(`https://${razorpay.key_id}:${razorpay.key_secret}@api.razorpay.com/v1/payments/${req.body.razorpay_payment_id}`, function (error, response, body) {
        body = JSON.parse(body);

        // replace null with blank string
        for (var key in body) {
            if (body.hasOwnProperty(key)) {
                if (body[key] == null) {
                    body[key] = '';
                }

            }
        }

        for (var key in req.body) {
            if (req.body.hasOwnProperty(key)) {
                if (req.body[key] == null) {
                    req.body[key] = '';
                }

            }
        }
        console.log(body)
        connection.query(`CALL ordermaster_payment_stat_update_final( "${body.id}", "${body.entity}", "${body.amount}", "${body.currency}", "${body.status}", "${body.order_id}", "${body.invoice_id}", "${req.body.razorpay_signature}", "${req.body.org_logo}", "${req.body.org_name}", "${req.body.checkout_logo}", "${req.body.custom_branding}", "${body.international}", "${body.method}", "${body.amount_refunded}", "${body.refund_status}", "${body.captured}", "${body.description}", "${body.card_id}", "${body.bank}", "${body.wallet}", "${body.vpa}", "${body.email}", "${body.contact}", "${body.notes}", "${body.fee}", "${body.tax}", "${body.error_code}", "${body.error_description}", "${body.error_source}", "${body.error_step}", "${body.error_reason}", "${body.acquirer_data.bank_transaction_id}")`, async (err, docs) => {
          if(err){
            console.log(err)
          }else{
            console.log(docs)
          }


        })
      
  })
}
  })



},

MisChargeSettings : (req,res)=>{
  connection.query('CALL miscchargesettings_select',(err,docs)=>{
    if(err){
      res.json({'error':err})
    }else{
      res.json({'status':'200','data':docs[0]});
    }
  })
},
GetPaymentMode : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
  connection.query("SELECT * FROM paymentmode",(err,docs)=>{
    if(err){
      res.json({'error':err})
    }else{
      var data = [];
      data.push(docs[0]);
      data.push(docs[2]);
      res.json({'status':'200','data':data});
    }
  })
}
})
},
CustomerCartCount : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var deviceKey = "'"+req.body.deviceId+"'"
   var CustomerId = typeof req.body.CustomerId != 'undefined' && req.body.CustomerId != '' ? req.body.CustomerId : null;
  var sql = "CALL customercart_count ('"+CustomerId+"',"+deviceKey+")";
  connection.query(sql,(err,docs)=>{
    if(err){
      res.json({'error':err})
    }else{
      res.json({'status':'200','data':docs[0]});
    }
  })
}
})
},
CcavRequestHandler: function (request, response){
    ccavReqHandler.postReq(request, response, information);
    information.length = 0;
},
CcavResponseHandler : function (request, response){
     var data = request.body;
    ccavResHandler.postRes(request, response,data);
},

CancelResponseHandler : (req,res)=>{
  res.json({'status':'I00002',message:"Your Payment Cancelled Sucessfully Done"});
},

PaymentResponse : (req,res)=>{
   jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
            connection.query("SELECT * FROM transactionmaster WHERE order_id = ?",[req.body.OrderId],(err,docs)=>{
              if(err){
                res.json({'status':'400','error':err})
              }else{
                var info = [];
                var data = {};
                data["order_id"]=docs[0].order_id;
                data["order_status"]= docs[0].order_status;
                data["amount"]= docs[0].amount;
                info.push(data);
                res.json({'status':'200','data':info})
              }

            })
        }
    })
},


CsutomerListByid : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
                  
           connection.query('SELECT * FROM customermaster WHERE CustomerId = ? ',[req.body.CustomerId],(err,result,fields)=>{
                if(err){
                    res.status(400).json({'error':err})

                }else{
              connection.query("SELECT Name,OwnRefCode FROM customermaster WHERE CustomerId= ?",[result[0].RefCustomerId],(err,name)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
               var data = []
               var docs = {};             
              if(name.length>0){
                 if(result[0].Name === null){
                 docs["CustomerId"] = result[0].CustomerId;
                 docs["CustomerType"] = result[0].CustomerType;
                 docs["Phone"] = result[0].Phone;
                 docs["DefaultAddress"]= result[0].DefaultAddress;
                 docs["Email"] = result[0].Email;
                 docs["DefaultLandmark"] = result[0].DefaultLandmark;
                 docs["DefaultPincode"] = result[0].DefaultPincode;
                 docs["ProfileImage"] = CustomerImg+result[0].ProfileImage;
                 docs["OwnRefCode"] =name[0].OwnRefCode;
                 docs["RefByCustomerName"] = name[0].Name
                 docs["Name"] = "Guest";
                 data.push(docs); 
                 res.status(200).json({'status':'200','data':data});

              }else{
                 docs["CustomerId"] = result[0].CustomerId;
                 docs["CustomerType"] = result[0].CustomerType;
                 docs["Name"] = result[0].Name;
                 docs["Phone"] = result[0].Phone;
                 docs["DefaultAddress"]= result[0].DefaultAddress;
                 docs["Email"] = result[0].Email;
                 docs["DefaultLandmark"] = result[0].DefaultLandmark;
                 docs["DefaultPincode"] = result[0].DefaultPincode;
                 docs["ProfileImage"] = CustomerImg+result[0].ProfileImage;
                 docs["OwnRefCode"] =name[0].OwnRefCode;
                 docs["RefByCustomerName"] = name[0].Name
                 data.push(docs);
                 res.status(200).json({'status':'200','data':data});
              }
             }else{
              if(result[0].Name === null){
                 docs["CustomerId"] = result[0].CustomerId;
                 docs["CustomerType"] = result[0].CustomerType;
                 docs["Phone"] = result[0].Phone;
                 docs["DefaultAddress"]= result[0].DefaultAddress;
                 docs["Email"] = result[0].Email;
                 docs["DefaultLandmark"] = result[0].DefaultLandmark;
                 docs["DefaultPincode"] = result[0].DefaultPincode;
                 docs["ProfileImage"] = CustomerImg+result[0].ProfileImage;
                 docs["OwnRefCode"] = ""
                 docs["RefByCustomerName"] = ""  
                docs["Name"] = "Guest";
                data.push(docs);
                res.status(200).json({'status':'200','data':data});

              }else{
                 docs["CustomerId"] = result[0].CustomerId;
                 docs["CustomerType"] = result[0].CustomerType;
                 docs["Name"] = result[0].Name;
                 docs["Phone"] = result[0].Phone;
                 docs["DefaultAddress"]= result[0].DefaultAddress;
                 docs["Email"] = result[0].Email;
                 docs["DefaultLandmark"] = result[0].DefaultLandmark;
                 docs["DefaultPincode"] = result[0].DefaultPincode;
                 docs["ProfileImage"] = CustomerImg+result[0].ProfileImage;
                 docs["OwnRefCode"] =""
                 docs["RefByCustomerName"] = "" 
                 data.push(docs);  
                 res.status(200).json({'status':'200','data':data});
                    }
                  }            
                }
              })
           }
      })
   }
})
},
OrderListByCustomerId : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
      res.json({'error':err})
    }else{
  connection.query("CALL ordermaster_select__customer ('"+req.body.CustomerId+"')",(err,docs)=>{
    if(err){
      res.json({'status':'400','error':err})
    }else{
      res.json({'status':'200','data':docs[0]})
    }
  })
}
})
},
OrderCancelByOrderId : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
      res.json({'error':err})
    }else{
      var orderid = req.body.orderId;
      var customerid = req.body.CustomerId;
      let date_ob = new Date();
      let date = ("0" + date_ob.getDate()).slice(-2);
      let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
      let year = date_ob.getFullYear();
      let hours = date_ob.getHours();
      let minutes = date_ob.getMinutes();
      let seconds = date_ob.getSeconds();
      let curtime=(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
      var sql = " ";
      connection.query("UPDATE `ordermaster` SET OrderStatusId = ?,IsCancelled = ?, CancelledOn = ? WHERE OrderId = ? AND CustomerId = ?", [9,'1',curtime,orderid,customerid,], (err,docs) => {
        if(err){
            res.json({'error':err})
        }else{
          connection.query("SELECT * FROM ordermaster WHERE OrderId = ? AND CustomerId = ?",[orderid,customerid],(err,docs)=>{

            res.json({'status': '200','data':docs[0], message: docs[0]["OrderNo"]+' cancelled sucessfully.' });

          })
        }
      })
    }
  })
},
OrderRefundByOrderId : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
      res.json({'error':err})
    }else{
      var orderid = req.body.orderId;
      var customerid = req.body.CustomerId;
      var OrderDetailArr = req.body.productarr;
      var refundautoid = generate(8);
      let date_ob = new Date();
      let date = ("0" + date_ob.getDate()).slice(-2);
      let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
      let year = date_ob.getFullYear();
      let hours = date_ob.getHours();
      let minutes = date_ob.getMinutes();
      let seconds = date_ob.getSeconds();
      let curtime=(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);

      // console.log(OrderDetailArr);
      var resultrefund = [];
      for(var i=0;i<OrderDetailArr.length ;i++){ 
          connection.query("SELECT * FROM orderdetail WHERE DOrderId=?",[OrderDetailArr[i].OrderDetailId],(err,datalimitdate)=>{
            let refDate = new Date(datalimitdate[0]['RefundDateLimit'])
            let currDate = new Date()
            // console.log('refDate', refDate.getTime());
            // console.log('currDate', currDate.getTime());
            if(currDate >= refDate) { 
                connection.query("UPDATE `orderdetail` SET Refund_status = ? WHERE DOrderId = ?",[ '1', datalimitdate[0].DOrderId ],(err,docs)=>{
                  if(err){ 
                    res.send({'status':'400','error':err}) 
                  }else{
                    connection.query(`INSERT INTO orderrefundrequest (RefundAutoId, CustomerId, OrderId, OrderDetailId, ProductId, CreatedDate) VALUES (${refundautoid}, ${customerid}, ${orderid} , ${datalimitdate[0].DOrderId}, ${datalimitdate[0].ProductId} , '${curtime}')`, (err, response) => {
                      if (err) {
                        return res.status(500).send({ Error: err })
                      }else{
                        resultrefund.push({"refunded ordered id:":datalimitdate[0].DOrderId})
                        console.log(resultrefund);
                      }
                    }); 
                  }
                })
            }else{
              console.log('else');
              resultrefund.push({"refund not possible ordered id:":datalimitdate[0].DOrderId})
              console.log(resultrefund);
            }
        })
      } 
      res.send({ 'status':'200' , data:resultrefund, msg: "Refund request sent succesfully." });
      
    }
  })
}, 


CustomerWallet : (req,res)=>{
   jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              connection.query("CALL customerwallet_history ('"+req.body.CustomerId+"')",(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
                  res.json({'status':'200','data':docs[0]});
                }
              })
            }
          })
},

OrderDetailsById : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
        if(err){
          res.json({'error':err})
        }else{
          var OrderId = req.body.OrderId;
          connection.query("SELECT * FROM ordermaster WHERE OrderNo = ?",[OrderId],(err,docs)=>{
            if(err){
              res.json({'status':'400','error':err})
            }else{
              var OrderId = docs[0].OrderId;
              connection.query("CALL ordermaster_select_particular_row('"+OrderId+"')",(err,master)=>{
                  if(err){
                    res.json({'status':'400','error':err})
                  }else{
                    connection.query("CALL orderdetail_select_orderwise ("+OrderId+")",(err,detail)=>{
                        if(err){
                            res.json({'status':'400','error':err})
                        }else{
                            res.json({'status':'200','master':master[0],'detail':detail[0],'CoverImage':ProductImg})
                        }
                    })
                  }
              })
            }
        })  
      }
  })

},

AddFavoriteByCustomer :  (req,res)=>{
   jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              connection.query("CALL customerfav_add ('"+req.body.CustomerId+"','"+req.body.ProductId+"')",(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
                  var AddFlag = 1;
                  res.json({'status':'200','message':'Favorite product item add sucessfully completed','IsFav':AddFlag})
                }
              })
            }
          })

},
FavoriteProductDeleteByCustomer : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              connection.query("CALL customerfav_delete ('"+req.body.CustomerId+"','"+req.body.ProductId+"')",(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
                  var DeleteFlag = 0;
                  res.json({'status':'200','message':'Favorite product item sucessfully deleted','IsFav':DeleteFlag})
                }

              })

            }
          })
},

FavoriteProductSelectedByCustomer : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              connection.query("CALL customerfav_select ('"+req.body.CustomerId+"',"+req.body.Page+","+req.body.Size+")",(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
                  var favoite_data = docs[0];
                  var data = []
                  for (var i = 0; i < favoite_data.length; i++) {
                    var data_new = {};                          
                           data_new["ProductId"] = favoite_data[i].ProductId;
                           data_new["IsCombo"] = favoite_data[i].IsCombo;
                           data_new["CategoryId"] = favoite_data[i].CategoryId;
                           data_new["Name"] = favoite_data[i].Name;
                           data_new["ShortDescription"] = favoite_data[i].ShortDescription;
                           data_new["FullDescription"] = favoite_data[i].FullDescription;
                           data_new["Pcs"] = favoite_data[i].Pcs;
                           data_new["StandardPrice"] = favoite_data[i].StandardPrice;
                           data_new["DiscountedPrice"] = favoite_data[i].DiscountedPrice
                           data_new["OldPrice"] = favoite_data[i].OldPrice;
                           data_new["Cost"] = favoite_data[i].Cost;
                           data_new["CoverImage"] = favoite_data[i].CoverImage;
                           data_new["CoverVideo"] = ProductVideo+favoite_data[i].CoverVideo;
                           data_new["IsFeatured"] = favoite_data[i].IsFeatured;
                           data_new["IsShowOnHomePage"] = favoite_data[i].IsShowOnHomePage;
                           data_new["DisplayOrder"] = favoite_data[i].DisplayOrder;
                           data_new["MetaKeyWords"] = favoite_data[i].MetaKeyWords;
                           data_new["MetaDescription"] = favoite_data[i].MetaDescription;
                           data_new["MetaTitle"] = favoite_data[i].MetaTitle;
                           data_new["Sku"] = favoite_data[i].Sku;
                           data_new["IsFreeShipping"] = favoite_data[i].IsFreeShipping;
                           data_new["IsTaxExempt"] = favoite_data[i].IsTaxExempt;
                           data_new["TaxCategoryId"] = favoite_data[i].TaxCategoryId ;
                           data_new["DisplayStockAvailability"] = favoite_data[i].DisplayStockAvailability;
                           data_new["DisplayStockQuantity"] = favoite_data[i].DisplayStockQuantity;
                           data_new["NotReturnable"] = favoite_data[i].NotReturnable;
                           data_new["Weight"] = favoite_data[i].Weight;
                           data_new["Length"] = favoite_data[i].Length;
                           data_new["Width"] = favoite_data[i].Width;
                           data_new["Height"] = favoite_data[i].Height;
                           data_new["ProductTags"] = favoite_data[i].ProductTags;
                           data_new["Manufacturer"] = favoite_data[i].Manufacturer;
                           data_new["IsActive"] = favoite_data[i].IsActive;
                           data_new["CreatedOn"] = favoite_data[i].CreatedOn;
                           data_new["CreatedBy"] = favoite_data[i].CreatedBy;
                           data_new["ModifiedOn"] = favoite_data[i].ModifiedOn;
                           data_new["ModifiedBy"] = favoite_data[i].ModifiedBy;
                           data_new["Brand"] = favoite_data[i].Brand;
                           data_new["FoodType"] = favoite_data[i].FoodType;
                           data_new["RetailerId"] = favoite_data[i].RetailerId;
                           data_new["IsAvailable"] = favoite_data[i].IsAvailable;
                           data_new["RetailerPrice"] = favoite_data[i].RetailerPrice;
                           data_new["IsAdded"] = favoite_data[i].IsAdded;
                           data_new["IsSpecial"] = favoite_data[i].IsSpecial;
                           data_new["IsFav"] = favoite_data[i].IsFav;
                           data.push(data_new);
                      }     
                  res.json({'status':'200','data':data,'ProductImg':ProductImg})
                }
              })

            }
          })
},
OrderRatingByCustomerId : (req,res)=>{
   jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              console.log(req.body);
              connection.query("CALL ordermaster_rate ('"+req.body.CustomerId+"','"+req.body.OrderId+"','"+req.body.OrderRate+"','"+req.body.OrderTip+"','"+req.body.OrderReview+"')",(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
                  res.json({'status':'200','message':'Order item rating sucessfully completed'})
                }
              })
            }
          })
},
BestSellingFoodListView : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              connection.query("CALL productmaster_select_best_selling_food ('"+req.body.CustomerId+"')",(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
                  res.json({'status':'200','data':docs[0]})
                }
              })
            }
          })
},
BestSellingGroceryListView : (req,res)=>{
   jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              connection.query("CALL productmaster_select_best_selling_grocery ('"+req.body.CustomerId+"')",(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
                  res.json({'status':'200','data':docs[0]})
                }
              })
            }
          })
},

BestSellingFrozenListView : (req,res)=>{
     jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              connection.query("CALL productmaster_select_best_selling_frozen ('"+req.body.CustomerId+"')",(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
                  res.json({'status':'200','data':docs[0]})
                }
              } )
            }
          })
},

ReOrder : (req,res)=>{
   jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
  var OrderId = req.body.OrderId;
  connection.query("SELECT * FROM ordermaster Where OrderNo = ?",[OrderId],(err,docs)=>{
    if(err){
      res.json({'status':'400','error':err})
    }else{
  
      var OrderId = docs[0].OrderId;
      connection.query("CALL customercart_add_for_reorder ("+req.body.CustomerId+","+OrderId+")",(err,docs)=>{
        if(err){
          res.json({'status':'400','error':err})
        }else{
          res.json({'status':'200','data':docs[0]})
          OrderId = 0;
        }
      })
    }
  })
}
})
},
ProductDetailsById : (req,res)=>{            
  connection.query("CALL productmaster_select_particular_row_for_app('"+req.body.ProductId+"',"+req.body.CustomerId+")",(err,docs)=>{
    if(err){
      res.json({'status':'400','error':err})
    }else{
      res.json({'status':'200','data':docs[0],'ProductImg':ProductImg,'ProductVideo':ProductVideo})
    }
  })
},

MedicineProductSerachList : (req,res)=>{
  connection.query("CALL productmaster_medicine_search_select ('"+req.body.Name+"',"+req.body.CustomerId+")",(err,docs)=>{
      if(err){
        res.json({'status':'400','error':err})
          }else{
            res.json({'status':'200','data':docs[0],'ProductImg':ProductImg,'ProductVideo':ProductVideo})
            }
      })
},


CmsSelectByKey : (req,res)=>{
 connection.query("CALL cmsmaster_select_by_key ('"+req.body.CmsKey+"')",(err,docs)=>{
      if(err){
          res.json({'status':'400','error':err})
      }else{
            var Arr = []
            var cms = {}
            cms["CmsId"] = docs[0][0].CmsId;
            cms["Name"] = docs[0][0].Name;
            cms["Content"] = entities.decode(docs[0][0].Content);
            cms["CmsKey"] = docs[0][0].CmsKey;
            cms["IsActive"] = docs[0][0].IsActive;
            cms["ModifiedBy"] = docs[0][0].ModifiedBy;
            cms["ModifiedOn"] = docs[0][0].ModifiedOn;
            Arr.push(cms)
            res.json({'status':'200','data':Arr})
      }
  })

},
backendSearchBar : (req,res)=>{
  var searchText = req.body.searchText;
  const limit = 10
  // page number
  const page = req.body.page
  // calculate offset
  const offset = (page - 1) * limit
  var sql = `SELECT p.* FROM productmaster as p WHERE (p.Name LIKE '%${searchText}%' ) AND p.IsActive = "1" limit ${limit} OFFSET ${offset}`;
  
  console.log(sql)
  connection.query(sql,(err,docs)=>{
    if(err){
      res.json({
        'status':'400',
        'error':err
      })
    }else{
      res.json({
        'status':'200',
        'data':docs
      })
    }
  })
},

commissionBreakup:async (req,res)=>{
  var customerId = req.body.customerId;
  var sql = `SELECT cw.*, cm.CustomerCode as AgentCode, cm.Name FROM customerwallet as cw JOIN customermaster as cm ON cw.CustomerFromId = cm.CustomerId WHERE cw.CustomerId=${customerId} `;
  connection.query(sql,async(err,docs)=>{
    if(err){
      res.json({
        'status':'400',
        'error':err
      })
    }else{
      var dataArr = []
      for(var i of docs){
        dataObj = {}
        dataObj["TranId"] = i.TranId
        dataObj["CustomerId"] = i.CustomerId
        dataObj["OrderId"] = i.OrderId
        dataObj["Amount"] = i.Amount
        dataObj["AdminTranFlag"] = i.AdminTranFlag
        dataObj["Remarks"] = i.Remarks
        dataObj["RetailerId"] = i.RetailerId
        dataObj["AgentCode"] = i.AgentCode
        dataObj["Name"] = i.Name
        dataObj["TranOn"] = i.TranOn
        dataObj["ProductDetails"] = await productDetailsByOrder(i.OrderId)
        dataArr.push(dataObj)
      }
      res.json({
        'status':'200',
        'data':dataArr
      })
    }
  })
},
deleteCartValue : (req,res)=>{
  var customerId = req.body.customerId;
  var sql = `DELETE FROM customercart WHERE CustomerId=${customerId}`;
  connection.query(sql,(err,docs)=>{
    if(err){
      res.json({
        'status':'400',
        'error':err
      })
    }else{
      res.json({
        'status':'200',
        'message':'Sucessfully Deleted!!'
      })
    }
  })
},
refundPayout : (req,res)=>{
  var customerId = req.body.customerId;
  var sql = `SELECT * FROM rzpayout WHERE CustomerId = ${customerId}`;
  connection.query(sql,(err,docs)=>{
    if(err){
      res.json({
        "status":'400',
        "error":err
      })
    }else{
      res.json({
        "status":'200',
        "data":docs
      })
    }
  })
},
productDeleterCart : (req,res)=>{
 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
      var customerId = req.body.customerId;
      var productId = req.body.productId;
      var sql = `DELETE FROM customercart WHERE CustomerId=${customerId} AND ProductId=${productId}`;
      connection.query(sql,(err)=>{
        if(err){
            res.json({'error':err})
        }else{
          res.json({'status':'200',message:'Deleted Sucessfully'});
        }
      })
    }
    })
},

paymentStatus :(req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
      res.json({'error':err})
    }else{
  var orderId = req.body.orderId;
  var sql = `SELECT * FROM transactionmaster WHERE order_id = ${orderId}`;
  connection.query(sql,(err,docs)=>{
    if(err){
      res.json({
        "status":'400',
        "error":err
      })
    }else{
      res.json({
        "status":'200',
        "data":docs
      })
    }
  })
}
})
  
},




UploadBase64Img : (req,res)=>{
var base64Str = req.body.filename;
var path ='uploads/customer/img/';
var imageFileName = Math.floor(Math.random()*899999+100000);
var imageName = imageFileName.toString();
var optionalObj = {'fileName': imageName, 'type':'png'};
var conversion = base64ToImage(base64Str,path,optionalObj); 
console.log(conversion);
res.json(conversion);
}








}

function productDetailsByOrder(id){
  return new Promise((resolve, reject) => {
    connection.query("SELECT od.Quantity , od.TotalAmt, pd.Name as ProductName , pd.ProductCode FROM orderdetail as od JOIN productmaster as pd ON od.ProductId = pd.ProductId WHERE od.OrderId = ?",[id],(err,docs)=>{
    resolve(docs);
    reject(err)
    })
  })
}

function orderTotalInToWords(num){
  var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
    var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];
    if ((num = num.toString()).length > 9) return 'overflow';
   this.n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!this.n) return; var str = '';
    str += (this.n[1] != 0) ? (a[Number(this.n[1])] || b[this.n[1][0]] + ' ' + a[this.n[1][1]]) + 'crore ' : '';
    str += (this.n[2] != 0) ? (a[Number(this.n[2])] || b[this.n[2][0]] + ' ' + a[this.n[2][1]]) + 'lakh ' : '';
    str += (this.n[3] != 0) ? (a[Number(this.n[3])] || b[this.n[3][0]] + ' ' + a[this.n[3][1]]) + 'thousand ' : '';
    str += (this.n[4] != 0) ? (a[Number(this.n[4])] || b[this.n[4][0]] + ' ' + a[this.n[4][1]]) + 'hundred ' : '';
    str += (this.n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(this.n[5])] || b[this.n[5][0]] + ' ' + a[this.n[5][1]]) + 'only ' : '';
    return str;
}

function generate(n) {
  var add = 1,
  max = 12 - add;

  if (n > max) {
    return generate(max) + generate(n - max);
  }

  max = Math.pow(10, n + add);
  var min = max / 10; // Math.pow(10, n) basically 
  var number = Math.floor(Math.random() * (max - min + 1)) + min;

  return ("" + number).substring(add);
}