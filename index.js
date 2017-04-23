'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
var promise = require('bluebird');
var request2 = require('request-promise');
var util = require('util');
var _ = require('lodash');
var skyscanner = require('skyscanner');



const app = express()

app.set('port', (process.env.PORT || 5000))

// Allows us to process the data
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// ROUTES

app.get('/', function(req, res) {
	res.send("Hi I am Emir")
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

function setApiKey (apiKey) {
        this.apiKey = apiKey;
    }
    

function getLocation (searchLocation) {
        var url = util.format(
            'http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/HK/HKD/en-US/?query=%s&apiKey=em572969184221791895504147306480',
            encodeURIComponent(searchLocation));

        return request(url).then(function (body) {
            var data = JSON.parse(body);

            return data.Places.map(function (loc) {
                return { id: loc.PlaceId, name: loc.PlaceName };
            });
        });
    }

function searchCache (fromLocation, toLocation) {
        var url = util.format(
            'http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/HK/HKD/en-US/%s/%s/%s/%s?apiKey=em572969184221791895504147306480',
            encodeURIComponent(fromLocation),
            encodeURIComponent(toLocation),
            encodeURIComponent('anytime'),
            encodeURIComponent('anytime'));

        return request2(url).then(function (body) {
            var data = JSON.parse(body);

            var toReturn = data.Quotes.map(function (quote) {

                var segments = [quote.OutboundLeg, quote.InboundLeg].map(function (segment, index) {

                    var departPlace = _.filter(data.Places, { PlaceId: segment.OriginId })[0];
                    var arrivePlace = _.filter(data.Places, { PlaceId: segment.DestinationId })[0];
                    var carriers = segment.CarrierIds.map(c => _.filter(data.Carriers, { CarrierId: c })[0].Name);

                    return {
                        group: index + 1,
                        departAirport: { code: departPlace.IataCode, name: departPlace.Name },
                        arriveAirport: { code: arrivePlace.IataCode, name: arrivePlace.Name },
                        departCity: { code: departPlace.CityId, name: departPlace.CityName },
                        arriveCity: { code: arrivePlace.CityId, name: arrivePlace.CityName },
                        departTime: segment.DepartureDate,
                        carriers: carriers
                    };
                });

                return {
                    segments: segments,
                    price: quote.MinPrice,
                }
            });

            return toReturn;
        });
    }


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

  if (messageText) {

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case 'generic':
        sendGenericMessage(senderID);
        break;
      case 'emir':
		sendTextMessage(senderID, 'Nasılsın Emir?');
		break;
      default:
        sendTextMessage(senderID, searchCache(messageText,getLocation('antalya')));
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function sendGenericMessage(recipientId, messageText) {
  // To be expanded in later sections
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

