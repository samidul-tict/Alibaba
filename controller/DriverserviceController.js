const connection  =  require('../config/db');
const jwt = require('jsonwebtoken');
const XLSX = require('xlsx')
const fs = require('fs');
const crypto = require('crypto');
const multer  = require('multer');
const upload = multer({dest: __dirname + '/uploads'});
const DriverImg = "https://api.onlyalibaba.in/driver/img/";
var base64ToImage = require('base64-to-image');
const { domainToASCII } = require('url');
var dateFormat = require("dateformat");

function mobileOTP(PhoneNumberSMSGateway,OTPSMSGateway){
var urlencode = require('urlencode');
var request = require('request');
var des = 'destination='+PhoneNumberSMSGateway;
var OTP_msg = '<#> Your OTP to proceed further: '+OTPSMSGateway;
var new_OTP_msg = urlencode(OTP_msg);
var msg = 'message='+ new_OTP_msg;
// var url ='https://sms6.rmlconnect.net/bulksms/bulksms?username=agroyOTP&password=3aPxS2mk&type=0&dlr=0&'+des+'&source=ALIBBA&'+msg;
// console.log(url);

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
	driverservice : (req,res)=>{
		res.json("Driver Service works fine")
	},


/*  API Function For Driver Login */ 
DriverLogin :(req,res)=>{
	 var phnumber = req.body.phnumber;
     var devicekey = req.body.devicekey;
        connection.query('SELECT * FROM drivermaster WHERE Phone =? ',[phnumber],(err,users,fields)=>{
            if (err) console.log(err);
            if(users.length>0){
                    users.find((u)=>{
                    if(u.Phone == phnumber){
                    var user = u;
                    jwt.sign({user},'secretkey',(err,token)=>{
                        if(err) console.log(err);                           
                        let sqlInsert ="call drivermaster_existance_check  ('"+phnumber+"','"+devicekey+"') ";
                        connection.query(sqlInsert,(err,docs)=>{
                        let data = docs;
                        var PhoneNumberSMSGateway = phnumber;
                        const OTPSMSGateway = data[0][0].OTP;
                        mobileOTP(PhoneNumberSMSGateway,OTPSMSGateway)          
                        res.json({"status":"200","data":data[0],"token":token})});
                        });           
                    };
                })
                }else{
                res.status(404).json({'status':'404',message:'Phonenumber Not Matched'});
            }
            });

},

   /*  API Function For Driver Validate */ 
DriverValidate :(req,res)=>{
   	jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
            	res.json({'error':err})
            }else{

	var check = "CALL drivermaster_otp_check_and_detail ('"+req.body.DriverId+"','"+req.body.OTP+"')";
	connection.query(check,(err,docs)=>{
	   if(err){
		   res.json({'error':err})

	   }else{
      if(docs[0] == ""){
        res.json({'status':'400','message':'OTP has been expired. Please regenerate.'})
      }else{     
        connection.query("SELECT * FROM drivermaster WHERE OTP=?",[req.body.OTP],(err,OTP)=>{
            if(err){
                res.json({'status':'200','error':err})
            }else{

                if(OTP.length == 0){
                  res.json({'status':'400','message':'OTP not vaild'});
                }else{
                  var info = docs[0];
                  var data = info[0];                 
                  var value = [];
                  var info = {};
                  if(data.IsOnline == 1){
                    var online = "true";
                    info["DriverId"]=data.DriverId;
                    info["Name"]=data.Name;
                    info["Phone"]=data.Phone;
                    info["Address"]=data.Address;
                    info["Email"]=data.Email;
                    info["Landmark"]=data.Landmark;
                    info["Pincode"]=data.Pincode;
                    info["ProfileImage"]=DriverImg + data.ProfileImage;
                    info["DeviceKey"]=data.DeviceKey;
                    info["Password"]=data.Password;
                    info["OTP"]=data.OTP;
                    info["IsOnline"]= online;
                    value.push(info);
                  }
                  else{
                    var online ="false"; 
                    info["DriverId"]=data.DriverId;
                    info["Name"]=data.Name;
                    info["Phone"]=data.Phone;
                    info["Address"]=data.Address;
                    info["Email"]=data.Email;
                    info["Landmark"]=data.Landmark;
                    info["Pincode"]=data.Pincode;
                    info["ProfileImage"]=DriverImg + data.ProfileImage;
                    info["DeviceKey"]=data.DeviceKey;
                    info["Password"]=data.Password;
                    info["OTP"]=data.OTP;
                    info["IsOnline"]= online;
                    value.push(info);
                  }
                    res.json({'status':'200','data':value});
                    
                }
                
            }
        })
		}
	   }
})	
}
	})
   },


DriverInformation : (req,res)=>{
   jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{
  connection.query("SELECT * FROM drivermaster WHERE DriverId = ?",[req.body.DriverId],(err,docs)=>{
    if(err){
      res.json({'status':'400','error':err})
    }else{
         var info = docs[0];
          var data = info;    
          var value = [];
          var info = {}; 
            if(data.IsOnline == 1){
              var online = "true"; 
                    info["DriverId"]=data.DriverId;
                    info["Name"]=data.Name;
                    info["Phone"]=data.Phone;
                    info["Address"]=data.Address;
                    info["Email"]=data.Email;
                    info["Landmark"]=data.Landmark;
                    info["Pincode"]=data.Pincode;
                    info["ProfileImage"]=DriverImg + data.ProfileImage;
                    info["DeviceKey"]=data.DeviceKey;
                    info["Password"]=data.Password;
                    info["OTP"]=data.OTP;
                    info["IsOnline"]= online;
                    value.push(info);
                  }
                  else{
                    var online ="false";
                    info["DriverId"]=data.DriverId;
                    info["Name"]=data.Name;
                    info["Phone"]=data.Phone;
                    info["Address"]=data.Address;
                    info["Email"]=data.Email;
                    info["Landmark"]=data.Landmark;
                    info["Pincode"]=data.Pincode;
                    info["ProfileImage"]=DriverImg + data.ProfileImage;
                    info["DeviceKey"]=data.DeviceKey;
                    info["Password"]=data.Password;
                    info["OTP"]=data.OTP;
                    info["IsOnline"]= online;
                    value.push(info);
                  }    
                    res.json({'status':'200','data':value});
                }
              })
            }
      })
},

/*  API Function For Driver Profile Update */ 
   DriverProfileUpdate : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
            	res.json({'error':err})
            }else{
                var Image_null = typeof req.body.myFile != 'undefined' && req.body.myFile != '' ? req.body.myFile : null;
                  if(Image_null == null){
                    var Image_alibaba = "no.jpg";
                  var sql = "CALL drivermaster_profile_update ('"+req.body.driverId+"','"+req.body.name+"','"+req.body.email+"','"+req.body.address+"','"+req.body.landmark+"','"+req.body.pincode+"','"+Image_alibaba+"')";
                  connection.query(sql,(err,docs)=>{
                    if(err){
                        res.json({'error':err})
                    }else{                        
                      res.json({'status':'200',message:'Sucessfully updated'});
                    }
                  })
              }else{
              var base64Str = req.body.myFile;
              var path ='uploads/driver/img/';
              var imageFileName = Date.now();
              var imageName = imageFileName.toString();
              var optionalObj = {'fileName': imageName, 'type':'png'};
              var image = base64ToImage(base64Str,path,optionalObj);
              var Image =image.fileName;
              
                 var sql = "CALL drivermaster_profile_update ('"+req.body.driverId+"','"+req.body.name+"','"+req.body.email+"','"+req.body.address+"','"+req.body.landmark+"','"+req.body.pincode+"','"+Image+"')";
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

/*  API Function For Pending Order List For Driver */
  PendingOrderListForDriver : (req,res)=>{
  	jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
            	res.json({'error':err})
            }else{
    
    var DriverId = typeof req.body.DriverId != 'undefined' && req.body.DriverId != '' ? req.body.DriverId : null;
    var sql = "CALL ordermaster_select_driverwise_pending ("+DriverId+",'"+req.body.OrderNo+"','"+req.body.CustomerName+"','"+req.body.CustomerPhone+"','"+req.body.Page+"','"+req.body.Size+"')";
    connection.query(sql,(err,docs)=>{
        if(err){
            res.json({'error':err})

        }else{
          var FinalData = []
          var ProcessData1 = docs[0];
          for (var i = 0; i < ProcessData1.length; i++) {
          var data_new = {};
          var date = ProcessData1[i].OrderedOn;
          var NewDate = date.split(" ");
          var OnlyDate = NewDate[0];
          var OnlyDateConversion = new Date(OnlyDate);
          var ProcessDateData1 = OnlyDateConversion.toDateString();
          var ProcessDateData2 = ProcessDateData1.split(" ");
          var FinalDateData = ProcessDateData2[2]+' '+ProcessDateData2[1]+' '+ProcessDateData2[3];
          var ProcessTimeData = NewDate[1];
          var date = new Date(date);
          var options = {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            }

          var FinalTimeData = date.toLocaleString('en-US', options);
          data_new["OrderNo"]=ProcessData1[i].OrderNo;
          data_new["OrderDate"] = FinalDateData;
          data_new["OrderTime"] = FinalTimeData;
          data_new["OrderTotal"] = ProcessData1[i].OrderTotal;
          data_new["OTP"] = ProcessData1[i].OTP;
          data_new["AddressName"] = ProcessData1[i].AddressName;
          data_new["Address"] = ProcessData1[i].Address;
          data_new["Pincode"] = ProcessData1[i].Pincode;
          data_new["Latitude"] = ProcessData1[i].Latitude;
          data_new["Longitude"] = ProcessData1[i].Longitude;
          data_new["OrderDetail"] = ProcessData1[i].OrderDetail;
          FinalData.push(data_new);

        }  
        res.json({'status':'200','data':FinalData});
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
          var sql = "CALL ordermaster_select_driverwise_completed ("+DriverId+",'"+req.body.OrderNo+"','"+req.body.CustomerName+"','"+req.body.CustomerPhone+"',"+req.body.Page+","+req.body.Size+")";
         
          connection.query(sql,(err,docs)=>{
              if(err){
                  res.json({'error':err})

              }else{
              var FinalData = []
                var ProcessData1 = docs[0];
                for (var i = 0; i < ProcessData1.length; i++) {
                var data_new = {};
                var date = ProcessData1[i].OrderedOn;
                var NewDate = date.split(" ");
                var OnlyDate = NewDate[0];
                var OnlyDateConversion = new Date(OnlyDate);
                var ProcessDateData1 = OnlyDateConversion.toDateString();
                var ProcessDateData2 = ProcessDateData1.split(" ");
                var FinalDateData = ProcessDateData2[2]+' '+ProcessDateData2[1]+' '+ProcessDateData2[3];
                var ProcessTimeData = NewDate[1];
                var date = new Date(date);
                var options = {
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                  }
                var FinalTimeData = date.toLocaleString('en-US', options);
                var Name = "NA";
                if(ProcessData1[i].Name == null){
                  data_new["OrderNo"]=ProcessData1[i].OrderNo;
                data_new["OrderDate"] = FinalDateData;
                data_new["OrderTime"] = FinalTimeData;
                data_new["OrderTotal"] = ProcessData1[i].OrderTotal;
                data_new["AddressName"] = ProcessData1[i].AddressName;
                data_new["Address"] = ProcessData1[i].Address;
                data_new["Pincode"] = ProcessData1[i].Pincode;
                data_new["Latitude"] = ProcessData1[i].Latitude;
                data_new["Longitude"] = ProcessData1[i].Longitude;
                data_new["OrderDetail"] = ProcessData1[i].OrderDetail;
                data_new["Name"] = Name;
                data_new["Phone"] = ProcessData1[i].Phone;
                data_new["PaymentMode"] = ProcessData1.PaymentMode;
                data_new["Status"] = "Delivered";
                FinalData.push(data_new);

                }else{
                  data_new["OrderNo"]=ProcessData1[i].OrderNo;
                data_new["OrderDate"] = FinalDateData;
                data_new["OrderTime"] = FinalTimeData;
                data_new["OrderTotal"] = ProcessData1[i].OrderTotal;
                data_new["AddressName"] = ProcessData1[i].AddressName;
                data_new["Address"] = ProcessData1[i].Address;
                data_new["Pincode"] = ProcessData1[i].Pincode;
                data_new["Latitude"] = ProcessData1[i].Latitude;
                data_new["Longitude"] = ProcessData1[i].Longitude;
                data_new["OrderDetail"] = ProcessData1[i].OrderDetail;
                data_new["Name"] = ProcessData1[i].Name;
                data_new["Phone"] = ProcessData1[i].Phone;
                data_new["PaymentMode"] = ProcessData1[i].PaymentMode;
                data_new["Status"] = "Delivered";
                FinalData.push(data_new);
                }
                
                  }
                  
              res.json({'status':'200','data':FinalData});
              }
          })
        }
    })
},

/*  API Function For Order Status Update By Driver */
OrderUpdate : (req,res)=>{
    jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
            	res.json({'error':err})
            }else{
               var OrderId = req.body.OrderId;
               var RefCustomerId = typeof req.body.RefCustomerId != 'undefined' && req.body.RefCustomerId != '' ?req.body.RefCustomerId : null; 
              connection.query("SELECT * FROM ordermaster WHERE OrderNo = ?",[OrderId],(err,docs)=>{
                if(err){
                  res.json({'status':'400','error':err})
                }else{
                var OrderId = docs[0].OrderId;
                var Latitude = req.body.latitude;
                var Longitude = req.body.longitude;
                var now = Date.now()
                var StartTime = dateFormat(now,"yyyy-mm-dd HH:MM:ss");
                var EndTime = dateFormat(now,"yyyy-mm-dd HH:MM:ss");
                var sql = "CALL ordermaster_driver_order_complete ("+OrderId+","+req.body.DriverId+","+req.body.OTP+","+req.body.CustomerId+","+RefCustomerId+",'"+Latitude+"','"+Longitude+"','"+StartTime+"','"+EndTime+"','"+req.body.OrderId+"')";

                console.log(sql)

                connection.query(sql,(err,docs)=>{
                    if(err){
                        res.json({'error':err})

                    }else{ 
                    res.json({'status':'200','data':docs[0]});
                    }
                  })
                }
    })
}
})
},

  /*  API Function For  Order List For Driver By Id */
  OrderDetailId :(req, res) =>{
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
          var sql = "CALL ordermaster_select_order_by_driver ('"+OrderId+"')";
          connection.query(sql, (err,docs) => {
        if(err){
            res.json({'error':err})

        }else{
          
           var FinalData = []
          var ProcessData0 = docs[0];
          var ProcessData1 = ProcessData0[0];
          var data_new = {};
          var date = ProcessData1.OrderedOn;
          var NewDate = date.split(" ");
          var OnlyDate = NewDate[0];
          var OnlyDateConversion = new Date(OnlyDate);
          var ProcessDateData1 = OnlyDateConversion.toDateString();
          var ProcessDateData2 = ProcessDateData1.split(" ");
          var FinalDateData = ProcessDateData2[2]+' '+ProcessDateData2[1]+' '+ProcessDateData2[3];
          var ProcessTimeData = NewDate[1];
          var date = new Date(date);
          var options = {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            }

          var FinalTimeData = date.toLocaleString('en-US', options);
          if(ProcessData1.Name == null){
          var Name = "NA";
          data_new["OrderNo"]=ProcessData1.OrderNo;
          data_new["OrderDate"] = FinalDateData;
          data_new["OrderTime"] = FinalTimeData;
          data_new["OrderTotal"] = ProcessData1.OrderTotal;
          data_new["OTP"] = ProcessData1.OTP;
          data_new["AddressName"] = ProcessData1.AddressName;
          data_new["Address"] = ProcessData1.Address;
          data_new["RefCustomerId"]= ProcessData1.RefCustomerId;
          data_new["Name"] = Name;
          data_new["Phone"] = ProcessData1.Phone;
          data_new["CustomerId"]= ProcessData1.CustomerId;
          data_new["PaymentMode"] = ProcessData1.PaymentMode;
          data_new["Pincode"] = ProcessData1.Pincode;
          data_new["Latitude"] = ProcessData1.Latitude;
          data_new["Longitude"] = ProcessData1.Longitude;
          data_new["OrderDetail"] = ProcessData1.OrderDetail;
          FinalData.push(data_new);

        }else{
          data_new["OrderNo"]=ProcessData1.OrderNo;
          data_new["OrderDate"] = FinalDateData;
          data_new["OrderTime"] = FinalTimeData;
          data_new["OrderTotal"] = ProcessData1.OrderTotal;
          data_new["OTP"] = ProcessData1.OTP;
          data_new["AddressName"] = ProcessData1.AddressName;
          data_new["Address"] = ProcessData1.Address;
          data_new["RefCustomerId"]= ProcessData1.RefCustomerId;
          data_new["Name"] = ProcessData1.Name;
          data_new["Phone"] = ProcessData1.Phone;
          data_new["CustomerId"]= ProcessData1.CustomerId;
          data_new["PaymentMode"] = ProcessData1.PaymentMode;
          data_new["Pincode"] = ProcessData1.Pincode;
          data_new["Latitude"] = ProcessData1.Latitude;
          data_new["Longitude"] = ProcessData1.Longitude;
          data_new["OrderDetail"] = ProcessData1.OrderDetail;
          FinalData.push(data_new);
        }
      

    		res.json({'status': '200', 'data': FinalData});
        }
    })
        }
      })
}
})
},

DriverMasterIsOnlineStatus : (req,res)=>{
   jwt.verify(req.token,'secretkey',(err)=>{
            if(err){
              res.json({'error':err})
            }else{

    if(req.body.IsOnline === "true"){
      var IsOnline = 1;
      var Latitude = req.body.latitude;
      var Longitude = req.body.longitude;
      var now = Date.now()
      var StartTime = dateFormat(now,"yyyy-mm-dd HH:MM:ss");
      var endTime = dateFormat(now,"yyyy-mm-dd HH:MM:ss");
      connection.query("CALL drivermaster_isonline ('"+IsOnline+"','"+req.body.DriverId+"','"+Latitude+"','"+Longitude+"','"+StartTime+"','"+endTime+"')",(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{

            res.json({'status':'200','data':docs[0]})
        }
    })

    }else{
    
      var IsOnline_false = 0;
      var now = Date.now()
      var Latitude = req.body.latitude;
      var Longitude = req.body.longitude;
      var EndTime = dateFormat(now,"yyyy-mm-dd HH:MM:ss");
      var startTime = dateFormat(now,"yyyy-mm-dd HH:MM:ss");
      connection.query("CALL drivermaster_isonline ('"+IsOnline_false+"','"+req.body.DriverId+"','"+Latitude+"','"+Longitude+"','"+startTime+"','"+EndTime+"')",(err,docs)=>{
        if(err){
            res.json({'status':'400','error':err})
        }else{

            res.json({'status':'200','data':docs[0]})
        }
    })

    }

    
}
})
}



}