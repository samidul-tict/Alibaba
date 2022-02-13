var http = require('http'),
    fs = require('fs'),
    ccav = require('./ccavutil.js'),
    qs = require('querystring');
const connection  =  require('../config/db');

function emailGateway(EmailData,transID){

var nodemailer = require('nodemailer');
var OAuth2 = require('oauth2');
var transporter = nodemailer.createTransport({
     service : "gmail",
    auth : {
      type: 'OAuth2',
      
            user: "alibabaonly519@gmail.com",
            clientId :'1008610370467-ce1ihgeki1pri2u0bus9f83202i25g9o.apps.googleusercontent.com',
            clientSecret : 'wtgec7YlTS8REp7CcMweAqeF',
            refreshToken : '1//04xhjTqH2tiQtCgYIARAAGAQSNwF-L9IricY16gq3CkInFuoHtQG19dMCHC84cY-qTj0j9XzMnWAl-Fj8EXBvnkoWvRMNZQg85u0',        
            accessToken : 'ya29.a0AfH6SMBH3gtMS534ybdO0qU6eY8m5VOch6Yji60dXDQfxEim8lGQVB_SG6jiNnfJJyLESBOyaaU3ndT7Z7MrR7hlSfWmTXg_IZN17cvg-UTnUS5YxdHQhhpufgiUDL8Fp9WDkbooSMms3TqmPwlFPcLvWcuDBHaoLS8'
         }
});
var mailOptions = {
  from: 'Only Alibaba',
  to: EmailData,
  subject: 'Payment Transcation From ALIBABA ',
  text: 'Transcation Sucessfully Completed . Your Transcation ID = ' + transID
};

transporter.sendMail(mailOptions, (err, info)=>{
  if(err){
    console.log('Error '+err)
  }
   else{
    console.log('Email sent: ' + info.response);
  }
});
}


// 7748d0556db60fb3bb03667e01266d79117e34d606f64a0ae98d3aa79ea5b7c1e2a8b3d8bc7c9a1095adbab1ac5c7a35d4ea69cf1e04fe12acf3f26fd93c94828fec0e315c2299840677517c902f5cc2e759711add11f33b7ebb756be9d40dc3b3feee20a3f820e999b780848ac5ffb412052730b39996956778a6dd27e541b60d1add4e2c13b93e2d60baf30053a2083096b0c801119827c9ed7dc79cf0a9a23677649bf1b4effe75fd86f85e7e56020f5f05be4ea3226a109ea7b6a95c07a7a5e0acb7ddbac8877255a4566c16241c73fd65b934ae98d03a8cab1cff4c514dbc74e1c9aa8a94cb44886ebb7ed0e48df5ffa550d0de504348f5b2ec3a0d377503b024682c90c365a2e109f57383e0fe9e142e628130fedee29bf91740f94692af34673363e1765a2fa76b89793c73cd95866b4794ed6285306f55f4ae44fee1e2a052c0e608b1b28d83d59c0487710bbd0e5b8f57f200bb157f1275b4c8865f091ea5ee9ed2503ed090a4e46a85f5a6acf534ad870c7ee10192c3c1616e217c9badd5e8de9b291db4a83113c4a61f280f870e64763c99651b337f8a54a381c00ed27fb9c281bc6b39405ad567634d21215d7209dbf8fe920421593d3a30b069f497c2d653b32d571cd06e0ad443735825c25f9c19587c7428d86367c0119bd32e398a31aa2c20e5e7a7711cd3dfb7916bbe9b2225ad505f3bf66471b5a54f222068293cb135d18a1178f51ae228076d5d0cfae8c8185259c1d1b32dc98921109aea7dc1b4cdcc199458504fbdacbf1a669a49b3f8092d0304b643e160749961ad1fa5ec55df67fa8414579141943672b017dc4ec8d3eb431b7e2730d1db09d44b14c4c4c4be083c69769f99af659a2ee3fb8139a1753f9009ec3d6df4e16c2bdbb57e41d263a3cf445124e5628c45f631a0f8d46836761103ee02e56615c91ce284c44e5fa1d6fd45cbbef9b64a9f2ba46a07a429bb9b53ceef17e822d8ee48

exports.postRes = (request,response,data)=>{

	workingKey = '7F0F123A1270505426CBFECA6F33C806';	//Put in the 32-Bit Key provided by CCAvenue
          var encryption = data.encResp;
          console.log(encryption)
		var ccavResponse = ccav.decrypt(encryption,workingKey);
		var information= qs.parse(ccavResponse);
          //  console.log(information)

          var query1 = `SELECT * FROM transactionmaster WHERE order_id= ${information.order_id} OR tracking_id = ${information.tracking_id} OR bank_ref_no = ${information.bank_ref_no}`;

          var query2 =  `SELECT * FROM preorder WHERE PreorderId = ${information.order_id}`;

          connection.query(query1,(err,val1)=>{
               if(err){
                    response.json({'status':'400','error':err})
               }else{
                    if(val1.length>1){
                         response.json({'status':'400','error':'Something went wrong!! contact to the admin!!!'})
                    }else{
                         console.log("ok")
                         connection.query(query2,(err,val2)=>{
                              if(err){
                                   response.json({'status':'400','error':err})
                              }else{
                                    console.log("2nd Ok")
                                    console.log(val2)
                                   if(val2.length>0){
                                        console.log("3nd Ok")
                                        if(val2[0].OrderTotal == information.amount && val2[0].OrderTotal == information.mer_amount){
                                             console.log("4th Ok")
                                             var order_id = typeof information.order_id != 'undefined' && information.order_id != '' ? information.order_id : null;
                                             var tracking_id = typeof information.tracking_id != 'undefined' && information.tracking_id != '' ?information.tracking_id: null;
                                             var bank_ref_no = typeof information.bank_ref_no != 'undefined' && information.bank_ref_no != '' ? information.bank_ref_no : null;
                                             var order_status = typeof information.order_status != 'undefined' && information.order_status != '' ? information.order_status : null;
                                             var failure_message = typeof information.failure_message != 'undefined' && information.failure_message != '' ? information.failure_message : null;
                                             var payment_mode = typeof information.payment_mode!= 'undefined' && information.payment_mode != '' ? information.payment_mode : null;
                                             var card_name = typeof information.card_name != 'undefined' && information.card_name != '' ? information.card_name : null;
                                             var status_code = typeof information.status_code != 'undefined' && information.status_code != '' ? information.status_code: null;
                                             var status_message = typeof information.status_message != 'undefined' && information.status_message != '' ? information.status_message : null;
                                             var currency = typeof information.currency != 'undefined' && information.currency != '' ? information.currency : null;
                                             var amount = typeof information.amount != 'undefined' && information.amount != '' ? information.amount: null;
                                             var billing_name = typeof information.billing_name != 'undefined' && information.billing_name != '' ? information.billing_name: null;
                                             var billing_address = typeof information.billing_address != 'undefined' && information.billing_address != '' ? information.billing_address: null;
                                             var billing_city = typeof information.billing_city != 'undefined' && information.billing_city != '' ? information.billing_city: null;
                                             var billing_state = typeof information.billing_state != 'undefined' && information.billing_state != '' ? information.billing_state: null;
                                             var billing_zip = typeof information.billing_zip != 'undefined' && information.billing_zip != '' ? information.billing_zip: null;
                                             var billing_country = typeof information.billing_country != 'undefined' && information.billing_country != '' ? information.billing_country: null;
                                             var billing_tel = typeof information.billing_tel != 'undefined' && information.billing_tel != '' ? information.billing_tel: null;
                                             var billing_email = typeof information.billing_email != 'undefined' && information.billing_email != '' ? information.billing_email: null;
                                             var delivery_name = typeof information.delivery_name != 'undefined' && information.delivery_name != '' ? information.delivery_name: null;
                                             var delivery_address = typeof information.delivery_address != 'undefined' && information.delivery_address!= '' ? information.delivery_address: null;
                                             var delivery_city= typeof information.delivery_city != 'undefined' && information.delivery_city != '' ? information.delivery_city: null;
                                             var delivery_state = typeof information.delivery_state != 'undefined' && information.delivery_state != '' ? information.delivery_state: null;
                                             var delivery_zip = typeof information.delivery_zip != 'undefined' && information.delivery_zip != '' ? information.delivery_zip: null;
                                             var delivery_country = typeof information.delivery_country!= 'undefined' && information.delivery_country != '' ? information.delivery_country: null;
                                             var delivery_tel = typeof information.delivery_tel != 'undefined' && information.delivery_tel != '' ? information.delivery_tel: null;
                                             var merchant_param1 = typeof information.merchant_param1 != 'undefined' && information.merchant_param1 != '' ? information.merchant_param1: null;
                                             var merchant_param2 = typeof information.merchant_param2 != 'undefined' && information.merchant_param2 != '' ? information.merchant_param2: null;
                                             var merchant_param3 = typeof information.merchant_param3 != 'undefined' && information.merchant_param3 != '' ? information.merchant_param3: null;
                                             var merchant_param4 = typeof information.merchant_param4 != 'undefined' && information.merchant_param4 != '' ? information.merchant_param4: null;
                                             var merchant_param5 = typeof information.merchant_param5!= 'undefined' && information.merchant_param5 != '' ? information.merchant_param5: null;
                                             var vault = typeof information.vault != 'undefined' && information.vault != '' ? information.vault: null;
                                             var offer_type = typeof information.offer_type != 'undefined' && information.offer_type != '' ? information.offer_type: null;
                                             var discount_value = typeof information.discount_value != 'undefined' && information.discount_value != '' ? information.discount_value: null;
                                             var eci_value = typeof information.eci_value != 'undefined' && information.eci_value != '' ? information.eci_value: null;
                                             var mer_amount = typeof information.mer_amount != 'undefined' && information.mer_amount != '' ? information.mer_amount: null;
                                             var retry = typeof information.retry != 'undefined' && information.retry != '' ? information.retry: null;
                                             var response_code = typeof information.response_code != 'undefined' && information.response_code != '' ? information.response_code: null;
                                             var billing_notes = typeof information.billing_notes != 'undefined' && information.billing_notes != '' ? information.billing_notes: null;
                                             // var trans_date = typeof information.trans_date != 'undefined' && information.trans_date != '' ? information.trans_date: null;
                                             var bin_country = typeof information.bin_country != 'undefined' && information.bin_country != '' ? information.bin_country: null;
                                             var offer_code = typeof information.offer_code != 'undefined' && information.offer_code != '' ? information.offer_code: null;
                                        
                                                  
                                                  var sql = "CALL ordermaster_payment_stat_update ('"+order_id+"','"+tracking_id+"','"+bank_ref_no+"','"+order_status+"','"+failure_message+"','"+payment_mode+"','"+card_name+"','"+status_code+"','"+status_message+"','"+currency+"','"+amount+"','"+billing_name+"','"+billing_address+"','"+billing_city+"','"+billing_state+"','"+billing_zip+"','"+billing_country+"','"+billing_tel+"','"+billing_email+"','"+delivery_name+"','"+delivery_address+"','"+delivery_city+"','"+delivery_state+"','"+delivery_zip+"','"+delivery_country+"','"+delivery_tel+"','"+merchant_param1+"','"+merchant_param2+"','"+merchant_param3+"','"+merchant_param4+"','"+merchant_param5+"','"+vault+"','"+offer_type+"','"+offer_code+"','"+discount_value+"','"+mer_amount+"','"+eci_value+"','"+retry+"','"+response_code+"','"+billing_notes+"','"+bin_country+"')";
                                                  
                                            connection.query(sql,(err,data)=>{
                                                  if(err){
                                                       response.json({'error':err})
                                                    }else{        
                                                        if(information.order_status == 'Success'){
                                                        connection.query('SELECT * FROM ordermaster WHERE PreorderId = ?',[order_id],(err,email)=>{
                                                            if(err){
                                                                 response.json({'error':err})
                                                            }else{
                                                                 var transID = data[0][0].TransactionId;
                                                                 var CustomerId = email[0].CustomerId;
                                                                 connection.query('SELECT * FROM customermaster WHERE CustomerId = ?',[CustomerId],(err,docs)=>{
                                                                      if(err){
                                                                           response.json({'error':err})
                                                                      }else{ 
                                                                           var EmailData = docs[0].Email;
                                                                           emailGateway(EmailData,transID)
                                                                           response.json({'status':'200','data':docs[0]+data[0][0],message:"Your Payment Sucessfully Completed"});
                                                                      }
                                                                 })
                                                                 
                                                            }
                                                       })
                                                       }else{
                                                                   response.json({'status':'I00008','data':data[0],message:"Your Payment Sucessfully Failure"});
                                                              }
                                                              }
                                                })
                                        }else{
                                             response.json({'status':'400','error':'Something went wrong!! contact to the admin!!!'})
                                        }
                                        
                                   }else{
                                        response.json({'status':'400','error':'Something went wrong!! contact to the admin!!!'})
                                   }
                              }
                            
                         })
                         // console.log("not - ok")
                    }
               }
          });return;


	
}
