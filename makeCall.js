// Download the helper library from https://www.twilio.com/docs/libraries/node
// Your Account Sid and Auth Token from twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

client.calls
  .create({
     twiml: '<Response><Say>Hello from Twilio!</Say></Response>',
     to: '+447367181532', // Your destination number
     from: '+447588718639' // Your Twilio phone number
   })
  .then(call => console.log(call.sid))
  .catch(err => console.error(err)); // Added error handling
