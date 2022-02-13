var request = require('supertest')
  , app = require('../../app');
  
//LOGIN

describe('All of the functions from Driver App test report', () => {
test("Driver Should Sign In With Vaild Details",async(done)=>{

  // jest.setTimeout(30000);
     const response = await request(app)
     .post('/driverservice/login')
      .send({
        phnumber:"8759093170",
        devicekey:"bsdhhjbhjsfhhvshgvhgs"
      })
      expect(200)
      expect(response.body)
      done();
})

//Driver Validate
test("Driver Should Sign with OTP and Validate",async(done)=>{

  // jest.setTimeout(30000);
     const response = await request(app)
     .post('/driverservice/drivervalidate')
      .send({
        DriverId:"5",
        OTP:"621133"
      })
      expect(200)
      expect(response.body)
      done();
})


//Profile Update
test("Driver Profile update",async(done)=>{

  // jest.setTimeout(30000);
     const response = await request(app)
     .post('/driverservice/profileupdate')
      .send({
        driverId:"5",
        name:"Rishi",
        email:"rishim985@gmail.com",
        address:"Kolkata",
        landmark:"Kolkata",
        pincode:"700102",
        myFile:""
      })
      expect(200)
      expect(response.body)
      done();
})

//pendingorderlist
test("Driver Pending Order List",async(done)=>{

  // jest.setTimeout(30000);
     const response = await request(app)
     .post('/driverservice/pendingorderlist')
      .send({
        DriverId:"5",
        OrderNo:"",
        CustomerName:"",
        CustomerPhone:"",
        Page:"1",
        Size:"10",
        
      })
      expect(200)
      expect(response.body)
      done();
})


// Complete Order List
test("Driver Complete Order List",async(done)=>{

  // jest.setTimeout(30000);
     const response = await request(app)
     .post('/driverservice/completedorderlist')
      .send({
        DriverId:"5",
        OrderNo:"",
        CustomerName:"",
        CustomerPhone:"",
        Page:"1",
        Size:"10",
        
      })
      expect(200)
      expect(response.body)
      done();
})


//Order Details By Id

test("Order Details By Id",async(done)=>{

  // jest.setTimeout(30000);
     const response = await request(app)
     .post('/driverservice/orderdetailbyid')
      .send({
        OrderId:"2020-21/7/000009"
       
      })
      expect(200)
      expect(response.body)
      done();
})

//Order update 
test("Order Update",async(done)=>{

  // jest.setTimeout(30000);
     const response = await request(app)
     .post('/driverservice/orderupdate')
      .send({
        OrderId:"2020-21/7/000009",
        DriverId:"5",
        OTP:"436600",
        CustomerId:"16",
        RefCustomerId:""
       
      })
      expect(200)
      expect(response.body)
      done();
})

// Driver Status Update
test("Driver Status update",async(done)=>{

  // jest.setTimeout(30000);
     const response = await request(app)
     .post('/driverservice/driverstatusupdate')
      .send({
        IsOnline:"1",
        DriverId:5
       
      })
      expect(200)
      expect(response.body)
      done();
})
});