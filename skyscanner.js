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

               /* var segments = [quote.OutboundLeg, quote.InboundLeg].map(function (segment, index) {

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
                });*/
                //console.log(segments);

                return {
                    //segments: segments,
                    price: quote.MinPrice,
                    direct: quote.Direct,
                }
            });
            return toReturn;
        });
    }

   
};
