const mysql = require('mysql');
const bodyParser = require('body-parser');
const express  = require('express');
const app = express();
const connection =  require('./config/db.js');
const WebRouter = require('./router/WebserviceRouter');
const AppRouter = require('./router/AppserviceRouter');
const DriverRouter = require('./router/DriverserviceRouter');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require("path");
const fileUpload = require('express-fileupload');
const http = require('http')
const PORT = process.env.PORT || 3100;

// const https = require('https');
// const fs = require('fs');

//* Database Connectivity *//
// connection.getConnection((err,connection)=>{
// 	if(err){
// 		return res.json(err)
// 	}else{
// 		console.log('Database Connected Succesfully Works');
// 	}
// 	connection.release('Connection End');
	
// });
console.log('Database connected Succesfully Works');

// let doesModifyBody = (req, res, next) => {
//     // res.setHeader("Content-Type", "text/html");
//     res.set('Content-Type', 'application/json');
//     res.json()
//   }
//* Express Engines *//
// app.use(doesModifyBody);
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({extended:true}));
app.use(fileUpload());
app.use(express.static(path.join(__dirname,'uploads')));
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept,Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Cache-Control', 'no-cache')
  next();
});




app.get('/',(req,res)=>{
    res.send("Welcome");
})
//* Router Implement *//
app.use('/webservice',WebRouter);
app.use('/appservice',AppRouter);
app.use('/driverservice',DriverRouter);
// const port = process.env.PORT || 3100
// beforeAll(async () => {
//  await new Promise((resolve) => {
//         app.listen(PORT, () => {
//             console.log('Example app listening on port 3100');
//             return resolve();
//             afterAll(() => { console.log('closing...'); app.close(); });
//         });
//     });
// });
var server = app.listen(process.env.PORT || 3100 )
console.log(server);
server.close()
module.exports = server;
// const port = 3100;
// const httpsOptions = {
// 	cert : fs.readFileSync('cert.pem'),
// 	key : fs.readFileSync('key.pem')

// }

// https.createServer(httpsOptions,app)
// 	.listen(port,(err)=> {
// 		if(err){
// 			console.log(err);
// 		}else{
// 			console.log("Succesfully Server Connected");		
// 		}
	
// 	});







