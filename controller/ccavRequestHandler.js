var http = require('http'),
    fs = require('fs'),
    ccav = require('./ccavutil.js'),
    qs = require('querystring');
const connection  =  require('../config/db');

exports.postReq = function(request,response,information){
    var data = { };
    console.log(information[0].OrderId)
    data["merchant_id"]="198611";
    data["order_id"]= information[0].OrderId;
  	data["currency"]="INR";
   	data["amount"]=information[0].OrderTotal;
    data["redirect_url"]="https://api.onlyalibaba.in/appservice/ccavResponseHandler";
    data["cancel_url"] ="https://api.onlyalibaba.in/appservice/cancelredirectpayment";
 	data["tid"]=Date.now()
    data["language"]="EN";
    var body = qs.stringify(data)

	workingKey = '7F0F123A1270505426CBFECA6F33C806',	//Put in the 32-Bit Key provided by CCAvenue.
	accessCode = 'AVXG81FK72BH31GXHB',			//Put in the Access Code provided by CCAvenue.
	encRequest = '',
	formbody = '';
	
	encRequest = ccav.encrypt(body,workingKey); 
	formbody = '<form id="nonseamless" method="post" name="redirect" action="https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction"/> <input type="hidden" id="encRequest" name="encRequest" value="' + encRequest + '"><input type="hidden" name="access_code" id="access_code" value="' + accessCode + '"><script language="javascript">document.redirect.submit();</script></form>';
				
    response.writeHeader(200, {"Content-Type": "text/html"});
	response.write(formbody);
	response.end();

};
