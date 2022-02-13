const connection  =  require('../config/db');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx')
const fs = require('fs');
const crypto = require('crypto');
const multer  = require('multer');
const util = require('util');
const upload = multer({dest: __dirname + '/uploads'});
const axios = require('axios');
const request = require('request');
const query = util.promisify(connection.query).bind(connection);
const http = require('http'),
    ccav = require('./ccavutil.js'),
    qs = require('querystring');
var CategoryImgUrl = "https://api.onlyalibaba.in/category/img/"; 
var ProductImgUrl = "https://api.onlyalibaba.in/product/img/";
var ProductVideoUrl = "https://api.onlyalibaba.in/product/videos/";
var RetailerImgUrl = "https://api.onlyalibaba.in/retailer/img/";
var CategoryVideourl = "https://api.onlyalibaba.in/category/videos/"
var DriverImgUrl = "https://api.onlyalibaba.in/driver/img/";
var BannerImgUrl = "https://api.onlyalibaba.in/banner/img/";
var DriverImgUrl = "https://api.onlyalibaba.in/driver/img/";
var CustomerImgUrl = "https://api.onlyalibaba.in/customer/img/"; 
var VehicleImgUrl = "https://api.onlyalibaba.in/vehicle/img/";
var dateFormat = require("dateformat");  
var base64ToImage = require('base64-to-image');
const Entities = require('html-entities').XmlEntities;
const entities = new Entities();
var Distance = require('geo-distance');
const { createContext } = require('vm');
const { connect } = require('pm2');
const { count } = require('console');
const { json } = require('body-parser');

const razorpay = { key_id: 'rzp_test_OUSW1j56KC15A9', key_secret: 'IYVAwHGdZqE9g6Ria6ebzWCa' };
const payoutAuth = {
  auth: {
      username: razorpay.key_id,
      password: razorpay.key_secret
  },
  header: {
      "Content-Type": "application/json"
  }
}
var razorpayPayout = "https://api.razorpay.com/v1/payouts";
var razorpayContact = "https://api.razorpay.com/v1/contacts";
var razorpayFundAccount = "https://api.razorpay.com/v1/fund_accounts";



module.exports={
//* User List *//
    main :(req,res)=>{
        res.json("Node.js project running");

    },
//*______________Start Of GetUsers_____________________________________________*//
UserGet : (req,res)=>{
        jwt.verify(req.token,'secretkey',(err)=>{
            if(err) throw err;                    
            connection.query('SELECT * FROM usermaster',(err,docs)=>{
                if (err) throw err;
                res.json(docs);
            });
        });
    },
//*______________End Of GetUsers_____________________________________________*//

/*##########################LOGIN#########################*/   
    UserLogin : (req,res)=>{
        var username = req.body.username;
        var password =req.body.password;
        connection.query('SELECT * FROM usermaster WHERE UserName =? ',[username],(err,users,fields)=>{
            if (err) console.log(err);
            if(users.length>0){
                if(password == users[0].UserPassword){
                    users.find((u)=>{
                    if(u.UserName === username && u.UserPassword === password){
                    const user = u;
                    jwt.sign({user},'secretkey',(err,token)=>{
                        if(err) console.log(err);
                        // let new_token = token;                            
                        let sqlInsert ="call user_admin_login  ('"+username+"','"+password+"') ";
                        connection.query(sqlInsert,(err,docs)=>{
                        let data = docs;   
                        let new_docs = data.map(d=>{
                        return d;})            
                        res.json({"status":"200","data":data,"token":token})});                                                                                   
                        });           
                    };
                })
                }else{
                    res.status(404).json({'status':'404',message:'Password Not Matched'})
                }
            }else{
                res.status(404).json({'status':'404',message:'Username Not Matched'});
            }
        })
    },

//* Forgot Password *//
    ForgotPassword : (req,res)=>{
        var email = req.body.email;
        connection.query('SELECT * FROM usermaster WHERE EmailID=?',[email],(err,docs,fields)=>{
            if(err){
                res.json({'error':err})
            }
            else{
            docs.find(d=>{
                res.json(d.UserId);
                var token = crypto.randomBytes(64).toString('base64');
                var expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + 1/24);

            })
        }
        })
    },

/*##########################LOGIN#########################*/ 


 

/*##########################PRODUCT#########################*/
GetProducts : async (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
      res.json({'error':err})
    }else{
      var categoryid = typeof req.body.categoryid != 'undefined' && req.body.categoryid != '' ? req.body.categoryid: null;
      var name = typeof req.body.name != 'undefined' && req.body.name != '' ? "'"+req.body.name+"'" : null;
      var Page = typeof req.body.page != 'undefined' && req.body.page != '' ? req.body.page: null;
      
      
      var sql = "call productmaster_select_search_result ("+categoryid+","+name+","+Page+","+req.body.Size+")";
      connection.query(sql,async(err,docs)=>{
        if(err){
            res.status(400).json({'error':err})

        } else{ 
            let products = docs[0];
            var productsArr = []
            console.log(products)
            for(var i of products){
              var productsObj = {}
                productsObj["RowNumber"] = i.RowNumber
                productsObj["ProductId"] = i.ProductId
                productsObj["ProductCode"] = i.ProductCode
                productsObj["IsCombo"] = i.IsCombo
                productsObj["CategoryId"] = i.CategoryId
                productsObj["Name"] = i.Name
                productsObj["ShortDescription"] = i.ShortDescription
                productsObj["FullDescription"] = i.FullDescription
                productsObj["Pcs"] = i.Pcs
                productsObj["StandardPrice"] = i.StandardPrice
                productsObj["DiscountedPrice"] = i.DiscountedPrice
                productsObj["OldPrice"] = i.OldPrice
                productsObj["Cost"] = i.Cost
                productsObj["CoverImage"] = i.CoverImage
                productsObj["CoverVideo"] = i.CoverVideo
                productsObj["IsFeatured"] = i.IsFeatured
                productsObj["IsShowOnHomePage"] = i.IsShowOnHomePage
                productsObj["DisplayOrder"] = i.DisplayOrder
                productsObj["MetaKeyWords"] = i.MetaKeyWords
                productsObj["MetaDescription"] = i.MetaDescription
                productsObj["MetaTitle"] = i.MetaTitle
                productsObj["Sku"] = i.Sku
                productsObj["IsFreeShipping"] = i.IsFreeShipping
                productsObj["IsTaxExempt"] = i.IsTaxExempt
                productsObj["TaxCategoryId"] = i.TaxCategoryId
                productsObj["DisplayStockAvailability"] = i.DisplayStockAvailability
                productsObj["DisplayStockQuantity"] = i.DisplayStockQuantity
                productsObj["NotReturnable"] = i.NotReturnable
                productsObj["Weight"] = i.Weight
                productsObj["Length"] = i.Length
                productsObj["Width"] = i.Width
                productsObj["Height"] = i.Height
                productsObj["ProductTags"] = i.ProductTags
                productsObj["RetailerId"] = i.RetailerId
                productsObj["vendor"] = await vendorDetails(i.RetailerId)
                productsObj["IsActive"] = i.IsActive
                productsObj["CreatedOn"] = i.CreatedOn
                productsObj["CreatedBy"] = i.CreatedBy
                productsObj["ModifiedOn"] = i.ModifiedOn
                productsObj["ModifiedBy"] = i.ModifiedBy
                productsObj["Brand"] = i.Brand
                productsObj["FoodType"] = i.FoodType
                productsObj["HSNCode"] = i.HSNCode
                productsObj["IsDeleted"] = i.IsDeleted
                productsObj["Category"] = i.Category
                productsObj["RowCount"] = i.RowCount
                productsObj["HSNCode"] = i.HSNCode
                productsArr.push(productsObj)
            }
          
            res.status(200).json({'status':'200','data':productsArr,'imgurl':ProductImgUrl,'videourl':ProductVideoUrl});
        }   
      })
    }
  })                           
},

AddProduct : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
      if(err){
        res.json({'error':err})
      }else{
          var ProductId = typeof req.body.ProductId != 'undefined' && req.body.ProductId ? req.body.ProductId : 0;
          var IsCombo = req.body.IsCombo != null  ? "'"+req.body.IsCombo+"'" : null; 
          var CategoryId =  req.body.CategoryId != null  ? "'"+req.body.CategoryId+"'" : null;
          var Name =   req.body.Name != null ? "'"+req.body.Name+"'" : null;
          var ShortDescription =   req.body.ShortDescription != null ? "'"+req.body.ShortDescription+"'" : null;
          var FullDescription =   req.body.FullDescription != null ? "'"+req.body.FullDescription+"'" : null;
          var Pcs =   req.body.Pcs != null ? "'"+req.body.Pcs+"'" : null;
          var StandardPrice =   req.body.StandardPrice != null ? "'"+req.body.StandardPrice+"'" : null;
          var CoverImage =   req.body.CoverImage != null ? "'"+req.body.CoverImage+"'" : null;
          var CoverVideo =   req.body.CoverVideo != null ? "'"+req.body.CoverVideo+"'" : null;
          var IsFeatured =   req.body.IsFeatured != null ? "'"+req.body.IsFeatured+"'" : null;
          var IsShowOnHomePage =   req.body.IsShowOnHomePage != null ? "'"+req.body.IsShowOnHomePage+"'" : null;
          var DisplayOrder =   req.body.DisplayOrder != null ? "'"+req.body.DisplayOrder+"'" : null;
          var MetaKeyWords =   req.body.MetaKeyWords != null ? "'"+req.body.MetaKeyWords+"'" : null;
          var MetaDescription =   req.body.MetaDescription != null ? "'"+req.body.MetaDescription+"'" : null;
          var MetaTitle =   req.body.MetaTitle != null ? "'"+req.body.MetaTitle+"'" : null;
          var Sku =   req.body.Sku != null ? "'"+req.body.Sku+"'" : null;
          var IsFreeShipping =   req.body.IsFreeShipping != null ? "'"+req.body.IsFreeShipping+"'" : null;
          var IsTaxExempt =   req.body.IsTaxExempt != null ? "'"+req.body.IsTaxExempt+"'" : null;
          var TaxCategoryId =   req.body.TaxCategoryId != null ? "'"+req.body.TaxCategoryId+"'" : null;
          var DisplayStockAvailability =   req.body.DisplayStockAvailability != null ? "'"+req.body.DisplayStockAvailability+"'" : null;
          var DisplayStockQuantity =   req.body.DisplayStockQuantity != null ? "'"+req.body.DisplayStockQuantity+"'" : null;
          var NotReturnable =   req.body.NotReturnable != null ? "'"+req.body.NotReturnable+"'" : null;
          var Weight =   req.body.Weight != null ? "'"+req.body.Weight+"'" : null;
          var Length =   req.body.Length != null ? "'"+req.body.Length+"'" : null;
          var Width =   req.body.Width != null ? "'"+req.body.Width+"'" : null;
          var Height =   req.body.Height != null ? "'"+req.body.Height+"'" : null;
          var ProductTags =   req.body.ProductTags != null ? "'"+req.body.ProductTags+"'" : null;
          var Manufacturer =   req.body.Manufacturer != null ? "'"+req.body.Manufacturer+"'" : null;
          var CreatedBy =   req.body.CreatedBy != null ? "'"+req.body.CreatedBy+"'" : null;
          var Brand =   req.body.Brand != null ? "'"+req.body.Brand+"'" : null;
          var FoodType =   req.body.FoodType != null ? "'"+req.body.FoodType+"'" : null;
          var Cost = req.body.Cost != null ? "'"+req.body.Cost+"'" : null;
          var HsnCode = req.body.HSNCode != null ? "'"+req.body.HSNCode+"'" : null;
          var RetailerId = req.body.RetailerId != null ? "'"+req.body.RetailerId+"'" : null;
          var MinOrderQty = req.body.MinOrderQty != null ? "'"+req.body.MinOrderQty+"'" : null;  
          var DiscountedPrice = req.body.DiscountedPrice != null ? "'"+req.body.DiscountedPrice+"'" : null;       
          var ReturnPolicyDays = req.body.ReturnPolicyDays != null ? "'"+req.body.ReturnPolicyDays+"'" : null;       
          let products = "call productmaster_insert_update ("+ProductId+","+IsCombo+","+CategoryId+","+Name+","+ShortDescription+","+FullDescription+","+Pcs+","+StandardPrice+","+Cost+","+CoverImage+","+CoverVideo+","+IsFeatured+","+IsShowOnHomePage+","+DisplayOrder+","+MetaKeyWords+","+MetaDescription+","+MetaTitle+","+Sku+","+IsFreeShipping+","+IsTaxExempt+","+TaxCategoryId+","+DisplayStockAvailability+","+DisplayStockQuantity+","+NotReturnable+","+Weight+","+Length+","+Width+","+Height+","+ProductTags+","+Manufacturer+","+CreatedBy+","+Brand+","+FoodType+","+HsnCode+","+RetailerId+","+DiscountedPrice+","+MinOrderQty+","+ReturnPolicyDays+")  ";
          connection.query(products,(err,docs)=>{
              if(err){
                  res.json({'status':200,'error':err})
              }else{
                  var value = docs[0][0].Output;      
                  if(value===0){
                      res.json({'status':'400',message:'Duplicate Data'});
                  }else{
                    // console.log(req.body.Bulksection.length)
                      if(value>0){
                        for(var i=0;i<req.body.Bulksection.length;i++){
                          if(req.body.Bulksection[i].id == 0){
                            var sql = `INSERT INTO productmaster_bulk_price (product_id,quantity,offer_price) VALUES (${value},${req.body.Bulksection[i].BulkQuantity},${req.body.Bulksection[i].BulkOffer})`;
                            // console.log(sql);
                            connection.query(sql,(err)=>{
                              if(err){
                                  res.json({'error':err})
                              }
                            })
                          }else{
                            // console.log(sql);
                            connection.query('UPDATE productmaster_bulk_price SET quantity = ? offer_price = ? WHERE id = ?',[req.body.Bulksection[i].BulkQuantity,req.body.Bulksection[i].BulkOffer,req.body.Bulksection[i].id],(err)=>{
                              if(err){
                                  return res.status(500).json({'error':err})
                              }
                            })
                          }
                        }
                      }
                      return res.status(200).json({'status':'200',message:'Saved Sucessfully' })
                  }    
            
              } 
          })
      }
    })
},
UploadProductVideo :(req,res)=>{
  console.log(req);
  jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    if (req.files && req.files.myFile) {
      var file = 'uploads/product/videos' + '/' + req.files.myFile.name;
      req.files.myFile.mv(file,(err)=>{
        if(err){
            res.json({'error':err})

        }else{
        res.json({'status':'200',message:'file uploaded' })
        }
    })
      } else {
        res.send("Select File");
      }
  }
})
},

DeleteProductBulkPrice : (req,res)=>{
  console.log(req);
  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
      res.json({'error':err})
    }else{
      connection.query('DELETE FROM productmaster_bulk_price WHERE id = ?',[req.params.id],(err)=>{
        if(err){
            res.json({'error':err})
        }else{
        res.json({'status':'200',message:'Delete Sucessfully'})
        }

      })
    }
  })
},

ListProductById : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
      res.json({'error':err})
    }else{
      // console.log(req.params.id);
      var jsonobj = [];
      connection.query('SELECT * FROM productmaster_bulk_price WHERE product_id = ? ',[req.params.id],(err,resdata,fields)=>{
        if(err){
            res.json({'error':err})
        }else{
          console.log(resdata)
          ret = JSON.stringify(resdata);
          data =  JSON.parse(ret);
          for(var i=0;i<data.length;i++){
            var Obj = {}
            Obj["id"]= data[i].id
            Obj["BulkQuantity"]= data[i].quantity
            Obj["BulkOffer"]= data[i].offer_price
            jsonobj.push(Obj)
          }
        }
      })
      console.log(jsonobj)
      connection.query('SELECT * FROM productmaster WHERE ProductId = ? ',[req.params.id],(err,result,fields)=>{
        if(err){
            res.json({'error':err})

        }else{
          var result = result[0]
          if(result.CoverImage === null){
            var Arr = []
            var Obj = {}
            Obj["ProductId"]= result.ProductId
            Obj["ProductCode"]= result.ProductCode
            Obj["IsCombo"]= result.IsCombo
            Obj["CategoryId"]= result.CategoryId
            Obj["Name"]= result.Name
            Obj["ShortDescription"]= result.ShortDescription
            Obj["FullDescription"]= result.FullDescription
            Obj["Pcs"]= result.Pcs
            Obj["StandardPrice"]=result.StandardPrice
            Obj["DiscountedPrice"]= result.DiscountedPrice
            Obj["OldPrice"]= result.OldPrice
            Obj["Cost"]= result.Cost
            Obj["CoverImage"]= ProductImgUrl+"no.jpg"
            Obj["CoverVideo"]= result.CoverVideo
            Obj["IsFeatured"]= result.IsFeatured
            Obj["IsShowOnHomePage"]= result.IsShowOnHomePage
            Obj["DisplayOrder"]= result.DisplayOrder
            Obj["MetaKeyWords"]= result.MetaKeyWords
            Obj["MetaDescription"]= result.MetaDescription
            Obj["MetaTitle"]= result.MetaTitle
            Obj["Sku"]= result.Sku
            Obj["IsFreeShipping"]= result.IsFreeShipping
            Obj["IsTaxExempt"]= result.IsTaxExempt
            Obj["TaxCategoryId"]= result.TaxCategoryId
            Obj["DisplayStockAvailability"]= result.DisplayStockAvailability
            Obj["DisplayStockQuantity"]= result.DisplayStockQuantity
            Obj["NotReturnable"]= result.NotReturnable
            Obj["Weight"]= result.Weight
            Obj["Length"]= result.Length
            Obj["Width"]= result.Width
            Obj["Height"]= result.Height
            Obj["ProductTags"]= result.ProductTags
            Obj["Manufacturer"]= result.Manufacturer
            Obj["RetailerId"]= result.RetailerId
            Obj["IsActive"]= result.IsActive
            Obj["CreatedOn"]= result.CreatedOn
            Obj["CreatedBy"]= result.CreatedBy
            Obj["ModifiedOn"]= result.ModifiedOn
            Obj["ModifiedBy"]= result.ModifiedBy
            Obj["Brand"]= result.Brand
            Obj["FoodType"]= result.FoodType
            Obj["HSNCode"]= result.HSNCode
            Obj["IsDeleted"]=result.IsDeleted
            Obj["MinOrderQty"]=result.MinOrderQty
            Obj["ReturnPolicyDays"]=result.ReturnPolicyDays
            Obj["BulkSection"]=jsonobj
            Arr.push(Obj)
            res.json({'status':'200','data':Arr,'Imgurl':ProductImgUrl,'Videourl':ProductVideoUrl});
          }else{
            var Arr = []
            var Obj = {}
            Obj["ProductId"]= result.ProductId
            Obj["ProductCode"]= result.ProductCode
            Obj["IsCombo"]= result.IsCombo
            Obj["CategoryId"]= result.CategoryId
            Obj["Name"]= result.Name
            Obj["ShortDescription"]= result.ShortDescription
            Obj["FullDescription"]= result.FullDescription
            Obj["Pcs"]= result.Pcs
            Obj["StandardPrice"]=result.StandardPrice
            Obj["DiscountedPrice"]= result.DiscountedPrice
            Obj["OldPrice"]= result.OldPrice
            Obj["Cost"]= result.Cost
            Obj["CoverImage"]= ProductImgUrl+result.CoverImage
            Obj["CoverVideo"]= result.CoverVideo
            Obj["IsFeatured"]= result.IsFeatured
            Obj["IsShowOnHomePage"]= result.IsShowOnHomePage
            Obj["DisplayOrder"]= result.DisplayOrder
            Obj["MetaKeyWords"]= result.MetaKeyWords
            Obj["MetaDescription"]= result.MetaDescription
            Obj["MetaTitle"]= result.MetaTitle
            Obj["Sku"]= result.Sku
            Obj["IsFreeShipping"]= result.IsFreeShipping
            Obj["IsTaxExempt"]= result.IsTaxExempt
            Obj["TaxCategoryId"]= result.TaxCategoryId
            Obj["DisplayStockAvailability"]= result.DisplayStockAvailability
            Obj["DisplayStockQuantity"]= result.DisplayStockQuantity
            Obj["NotReturnable"]= result.NotReturnable
            Obj["Weight"]= result.Weight
            Obj["Length"]= result.Length
            Obj["Width"]= result.Width
            Obj["Height"]= result.Height
            Obj["ProductTags"]= result.ProductTags
            Obj["Manufacturer"]= result.Manufacturer
            Obj["RetailerId"]= result.RetailerId
            Obj["IsActive"]= result.IsActive
            Obj["CreatedOn"]= result.CreatedOn
            Obj["CreatedBy"]= result.CreatedBy
            Obj["ModifiedOn"]= result.ModifiedOn
            Obj["ModifiedBy"]= result.ModifiedBy
            Obj["Brand"]= result.Brand
            Obj["FoodType"]= result.FoodType
            Obj["HSNCode"]= result.HSNCode
            Obj["IsDeleted"]=result.IsDeleted
            Obj["MinOrderQty"]=result.MinOrderQty
            Obj["ReturnPolicyDays"]=result.ReturnPolicyDays
            Obj["BulkSection"]=jsonobj
            Arr.push(Obj)
            res.json({'status':'200','data':Arr,'Imgurl':ProductImgUrl,'Videourl':ProductVideoUrl});
          }
        }
      })
    }
  })
},
 
DeleteProduct : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query('DELETE FROM productmaster WHERE ProductId = ?',[req.params.id],(err)=>{
        if(err){
            res.json({'error':err})

        }else{
        res.json({'status':'200',message:'Delete Sucessfully'})
        }

    })
}
})
},

ProductStatus:(req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
     connection.query("CALL productmaster_activate_deactivate ('"+req.body.ProductId+"','"+req.body.IsActive+"','"+req.body.CreatedBy+"')",(err,docs)=>{
            if(err){
                res.json({'status':'400','error':err})
            }else{
                res.json({'status':'200','data':docs[0]})
            }          
        })
 }
})

},

/*##########################PRODUCT#########################*/
  

/*##########################CATEGORY#########################*/

ListParentCategory : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
        connection.query("CALL categorymaster_select_active_list",(err,docs)=>{
            if(err){
                res.status(404).json({'error':err})
    
            }else{
               res.status(200).json({'status':'200','data':docs,'Imgurl':CategoryImgUrl })
            }
        })
    }
})

    },

ListCategory : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
        var Page = typeof req.body.page != 'undefined' && req.body.page != '' ? req.body.page: null;
        var sql = "call categorymaster_select_search_result ('"+req.body.categoryname+"','"+Page+"',"+req.body.Size+")";
        console.log(sql)
        connection.query(sql,(err,docs)=>{
            if(err){
                res.json({'error':err})
    
            }else{
            let products = docs;
            res.json({'status':'200','data':products,"Imgurl":CategoryImgUrl,"Videourl":CategoryVideourl });
            }
        })
        }
        })                 
    },
  
  AddCategory : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
     var CategoryId = typeof req.body.CategoryId != 'undefined' &&  req.body.CategoryId ? req.body.CategoryId : 0;
     var Category = req.body.Category != null  ? "'"+req.body.Category+"'" : null; 
     var CoverImage =  req.body.CoverImage != null  ? "'"+req.body.CoverImage+"'" : null;
     var CoverVideo =   req.body.CoverVideo != null ? "'"+req.body.CoverVideo+"'" : null;
     var Description =   req.body.Description != null ? "'"+req.body.Description+"'" : null;
     
           let data = "call categorymaster_insert_update("+CategoryId+","+req.body.ParentCategoryId+","+Category+","+
            CoverImage+","+CoverVideo +","+
            Description+","+req.body.CreatedBy+","+req.body.IsFeatured +")";
            connection.query(data,(err,docs)=>{
            if(err){
                res.json({'error':err})
    
            }else{
                var value = docs[0][0].Output;
                 
                if(value===0){
                    res.json({'status':'400',message:'Duplicate Data'});
                 
                }else{
                    res.json({'status':'200',message:'Saved Sucessfully' })
                }                
            }
        })
      }
  })
            
},

UploadCategory :(req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    if (req.files && req.files.myFile) {
      var file = 'uploads/category/img' + '/' + req.files.myFile.name;
      req.files.myFile.mv(file,(err)=>{
        if(err){
            res.json({'error':err})

        }else{
        res.json({'status':'200',message:'file uploaded' })
        }
    })
      } else {
        res.send("Select File");
      }
  }
})
},


DeleteCategory : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query('DELETE FROM categorymaster WHERE CategoryId = ?',[req.params.id],(err)=>{
        if(err){
            res.json({'error':err})

        }else{
        res.json({'status':'200',message:'Delete Sucessfully'})
        }
    })
} 
})

},
 ListCategoryById : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
        connection.query('SELECT * FROM categorymaster WHERE CategoryId = ? ',[req.params.id],(err,result,fields)=>{
            if(err){
                res.json({'error':err})
    
            }else{
              // console.log(result);
              var result = result[0]
              if(result.CoverImage ===null){
                 var Arr = []
                 var Obj = {}
                    Obj["CategoryId"]= result.CategoryId
                    Obj["ParentCategoryId"]= result.ParentCategoryId
                    Obj["Category"]= result.Category
                    Obj["CoverImage"]= CategoryImgUrl + "no.jpg"
                    Obj["CoverVideo"]= result.CoverVideo
                    Obj["Description"]= result.Description
                    Obj["IsActive"]= result.IsActive
                    Obj["CreatedOn"]= result.CreatedOn
                    Obj["CreatedBy"]= result.CreatedBy
                    Obj["ModifiedOn"]= result.ModifiedOn
                    Obj["ModifiedBy"]= result.ModifiedBy
                    Obj["IsFeatured"]= result.IsFeatured
                    Obj["IsSpecial"]= result.IsSpecial
                    Obj["IsParent"]= result.IsParent
                    Obj["DisplayOrder"]= result.DisplayOrder
                    Obj["IsTopMenu"]= result.IsTopMenu
                    Obj["IsEdit"]= result.IsEdit
                    Obj["IsDeleted"]= result.IsDeleted
                    Arr.push(Obj)
                     res.json({'status':'200','data':Arr,'Imgurl':CategoryImgUrl,'Videourl':CategoryVideourl});
              }else{
                 var Arr = []
                 var Obj = {}
                    Obj["CategoryId"]= result.CategoryId
                    Obj["ParentCategoryId"]= result.ParentCategoryId
                    Obj["Category"]= result.Category
                    Obj["CoverImage"]= CategoryImgUrl + result.CoverImage
                    Obj["CoverVideo"]= result.CoverVideo
                    Obj["Description"]= result.Description
                    Obj["IsActive"]= result.IsActive
                    Obj["CreatedOn"]= result.CreatedOn
                    Obj["CreatedBy"]= result.CreatedBy
                    Obj["ModifiedOn"]= result.ModifiedOn
                    Obj["ModifiedBy"]= result.ModifiedBy
                    Obj["IsFeatured"]= result.IsFeatured
                    Obj["IsSpecial"]= result.IsSpecial
                    Obj["IsParent"]= result.IsParent
                    Obj["DisplayOrder"]= result.DisplayOrder
                    Obj["IsTopMenu"]= result.IsTopMenu
                    Obj["IsEdit"]= result.IsEdit
                    Obj["IsDeleted"]= result.IsDeleted
                    Arr.push(Obj)
                     res.json({'status':'200','data':Arr,'Imgurl':CategoryImgUrl,'Videourl':CategoryVideourl});
               }
            }
        })
      }
  })
},

    CategoryStatus : (req,res)=>{
        jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
        connection.query("CALL categorymaster_activate_deactivate ('"+req.body.CategoryId+"','"+req.body.IsActive+"','"+req.body.CreatedBy+"')",(err,docs)=>{
            if(err){
                res.json({'status':'400','error':err})
            }else{
                res.json({'status':'200','data':docs[0]})
            }          
        })
      }
})
},

    CategoryActiveParentList : (req,res)=>{
        jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
        connection.query("CALL categorymaster_select_active_parent_list",(err,docs)=>{
            if(err){
                res.json({'status':'400','error':err})
            }else{
                res.json({'status':'200','data':docs})
            }
        })
    }
})
},
CategoryActiveEndChildList : (req,res)=>{
           jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              connection.query("CALL categorymaster_select_active_end_child_list_web",(err,docs)=>{
            if(err){
                res.json({'status':'400'})
            }else{
                res.json({'status':'200','data':docs})
            }
        })
    }
})
},

/*##########################CATEGORY#########################*/
  


/*##########################BANNER#########################*/ 
BannerListView : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
        connection.query("CALL bannermaster_select_all",(err,docs)=>{
            if(err){
                res.json({'error':err})
    
            }else{   
            res.json({'status':'200','data':docs,'Imgurl':BannerImgUrl});
            }
        })
    }
})
    },

ListBannerById : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query('SELECT * FROM bannermaster WHERE BannerId = ? ',[req.params.id],(err,result,fields)=>{
        if(err){
            res.json({'error':err})

        }else{
          var data = result[0]
          if(data.IsActive ===null){
             var Arr = []
          var obj = {}
           obj["BannerId"]= data.BannerId
           obj["BannerName"]= data.BannerName
           obj["BannerImage"]= "no.jpg"
           obj["LinkFlag"]= data.LinkFlag
           obj["LinkId"]= data.LinkId
           obj["Remarks"]= data.Remarks
           obj["IsActive"]= data.IsActive
           obj["CreatedOn"]= data.CreatedOn
           obj["CreatedBy"]= data.CreatedBy
           obj["ModifiedOn"]= data.ModifiedOn
           obj["ModifiedBy"]= data.ModifiedBy
           obj["IsHead"]= data.IsHead
           obj["DisplayOrder"]=data.DisplayOrder
            Arr.push(obj)
            res.json({'status':'200','data':Arr,'Imgurl':BannerImgUrl});
          }else{
              var Arr = []
            var obj = {}
            obj["BannerId"]= data.BannerId
            obj["BannerName"]= data.BannerName
            obj["BannerImage"]= BannerImgUrl + data.BannerImage
            obj["LinkFlag"]= data.LinkFlag
            obj["LinkId"]= data.LinkId
            obj["Remarks"]= data.Remarks
            obj["IsActive"]= data.IsActive
            obj["CreatedOn"]= data.CreatedOn
            obj["CreatedBy"]= data.CreatedBy
            obj["ModifiedOn"]= data.ModifiedOn
            obj["ModifiedBy"]= data.ModifiedBy
            obj["IsHead"]= data.IsHead
            obj["DisplayOrder"]=data.DisplayOrder
            Arr.push(obj)
            res.json({'status':'200','data':Arr,'Imgurl':BannerImgUrl});
          }
         
        }
    })
}
})
},

UploadBanner : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    if (req.files && req.files.myFile) {
      var file = 'uploads/banner/img' + '/' + req.files.myFile.name;
      req.files.myFile.mv(file,(err)=>{
        if(err){
            res.json({'error':err})

        }else{
        res.json({'status':'200',message:'file uploaded' })
        }
    })
      } else {
        res.send("Select File");
      }
  }
})
},
Addbanner : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var BannerId = typeof req.body.BannerId != 'undefined' && req.body.BannerId ? req.body.BannerId : 0;
     var BannerImage =  req.body.BannerImage != null  ? "'"+req.body.BannerImage+"'" : null;
     var Remarks =  req.body.Remarks != null  ? "'"+req.body.Remarks+"'" : null;
     var BannerName =   req.body.BannerName != null ? "'"+req.body.BannerName+"'" : null;
     var LinkFlag =   req.body.LinkFlag != null ? "'"+req.body.LinkFlag+"'" : null;
     var LinkId =   req.body.LinkId != null ? req.body.LinkId : null;
     var IsHead =   req.body.IsHead != null ? "'"+req.body.IsHead+"'" : null;
    
    var sql = "CALL bannermaster_insert_update ("+BannerId+","+BannerName+","+BannerImage+","+LinkFlag+","+LinkId+","+Remarks+","+req.body.CreatedBy+","+IsHead+")";
    connection.query(sql,(err,docs)=>{
        if(err){
            res.json({'error':err})

        }else{
            var value = docs[0][0].Output;       
            if(value===0){
                res.json({'status':'400',message:'Duplicate Data'});
             
            }else{
                res.json({'status':'200',message:'Banner Added Sucessfully Done'});
            }
            
        }
    })
}
})
},

DeleteBanner : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query('DELETE FROM bannermaster WHERE BannerId = ?',[req.params.id],(err)=>{
        if(err){
            res.json({'error':err})

        }else{
        res.json({'status':'200',message:'Delete Sucessfully'})
        }

    })
}
})
},

BannerStatus : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var sql = "CALL bannermaster_activate_deactivate ('"+req.body.BannerId+"','"+req.body.IsActive+"','"+req.body.CreatedBy+"')";
    connection.query(sql, (err,docs) => {
        if(err){
            res.json({'error':err})

        }else{
    res.json({'status': '200','data':docs[0]});
        }
})
}
})

},

 
UploadProductImage : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    console.log(req);
  if (req.files && req.files.myFile) {
    var file = 'uploads/product/img' + '/' + req.files.myFile.name;
    req.files.myFile.mv(file,(err)=>{
        if(err){
            res.json({'error':err})

        }else{
      res.json({'status':'200',message:'file uploaded' })
        }
  })
    } else {
      res.send("Select File");
    }
}
})
  
},

/*##########################BANNER#########################*/ 



/*##########################DRIVER#########################*/ 

UploadDriverLicenseImage : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
          if(err){
            res.json({'error':err})
          }else{
  if (req.files && req.files.myFile) {
    var file = 'uploads/driver/img' + '/' + req.files.myFile.name;
    req.files.myFile.mv(file,(err)=>{
      if(err){
          res.json({'error':err})

      }else{
      res.json({'status':'200',message:'file uploaded' })
      }
  })
    } else {
      res.send("Select File");
    }
}
})
},


/*  API Function For Driver  Add Edit */          
DriverAddEdit : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{

    var DriverId = typeof req.body.DriverId != 'undefined' && req.body.DriverId ? req.body.DriverId : 0;
    var Name =   req.body.Name != null ? "'"+req.body.Name+"'" : null;
    var Phone =   req.body.Phone != null ? "'"+req.body.Phone+"'" : null;
    var Email =   req.body.Email != null ? "'"+req.body.Email+"'" : null;
    var Address =   req.body.Address != null ? "'"+req.body.Address+"'" : null;
    var Landmark =   req.body.Landmark != null ? "'"+req.body.Landmark+"'" : null;
    var Pincode =   req.body.Pincode != null ? "'"+req.body.Pincode+"'" : null;
    var ProfileImage =   req.body.ProfileImage != null ? "'"+req.body.ProfileImage+"'" : null;
    var CreatedBy =   req.body.CreatedBy != null ? "'"+req.body.CreatedBy+"'" : null;
    var DrivingLicenseNo =   req.body.DrivingLicenseNo != null ? "'"+req.body.DrivingLicenseNo+"'" : null;
    var DrivingLicenseImage = req.body.DrivingLicenseImage != null ? "'"+req.body.DrivingLicenseImage+"'" : null;
    
    var sql = "CALL drivermaster_insert_update ('"+DriverId+"',"+Name+","+Phone+","+Email+","+Address+","+Landmark+","+Pincode+","+ProfileImage+","+req.body.CreatedBy+","+DrivingLicenseNo+","+DrivingLicenseImage+")";
    connection.query(sql, (err,docs) => {
        if(err){
            res.json({'error':err})

        }else{
            var value = docs[0][0].Output;
            if(value===0){
                res.json({'status':'400',message:'Duplicate Data'});
             
            }else{
                res.json({'status':'200',message:'Saved Sucessfully' });
            }

        }
    })
  }
})
},

/*  API Function For Driver  Upload profile Image */   
UploadDriverImage : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    if (req.files && req.files.myFile2) {
      var file = 'uploads/driver/img' + '/' + req.files.myFile2.name;
      req.files.myFile2.mv(file,(err)=>{
        if(err){
            res.json({'error':err})

        }else{
        res.json({'status':'200',message:'file uploaded' })
        }
    })
      } else {
        res.send("Select File");
      }
  }
})
},


/*  API Function For Driver  Select By ID */   
DriverSelectRowById : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query('SELECT * FROM drivermaster WHERE DriverId = ? ',[req.params.id],(err,result,fields)=>{
        if(err){
            res.json({'error':err})

        }else{
        var data = result[0]
        if(data.ProfileImage === null && data.DrivingLicenseImage ){
          var Arr = []
          var obj = {}
         obj["DriverId"]= data.DriverId
         obj["Name"]= data.Name
         obj["Phone"]= data.Phone
         obj["Email"]= data.Email
         obj["Address"]= data.Address
         obj["Landmark"]= data.Landmark
         obj["Pincode"]= data.Pincode
         obj["ProfileImage"]=  DriverImgUrl+"no.jpg"
         obj["DeviceKey"]= data.DeviceKey
         obj["Password"]= data.Password
         obj["IsActive"]= data.IsActive,
         obj["CreatedOn"]= data.CreatedOn
         obj["CreatedBy"]= data.CreatedBy
         obj["ModifiedOn"]= data.ModifiedOn
         obj["ModifiedBy"]= data.ModifiedBy
         obj["IsOnline"]= data.IsOnline
         obj["OTP"]= data.OTP
         obj["OTPGeneratedOn"]= data.OTPGeneratedOn
         obj["DrivingLicenseNo"] = data.DrivingLicenseNo
         obj['DrivingLicenseImage'] = DriverImgUrl+'no.jpg'
         Arr.push(obj)
          res.json({'status':'200','data':Arr,"Imgurl":DriverImgUrl});
        }else{
           var Arr = []
          var obj = {}
         obj["DriverId"]= data.DriverId
         obj["Name"]= data.Name
         obj["Phone"]= data.Phone
         obj["Email"]= data.Email
         obj["Address"]= data.Address
         obj["Landmark"]= data.Landmark
         obj["Pincode"]= data.Pincode
         obj["ProfileImage"]=  DriverImgUrl+data.ProfileImage
         obj["DeviceKey"]= data.DeviceKey
         obj["Password"]= data.Password
         obj["IsActive"]= data.IsActive,
         obj["CreatedOn"]= data.CreatedOn
         obj["CreatedBy"]= data.CreatedBy
         obj["ModifiedOn"]= data.ModifiedOn
         obj["ModifiedBy"]= data.ModifiedBy
         obj["IsOnline"]= data.IsOnline
         obj["OTP"]= data.OTP
         obj["OTPGeneratedOn"]= data.OTPGeneratedOn
         obj["DrivingLicenseNo"] = data.DrivingLicenseNo
         obj['DrivingLicenseImage'] = DriverImgUrl+data.DrivingLicenseImage
         Arr.push(obj)
          res.json({'status':'200','data':Arr,"Imgurl":DriverImgUrl});
        }
        }
    })
}
})
},

/*  API Function For Driver  Active and Deactive */          
DriverActiveDeactive : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{

    var sql = "CALL drivermaster_activate_deactivate ('"+req.body.DriverId+"','"+req.body.IsActive+"','"+req.body.CreatedBy+"')";
    connection.query(sql, (err,docs) => {
        if(err){
            res.json({'error':err})

        }else{
    res.json({'status': '200','data':docs[0]});
        }
})
}
})
},


/*  API Function For Driver Search */          
DriverSearch : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var Name = typeof req.body.drivername != 'undefined' && req.body.drivername != '' ? "'"+req.body.drivername+"'" : null;
    var Phone = typeof req.body.Phone != 'undefined' && req.body.Phone != '' ? req.body.Phone : null;
    var Address = typeof req.body.Address != 'undefined' && req.body.Address != '' ? req.body.Address : null;
    var Email = typeof req.body.Email != 'undefined' && req.body.Email != '' ?req.body.Email : null;
    var Pincode = typeof req.body.Pincode != 'undefined' && req.body.Pincode != '' ? req.body.Pincode : null;
    var Page = typeof req.body.page != 'undefined' && req.body.page != '' ? req.body.page : null;
    
    
    var sql = "CALL drivermaster_select_search_result ("+Name+","+Phone+","+Email+","+Address+","+Pincode+",'"+Page+"',"+req.body.Size+")";
    console.log(sql);
    connection.query(sql, (err,docs) => {
        if(err){
            res.json({'error':err})

        }else{
            res.json({'status': '200', 'data': docs[0],'Imgurl':DriverImgUrl});
        }
      })
    }
  })
},

/*  API Function For Driver Delete */ 
DeleteDriver : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query('DELETE FROM drivermaster WHERE DriverId = ?',[req.params.id],(err)=>{
        if(err){
            res.json({'error':err})

        }else{
        res.json({'status':'200',message:'Delete Sucessfully'})
        }

    })
}
})
},


/*##########################DRIVER#########################*/ 



/*##########################CUSTOMER#########################*/ 


CustomerSelectSearchResult : async (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var Name = typeof req.body.customername != 'undefined' && req.body.customername != '' ? "'" + req.body.customername+"'" : null;
    // var Phone = typeof req.body.customerphone != 'undefined' && req.body.customerphone != '' ? req.body.customerphone : null;
    var DefaultAdderess = typeof req.body.DefaultAdderess != 'undefined' && req.body.DefaultAdderess != '' ? req.body.DefaultAdderess+"'" : null;
    var Email = typeof req.body.Email != 'undefined' && req.body.Email != '' ? req.body.Email+"'" : null;
    var DefaultPincode = typeof req.body.DefaultPincode != 'undefined' && req.body.DefaultPincode != '' ? req.body.DefaultPincode+"'" : null;
    var OwnRefCode = typeof req.body.OwnRefCode != 'undefined' && req.body.OwnRefCode != '' ? req.body.OwnRefCode+"'" : null;
    var RefByCustomerName = typeof req.body.RefByCustomerName != 'undefined' && req.body.RefByCustomerName != '' ? req.body.RefByCustomerName+"'" : null;
    var RefByCustomerPhone = typeof req.body.RefByCustomerPhone != 'undefined' && req.body.RefByCustomerPhone != '' ? req.body.RefByCustomerPhone+"'" : null;
     var Page = typeof req.body.page != 'undefined' && req.body.page != '' ? req.body.page : null;
     
    var sql = "CALL customermaster_select_search_result ("+Name+",'"+req.body.customerphone+"',"+DefaultAdderess+","+Email+","+DefaultPincode+","+OwnRefCode+","+RefByCustomerName+","+RefByCustomerPhone+",'"+Page+"',"+req.body.Size+")";
    connection.query(sql,async (err,docs)=>{
        if(err){
            res.json({'error':err})

        }else{
        console.log(docs)  
        var data = docs[0]
        var customerDetailsArr = []
        for(var i of data){
          var customerDetailsObj = {}
          customerDetailsObj["RowNumber"] = i.RowNumber
          customerDetailsObj["CustomerId"] = i.CustomerId
          customerDetailsObj["CustomerCode"] = i.CustomerCode
          customerDetailsObj["CustomerRefferedDetails"] = await customerDetails(i.CustomerId)
          customerDetailsObj["CustomerType"] = i.CustomerType
          customerDetailsObj["Name"] = i.Name
          customerDetailsObj["Phone"] =  i.Phone
          customerDetailsObj["DefaultAddress"] = i.DefaultAddress
          customerDetailsObj["Email"] = i.Email
          customerDetailsObj["DefaultLandmark"] = i.DefaultLandmark
          customerDetailsObj["DefaultPincode"] = i.DefaultPincode
          customerDetailsObj["ProfileImage"] = i.ProfileImage
          customerDetailsObj["DeviceKey"] = i.DeviceKey
          customerDetailsObj["OwnRefCode"] = i.OwnRefCode
          customerDetailsObj["RefCustomerId"] = i.RefCustomerId
          customerDetailsObj["WalletValue"] = i.WalletValue
          customerDetailsObj["IsActive"] = i.IsActive
          customerDetailsObj["CreatedOn"] = i.CreatedOn
          customerDetailsObj["CreatedBy"] = i.CreatedBy
          customerDetailsObj["ModifiedOn"] = i.ModifiedOn
          customerDetailsObj["ModifiedBy"] = i.ModifiedBy
          customerDetailsObj["IPAddress"] = i.IPAddress
          customerDetailsObj["DOB"] = i.DOB
          customerDetailsObj["Age"] = i.Age
          customerDetailsObj["Govtid_Id"] = i.Govtid_Id
          customerDetailsObj["AgeproofImage"] = i.AgeproofImage
          customerDetailsObj["IsVerified"] = i.IsVerified
          customerDetailsObj["OTP"] = i.OTP
          customerDetailsObj["OTPGeneratedOn"] = i.OTPGeneratedOn
          customerDetailsObj["RefByCustomerName"] = i.RefByCustomerName
          customerDetailsObj["RefByCustomerPhone"] = i.RefByCustomerPhone
          customerDetailsObj["TotalCartQuantity"] = i.TotalCartQuantity
          customerDetailsObj["RefQuantity"] = i.RefQuantity
          customerDetailsObj["TotalWalletAmt"] = i.TotalWalletAmt
          customerDetailsObj["TotalOrder"] = i.TotalOrder
          customerDetailsObj["AddressCount"] = i.AddressCount
          customerDetailsObj["RowCount"] = i.RowCount
          customerDetailsArr.push(customerDetailsObj)
        }

        res.json({'status':'200','data':customerDetailsArr,'Imgurl':CustomerImgUrl});
        }
    })
}
})
}, 


CustomerListing : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query('SELECT * FROM customermaster',(err,docs)=>{
        if(err){
            res.json({"error":err})
        }else{
            res.json({'status':'200','data':docs,'Imgurl':CustomerImgUrl});
        }
    })
}
})
},

CustomerMasterInsertUpdate : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var CustomerId = typeof req.body.CustomerId != null ? req.body.CustomerId : 0;
    var DefaultLandmark =  req.body.DefaultLandmark != null ? "'"+req.body.DefaultLandmark+"'"  : null;
    var DefaultPincode =  req.body.DefaultPincode != null ? "'"+req.body.DefaultPincode+"'" : null;
    var ProfileImage =  req.body.ProfileImage != null ? "'"+req.body.ProfileImage+"'" : null;
    var Email =  req.body.Email != null ? "'"+req.body.Email+"'" : null;
    var DefaultAddress =  req.body.DefaultAddress != null ? "'"+req.body.DefaultAddress+"'"  : null;
    var OwnRefCode =  req.body.OwnRefCode != null ? "'"+req.body.OwnRefCode+"'"  : null;
    var Name =  req.body.Name != null ? "'"+req.body.Name+"'"  : null;
    var Phone =  req.body.Phone != null ? "'"+req.body.Phone+"'"  : null;
    
    let products = "call customermaster_insert_update ('"+CustomerId+"','"+req.body.CustomerType+"',"+Name+","+Phone+","+DefaultAddress+","+Email+","+DefaultLandmark+","+DefaultPincode+","+ProfileImage+","+req.body.CreatedBy+","+OwnRefCode+")";
    connection.query(products,(err,docs)=>{
        if(err){
            res.json({'error':err})

        }else{
            var value = docs[0][0].Output;      
            if(value===0){
                res.json({'status':'400',message:'Duplicate Data'});
             
            }else{
                res.json({'status':'200',message:'Saved Sucessfully' });
            }
          }
        })
      }
    })
},

UploadCustomer : (req,res) =>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    if (req.files && req.files.myFile) {
        var file = 'uploads/customer/img' + '/' + req.files.myFile.name;
        req.files.myFile.mv(file,(err)=>{
            if(err){
                res.json({'error':err})
    
            }else{
          res.json({'status':'200',message:'file uploaded' })
            }
      })
        } else {
          res.send("Select File");
        }
    }
})

},

CustomeSelectParticularRow : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query("CALL customermaster_select_particular_row ('"+req.body.CustomerId+"')",(err,docs)=>{
        if(err){
            res.json({'error':err})

        }else{
        res.json({'status':'200','data':docs[0],'Imgurl':CustomerImgUrl});
        }
    })
}
})
},
CustomerMasterActiveDeactive : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var sql = "CALL customermaster_activate_deactivate ('"+req.body.CustomerId+"','"+req.body.IsActive+"','"+req.body.CreatedBy+"') ";
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
DeleteCustomer : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query('DELETE FROM customermaster WHERE CustomerId = ?',[req.params.id],(err)=>{
        if(err){
            res.json({'error':err})

        }else{
        res.json({'status':'200',message:'Delete Sucessfully'})
        }

    })
}
})
},


/*##########################CUSTOMER#########################*/ 


/*##########################RETAILER#########################*/  

/*  API Function For Retiler  Upload profile Image */   
UploadRetailer : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    if (req.files && req.files.myFile) {
      var file = 'uploads/retailer/img' + '/' + req.files.myFile.name;
      req.files.myFile.mv(file,(err)=>{
        if(err){
            res.json({'error':err})

        }else{
        res.json({'status':'200',message:'file uploaded' })
        }
    })
      } else {
        res.send("Select File");
      }
  }
})
},

/*  API Function For Retiler Contact Person  Upload profile Image */   
UploadRetailerContactperson : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    if (req.files && req.files.myFile) {
      var file = 'uploads/retailer/img' + '/' + req.files.myFile.name;
      req.files.myFile.mv(file,(err)=>{
        if(err){
            res.json({'error':err})

        }else{
        res.json({'status':'200',message:'file uploaded' })
        }
    })
      } else {
        res.send("Select File");
      }
  }
})
},

/*  API Function For Retailer  Active and Deactive */          
RetailerMasterActiveDeactive : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{

    var sql = "CALL retailermaster_activate_deactivate ('"+req.body.RetailerId+"','"+req.body.IsActive+"','"+req.body.CreatedBy+"')";
    connection.query(sql, (err,docs) => {
        if(err){
            res.json({'error':err})

        }else{
          res.json({'status': '200', 'data':docs[0]});
        }
      })
    }
  })
},
           
/*  API Function For Retailer Delete */ 
DeleteRetailer : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query('DELETE FROM retailermaster WHERE RetailerId = ?',[req.params.id],(err)=>{
        if(err){
            res.json({'error':err})

        }else{
        res.json({'status':'200',message:'Delete Sucessfully'})
        }

    })
}
})
},
  
/*  API Function For Retailer Detail By ID */ 
RetailerSelectParticularRow : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query("CALL retailermaster_select_particular_row ('"+req.body.RetailerId+"')",(err,docs)=>{
        if(err){
            res.json({'error':err})

        }else{
          var data = docs[0][0]
          if(data.RetailerImage === null && data.ContactPersonImage ===null){
             var Arr = []
          var obj = {}
            obj["RetailerId"]= data.RetailerId
            obj["Name"]= data.Name
            obj["Phone"]= data.Phone
            obj["Address"]= data.Address
            obj["Email"]= data.Email
            obj["Location"]= data.Location
            obj["Latitude"]= data.Latitude
            obj["Longitude"]= data.Longitude
            obj["Landmark"]= data.Landmark
            obj["Pincode"]= data.Pincode
            obj["RetailerImage"]= RetailerImgUrl+"no.jpg"
            obj["ContactPerson"]= data.ContactPerson
            obj["ContactPersonPhone"]= data.ContactPersonPhone
            obj["ContactPersonAddress"]= data.ContactPersonAddress
            obj["ContactPersonEmail"]= data.ContactPersonEmail
            obj["ContactPersonImage"]=  RetailerImgUrl+"no.jpg"
            obj["IsActive"]= data.IsActive
            obj["CreatedOn"]= data.CreatedOn
            obj["CreatedBy"]= data.CreatedBy
            obj["ModifiedOn"]= data.ModifiedOn
            obj["ModifiedBy"]=data.ModifiedBy
            obj["RetailerTag"]= data.RetailerTag
            obj["IsEditable"]= data.IsEditable
            obj["OTP"]= data.OTP
            obj["OTPGeneratedOn"]= data.OTPGeneratedOn
            obj["DeviceKey"]= data.DeviceKey
            Arr.push(obj)
            res.json({'status':'200','data':Arr,'Imgurl':RetailerImgUrl});
          }else{
              var Arr = []
          var obj = {}
            obj["RetailerId"]= data.RetailerId
            obj["Name"]= data.Name
            obj["Phone"]= data.Phone
            obj["Address"]= data.Address
            obj["Email"]= data.Email
            obj["Location"]= data.Location
            obj["Latitude"]= data.Latitude
            obj["Longitude"]= data.Longitude
            obj["Landmark"]= data.Landmark
            obj["Pincode"]= data.Pincode
            obj["RetailerImage"]= RetailerImgUrl+data.RetailerImage;
            obj["ContactPerson"]= data.ContactPerson
            obj["ContactPersonPhone"]= data.ContactPersonPhone
            obj["ContactPersonAddress"]= data.ContactPersonAddress
            obj["ContactPersonEmail"]= data.ContactPersonEmail
            obj["ContactPersonImage"]= RetailerImgUrl+data.ContactPersonImage
            obj["IsActive"]= data.IsActive
            obj["CreatedOn"]= data.CreatedOn
            obj["CreatedBy"]= data.CreatedBy
            obj["ModifiedOn"]= data.ModifiedOn
            obj["ModifiedBy"]=data.ModifiedBy
            obj["RetailerTag"]= data.RetailerTag
            obj["IsEditable"]= data.IsEditable
            obj["OTP"]= data.OTP
            obj["OTPGeneratedOn"]= data.OTPGeneratedOn
            obj["DeviceKey"]= data.DeviceKey
            Arr.push(obj)
            res.json({'status':'200','data':Arr,'Imgurl':RetailerImgUrl});
          }
         
        }
       
    })
}
})
},

/*  API Function For Retailer Search Listing */ 
RetailerSelectSearchResult : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var sql = "CALL retailermaster_select_search_result ('"+req.body.Name+"','"+req.body.Phone+"','"+req.body.Address+"','"+req.body.Pincode+"','"+req.body.Landmark+"','"+req.body.ContactPerson+"','"+req.body.Page+"','"+req.body.Size+"')";
    connection.query(sql,(err,docs)=>{
        if(err){
            res.json({'error':err})

        }else{
        
        res.json({'status':'200','data':docs[0],"Imgurl":RetailerImgUrl});
        }
    })
}
})
},

/*  API Function For Retailer Add Edit */ 
RetailerMasterInsertUpdate : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var RetailerId = typeof req.body.RetailerId != 'undefined' && req.body.RetailerId ? req.body.RetailerId : 0;
    var Name = req.body.Name != null  ? "'"+req.body.Name+"'" : null;
    var Phone = req.body.Phone != null  ? "'"+req.body.Phone+"'" : null;
   var Adderess = req.body.Address != null  ? "'"+req.body.Address+"'" : null;
    var Email = req.body.Email != null  ? "'"+req.body.Email+"'" : null;
    var Location = req.body.Location != null  ? "'"+req.body.Location+"'" : null;
    var Latitude = req.body.Latitude != null  ? "'"+req.body.Latitude+"'" : null;
    var Longitude = req.body.Longitude != null  ? "'"+req.body.Longitude+"'" : null;
    var Landmark = req.body.Landmark != null  ? "'"+req.body.Landmark+"'" : null;
    var Pincode = req.body.Pincode != null  ? "'"+req.body.Pincode+"'" : null;
    var RetailerImage = req.body.RetailerImage != null  ? "'"+req.body.RetailerImage+"'" : null;
    var ContactPerson = req.body.ContactPerson != null  ? "'"+req.body.ContactPerson+"'" : null;
    var ContactPersonPhone = req.body.ContactPersonPhone != null  ? "'"+req.body.ContactPersonPhone+"'" : null;
    var ContactPersonAddress = req.body.ContactPersonAddress != null  ? "'"+req.body.ContactPersonAddress+"'" : null;
    var ContactPersonEmail = req.body.ContactPersonEmail != null  ? "'"+req.body.ContactPersonEmail+"'" : null;
    var ContactPersonImage = req.body.ContactPersonImage != null  ? "'"+req.body.ContactPersonImage+"'" : null;
   
    let products = "call retailermaster_insert_update ('"+RetailerId+"',"+Name+","+Phone+","+Adderess+","+Email+","+Location+","+Latitude+","+Longitude+","+Landmark+","+Pincode+","+RetailerImage+","+ContactPerson+","+ContactPersonPhone+","+ContactPersonAddress+","+ContactPersonEmail+","+ContactPersonImage+","+req.body.CreatedBy+")";
    connection.query(products,(err,docs)=>{
        if(err){
            res.json({'error':err})

        }else{
            var value = docs[0][0].Output;       
            if(value===0){
                res.json({'status':'400',message:'Duplicate Data'});
             
            }else{
                res.json({'status':'200',message:'Saved Sucessfully' })
            }    
          }
        })
      }
    })
},



/*  API Function For Retailer Product  Active and Deactive */          
RetailerProductActiveDeactive : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{

    var sql = "CALL retailerprod_activate_deactivate ('"+req.body.ProdRetailerId+"','"+req.body.IsActive+"','"+req.body.CreatedBy+"')";
    connection.query(sql, (err,docs) => {
        if(err){
            res.json({'error':err})

        }else{
          res.json({'status': '200', 'data':docs[0]});
        }
      })
      }
  })
},

/*  API Function For Retailer Product Add Edit */ 
 

RetailerProductInsertUpdate : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
var ProdRetailerId = typeof req.body.ProdRetailerId != 'undefined' && req.body.ProdRetailerId ? req.body.ProdRetailerId : 0;
    var products = "call retailerprod_insert_update ('"+ProdRetailerId+"','"+req.body.RetailerId+"','"+req.body.ProductId+"','"+req.body.Price+"','"+req.body.Remarks+"','"+req.body.IsAvailable+"','"+req.body.CreatedBy+"')";
     connection.query(products,(err,docs)=>{
                if(err){
                    res.json({'error':err})

                }else{
                    var value = docs[0][0].Output;      
                    if(value===0){
                        res.json({'status':'400',message:'Duplicate Data'});
                     
                    }else{
                        res.json({'status':'200',message:'Saved Sucessfully' })
                    }    
                }
            })
          }
      })      
},

RetailerProductListById : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
     var CategoryId = typeof req.body.CategoryId != 'undefined' && req.body.CategoryId != '' ? req.body.CategoryId : null; 
       connection.query("CALL retailerprod_select_active_for_add ('"+req.body.RetailerId+"',"+CategoryId+")",(err,docs)=>{
        if(err){
            res.json({'error':err})

        }else{
            res.json({'status':'200','data':docs[0],'Imgurl':ProductImgUrl,'Videourl':ProductVideoUrl});
        }
       
    })
   }
})
},


/*  API Function For Retailer Product List For Edit/Delete */ 
RetailerProductDetailById : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var CategoryId = typeof req.body.CategoryId != 'undefined' && req.body.CategoryId != '' ? req.body.CategoryId : null; 

    connection.query("CALL retailerprod_select_active_for_edit_delete ('"+req.body.RetailerId+"',"+CategoryId+")",(err,docs)=>{
        if(err){
            res.json({'error':err})

        }else{
            res.json({'status':'200','data':docs[0],'ProductImgUrl':ProductImgUrl,'ProductVideoUrl':ProductVideoUrl});
        }
       
    })
}
})

}, 

/*##########################RETAILER#########################*/ 


/*########################## CUSTOMER ADDERSS #########################*/ 

CustomerAddressAddEdit : (req, res) =>
{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
     var AddressId = req.body.addressid ? req.body.AddressId : 0;
     var AddressName = req.body.AddressName != null  ? "'"+req.body.AddressName+"'" : null;
     var Name = req.body.Name != null  ? "'"+req.body.Name+"'" : null;
     var Phone = req.body.Phone != null  ? "'"+req.body.Phone+"'" : null;
     var Address = req.body.Address != null  ? "'"+req.body.Address+"'" : null;
     var Email = req.body.Email != null  ? "'"+req.body.Email+"'" : null;
     var Landmark = req.body.Landmark != null  ? "'"+req.body.Landmark+"'" : null;
     var Pincode = req.body.Pincode != null  ? "'"+req.body.Pincode+"'" : null;
     var Location = req.body.Location != null  ? "'"+req.body.Location+"'" : null;
     var Lat = req.body.Lat != null  ? "'"+req.body.Lat+"'" : null;
     var Long = req.body.Long != null  ? "'"+req.body.Long+"'" : null;
     var sql = "CALL customeraddress_insert_update (" + req.body.AddressId + ","+ req.body.CustomerId+"," + AddressName + "," + Name + "," + Phone + "," + Address + "," + Email + "," + Landmark + "," + Pincode + "," + Location + "," + Lat + "," + Long + ")";
    connection.query(sql, (err,docs) => {
        if(err){
            res.json({'error':err})

        }else{
            var value = docs[0][0].Output;      
            if(value===0){
                res.json({'status':'400',message:'Duplicate Data'});
             
            }else{
                res.json({'status':'200',message:'Saved Sucessfully' })
            }    
        }
      })
    }
  })
},
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

CustomerAdderssById : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
      connection.query('SELECT * FROM customeraddress WHERE AddressId = ? ',[req.params.id],(err,result,fields)=>{
        if(err){
            res.status(400).json({'error':err})

        }else{
            var docs = []
            var data = {};
            data["AddressId"]= result[0].AddressId;
            data["CustomerId"]= result[0].CustomerId;
            data["AddressName"]= result[0].AddressName;
            data["Name"]= result[0].Name;
            data["Phone"]= result[0].Phone;
            data["Address"]= result[0].Address;
            data["Email"]= result[0].Email;
            data["Landmark"]= result[0].Landmark;
            data["Pincode"]= result[0].Pincode;
            data["Location"]= result[0].Location;
            data["Latitude"]= result[0].Latitude;
            data["Longitude"]= result[0].Longitude;
            docs.push(data);
            res.status(200).json({'status':'200','data':docs});
        }
    })
  }
})

},


/*########################## CUSTOMER ADDERSS #########################*/ 




/*########################## MISCHARGE SETTINGS #########################*/ 


// MischargeSettingUpdate : (req,res)=>{
//     var sql = "CALL miscchargesettings_update ('"+req.body.DefaultDiscountRate+"','"+req.body.SpecialDiscountRate+"','"+req.body.DefaultTaxRate+"','"+req.body.SpecialTaxRate+"','"+req.body.DefaultDeliveryCharge+"','"+req.body.SpecialDeliveryRate+"','"+req.body.WelcomeWalletAmt+"','"+req.body.WalletDeductionRateOnOrder+"','"+req.body.OrderReturnCommRate+"','"+req.body.RefByAddCommRate+"','"+req.body.ModifiedBy+"')";
//     connection.query(sql,(err)=>{
//         if(err){
//             res.json({'error':err})
//         }else{
//             res.json({'status':'200',message:'Sucessfully Updated'});
//         }
//     })
// },

/*########################## MISCHARGE SETTINGS #########################*/ 



/*########################## DRIVER #########################*/ 

DriverMasterListing : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query("CALL drivermaster_select_active_all",(err,docs)=>{
        if(err){
            res.json({'error':err})
        }else{
            res.json({'status':'200','data':docs[0]})
        }
    })
}
})
},



ActiveDriverMasterListing : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query("CALL drivermaster_select_active_online_list",(err,docs)=>{
        if(err){
            res.json({'error':err})
        }else{
            res.json({'status':'200','data':docs[0]})
        }
    })
}
})
},


OrderMasterDriverMapping : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
      if(err){
        res.json({'error':err})
      }else{
      var OrderId = typeof req.body.OrderId != 'undefined' && req.body.OrderId != '' ? req.body.OrderId : null;
      var DriverId = typeof req.body.DriverId != 'undefined' && req.body.DriverId != '' ? req.body.DriverId : null;
      var ModifiedBy = typeof req.body.ModifiedBy != 'undefined' && req.body.ModifiedBy != '' ? req.body.ModifiedBy : null;
      var sql = "CALL ordermaster_driver_mapping ("+OrderId+","+DriverId+","+ModifiedBy+")";
      connection.query(sql,(err,docs)=>{
          if(err){
              res.json({'error':err})
          }else{
              res.json({'status':'200',message:'Sucessfully mapped','data':docs[0]});
          }
      })
    }
  })
},


/*########################## DRIVER #########################*/ 


/*########################## ORDER #########################*/ 
CustomerCartCount : async (req,res)=>{
    jwt.verify(req.token,'secretkey',async (err)=>{
            if(err){
              res.json({'error':err})
            }else{

try {

  let deviceKey = 0
  console.log(deviceKey)
  let sql = `CALL customercart_list (${req.body.CustomerId},${deviceKey})`;
  let docs = await query(sql)
    res.json({'status':'200','data':docs[0],'ProductImgUrl':ProductImgUrl,'ProductVideoUrl':ProductVideoUrl});
  
}
catch(e){
  console.log(e)
}


}
})
},

OrderListing : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var OrderNo = typeof req.body.ordernumber != 'undefined' && req.body.ordernumber != '' ? req.body.ordernumber : null;
    var CustomerId = typeof req.body.CustomerId != 'undefined' && req.body.CustomerId != '' ? req.body.CustomerId : null;
    var CustomerName = typeof req.body.CustomerName != 'undefined' && req.body.CustomerName != '' ? "'"+req.body.CustomerName+"'" : null;
    var FromDate = typeof req.body.FromDate != 'undefined' && req.body.FromDate != '' ? "'"+req.body.FromDate+"'" : null;
    var ToDate = typeof req.body.ToDate != 'undefined' && req.body.ToDate != '' ? "'"+req.body.ToDate+"'" : null;
    var DeliveryFromDate = typeof req.body.DeliveryFromDate != 'undefined' && req.body.DeliveryFromDate != '' ? "'"+req.body.DeliveryFromDate+"'" : null;
    var DeliveryToDate = typeof req.body.DeliveryToDate != 'undefined' && req.body.DeliveryToDate != '' ? "'"+req.body.DeliveryToDate+"'" : null;
    var PaymentModeId = typeof req.body.PaymentModeId != 'undefined' && req.body.PaymentModeId != '' ? req.body.PaymentModeId : null;
    var drivername = typeof req.body.drivername != 'undefined' && req.body.drivername != '' ? "'"+req.body.drivername+"'" : null;
    var OrderStatusId = typeof req.body.OrderStatusId != 'undefined' && req.body.OrderStatusId != '' ? "'"+req.body.OrderStatusId+"'" : null;
    var VehicleRegNo  = typeof req.body.VehicleRegNo != 'undefined' && req.body.VehicleRegNo != '' ? "'"+req.body.VehicleRegNo+"'" : null;

    var sql = "CALL ordermaster_select_search_result ("+OrderNo+","+CustomerId+","+CustomerName+","+FromDate+","+ToDate+","+drivername+","+DeliveryFromDate+","+DeliveryToDate+","+VehicleRegNo+","+OrderStatusId+","+PaymentModeId+","+req.body.page+","+req.body.Size+")";
    console.log(sql);
    connection.query(sql,(err,docs)=>{
        if(err){
            res.json({'error':err});
        }else{
            res.json({'status':'200','data':docs[0]});
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
      connection.query("CALL ordermaster_select__customer ('"+req.body.CustomerId+"')",(err,result)=>{
        if(err){
            res.status(400).json({'error':err})
        }else{
            res.status(200).json({'status':'200','data':result[0]});
        }
      })
    }
  })
},


/*  API Function For Pending Order List For Driver */
PendingOrderListForDriver : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
          if(err){
              res.json({'error':err})
          }else{
  
  var DriverId = typeof req.body.DriverId != 'undefined' && req.body.DriverId != '' ? req.body.DriverId : null;
  var OrderNo = typeof req.body.Phone != 'undefined' && req.body.Phone != '' ? req.body.Phone : null;
  var CustomerName = typeof req.body.CustomerName != 'undefined' && req.body.CustomerName != '' ? req.body.CustomerName : null;
  var CustomerPhone = typeof req.body.CustomerPhone != 'undefined' && req.body.CustomerPhone != '' ? req.body.CustomerPhone : null;
      
  var sql = "CALL ordermaster_select_driverwise_pending ("+DriverId+","+OrderNo+","+CustomerName+","+CustomerPhone+",'"+req.body.Page+"','"+req.body.Size+"')";
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

/*  API Function For Completed Order List For Driver */
CompletedOrderListForDriver : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
        res.json({'error':err})
      }else{
      var DriverId = typeof req.body.DriverId != 'undefined' && req.body.DriverId != '' ? req.body.DriverId : null;
      var OrderNo = typeof req.body.Phone != 'undefined' && req.body.Phone != '' ? req.body.Phone : null;
      var CustomerName = typeof req.body.CustomerName != 'undefined' && req.body.CustomerName != '' ? req.body.CustomerName : null;
      var CustomerPhone = typeof req.body.CustomerPhone != 'undefined' && req.body.CustomerPhone != '' ? req.body.CustomerPhone : null;
          
      var sql = "CALL ordermaster_select_driverwise_completed ("+DriverId+","+OrderNo+","+CustomerName+","+CustomerPhone+",'"+req.body.Page+"','"+req.body.Size+"')";
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
CancelOrder : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query("CALL ordermaster_cancel ('"+req.body.OrderId+"')",(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err});
        }else{
            res.json({'status':'200',message:'Order Sucessfully Cancelled'});
        }
    })
}
})
},

OrderRefundList : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
      res.json({'error':err})
    }else{
      connection.query("SELECT orr.RefunId, orr.RefundAutoId, orr.RefundStatus, orr.CreatedDate ,orr.ModifieDate , orr.CustomerId, cm.Name as cname , orr.OrderId , om.OrderNo, orr.ProductId , pr.ProductCode, pr.Name, od.Quantity, od.TotalAmt FROM `orderrefundrequest` as orr JOIN `customermaster` as cm ON orr.CustomerId = cm.CustomerId JOIN `ordermaster` as om ON orr.OrderId = om.OrderId JOIN `productmaster` as pr ON orr.ProductId = pr.ProductId JOIN `orderdetail` as od ON orr.OrderDetailId = od.DOrderId ORDER BY RefunId DESC", (err,docs) => {
        if(err){
          res.json({'error':err});
        }else{
          var refundArr = []
          for(var refund of docs){
              var refundObj = {}
              var refundProductObj = {}

              refundProductObj["Id"] = refund.RefunId
              refundProductObj["RefundId"] = refund.RefundAutoId
              refundProductObj["RefundStatus"] = refund.RefundStatus
              refundProductObj["ProductId"] = refund.ProductId
              refundProductObj["ProductCode"] = refund.ProductCode
              refundProductObj["ProductName"] = refund.Name
              refundProductObj["Quantity"] = refund.Quantity
              refundProductObj["TotalAmt"] = refund.TotalAmt
              refundProductObj["CreatedDate"] = refund.CreatedDate
              refundProductObj["ModifieDate"] = refund.ModifieDate

              refundObj["CustomerId"] = refund.CustomerId
              refundObj["CustomerName"] = refund.cname
              refundObj["OrderId"] = refund.OrderId
              refundObj["OrderNo"] = refund.OrderNo
              refundObj["ProductArr"] = refundProductObj

              
              
              
              refundArr.push(refundObj)
          }
          res.json({'status':'200','data':refundArr});
        }
      }) 
      
    }
  })
},

OrderRefundAccepted : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
      res.json({'error':err})
    }else{
      var id = req.body.refundrequestid;
      let date_ob = new Date();
      let date = ("0" + date_ob.getDate()).slice(-2);
      let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
      let year = date_ob.getFullYear();
      let hours = date_ob.getHours();
      let minutes = date_ob.getMinutes();
      let seconds = date_ob.getSeconds();
      let curtime=(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);

      connection.query("UPDATE `orderrefundrequest` SET RefundStatus = ?, ModifieDate = ? WHERE RefunId= ?",['1',curtime,id],(err,docs)=>{
        if(err){
          return res.status(500).send({'status':'500','error':err})
        }else{
          connection.query("SELECT * FROM orderrefundrequest WHERE RefunId=?",[id],(err,docs)=>{
            if(err){
              return res.status(500).send({'status':'500','error':err})
            }else{
              ret = JSON.stringify(docs);
              var jsonobj =  JSON.parse(ret);
              // console.log(jsonobj[0]["OrderDetailId"]);return; 
              connection.query("UPDATE `orderdetail` SET IsRefund = ? WHERE DOrderId = ?",[ '1', jsonobj[0]["OrderDetailId"] ],(err,docs)=>{
                if(err){
                  res.send({'status':'400','error':err})
                }else{
                  return res.status(200).send({'status':'200','message':'Refund request accepted successfully'})
                }
              })
            }
          })
        }
      })
    }
  })
},
/*########################## ORDER #########################*/ 


/*########################## COUNT #########################*/ 

TotalProductCount : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var Category = typeof req.body.categoryid != 'undefined' && req.body.categoryid != '' ? req.body.categoryid : null;
    var Name = typeof req.body.name != 'undefined' && req.body.name != '' ? req.body.name : null;    
    if(Category == null && Name == null){
        connection.query("SELECT * FROM productmaster",(err,docs)=>{
        if(err){
            res.json({'status':'200','error':err})
        }else{

            res.json({'status':'200','TotalItemsCount':docs.length})
        }
    })

    }else{
         connection.query("SELECT * FROM productmaster WHERE CategoryId = ?  OR Name  LIKE '%?%') ",[Category,Name],(err,docs)=>{
        if(err){
            res.json({'status':'200','error':err})
        }else{
            res.json({'status':'200','TotalItemsCount':docs.length})

    }
})
}
}
})

    
},

TotalCategoryCount : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
     connection.query("SELECT * FROM categorymaster",(err,docs)=>{
        if(err){
            res.json({'status':'200','error':err})
        }else{

            res.json({'status':'200','TotalCategoryCount':docs.length})
        }
    })
 }
})
},

TotalCustomerCount : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
     connection.query("SELECT * FROM customermaster",(err,docs)=>{
        if(err){
            res.json({'status':'200','error':err})
        }else{

            res.json({'status':'200','TotalCustomerCount':docs.length})
        }
    })
 }
})
},

TotalDriverCount: (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
     connection.query("SELECT * FROM drivermaster",(err,docs)=>{
        if(err){
            res.json({'status':'200','error':err})
        }else{

            res.json({'status':'200','TotalDriverCount':docs.length})
        }
    })
 }
})
},

TotalOrderCount: (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
   var Driver = typeof req.body.driverid != 'undefined' && req.body.driverid != '' ? req.body.driverid : null;
    if(Driver == null){
        connection.query("SELECT * FROM ordermaster",(err,docs)=>{
        if(err){
            res.json({'status':'200','error':err})
        }else{

            res.json({'status':'200','TotalOrderCount':docs.length})
        }
    })

    }else{
         connection.query("SELECT * FROM ordermaster WHERE DriverId = ?",[Driver],(err,docs)=>{
        if(err){
            res.json({'status':'200','error':err})
        }else{
            res.json({'status':'200','TotalOrdeCount':docs.length})
    }
})
}
}
})
},
/*########################## COUNT #########################*/ 
TaxSelectAll : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query("CALL taxcategory_select_active_all",(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
            res.json({'status':'200','data':docs})
        }
    })
}
})
},
OrderMasterCancel : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query("CALL ordermaster_cancel_Admin ('"+req.body.OrderId+"','"+req.body.CancelBy+"','"+req.body.OrderStatus+"')",(err,docs)=>{
        if(err){
            res.json({'status':'400'})
        }else{
            res.json({'status':'200','message':'Your Order Sucessfully Cancelled'});
        }
    })
}
})
},

PincodeInsertUpdate : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var PincodeId = typeof req.body.PincodeId != 'undefined' && req.body.PincodeId != '' ? req.body.PincodeId : 0; 
    var Pincode =   req.body.Pincode != null ? "'"+req.body.Pincode+"'" : null;
    var Area =   req.body.Area != null ? "'"+req.body.Area+"'" : null;
    var District =   req.body.District != null ? "'"+req.body.District+"'" : null;
    var Route =   req.body.Route != null ? "'"+req.body.Route+"'" : null;

    var sql = "CALL pincodemaster_insert_update ("+PincodeId+","+Pincode+","+Area+","+District+","+Route+","+req.body.CreatedBy+") "
    connection.query(sql,(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
            var value = docs[0][0].Output;      
            if(value===0){
                res.json({'status':'400',message:'Duplicate Data'});
             
            }else{
                res.json({'status':'200','data':docs[0], 'message':"Pincode Inserted Sucessfully Done"})
            }    
          
        }
    })
}
})
},

PincodeListing : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query("CALL pincodemaster_select_particular_row ('"+req.body.PincodeId+"')",(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
            res.json({'status':'200','data':docs[0]})
        }
    })
}
})
},

PincodeSearchList  : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
   
    var sql = "CALL pincodemaster_select_search_result ('"+req.body.Pincode+"','"+req.body.Area+"','"+req.body.District+"','"+req.body.Route+"',"+req.body.Page+","+req.body.Size+")";
    connection.query(sql,(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
            res.json({'status':'200','data':docs[0]})
        }
    })
}
})
},

PincodeStatus : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var sql = "CALL pincodemaster_activate_deactivate ("+req.body.PincodeId+",'"+req.body.IsActive+"',"+req.body.CreatedBy+")";
    connection.query(sql,(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
            res.json({'status':'200','data':docs[0],'message':"Pincode Status Sucessfully Changed"})
        }
    })
}
})
},
MischargeSettingUpdate : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{

    var sql = "CALL miscchargesettings_update ("+req.body.DefaultDiscountRate+","+req.body.SpecialDiscountRate+","+req.body.DefaultTaxRate+","+req.body.SpecialTaxRate+","+req.body.DefaultDeliveryCharge+","+req.body.SpecialDeliveryRate+","+req.body.WelcomeWalletAmt+","+req.body.WalletDeductionRateOnOrder+","+req.body.OrderReturnCommRate+","+req.body.OrderReturnCommRateNOA+","+req.body.RefByAddCommRate+","+req.body.ModifiedBy+")";

    connection.query(sql,(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
            res.json({'status':'200','data':docs[0]})
        }
    })
}
})

},
MischargeSelete : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query("CALL miscchargesettings_select",(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
            res.json({'status':'200','data':docs[0]})
        }
    })
}
})
},

//CMS PART

CmsMasterSelectAll : (req,res)=>{
	 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query("CALL cmsmaster_select_all ",(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
            res.json({'status':'200','data':docs[0]})
        }
    })
}
})
},
CmsSelectById : (req,res)=>{
	 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query("CALL cmsmaster_select_by_id ("+req.body.CmsId+")",(err,docs)=>{
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
}
})
},


CmsUpdate :(req,res)=>{
	 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var CmsId = typeof req.body.CmsId != 'undefined' && req.body.CmsId != '' ? req.body.CmsId : 0;
    var ContentLong = req.body.ContentLongText;
    var CLT = entities.encode(ContentLong);
    connection.query("CALL cmsmaster_update_id ("+CmsId+",'"+CLT+"','"+req.body.ModifiedBy+"')",(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
            var value = docs[0][0].Output;     
            if(value===0){
                res.json({'status':'400',message:'Duplicate Data'});
             
            }else{
                res.json({'status':'200',message:'Saved Sucessfully' })
            }    
            
        }
    })
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

OrderMasterSelectCompletedDriver : (req,res)=>{
	 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{

    connection.query(" CALL ordermaster_select_completed_driver ("+req.body.DriverId+")",(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
            res.json({'status':'200','data':docs[0]})
        }
    })
}
})
}, 

OrderMasterSelectPendingDriver : (req,res)=>{
	 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{

    connection.query("CALL ordermaster_select_pending_driver ('"+req.body.DriverId+"')",(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
            res.json({'status':'200','data':docs[0]})
        }
    })
}
})
},

DashboardCount : (req,res)=>{
	 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{

    connection.query("CALL dashboard_count_admin_panel",(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
            res.json({'status':'200','data':docs[0]})
        }
    })
}
})
},
CmsPictureUpload : (req,res)=>{
	 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
      var base64Str = req.body.myFile;
     var path ='uploads/cms/img/';
     var imageFileName = Date.now()
     var imageName = imageFileName.toString();
     var optionalObj = {'fileName': imageName, 'type':'png'};
     var image = base64ToImage(base64Str,path,optionalObj);
     var Image =image.fileName;
     var CmsImgUrl=Image;
     var ImgUrl = `<img src=https://api.onlyalibaba.in/cms/img/${CmsImgUrl}>`
     res.json({'status':'200','data':ImgUrl})
 }
})
},

CustomerAdderssById : (req,res)=>{
	 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query("CALL customeraddress_select_particular_row ("+req.body.AdderssId+")",(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
           
            res.json({'status':'200','data':docs[0]})
        }
   
  })
}
})
}, 

BannerDisplayUpdate : (req,res)=>{
	 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    connection.query("CALL bannermaster_displayorder_update ("+req.body.BannerId+",'"+req.body.Flag+"',"+req.body.CreatedBy+")",(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
            var value = docs[0][0].Output;      
            if(value===0){
                res.json({'status':'400',message:'Duplicate Data'});
             
            }else{
                res.json({'status':'200',message:'Saved Sucessfully' })
            }    
            
        }
    })
}
})
},
CustomerAdderssUpdate : (req,res)=>{
	 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var AddressName =   req.body.AddressName != null ? "'"+req.body.AddressName+"'" : null;
    var Name =   req.body.Name != null ? "'"+req.body.Name+"'" : null;
    var Phone  =   req.body.Phone  != null ? "'"+req.body.Phone +"'" : null;
    var Address  =   req.body.Address  != null ? "'"+req.body.Address +"'" : null;
    var Email   =   req.body.Email   != null ? "'"+req.body.Email  +"'" : null;
    var Landmark   =   req.body.Landmark   != null ? "'"+req.body.Landmark  +"'" : null;
  
    var sql = "CALL customeraddress_update_web ("+req.body.AddressId+","+AddressName+","+Name+","+Phone+", "+Address+","+Email+","+Landmark+") ";
    connection.query(sql,(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
            var value = docs[0][0].Output;      
            if(value===0){
                res.json({'status':'400',message:'Duplicate Data'});
             
            }else{
                res.json({'status':'200',message:'Saved Sucessfully' })
            }    
        }
    })
}
})

},

CustomerWalletInsert : (req,res)=>{
	 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{

    var CustomerFromId =  req.body.CustomerFromId   != null ? req.body.CustomerFromId : null;
    var OrderId = req.body.CustomerFromId   != null ? req.body.CustomerFromId : null;
    var sql = "CALL customerwallet_insert ("+req.body.CustomerId+","+CustomerFromId+","+OrderId+","+req.body.Amount+")";
    connection.query(sql,(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{

            var value = docs[0][0].Output;      
            if(value===0){
                res.json({'status':'400',message:'Duplicate Data'});
             
            }else{
                res.json({'status':'200',message:'Saved Sucessfully' })
            }    
        }
    })
}
})
},
CustomerAccounts : (req,res)=>{
	 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var sql = "CALL customeraccount_defaultaccount_select_customerwise ("+req.body.CustomerId+")";
    connection.query(sql,(err,docs)=>{
        if(err){
            res.json({'status':'400'})
        }else{
            res.json({'status':'200','data':docs[0]})
        }
    })
}
})
},
CustomerAll : (req,res)=>{
	 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var CustomerId = req.body.CustomerId;
    connection.query("CALL customermaster_select_particular_row ("+CustomerId+")",(err,CustomerInfo)=>{
        if(err){
            res.json({'error':err})
        }else{
            connection.query("CALL customeraddress_select_customerwise_active_list ("+CustomerId+")",(err,AdderssInfo)=>{
                if(err){
                    res.json({'status':'400','error':err})
                }else{
                  let deviceKey = 0
                    connection.query("CALL customercart_list ("+CustomerId+","+deviceKey+")",(err,CartInfo)=>{
                        if(err){
                            res.json({'status':'400','error':err})
                        }else{
                            connection.query("CALL ordermaster_select__customer ("+CustomerId+")",(err,OderInfo)=>{
                                if(err){
                                    res.json({'status':'400','error':err})
                                }else{
                                    connection.query("CALL customerwallet_history ("+CustomerId+")",(err,WalletInfo)=>{
                                        if(err){
                                            res.json({'status':'400','error':err})
                                        }else{
                                            connection.query("CALL customeraccount_defaultaccount_select_customerwise ("+CustomerId+")",(err,AccountInfo)=>{
                                                if(err){
                                                    res.json({'status':'400','error':err})
                                                }else{
                                                    res.json({'status':'200','customerinfo':CustomerInfo[0],'addressinfo':AdderssInfo[0],'cartinfo':CartInfo[0],'ordeinfo':OderInfo[0],'walletinfo':WalletInfo[0],'accountinfo':AccountInfo[0],'productimg':ProductImgUrl,'productvideo':ProductVideoUrl})
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
}
})
},
OrderDetailsForOrderMaster : (req,res)=>{
	 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    var OrderId = req.body.OrderId;
    connection.query("CALL ordermaster_select_particular_row ("+req.body.OrderId+")",(err,master)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
            connection.query("CALL orderdetail_select_orderwise ("+OrderId+")",(err,detail)=>{
                if(err){
                    res.json({'status':'400','error':err})
                }else{
		   var Details = detail[0];
                    var OrderDetails = []
                   var TotalStanderdPrice = 0.00;
                    var TotalNetDiscountedPrice = 0.00;
                    var TotalDiscountedPrice = 0.00;
 			var TotalOrderPrice = 0.00;
                    for(var i=0; i<Details.length; i++){
                        var DetailObj = {}
                      DetailObj["RowNo"] = Details[i].RowNo;
                      DetailObj["Quantity"] = Details[i].Quantity;
                      DetailObj["OrderPrice"] = parseFloat(Details[i].OrderPrice+Details[i].TaxAmt);
                      DetailObj["HSNCode"] = Details[i].HSNCode;
                      DetailObj["ProductName"]=Details[i].ProductName;
                      DetailObj["SGST"] = Details[i].TaxAmt/2;
                      DetailObj["CGST"] = Details[i].TaxAmt/2;
                      DetailObj["TaxAmt"] = Details[i].TaxAmt;
                      DetailObj["Percentage"] = Details[i].Percentage;
                      DetailObj["StandardPrice"] = Details[i].StandardPrice;
                      DetailObj["NetDiscountedPrice"] = Details[i].DiscountedPrice;
                       DetailObj["DiscountedPrice"] = Details[i].StandardPrice-Details[i].DiscountedPrice;
                      TotalStanderdPrice += parseFloat(Details[i].StandardPrice);
                      TotalNetDiscountedPrice += parseFloat(Details[i].DiscountedPrice)
                      TotalDiscountedPrice +=parseFloat(Details[i].StandardPrice-Details[i].DiscountedPrice)
		      TotalOrderPrice += parseFloat(parseFloat(Details[i].OrderPrice+Details[i].TaxAmt))
                      OrderDetails.push(DetailObj)
                    }
                    res.json({'status':'200','master':master[0],'detail':OrderDetails,'TotalStanderdPrice':TotalStanderdPrice,'TotalDiscountedPrice':TotalDiscountedPrice,'TotalNetDiscountedPrice':TotalNetDiscountedPrice,'TotalOrderPrice':TotalOrderPrice})                }
            })
        }
    })
}
})
},
TexSelectAll : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
                connection.query("CALL taxcategory_select_all",(err,docs)=>{
                  if(err){
                    res.json({'status':'400','error':err})
                  }else{
                    res.json({'status':'200','data':docs[0]})
                  }
                })
            }
          })

},
TexCategoryActiveDeactive : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              connection.query("CALL taxcategory_activate_deactivate ("+req.body.TaxCategoryId+",'"+req.body.IsActive+"',"+req.body.CreatedBy+")",(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
                var value = docs[0][0].Output;
                  if(value===0){
                        res.json({'status':'400',message:'Duplicate Data'});
                     
                    }else{
                        res.json({'status':'200',message:'Saved Sucessfully', 'data':docs[0] })
                    }    
                }
              })

}
})
},
TaxmasterInsertUpdate :(req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
                var TaxCategoryId = typeof req.body.TaxCategoryId != 'undefined' && req.body.TaxCategoryId != '' ? req.body.TaxCategoryId : 0; 
                var TaxCategory =   req.body.TaxCategory != null ? "'"+req.body.TaxCategory+"'" : null;
                var Percentage =   req.body.Percentage != null ? "'"+req.body.Percentage+"'" : null;
                var Description =   req.body.Description != null ? "'"+req.body.Description+"'" : null;
                connection.query("CALL taxcategory_insert_update ("+TaxCategoryId+","+TaxCategory+","+Percentage+","+Description+","+req.body.CreatedBy+")",(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
                 var value = docs[0][0].Output;  
                    if(value===0){
                        res.json({'status':'400',message:'Duplicate Data'});
                     
                    }else{
                        res.json({'status':'200',message:'Saved Sucessfully', 'data':docs[0] })
                    }    
                }
              })
            }
          })

},
VehicleListingAll : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              connection.query("CALL vehiclemaster_select_all ",(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{ 
                  var data = docs[0]
                  var FinalData = []
                  for(var i =0 ; i<data.length; i++){
                    if(data[i].VehiclaImage == ""){
                       var DataObj = {}
                    DataObj["VehicleId"] = data[i].VehicleId
                    DataObj["VehicleClass"] = data[i].VehicleClass
                    DataObj["RegistrationNo"] = data[i].RegistrationNo
                    DataObj["VehicleBrand"] = data[i].VehicleBrand
                    DataObj["EngineCC"] = data[i].EngineCC
                    DataObj["FuelType"] = data[i].FuelType
                    DataObj["Description"] = data[i].Description
                    DataObj["VehiclaImage"] = VehicleImgUrl+"no.jpg"
                    DataObj["IsActive"] = data[i].IsActive
                    DataObj["CreatedOn"] = data[i].CreatedOn
                    DataObj["CreatedBy"] = data[i].CreatedBy
                    DataObj["ModifiedOn"] = data[i].ModifiedOn
                    DataObj["ModifiedBy"] = data[i].ModifiedBy
                    FinalData.push(DataObj)
                  }else{
                   
                     var DataObj = {}
                
                    DataObj["VehicleId"] = data[i].VehicleId
                    DataObj["VehicleClass"] = data[i].VehicleClass
                    DataObj["RegistrationNo"] = data[i].RegistrationNo
                    DataObj["VehicleBrand"] = data[i].VehicleBrand
                    DataObj["EngineCC"] = data[i].EngineCC
                    DataObj["FuelType"] = data[i].FuelType
                    DataObj["Description"] = data[i].Description
                    DataObj["VehiclaImage"] = VehicleImgUrl+data[i].VehiclaImage
                    DataObj["IsActive"] = data[i].IsActive
                    DataObj["CreatedOn"] = data[i].CreatedOn
                    DataObj["CreatedBy"] = data[i].CreatedBy
                    DataObj["ModifiedOn"] = data[i].ModifiedOn
                    DataObj["ModifiedBy"] = data[i].ModifiedBy
                    FinalData.push(DataObj)
                      }
                  }
                  res.json({'status':'200','data':FinalData})
                }
              })
            }
          })

},
VehicleActiveListing : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              connection.query("CALL vehiclemaster_select_active_all ",(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
                  var data = docs[0]
                  var FinalData = []
                  for(var i =0 ; i<data.length; i++){
                    if(data[i].VehiclaImage == ""){
                      var DataObj = {}
                      DataObj["VehicleId"] = data[i].VehicleId
                      DataObj["VehicleClass"] = data[i].VehicleClass
                      DataObj["RegistrationNo"] = data[i].RegistrationNo
                      DataObj["VehicleBrand"] = data[i].VehicleBrand
                      DataObj["EngineCC"] = data[i].EngineCC
                      DataObj["FuelType"] = data[i].FuelType
                      DataObj["Description"] = data[i].Description
                      DataObj["VehiclaImage"] = VehicleImgUrl+"no.jpg"
                      DataObj["IsActive"] = data[i].IsActive
                      DataObj["CreatedOn"] = data[i].CreatedOn
                      DataObj["CreatedBy"] = data[i].CreatedBy
                      DataObj["ModifiedOn"] = data[i].ModifiedOn
                      DataObj["ModifiedBy"] = data[i].ModifiedBy
                      FinalData.push(DataObj)

                    }else{
                       var DataObj = {}
                      DataObj["VehicleId"] = data[i].VehicleId
                      DataObj["VehicleClass"] = data[i].VehicleClass
                      DataObj["RegistrationNo"] = data[i].RegistrationNo
                      DataObj["VehicleBrand"] = data[i].VehicleBrand
                      DataObj["EngineCC"] = data[i].EngineCC
                      DataObj["FuelType"] = data[i].FuelType
                      DataObj["Description"] = data[i].Description
                      DataObj["VehiclaImage"] = VehicleImgUrl+data[i].VehiclaImage
                      DataObj["IsActive"] = data[i].IsActive
                      DataObj["CreatedOn"] = data[i].CreatedOn
                      DataObj["CreatedBy"] = data[i].CreatedBy
                      DataObj["ModifiedOn"] = data[i].ModifiedOn
                      DataObj["ModifiedBy"] = data[i].ModifiedBy
                      FinalData.push(DataObj)

                    }
                    

                  }
                  res.json({'status':'200','data':FinalData})
                }
              })
            }
          })

},
VehicleSelectParticularRow : (req,res)=>{
   jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              connection.query("CALL vehiclemaster_select_particular_row ("+req.body.VehicleId+")",(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
                  var data = docs[0][0]
                  if(docs[0].length>0){
                  DataArr = []
                  if(data.VehiclaImage == ""){
                      var data_new = {}
                  data_new["VehicleId"] = data.VehicleId;
                  data_new["VehicleClass"] = data.VehicleClass;
                  data_new["RegistrationNo"] = data.RegistrationNo;
                  data_new["VehicleBrand"] = data.VehicleBrand;
                  data_new["FuelType"] = data.FuelType;
                  data_new["EngineCC"] = data.EngineCC;
                  data_new["Description"] = data.Description;
                  data_new["VehiclaImage"] = VehicleImgUrl+"no.jpg";
                  data_new["IsActive"] = data.IsActive;
                  data_new["CreatedOn"] = data.CreatedOn;
                  data_new["CreatedBy"] = data.CreatedBy;
                  data_new["ModifiedOn"] = data.ModifiedOn;
                  data_new["ModifiedBy"] = data.ModifiedBy;
                  data_new["InsuranceExpiredOn"] = data.InsuranceExpiredOn;
                  data_new["PollutionExpiredOn"] = data.PollutionExpiredOn;
                  DataArr.push(data_new)
                }else{
                     var data_new = {}
                  data_new["VehicleId"] = data.VehicleId;
                  data_new["VehicleClass"] = data.VehicleClass;
                  data_new["RegistrationNo"] = data.RegistrationNo;
                  data_new["VehicleBrand"] = data.VehicleBrand;
                  data_new["FuelType"] = data.FuelType;
                  data_new["EngineCC"] = data.EngineCC;
                  data_new["Description"] = data.Description;
                  data_new["VehiclaImage"] = VehicleImgUrl+data.VehiclaImage;
                  data_new["IsActive"] = data.IsActive;
                  data_new["CreatedOn"] = data.CreatedOn;
                  data_new["CreatedBy"] = data.CreatedBy;
                  data_new["ModifiedOn"] = data.ModifiedOn;
                  data_new["ModifiedBy"] = data.ModifiedBy;
                  data_new["InsuranceExpiredOn"] = data.InsuranceExpiredOn;
                  data_new["PollutionExpiredOn"] = data.PollutionExpiredOn;
                  DataArr.push(data_new)
                }
                res.json({'status':'200','data':DataArr})

              }else{
                res.json({'status':'200','data':docs[0]})
              }      
            }
          })
        }
    })
},
VehicleMasterStatusUpdate : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              connection.query("CALL vehiclemaster_activate_deactivate ("+req.body.VehicleId+",'"+req.body.IsActive +"',"+req.body.CreatedBy+")",(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
                  res.json({'status':'200','data':docs[0]})
                }
              })
            }
          })
},

UploadVehicle : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
    if (req.files && req.files.myFile) {
      var file = 'uploads/vehicle/img/' + '/' + req.files.myFile.name;
      req.files.myFile.mv(file,(err)=>{
        if(err){
            res.json({'error':err})

        }else{
        res.json({'status':'200',message:'file uploaded' })
        }
    })
      } else {
        res.send("Select File");
      }
  }
})
},

VehicleInsertUpdate : (req,res)=>{
     jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
               
                var VehicleId =  req.body.DriverId != 'undefined' && req.body.VehicleId ? req.body.VehicleId : 0;
                var VehicleClass =   req.body.VehicleClass != null ? "'"+req.body.VehicleClass+"'" : null;
                var RegistrationNo =   req.body.RegistrationNo != null ? "'"+req.body.RegistrationNo+"'" : null;
                var VehicleBrand =   req.body.VehicleBrand != null ? "'"+req.body.VehicleBrand+"'" : null;
                var FuelType =   req.body.FuelType != null ? "'"+req.body.FuelType+"'" : null;
                var EngineCC =   req.body.EngineCC != null ? req.body.EngineCC : null;
                var Description =   req.body.Description != null ? "'"+req.body.Description+"'" : null;
                var VehiclaImage =   req.body.VehiclaImage != null ? "'"+req.body.VehiclaImage+"'" : null;
                var CreatedBy =   req.body.CreatedBy != null ? "'"+req.body.CreatedBy+"'" : null;
                var InsuranceExpiredOn = req.body.InsuranceExpiredOn != null ? "'"+req.body.InsuranceExpiredOn+"'" : null;
                var PollutionExpiredOn = req.body.PollutionExpiredOn != null ? "'"+req.body.PollutionExpiredOn+"'" : null;

                var sql = "CALL vehiclemaster_insert_update  ("+VehicleId+","+VehicleClass+","+RegistrationNo+","+VehicleBrand+","+FuelType+","+EngineCC+","+Description+","+VehiclaImage+","+CreatedBy+","+InsuranceExpiredOn+","+PollutionExpiredOn+") ";
               
                connection.query(sql,(err,docs)=>{
                  if(err){
                    res.json({'status':'400','error':err})
                  }else{
                    res.json({'status':'200','data':docs[0]})
                  }
                })
            }
          })
},

OrderSearchMasterVehicleMapping : (req,res)=>{
    var CustomerPhone = typeof req.body.CustomerPhone != 'undefined' && req.body.CustomerPhone != '' ? "'"+req.body.CustomerPhone+"'" : null;
    var FromDate = typeof req.body.FromDate != 'undefined' && req.body.FromDate != '' ? "'"+req.body.FromDate+"'" : null;
    var ToDate = typeof req.body.ToDate != 'undefined' && req.body.ToDate != '' ? "'"+req.body.ToDate+"'" : null;
    var PaymentModeId = typeof req.body.PaymentModeId != 'undefined' && req.body.PaymentModeId != '' ? req.body.PaymentModeId : null;

    var sql = "CALL ordermaster_search_pendings_routewise_for_driver_vehicle_mapping ('"+req.body.Route+"','"+req.body.ordernumber+"','"+req.body.CustomerName+"',"+CustomerPhone+","+FromDate+","+ToDate+",'"+req.body.drivername+"','"+req.body.VehicleRegNo+"',"+PaymentModeId+")";
      connection.query(sql,(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{
          res.json({'status':'200','data':docs[0]})
            }
          })               
},

OrderMasterDriverVehicleMapping : (req,res)=>{
 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
  var sql = "CALL ordermaster_driver_vehicle_mapping ("+req.body.OrderId+","+req.body.DriverId+","+req.body.VehicleId+","+req.body.ModifiedBy+") ";
  connection.query(sql,(err,docs)=>{
    if(err){
      res.json({'status':'400','error':err})
    }else{
      res.json({'status':'200','data':docs[0],'message':"Sucessfully Mapped"})
    }
  })
  }
 })
},
OrdermasterDriverVehicleBulkMapping : (req,res)=>{
 jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
  var sql = "CALL ordermaster_driver_vehicle_mapping_bulk ('"+req.body.OrderIds +"',"+req.body.DriverId+","+req.body.VehicleId+","+req.body.ModifiedBy+") "
  connection.query(sql,(err,docs)=>{
    if(err){
      res.json({'status':'400','error':err})
    }else{
      res.json({'status':'200','data':docs[0],'message':"Sucessfully Mapped"})
    }
  })
  }
 })

},
OrderMasterVehicleMapping : (req,res)=>{
   jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
              connection.query("CALL ordermaster_vehicle_mapping ("+req.body.OrderId+","+req.body.VehicleId+","+req.body.ModifiedBy+")",(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
                  res.json({'status':'200','data':docs[0]})
                }
              })
            }
          })
},
OrderasterPendingSelectRoute : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
      res.json({'error':err})
    }else{
  connection.query("CALL  ordermaster_pending_select_route ",(err,docs)=>{
    if(err){
      res.json({'status':'400','error':err})
    }else{
      res.json({'status':'200','data':docs[0]})
    }
  })
}
  })
},

OrdermasterCurrentDayReview : (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
      res.json({'error':err})
    }else{
  connection.query("CALL ordermaster_current_day_review ",(err,docs)=>{
    if(err){
      res.json({'status':'400','error':err})
    }else{
      res.json({'status':'200','data':docs[0]})
    }
  })
}
  })
},

// , c.CustomerId ,c.Name, c.Phone FROM  ordermaster as o JOIN customermaster as c ON c.CustomerId = o.CustomerId

DailySaleRegister: async (req,res)=>{
  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
      res.json({'error':err})
    }else{
      if(req.body.firstLoading){
        var fromDate =  dateFormat(req.body.fromDate,"yyyy-mm-dd");
        var toDate =  dateFormat(req.body.toDate,"yyyy-mm-dd");
  
        console.log('FromDate',fromDate)
        console.log('ToDate',toDate)
         
        var sql =`SELECT o.OrderId, o.IsSupplied ,o.OrderedOn, o.OrderNo , o.OrderStatusId , o.PaymentModeId , o.SubTotal , o.TaxAmt , o.TotalAmt, o.OrderTotal, o.DriverId, o.DriverAccepted, o.TotalQty, o.DeliveryAmt, o.Discount, o.VehicleId, c.Name as CustomerName , c.Phone as CustomerPhone , ca.Address , ca.Landmark , ca.Pincode ,pm.PaymentMode , dr.Name as DriverName ,dr.Phone as DriverPhone , vc.VehicleBrand , vc.RegistrationNo FROM ordermaster as o JOIN customermaster as c JOIN customeraddress as ca JOIN paymentmode as pm JOIN drivermaster as dr JOIN vehiclemaster as vc ON c.CustomerId = o.CustomerId AND ca.AddressId = o.AddressId AND pm.PaymentModeId = o.PaymentModeId AND dr.DriverId = o.DriverId AND vc.VehicleId = o.VehicleId WHERE (o.OrderedOn LIKE '%${fromDate}%' ) ORDER BY OrderId DESC`

        

        connection.query(sql,async (err,docs)=>{
          if(err){
            res.json({'status':'400','error':err})
          }else{
            var DailySaleArr = []
            for(var i of docs){
              var DailySaleObj = {}
              DailySaleObj["OrderedOn"] = i.OrderedOn;
              DailySaleObj["OrderId"] = i.OrderId;
              DailySaleObj["OrderNo"] = i.OrderNo;
              DailySaleObj["OrderStatusId"] = i.OrderStatusId;
              DailySaleObj["PaymentMode"] = i.PaymentMode;
              DailySaleObj["SubTotal"] = i.SubTotal;
              DailySaleObj["OrderId"] = i.OrderId;
              DailySaleObj["TaxAmt"] = i.TaxAmt;
              DailySaleObj["TotalAmt"] = i.TotalAmt;
              DailySaleObj["OrderTotal"] = i.OrderTotal;
              DailySaleObj["DriverId"] = i.DriverId;
              DailySaleObj["DriverAccepted"] = i.DriverAccepted;
              DailySaleObj["TotalQty"] = i.TotalQty;
              DailySaleObj["CustomerName"] = i.CustomerName;
              DailySaleObj["CustomerPhone"] = i.CustomerPhone;
              DailySaleObj["Address"] = i.Address;
              DailySaleObj["Landmark"] = i.Landmark;
              DailySaleObj["Pincode"] = i.Pincode;
              DailySaleObj["PaymentMode"] = i.PaymentMode; 
              DailySaleObj["DriverName"] = i.DriverName;  
              DailySaleObj["DriverPhone"] = i.DriverPhone; 
              DailySaleObj["VehicleBrand"] = i.VehicleBrand;
              DailySaleObj["RegistrationNo"] = i.RegistrationNo;
              DailySaleObj["DeliveryAmt"] = i.DeliveryAmt;
              DailySaleObj["Discount"] = i.Discount;
              DailySaleObj["AlibabaProducts"] = await AlibabaProductsDetails(i.OrderId)
              DailySaleObj["NonAlibabaProducts"] = await NonAlibabaProductDetails(i.OrderId)
              DailySaleObj["NetBusiness"] = DailySaleObj.AlibabaProducts.SubTotal + DailySaleObj.NonAlibabaProducts.SubTotal + DailySaleObj.DeliveryAmt
              
  
              DailySaleArr.push(DailySaleObj)
            }
            res.json(
              {
                'status':'200',
                'data':DailySaleArr
              }
              )
          }
        })
        
      }else{
      var fromDate =  dateFormat(req.body.fromDate,"yyyy-mm-dd 00:00:00");
      var toDate =  dateFormat(req.body.toDate,"yyyy-mm-dd 00:00:00");

      console.log('FromDate',fromDate)
      console.log('ToDate',toDate)

      var sql =`SELECT o.OrderId, o.IsSupplied ,o.OrderedOn, o.OrderNo , o.OrderStatusId , o.PaymentModeId , o.SubTotal , o.TaxAmt , o.TotalAmt, o.OrderTotal, o.DriverId, o.DriverAccepted, o.TotalQty, o.DeliveryAmt, o.Discount, o.VehicleId, c.Name as CustomerName , c.Phone as CustomerPhone , ca.Address , ca.Landmark , ca.Pincode ,pm.PaymentMode , dr.Name as DriverName ,dr.Phone as DriverPhone , vc.VehicleBrand , vc.RegistrationNo FROM ordermaster as o JOIN customermaster as c JOIN customeraddress as ca JOIN paymentmode as pm JOIN drivermaster as dr JOIN vehiclemaster as vc ON c.CustomerId = o.CustomerId AND ca.AddressId = o.AddressId AND pm.PaymentModeId = o.PaymentModeId AND dr.DriverId = o.DriverId AND vc.VehicleId = o.VehicleId WHERE (o.OrderedOn BETWEEN '${fromDate}' AND  '${toDate}' ) ORDER BY OrderId DESC`
      
      connection.query(sql,async (err,docs)=>{
        if(err){
          res.json({'status':'400','error':err})
        }else{
          var DailySaleArr = []
          for(var i of docs){
            var DailySaleObj = {}
            DailySaleObj["OrderedOn"] = i.OrderedOn;
            DailySaleObj["OrderId"] = i.OrderId;
            DailySaleObj["OrderNo"] = i.OrderNo;
            DailySaleObj["OrderStatusId"] = i.OrderStatusId;
            DailySaleObj["PaymentMode"] = i.PaymentMode;
            DailySaleObj["SubTotal"] = i.SubTotal;
            DailySaleObj["OrderId"] = i.OrderId;
            DailySaleObj["TaxAmt"] = i.TaxAmt;
            DailySaleObj["TotalAmt"] = i.TotalAmt;
            DailySaleObj["OrderTotal"] = i.OrderTotal;
            DailySaleObj["DriverId"] = i.DriverId;
            DailySaleObj["DriverAccepted"] = i.DriverAccepted;
            DailySaleObj["TotalQty"] = i.TotalQty;
            DailySaleObj["CustomerName"] = i.CustomerName;
            DailySaleObj["CustomerPhone"] = i.CustomerPhone;
            DailySaleObj["Address"] = i.Address;
            DailySaleObj["Landmark"] = i.Landmark;
            DailySaleObj["Pincode"] = i.Pincode;
            DailySaleObj["PaymentMode"] = i.PaymentMode; 
            DailySaleObj["DriverName"] = i.DriverName;  
            DailySaleObj["DriverPhone"] = i.DriverPhone; 
            DailySaleObj["VehicleBrand"] = i.VehicleBrand;
            DailySaleObj["RegistrationNo"] = i.RegistrationNo;
            DailySaleObj["DeliveryAmt"] = i.DeliveryAmt;
            DailySaleObj["Discount"] = i.Discount;
            DailySaleObj["AlibabaProducts"] = await AlibabaProductsDetails(i.OrderId)
            DailySaleObj["NonAlibabaProducts"] = await NonAlibabaProductDetails(i.OrderId)
            DailySaleObj["NetBusiness"] = DailySaleObj.AlibabaProducts.SubTotal + DailySaleObj.NonAlibabaProducts.SubTotal + DailySaleObj.DeliveryAmt
            

            DailySaleArr.push(DailySaleObj)
          }
          res.json(
            {
              'status':'200',
              'data':DailySaleArr
            }
            )
        }
      })
    }
    }
  })
},

commissionPayable : async (req,res) =>{
  jwt.verify(req.token,'secretkey',(err)=>{
    if(err){
      res.json({'error':err})
    }else{
      if(req.body.firstLoading){
        var fromDate =  dateFormat(req.body.fromDate,"yyyy-mm-dd");
        var toDate =  dateFormat(req.body.toDate,"yyyy-mm-dd");
      
      var sql = `SELECT c.TranId, cm.CustomerCode as AgentCode, cd.CustomerCode as SubAgentCode, c.OrderId, c.Amount, c.TranOn, c.AdminTranFlag, c.Remarks, o.OrderNo, o.SubTotal as NetSale,  cm.Name as AgentName  FROM customerwallet as c JOIN ordermaster as o JOIN customermaster as cm JOIN customermaster as cd ON c.OrderId = o.OrderId AND cm.CustomerId = c.CustomerId AND cd.CustomerId = c.CustomerFromId WHERE (c.TranOn LIKE '%${fromDate}%' ) AND o.IsSupplied = "1" ORDER BY OrderId DESC `

      connection.query(sql, async (err,docs)=>{
        if(err){
          res.json(
            {
              'status':'400','error':err
            }
          )
        }else{
          var dataArr = []
          var OACommission = 0.00;
          var NOACommission = 0.00;
          var totalAlibabaProductsSubTotal = 0.00;

          for(var i of docs){
            
            if(i.RetailerId === 1){
              OACommission += i.Amount
              
            }else{
              NOACommission +=i.Amount
              
            }

            var dataObj = {}
            dataObj["TranId"] = i.TranId;
            dataObj["AgentCode"] = i.AgentCode;
            dataObj["SubAgentCode"] = i.SubAgentCode;
            dataObj["OrderId"] = i.OrderId;
            dataObj["Amount"] = i.Amount;
            dataObj["TranOn"] = i.TranOn;
            dataObj["AdminTranFlag"] = i.AdminTranFlag;
            dataObj["Remarks"] = i.Remarks;
            dataObj["OrderNo"] = i.OrderNo;
            dataObj["AgentName"] = i.AgentName;
            dataObj["NetSale"] = i.NetSale
            dataObj["AlibabaProducts"] = await AlibabaProductsDetails(i.OrderId)
            dataObj["NonAlibabaProducts"] = await NonAlibabaProductDetails(i.OrderId)
            

            dataArr.push(dataObj)
          }
          res.json(
            {
              'status':'200',
              'data':dataArr,
              'OACommission' : OACommission,
              'NOACommission' : NOACommission,

            }
          )
        }
      })
      }else{

      var fromDate = req.body.fromDate;
      var toDate = req.body.toDate;
      
      var sql = `SELECT c.TranId, cm.CustomerCode as AgentCode, cd.CustomerCode as SubAgentCode, c.OrderId, c.Amount, c.TranOn, c.AdminTranFlag, c.Remarks, o.OrderNo, o.SubTotal as NetSale,  cm.Name as AgentName  FROM customerwallet as c JOIN ordermaster as o JOIN customermaster as cm JOIN customermaster as cd ON c.OrderId = o.OrderId AND cm.CustomerId = c.CustomerId AND cd.CustomerId = c.CustomerFromId WHERE (c.TranOn BETWEEN '${fromDate}' AND  '${toDate}' ) AND o.IsSupplied = "1" ORDER BY OrderId DESC `

      connection.query(sql, async (err,docs)=>{
        if(err){
          res.json(
            {
              'status':'400','error':err
            }
          )
        }else{

          var dataArr = []
          var OACommission = 0.00;
          var NOACommission = 0.00;
          var totalAlibabaProductsSubTotal = 0.00;
          for(var i of docs){
            if(i.RetailerId === 1){
              OACommission += i.Amount
              
            }else{
              NOACommission +=i.Amount
              
            }

            var dataObj = {}
            dataObj["TranId"] = i.TranId;
            dataObj["AgentCode"] = i.AgentCode;
            dataObj["SubAgentCode"] = i.SubAgentCode;
            dataObj["OrderId"] = i.OrderId;
            dataObj["Amount"] = i.Amount;
            dataObj["TranOn"] = i.TranOn;
            dataObj["AdminTranFlag"] = i.AdminTranFlag;
            dataObj["Remarks"] = i.Remarks;
            dataObj["OrderNo"] = i.OrderNo;
            dataObj["AgentName"] = i.AgentName;
            dataObj["NetSale"] = i.NetSale
            dataObj["AlibabaProducts"] = await AlibabaProductsDetails(i.OrderId)
            dataObj["NonAlibabaProducts"] = await NonAlibabaProductDetails(i.OrderId)
            

            dataArr.push(dataObj)
          }
          res.json(
            {
              'status':'200',
              'data':dataArr,
              'OACommission' : OACommission,
              'NOACommission' : NOACommission,
              

            }
          )
        }
      })
    }
    } 
  })
},
agenTreeTraking: (req,res)=>{
  var customerId = req.body.customerId;
    var sql = `SELECT c.TranId, c.CustomerId , c.CustomerFromId as subagentcode, c.OrderId, c.Amount, c.TranOn, c.AdminTranFlag, c.Remarks, cm.Name as AgentName , cm.CustomerCode  FROM customerwallet as c JOIN customermaster as cm ON cm.CustomerId = c.CustomerId WHERE c.CustomerId = ?`;
    console.log(sql)
    connection.query(sql,[customerId],(err,docs)=>{
      if(err){
        res.json({'status':'400','error':err})
      }else{
        res.json({'status':'200','data':docs,'orderLength':docs.length})
      }
    })
 
},

paymentReceiptAndPayable : (req,res)=>{

var fromDate = req.body.fromDate;
var toDate = req.body.toDate;

var sql = `SELECT o.* FROM ordermaster as o WHERE (o.OrderedOn BETWEEN '${fromDate}' AND  '${toDate}' ) ORDER BY OrderId DESC`


connection.query(sql,(err,docs)=>{
  if(err){
    res.json({
      'status':'400',
      'error':err
    })
  }else{
    console.log(docs)
    var TotalSubTotal = 0.00;
    var TotalTaxAmt = 0.00;
    var GrossSale = 0.00;
    var TotalDeliveryCharges = 0.00;
    var TotalLessDiscount = 0.00;
    var NetSalePrice = 0.00;

    for(var i of docs){
      TotalSubTotal += parseFloat(i.SubTotal)
      TotalTaxAmt += parseFloat(i.TaxAmt)
      GrossSale += parseFloat(i.SubTotal)+parseFloat(i.TaxAmt)
      TotalDeliveryCharges += parseFloat(i.DeliveryAmt)
      TotalLessDiscount += parseFloat(i.Discount)
      NetSalePrice = (GrossSale+TotalDeliveryCharges)-TotalLessDiscount;
    }

    res.json({
      'status':'200',
      'TotalSubTotal':TotalSubTotal,
      'TotalGstAmount':TotalTaxAmt,
      'TotalOrderTotalWithGst':GrossSale,
      'DeliveryAmount':TotalDeliveryCharges,
      'TotalDiscount':TotalLessDiscount,
      'NetSalePrice':NetSalePrice

    })
  }
})


},
commissionPayableForpaymentReceipt :(req,res)=>{
  var fromDate = req.body.fromDate;
  var toDate = req.body.toDate;

  var sql = `SELECT c.* FROM customerwallet as c WHERE (c.TranOn BETWEEN '${fromDate}' AND  '${toDate}' ) ORDER BY OrderId DESC`

  connection.query(sql,(err,docs)=>{
    if(err){
      res.json(
      {
        'status':'400',
        'error':err
      }
    )
    }else{
      var retailerNONCommission = 0.00;
      var retailerOACommission = 0.00;
      var TotalCommission = 0.00;
      
      for(var i of docs){
        if(i.RetailerId === 2){
          retailerNONCommission += i.Amount
        }else{
          retailerOACommission += i.Amount
        } 
        TotalCommission = retailerNONCommission + retailerOACommission
      }
      res.json(
        {
          'status':'200',
          'NOARetailerCommission':retailerNONCommission,
          'OARetailerCommission':retailerOACommission,
          'TotalCommission' : TotalCommission
        }
      )
    }
  })


},
ExpectedDeliveryTime :async (req,res)=>{
  // var data =  oddsums(5);
  // console.log(data)
  var OrderId = req.body.OrderId;
  var expectedTime = req.body.expectedTime
  var sql = `UPDATE ordermaster SET ExpectedDeliveryTime = '${expectedTime}' WHERE OrderId = ${OrderId}`
  console.log(sql)
  connection.query(sql,(err,docs)=>{
    if(err){
      res.json({'status':'400','error':err})
    }else{
      res.json({'status':'200','data':docs})
    }
  })


},
perFormanceTracking : (req,res)=>{
  var fromDate = req.body.fromDate;
  var toDate = req.body.toDate;
  var DriverId = req.body.deliveryId
  
  var sql = `SELECT t.* , d.* FROM locationstravelled as t JOIN drivermaster as d ON d.DriverId = t.DriverId WHERE (t.StartTime BETWEEN '${fromDate}' AND '${toDate}') AND d.DriverId = '${DriverId}' ORDER BY TrackingId DESC`

  console.log(sql)
  connection.query(sql,(err,docs)=>{
    if(err){
      res.json({'status':'400','error':err})
    }else{
      var distanceBetween = 0.00
      var finalDistanceCalculation = 0.00;
      var distanceArr = []
      for(var i of docs){
         var distanceObject = {}
         distanceBetween += distance(i.latitude,i.longtitude,i.latitude+1,i.longtitude+1,"K")
         console.log(distanceBetween)
         finalDistanceCalculat = (distanceBetween / 1000)
         distanceObject["TrackingId"] = i.TrackingId;
         distanceObject["DriverId"] = i.DriverId
         distanceObject["DriverNo"] = "OAD/0000"+i.DriverId;
         distanceObject["OrderId"] = i.OrderId;
         distanceObject["OrderNo"] = i.OrderNo;
         distanceObject["AcceptedOn"] = i.AcceptedOn;
         distanceObject["DeliveredOn"] = i.DeliveredOn;
         distanceObject["IsSupplied"] = i.IsSupplied;
         distanceObject["StartTime"] = i.StartTime;
         distanceObject["EndTime"] = i.EndTime;
         distanceObject["finalDistanceCalculation"] = finalDistanceCalculat;
         finalDistanceCalculation = finalDistanceCalculat;
         distanceObject["Name"] = i.Name;
         distanceObject["Phone"] = i.Phone;
         distanceArr.push(distanceObject)
        console.log(distanceObject)
      }

      res.json({'status':'200','data':distanceArr,'finalDistanceCalculation':finalDistanceCalculation})
    }
  });return;


  var Oslo = {
    lat: 22.621378,
    lon: 88.454056
  };
  var Berlin = {
    lat: 22.598549,
    lon: 88.446167
  };
  var DistanceT = Distance.between(Oslo, Berlin);
  res.json(DistanceT)
},

SelectAllDrivers:(req,res)=>{
  var sql = `SELECT * FROM drivermaster`;
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
payoutList:(req,res)=>{

  var customerId = req.body.customerId;
  
  var sql = `SELECT * FROM customerwallet WHERE CustomerId= ${customerId} AND PaidByAdmin="0"` ;

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
widthdrawalsRequests : async (req,res)=>{
  const axios = require('axios');

  var customerId = req.body.customerId;

  var sql = `SELECT * FROM customerwallet WHERE CustomerId=${customerId} AND PaidByAdmin="0"`;

  customerWalletValue = 0.00;

  connection.query(sql, async(err,docs)=>{
    if(err){
      res.json({
        'status':'400',
        'error':err
      })
    }else{
      if(docs == ""){
        res.json({'status':400,'message':"Sorry you don't have balance!!"})
      }
      else{

      for(var i of docs){
        customerWalletValue += i.Amount;
      }
      if(customerWalletValue<100){
        res.json({'status':400,'message':"Sorry you don't have minimum balance withdrawal request!!"})
      }else{

      
   

      var sql = `SELECT cm.*, ca.*  FROM customermaster as cm JOIN customeraccount as ca ON cm.CustomerId = ca.CustomerId WHERE cm.CustomerId= ${customerId}`;
      connection.query(sql,async(err,docs)=>{
        if(err){
          res.json({
            'status':'400',
            'error':err
          })
        }else{
          var data = docs[0]
          console.log(docs)
          var addData = {
            "customerData":data
          }
           
          
          var razorpayContactId = await createRzpayContact(addData) 
          console.log(razorpayContactId)
          var razorpayFundAccount = await createRzpayFundAccount(addData,razorpayContactId)
           console.log(razorpayFundAccount)

           var customerWalletNew = 120
           let reqData = {
            "account_number": "2323230041462758",
            "fund_account_id": razorpayFundAccount,
            "amount": parseFloat(customerWalletNew) * 100,
            "currency": "INR",
            "mode": "NEFT",
            "purpose": "refund",
            "queue_if_low_balance": true,
            "reference_id": "'"+addData.customerData.CustomerId+"'",
            "narration": "Only Alibaba Fund Transfer",
            "notes": {
                "notes": "Refund Bonus From Only Alibaba " + customerWalletNew
            }

          }
          const payout = await axios.post(razorpayPayout, reqData, payoutAuth)
          // axios.post(razorpayPayout, reqData, payoutAuth)
          //   .then(docs=>{
          //     console.log(docs)
          //   }).catch(err=>{
          //     console.log(err)
          //   });return;
          // console.log(payout);return;
  
          if (payout.data) {
              var sql = `INSERT INTO rzpayout (CustomerId,RazorpayContactId,RazorpayFundAccountId,WidthdrawalAmount,RazorpayPayoutId,Entity,Fund_account_id,Amount,Currency,Notes,Fees,Tax,Status,Purpose,Utr,Mode,Reference_id,Narration,Batch_id,Failure_reason,Created_at,Fee_type) VALUES (${addData.customerData.CustomerId},'${razorpayContactId}','${razorpayFundAccount}','${customerWalletValue}','${payout.data.id}','${payout.data.entity}','${payout.data.fund_account_id}','${payout.data.amount}','${payout.data.currency}','${payout.data.notes.notes}','${payout.data.fees}','${payout.data.tax}','${payout.data.status}','${payout.data.purpose}','${payout.data.utr}','${payout.data.mode}',${payout.data.reference_id},'${payout.data.narration}','${payout.data.batch_id}','${payout.data.failure_reason}','${payout.data.created_at}','${payout.data.fee_type}')`;
              connection.query(sql,(err,docs)=>{
                if(err){
                  res.json({
                    'status':'400',
                    'error':err
                  })
                }else{
                  var sql = `UPDATE customerwallet SET PaidByAdmin='1' WHERE CustomerId=${customerId}`;
                  connection.query(sql,(err,docs)=>{
                    if(err){
                      res.json({
                        'status':'400',
                        'error':err
                      })
                    }else{
                      res.json({
                        'status':'200',
                        'data':docs,
                        'payout':payout.data
                      })
                    }
                  })
                 
                }
              })
          }
        


        }
      })
    }
    }
     





      // let reqData = {
      //   "account_number": "2323230079469890",
      //    "fund_account_id": input.fundAccountId,
      //    "amount": parseFloat(withdrawal.amount) * 100,
      //   "currency": "INR",
      //   "mode": "NEFT",
      //   "purpose": "winnings",
      //   "queue_if_low_balance": true,
      //   "reference_id": req.user._id,
      //   "narration": "Brand War Fund Transfer",
      //   "notes": {
      //       "notes": "Withdrawing winning amount Rs. " + withdrawal.amount,
      //   }
      // }
      // const payout = await axios.post(razorpayPayout, reqData, payoutAuth)


      console.log(customerWalletValue)
    }
  })
},

CustomerWalletTotal:(req,res)=>{
  var customerId = req.body.customerId;
  var sql =  `SELECT * FROM customerwallet `
},
PastRefund : (req,res)=>{
  var sql = `SELECT r.*,c.* FROM rzpayout as r JOIN customermaster as c ON c.CustomerId = r.CustomerId`;
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

CustomerListForPayout : (req,res)=>{
 
 var sql = `SELECT * FROM customermaster`;
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
payoutSelected:(req,res)=>{
  var customerId = req.body.customerId;
  var IsSelected = req.body.IsSelected;
  var sql = `UPDATE customerwallet SET IsSelected='${IsSelected}' WHERE CustomerId = ${customerId} AND PaidByAdmin`;
  connection.query(sql,(err,docs)=>{
    if(err){
      res.json({
        'status':'400',
        'error':err
      })
    }else{
      res.json({
        'status':'200',
        'message':'Sucessfully Updated'
      })
    }
  })


},

OrderFullDatails : async (req,res) =>{
  // var sql = "SELECT * FROM transactionmaster";
  var sql = "SELECT t.*,o.* FROM transactionmaster as t JOIN ordermaster as o ON t.order_id = o.PreorderId";
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


OrderStatusByBank : (req,res)=>{
  var encRequest = ''
  var dataObj = {}
  dataObj["reference_no"] = req.body.reference_no;
  dataObj["order_no"] = req.body.order_no;
  var body = qs.stringify(dataObj)
  var OrderStatusQueryJson = `{ \"reference_no\":\"${req.body.reference_no}\", \"order_no\":\"${req.body.order_no}\" }`; 
  var workingKey = '7F0F123A1270505426CBFECA6F33C806'	//Put in the 32-Bit Key provided by CCAvenue.

  encRequest = ccav.encrypt(OrderStatusQueryJson,workingKey);


  var	accessCode = 'AVXG81FK72BH31GXHB'
  
  var pCommand = "orderStatusTracker";
  var pResponseType = "JSON";
  var pRequestType = "JSON";
  var pVersion="1.1";

  const axios = require('axios');
  
  // "enc_request=" + encJson + "&access_code=" + accessCode + "&command=orderStatusTracker&request_type=JSON&response_type=JSON"
  var authQueryUrlParam = "enc_request="+encRequest+"&access_code="+accessCode+ "&command=orderStatusTracker&request_type=JSON&response_type=JSON";
 console.log(authQueryUrlParam)


  axios.post("https://logintest.ccavenue.com/apis/servlet/DoWebTrans",authQueryUrlParam)
  .then(function (response) {
    var encResJson = "";
    var workingKey = '7F0F123A1270505426CBFECA6F33C806'
    var resData = qs.parse(response.data);
    var resDataParse = (resData.enc_response)
    // console.log(resDataParse);return;
    var ccavResponse = ccav.decrypt(resDataParse,workingKey);
    console.log(ccavResponse)
     res.send({'status':'200','data':ccavResponse})
  })
  .catch(function (error) {
    console.log(error);
  });
}
}





function distance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
  }
  
	else {
   
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}


function customerDetails(id){
  return new Promise((resolve, reject) => {
    connection.query("SELECT d.CustomerFromId,c.CustomerId,c.Name,c.Phone FROM `customermaster` as c JOIN `customerwallet` as d ON c.CustomerId = d.CustomerFromId WHERE d.CustomerFromId = ?",[id],(err,docs)=>{
      console.log(docs)
    resolve(docs);
    reject(err)
    })
  })
}

function vendorDetails(id){
  return new Promise((resolve, reject) => {
    connection.query("SELECT Name FROM retailermaster WHERE RetailerId = ?",[id],(err,docs)=>{
    resolve(docs);
    reject(err)
    })
   

  })
}

createRzpayFundAccount = async (account, contactId) => {

  let reqData = {
      "contact_id": contactId,
      "account_type": "bank_account",
      "bank_account": {
          "name": account.customerData.Name,
          "ifsc": account.customerData.IFSC.toUpperCase(),
          "account_number": account.customerData.AccountNo
      }
  };

  return new Promise((resolve, reject) => {
      axios.post(razorpayFundAccount, reqData, payoutAuth)
          .then(async res => {
              if (res.data) {
                  resolve(res.data.id);
              }
          })
          .catch(err => {
              resolve(false);
          })
  });
};


function createRzpayContact(data){
  // console.log(data);return;
    let reqData = {
      "name": data.customerData.Name,
      "email": data.customerData.Email,
      "contact": data.customerData.Phone,
      "type": "customer",
      "reference_id": "'"+data.customerData.CustomerId+"'",
      "notes": {
          "notes_key": "Creating Razorpay Contact for " + data.customerData.Name,
      }
      
  }
  var payoutAuthz = {
    auth: {
        username: razorpay.key_id,
        password: razorpay.key_secret
    },
    header: {
        "Content-Type": "application/json"
    }
  }
  
  return new Promise(async (resolve, reject) => {
   

    var razorpayContactDetails = razorpayContact
    console.log("Razorpay conatct",razorpayContactDetails)
    console.log("Razorpay data",reqData)
    console.log("Razorpay payoutAuth",payoutAuth);

  //   const contactX =  request.post("https://api.razorpay.com/v1/contacts/", reqData, payoutAuthz)
  //   if (contact.data) {
  //     resolve(contact.data.id);
  // } else
  //     reject(error);

    const contact = await axios.post("https://api.razorpay.com/v1/contacts/", reqData, payoutAuthz);
    if (contact.data) {
        resolve(contact.data.id);
    } else
        reject(false);
  
});
  
}

function AlibabaProductsDetails(OrderId) {
  return new Promise((resolve, reject) => {
    var RetailerId = 4
   
    connection.query("SELECT *  FROM orderdetail WHERE OrderId = ? AND RetailerId=?",[OrderId,RetailerId],(err,docs)=>{
    var TotalGst = 0;
    var priceWithoutGST = 0
    var GstWithPrice = 0;
    var alibabaProductPrice = 0;
    var alibabaSubTotal = 0;
    for(var i of docs){
      TotalGst += i.TaxAmt
      alibabaProductPrice += i.SubTotal
      GstWithPrice = TotalGst+ alibabaProductPrice
      alibabaSubTotal += i.SubTotal

    }
    var AlibabaProductDetailsWithPrice = {}
    AlibabaProductDetailsWithPrice["SubTotal"] = alibabaProductPrice
    AlibabaProductDetailsWithPrice["TotalWithGst"] = TotalGst
    AlibabaProductDetailsWithPrice["TotalWithGstprice"] = GstWithPrice
    resolve(AlibabaProductDetailsWithPrice);
    reject(err)
    })
  })
}

function NonAlibabaProductDetails(OrderId) {
  return new Promise((resolve, reject) => {
    var RetailerId = 4
    connection.query("SELECT *  FROM orderdetail WHERE OrderId = ?",[OrderId],(err,docs)=>{
    var NonalibabaProductPrice = 0;
    var GstWithPrice = 0;
    var TotalGst = 0;
    for(var i of docs){
      if(i.RetailerId == 4){
        
      }else{
        TotalGst += i.TaxAmt
        NonalibabaProductPrice += i.SubTotal
        GstWithPrice = TotalGst+ NonalibabaProductPrice
      }
    }
    var NonAlibabaProductDetailsWithPrice = {}
    NonAlibabaProductDetailsWithPrice["SubTotal"] = NonalibabaProductPrice
    NonAlibabaProductDetailsWithPrice["TotalWithGst"] = TotalGst
    NonAlibabaProductDetailsWithPrice["TotalWithGstprice"] = GstWithPrice
    resolve(NonAlibabaProductDetailsWithPrice);
    reject(err)
    })
   

  })
}