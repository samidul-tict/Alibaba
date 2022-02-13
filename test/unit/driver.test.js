var request = require('supertest')
  , app = require('../../app');
  
//LOGIN

describe('Unit Test Report', () => {
test("Driver Should Sign In With Vaild Details",async(done)=>{

  // jest.setTimeout(30000);
  const user = {
        DriverId: 5,
        Name: 'Rishi Mishra',
        Phone: '8759093170',
        Email: 'rishi@r.com',
        Address: 'kolkata sjdhdjdksj',
        Landmark: 'kolkata',
        Pincode: '700102',
        ProfileImage: '821918.png',
        DeviceKey: 'bsdhhjbhjsfhhvshgvhgs',
        Password: '12345',
        IsActive: '1',
        CreatedOn: '2020-07-13 15:55:24',
        CreatedBy: 1,
        ModifiedOn: '2020-08-11 14:41:23',
        ModifiedBy: 1,
        IsOnline: '1',
        OTP: '037082',
        OTPGeneratedOn: '2020-08-11 14:41:23'
  }
     const response = await request(app)
     .post('/driverservice/login')
      .send({
        phnumber:"8759093170",
        devicekey:"bsdhhjbhjsfhhvshgvhgs"
      })
      expect(200)
      expect(response.body)expect
      done();
})

//Driver Validate
