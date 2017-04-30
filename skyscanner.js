var promise = require('bluebird');
var request = require('request-promise');
var util = require('util');
var _ = require('lodash');

module.exports = {

    setApiKey: function (apiKey) {
        this.apiKey = apiKey;
    },

    getLocation: function (searchLocation) {
        var url = util.format(
            'http://partners.api.skyscanner.net/apiservices/autosuggest/v1.0/TR/TRY/tr-TR/?query=%s&apiKey=%s',
            encodeURIComponent(searchLocation),
            this.apiKey);

        return request(url).then(function (body) {
            var data = JSON.parse(body);

            return data.Places[0].PlaceId
        });
    },

    searchCache: function (fromLocation, toLocation, fromDate, toDate) {
        var url = util.format(
            'http://partners.api.skyscanner.net/apiservices/browsequotes/v1.0/TR/TRY/tr-TR/%s/%s/%s/%s?apiKey=%s',
            encodeURIComponent(fromLocation),
            encodeURIComponent(toLocation),
            encodeURIComponent(fromDate),
            encodeURIComponent(toDate),
            this.apiKey);

        return request(url).then(function (body) {
            var data = JSON.parse(body);

            var toReturn = data.Quotes.map(function (quote) {          

                return {
                    
                    price: quote.MinPrice,
                    direct: quote.Direct,
                }
            });
            var x = data.Carriers.map(function (carrier) {
				return {
                    
                    carrier_name: carrier.Name,
                    
                }
            });
           
            return JSON.stringify(x)+" and the cheapest prices are: "+JSON.stringify(toReturn);
        });
    }

   
};
