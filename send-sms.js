require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
console.log(accountSid);
const client = require('twilio')(accountSid, authToken);
client.messages
  .create({
    body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
    from: '+19712323085',
    to: '+15037548519',
  })
  .then((message) => console.log(message.sid));
