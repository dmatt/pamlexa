/***********
Boilerplate code below for reference
************/

/*

var BASE_URL = 'https://api.forecast.io/forecast/' + process.env.WEATHER_API_KEY + '/38.9649734,-77.0207249', // Using coordinates of Washington DC, replace with your own or a lookup for an Alexa user's address

// Intent #1 - Weather
// checks if a day/date was supplied or not and sends the appropriate response
alexaApp.intent("Weather", {
    "slots": { "WHEN": "AMAZON.DATE" },
    "utterances": [
      "what's the weather for {WHEN}",
      "what I should expect on {WHEN}",
      "tell me the weather",
      "{WHEN}"
    ]
  },
  function(request, response) {
    console.log("In Weather intent");
    // If the requester specified a date/day
    if (request.data.request.intent.slots.WHEN &&
        request.data.request.intent.slots.WHEN.value) {
        // Request the weather - we're using Promises to delay the response until we have data back from forecast.io
        return getWeather(new Date(request.data.request.intent.slots.WHEN.value))
          .then(function (weather) {
            console.log('Responding to weather request for ' + request.data.request.intent.slots.WHEN.value + ' with:', weather);
            response.say(weather);
          })
          .catch(function(err){
            response.say(err);
          });
    } else {
      // If the requester didn't specify a date/day
      console.log('Responding to weather request with no day/date');
      response.say('I can tell you the weather<break time="1s"/> but you must give me a day');
    }
  }
);


// Function #1 - Weather
// Looks up the weather for the date given, using forecast.io
function getWeather(day) {
  return new Promise(function(resolve, reject) {
    if (!day || day.toString() === 'Invalid Date') {
      return reject('Invalid date for weather!');
    }

    request({
      url: BASE_URL,
      json: true
    }, function(err, res, body) {
      var data, text, card,
          simpleDate = day.toISOString().split('T')[0];

      if (err || res.statusCode >= 400) {
        console.error(res.statusCode, err);
        return reject('Unable to get weather data!');
      }

      body.daily.data.forEach(function(dailyData) {
        if ((new Date(dailyData.time * 1000)).toISOString().split('T')[0] === simpleDate) {
          data = dailyData;
        }
      });

      if (!data) {
       return reject('I have no data for that day!');
      }

      text = getWeatherText(data);

      resolve(text);
    });
  });
}

// Function #1 - Weather
// Converts the weather data into an understandable text string
function getWeatherText(data) {
  var conditions;
  
  if (data.precipProbability > 0.7 && data.precipIntensityMax > 0.05) {
    if (data.precipType === 'rain') {
      conditions = 'Don\'t forget your umbrella.';
    } else {
      conditions = 'Brace yourself for the snow.';
    }
  } else if (data.temperatureMax > 93 || data.apparentTemperatureMax > 98) {
    if (data.dewPoint > 72 || data.humidity > 0.75) {
      conditions = 'It\'s going to be nasty.';
  } else {
      conditions = 'Prepare for a scorcher.';
    }
  } else if (data.temperatureMax < 35) {
    if (data.windSpeed > 15) {
      conditions = 'Prepare for bitter cold wind in your face.';
    } else {
      conditions = 'Bitterly cold temperatures are in store for.';
    }
  } else if (data.dewPoint > 72 && data.humidity > 0.75) {
    conditions = 'The humidity is going to be brutal.';
  } else if (data.cloudCover > 0.85) {
    conditions = 'It will be very cloudy.';
  } else if (data.cloudCover < 0.1) {
    if (data.windSpeed > 15) {
      conditions = 'Lots of sun and breezy conditions are in store.';
    } else {
      conditions = 'There will be lots of sunshine.';
    }
  } else if (data.windSpeed > 20) {
    conditions = 'It\'s going to be gusty.';
  } else {
    conditions = data.summary;
  }

  return conditions;
}

*/
