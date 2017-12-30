var express = require("express"),
    alexa = require("alexa-app"),
    request = require("request"),
    PORT = process.env.PORT || 3000,
    app = express(),
    DISQUS_BASE_URL = "https://disqus.com/api/3.0/",
    // Setup the alexa app and attach it to express before anything else.
    alexaApp = new alexa.app(""),
    Disqus = require('disqus');

var disqus = new Disqus({
    api_secret : process.env.DISQUS_API_SECRET,
    api_key : process.env.DISQUS_API_KEY,
    access_token : process.env.DISQUS_ACCESS_TOKEN  // Optional
});

// POST calls to / in express will be handled by the app.request() function
alexaApp.express({
  expressApp: app,
  checkCert: true,
  // sets up a GET route when set to true. This is handy for testing in
  // development, but not recommended for production.
  debug: true
});

app.set("view engine", "ejs");

alexaApp.launch(function(request, response) {
  console.log("App launched");
  response.say('I can give you some comment replies<break time="500ms"/> but first, log into the app and sign in with Discuss');
});

// Intent #2 - Replies
//Checks if a username was supplied or not and sends the appropriate response
alexaApp.intent("Replies", {
    "slots": { "USERNAME": "LIST_OF_USERNAMES" },
    "utterances": [
      "to test discuss now",
      "test with {USERNAME}",
      "read the replies",
      "read my replies",
      "read my recent replies",
      "tell me my replies",
      "tell me my recent replies",
      "read the replies to {USERNAME}",
      "what are my recent replies",
      "do I have any replies",
      "do I have any recent replies",
    ]
  },
  function(request, response) {
    console.log("In Replies intent");
    // If the requester specified a date/day
    if (true /* request.data.request.intent.slots.USERNAME &&
        request.data.request.intent.slots.USERNAME.value */) {
        // Request the replies from Disqus - we're using Promises to delay the response until we have data back from Disqus API
        return getReplies(request.data.request.intent.slots.USERNAME.value)
          .then(function (replies) {
            console.log('Responding to replies request for ' + request.data.request.intent.slots.USERNAME.value + ' with:', replies);
            response.say(replies);
          })
          .catch(function(err){
            response.say(err);
          });
    } else {
      // If the requester didn't specify a date/day
      console.log('Responding to replies request with no username');
      response.say('I can give you some comment replies<break time="500ms"/> but I need to know your Discuss username!');
    }
  }
);

// Function #2 - Replies
// Looks up recent replies for the username provided, using Disqus API
function getReplies(username) {
  return new Promise(function(resolve, reject) {
    //if (!username /*|| username.toString() === 'Invalid Date'*/) {
      //return reject('Invalid usernames for Discuss replies!');
    //}
    
    // fixture
    username = "iamfrancisyo"
    
    // Notes
    // Method for building replies information:
    // check if alexa ID exists
    // get disqus username from user via alexa input or get existing username if it exists
    // store username + alexa ID to simple database
    // GET /users/listActivity/ + include: replies (disqus api)
      // could maybe use timelines/activities if I can figure out how to use that
    // map object of replies + article titles + reply author display name -> object used for speech output
    // speak the most recent replies
    // ask user if they want to hear more
    
    disqus.request('users/listActivity', { user : 'username:'+username }, function(data) {
      if (data.error || data.statusCode >= 400) {
        console.error('Something went wrong...', data.error);
      } else {
        console.log(data);
      }
    });

    request({
      url: DISQUS_BASE_URL+"/users/listActivity.json"+"?user=username:iamfrancisyo&api_key="+process.env.DISQUS_API_KEY,
      json: true
    }, function(err, res, body) {
      var data, text, card,
          simpleUsername = username /* day.toISOString().split('T')[0];*/

      if (err || res.statusCode >= 400) {
        console.error(res.statusCode, err);
        console.log(DISQUS_BASE_URL+"users/listActivity.json"+"?user=username:iamfrancisyo&api_key="+process.env.DISQUS_API_KEY)
        return reject('Unable to get Disqus data!');
      }

      console.log("🍔", body);
      
      // fixtures
      data = {
        username: simpleUsername,
        replyComment: "quite interesting",
        replyDate: "Sunday at 4:30pm",
        replyVoteCount: "2 upvotes and 1 downvote",
        replyThreadTitle: "10 facts you wont believe about cats."
      };

      if (!data) {
       return reject('I have no data for that username!');
      }

      text = getRepliesText(data);

      resolve(text);
    });
  });
}

// Function #2 - Replies
// Converts the Disqus replies data into an understandable text string
function getRepliesText(data) {
  // set a variale that we'll change based on what is inside data, for example if contains special characters strip, if an image say so.
  var reply, conditions;
  
  reply = "On the article " + "<prosody rate='fast'>" + data.replyThreadTitle + "</prosody>" +
    ", PepBoy replied to you: " + "\"" + data.replyComment + "\"";

  return reply;
}

// Native intents
alexaApp.intent("AMAZON.CancelIntent", {
    "slots": {},
    "utterances": []
  }, function(request, response) {
    console.log("Sent cancel response");
  	response.say("Ok, sure thing");
  	return;
  }
);

alexaApp.intent("AMAZON.StopIntent", {
    "slots": {},
    "utterances": []
  }, function(request, response) {
    console.log("Sent stop response");
  	response.say("Alright, I'll stop");
  	return;
  }
);

alexaApp.sessionEnded(function(request, response) {
  console.log("In sessionEnded");
  console.error('Alexa ended the session due to an error');
  // no response required
});

app.listen(PORT, () => console.log("Listening on port " + PORT + "."));

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