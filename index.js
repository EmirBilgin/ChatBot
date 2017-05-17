'use strict'

var skyscanner = require('./skyscanner');
const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')


// all comment in below test for searchCache fligts

/*skyscanner.setApiKey('em572969184221791895504147306480');

		var str   ="istanbul trabzon 2017-06-10 2017-07-10";
		var stringArray = str.split(/(\s+)/);
		
		skyscanner.getLocation(stringArray[0]).then(function (data1){
	skyscanner.getLocation(stringArray[2]).then(function (data2){
		if(stringArray.length<7){
		skyscanner.searchCache(data1,data2, stringArray[4],"" ).then(function (data) {
			console.log(data);
   			
});}
		else{
		skyscanner.searchCache(data1,data2, stringArray[4],stringArray[6] ).then(function (data) {
			console.log(data);
   			
});}

});		   
});*/



const app = express()

app.set('port', (process.env.PORT || 5000))

// Allows us to process the data
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// ROUTES

app.get('/', function(req, res) {
	res.send("Hi I am Emir2")
})

let token = "EAAXM1gXZAdsQBAPNY26IfgdQEjCZCStVSvNfv1drZCZAVaqVsZC8rELsQHOalwFj6PAbWkFrG4Cn5xvfnEm1tkPhunMNozDE70gfnwuYqGCFG1pptKKRZCkiVeH2vNG1NVZAcWxQSZB5IoyXpRPTavNisddP3RUuDDBXJZCrXaq4HjQZDZD"

// Facebook 


app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === 'emir3941.') {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});



app.post('/webhook', function (req, res) {

  var data = req.body;
	
  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});



function receivedMessage(event) {
  

  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
  	senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;
	
  var departure;
  var arrival;	
  var date;
	
  if (messageText) {


    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'Get Started':
        sendTextMessage(senderID,"Welcome Best Price Chatbot! Please search flights with this pattern (Ex:izmir istanbul 2017-06-15 2017-06-30) You don't have to add return date if you want.");
        break;
      default:
		var str   =messageText;
		var stringArray = str.split(/(\s+)/);
		
		skyscanner.setApiKey('em572969184221791895504147306480');
		skyscanner.getLocation(stringArray[0]).then(function (data1){ //taking location id for searcCache function
	skyscanner.getLocation(stringArray[2]).then(function (data2){

		if(stringArray.length<7){ // if there isn't any return date search without return date
		skyscanner.searchCache(data1,data2, stringArray[4],"" ).then(function (data) {
			sendTextMessage(senderID,("From "+stringArray[0]+" to "+stringArray[2]+" in date "+stringArray[4]+" you can fly with "+data));

   			
});}
		else{ // else there is any return date search with return date
		skyscanner.searchCache(data1,data2, stringArray[4],stringArray[6] ).then(function (data) {
			sendTextMessage(senderID,("From "+stringArray[0]+" to "+stringArray[2]+" in date "+stringArray[4]+" you can fly with "+data));

   			
});}
});		   
});
    
   break;
        
    }
  } 

}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

app.listen(app.get('port'), function() {
	console.log("running: port")
})


