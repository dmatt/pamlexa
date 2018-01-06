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
  response.say('Hi there, I\'m Pam, ask me to read your replies.');
});

// Intent #2 - Replies
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
      // If the requester didn't specify a username
      console.log('Responding to replies request with no username');
      response.say('I can give you some comment replies<break time="500ms"/> but I need to know your Discuss username first!');
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
    
    // variable set for now until alexa + disqus oauth stuff is set up
    username = "iamfrancisyo"
    
    
    // GET timelines/activities
    // count # of unread reply notifications
    // map object of replies to speech output
    // speak the first most recent reply
    // use Alexa dialog model to read multiple replies (ask user if they want to hear more)
    
    var data,
        text,
        card,
        replySpeechData,
        unreadObjects = [],
        simpleUsername = username /* day.toISOString().split('T')[0];*/

    disqus.request('timelines/activities', { type : 'notifications', index : 'replies', routingVersion : 12, limit : 10  }, function(data) {
      if (data.error || data.statusCode >= 400 || !data) {
        console.error('Something went wrong... 🙈', data.error);
        return reject('Something went wrong with getting Discuss data!');
      } else {
        data = JSON.parse(data);
      }
      
      function getUnreadObjects(item) {
        console.log("⎏",item.items["0"].type);
        console.log("unread",item.items["0"].isUnread);
        if (item.items["0"].type === "RegisteredUserSubmitPost" && item.items["0"].isUnread) {
          unreadObjects.push(item.items["0"].object);
        }
      }
      
      console.log(unreadObjects)
      
      data.response.activities.forEach(getUnreadObjects);
      
      console.log(unreadObjects)
      
      // Check if there are unread notifications, return the activity or object key
      // if no unread notification resolve with OkBye text condition in getRepliesText()
      
      // With the correct key, populate replySpeechData object with correct info
      
      replySpeechData = {
        username: simpleUsername,
        replyUsername: data.response.objects[unreadObjects[0]].author.username,
        replyComment: data.response.objects[unreadObjects[0]].raw_message,
        replyDate: "Sunday at 4:30pm",
        replyVoteCount: "2 upvotes and 1 downvote",
        // Actual data from request with fixture object key, yay
        replyThreadTitle: data.response.objects[data.response.objects[unreadObjects[0]].thread].clean_title
      };
      
      console.log("🙌",replySpeechData);
      
      // fixtures for testing getRepliesText()
      data = {
        username: simpleUsername,
        replyComment: "quite interesting",
        replyDate: "Sunday at 4:30pm",
        replyVoteCount: "2 upvotes and 1 downvote",
        replyThreadTitle: "10 facts you wont believe about cats."
      };
      
      text = getRepliesText(replySpeechData);

      resolve(text);
    });
  });
}

// Function #2 - Replies
// Converts the Disqus replies data into an understandable text string
function getRepliesText(data) {
  // set a variale that we'll change based on what is inside data,
  // for example if contains special characters strip, if an image say so.
  // If the comment is too long, truncate.
  var reply, conditions;
  
  reply = "On the article, " + "\"" + data.replyThreadTitle + "\"" +
    ", "+data.replyUsername+" replied to you: " + "\"<prosody pitch='low'>" + data.replyComment + "</prosody>\"";

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

