var skyscanner = require('./skyscanner');
var util = require('util');

// This API key is shared in API documentation, you should register your own
skyscanner.setApiKey('em572969184221791895504147306480');

skyscanner.getLocation('herthrow').then(function (data) {
    console.log(data);
});
