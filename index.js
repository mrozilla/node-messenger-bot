// =============================================================================
// Import
// =============================================================================

var express = require('express');
var request = require('request');
var bodyParser = require('body-parser');

// =============================================================================
// Server setup
// =============================================================================

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.listen(process.env.PORT || 5000);

// Server index page
app.get('/', function(req, res) {
  res.send('Deployed!');
});

// =============================================================================
// Webhook setup
// =============================================================================

app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === process.env.VERIFICATION_TOKEN) {
    console.log('Verified webhook');
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error('Verification failed. The tokens do not match.');
    res.sendStatus(403);
  }
});

// =============================================================================
// Listen to callbacks for Messenger
// =============================================================================

app.post('/webhook', function(req, res) {
  if (req.body.object == 'page') {
    req.body.entry.forEach(function(entry) {
      entry.messaging.forEach(function(event) {
        if (event.postback) {
          processPostback(event);
        } else if (event.message) {
          processMessage(event);
        }
      });
    });

    res.sendStatus(200);
  }
});

// =============================================================================
// Process postback
// =============================================================================

function processPostback(event) {
  var senderId = event.sender.id;
  var payload = event.postback.payload;

  if (payload === 'Greeting') {
    request(
      {
        url: 'https://graph.facebook.com/v2.6/' + senderId,
        qs: {
          access_token: process.env.PAGE_ACCESS_TOKEN,
          fields: 'first_name',
        },
        method: 'GET',
      },
      async (err, res, body) => {
        if (err) {
          console.log("Error getting user's name: " + err);
        } else {
          await sendMessage(senderId, { text: `Meow 🐈, ${JSON.parse(body).first_name}!` });
          await sendMessage(senderId, { text: "I'm your personal Meowslator! You can send me any text and I'll translate it to meowish 🐈💬" });
        }
      }
    );
  }
}

// =============================================================================
// Process message
// =============================================================================

async function processMessage(event) {
  if (!event.message.is_echo) {
    var message = event.message;
    var senderId = event.sender.id;

    console.log('Received message from senderId: ' + senderId);
    console.log('Message is: ' + JSON.stringify(message));

    // You may get a text or attachment but not both
    if (message.text) {
      await sendMessage(senderId, { text: `"${message.text}" translates to meowish 🐈💬 as:` });
      await sendMessage(senderId, { text: translateToMeowish(message.text) });
    } else if (message.attachments) {
      await sendMessage(senderId, { text: "Sorry, I don't understand your request." });
    }
  }
}

// =============================================================================
// Send message to user
// =============================================================================

function sendMessage(recipientId, message) {
  return new Promise(resolve => {
    resolve(
      request(
        {
          url: 'https://graph.facebook.com/v2.6/me/messages',
          qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
          method: 'POST',
          json: {
            recipient: { id: recipientId },
            message: message,
          },
        },
        (error, response, body) => {
          if (error) {
            console.log('Error sending message: ' + response.error);
          }
        }
      )
    );
  });
}

// =============================================================================
// Translate to meowish
// =============================================================================

function translateToMeowish(str) {
  if (str.length === 0) {
    return 'Meow!';
  }

  const re = /[^\r\n.!?]+(:?(:?\r\n|[\r\n]|[.!?])+|$)/gi;
  const sentenceArray = str.trim().match(re);

  function meowifyWords(str) {
    return str
      .trim()
      .split(' ')
      .map(word => {
        const letters = [['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], ['i', 'k', 'l', 'm', 'n', 'o', 'p', 'q'], ['r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']];
        if (letters[0].some(char => word.charAt(0).toLowerCase().indexOf(char) >= 0)) {
          return 'meow';
        } else if (letters[1].some(char => word.charAt(0).toLowerCase().indexOf(char) >= 0)) {
          return 'miau';
        } else if (letters[2].some(char => word.charAt(0).toLowerCase().indexOf(char) >= 0)) {
          return 'purr';
        } else {
          return word;
        }
      })
      .join(' ');
  }

  return sentenceArray
    .map(sentence => {
      const punctuation = ['.', '?', '!'];
      if (punctuation.some(char => sentence.charAt(sentence.length - 1).indexOf(char) >= 0)) {
        return meowifyWords(sentence) + sentence.charAt(sentence.length - 1);
      } else {
        return meowifyWords(sentence);
      }
    })
    .join(' ');
}
