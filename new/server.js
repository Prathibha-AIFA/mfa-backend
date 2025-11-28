const axios = require("axios");
 
const URL = "http://localhost:4000/auth/login-otp";
 
const headers = {

  "Content-Type": "application/json",

  "Origin": "http://localhost:5173",

  "Referer": "http://localhost:5173/",

};
 
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
 
async function limitedOtpTest() {

  const email = "test7@example.com";
 
  for (let otp = 111111; otp <= 999999; otp++) {  

    try {

      console.log(`Testing OTP: ${otp}`);
 
      const res = await axios.post(

        URL,

        { email, otp: otp.toString() },

        { headers }

      );
 
      console.log("Status:", res.status);

      console.log("Response:", res.data);
 
    } catch (error) {

      if (error.response) {

        console.log("Status:", error.response.status);

        console.log("Response:", error.response.data);

      }

    }
 

  }

}
 
limitedOtpTest();

 