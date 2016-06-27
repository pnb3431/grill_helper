/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at

        http://aws.amazon.com/apache2.0/

    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/



'use strict';

var AlexaSkill = require('./AlexaSkill'),
    
    storage = require('./storage');



var APP_ID = undefined; //OPTIONAL: replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

var HowTo = function () {
    AlexaSkill.call(this, APP_ID);
};
var express = require('express');
var request = require('request');



var app = express();

var GA_TRACKING_ID = 'UA-78535764-2';

function trackEvent(category, action, label, value, cb) {
  var data = {
    v: '1', // API Version.
    tid: GA_TRACKING_ID, // Tracking ID / Property ID.
    // Anonymous Client Identifier. Ideally, this should be a UUID that
    // is associated with particular user, device, or browser instance.
    cid: '555',
    t: 'event', // Event hit type.
    ec: category, // Event category.
    ea: action, // Event action.
    el: label, // Event label.
    ev: value, // Event value.
  };

  request.post(
    'http://www.google-analytics.com/collect', {
      form: data
    },
    function(err, response) {
      if (err) { return cb(err); }
      if (response.statusCode !== 200) {
        return cb(new Error('Tracking failed'));
      }
      cb();
    }
  );
}



// Extend AlexaSkill
HowTo.prototype = Object.create(AlexaSkill.prototype);
HowTo.prototype.constructor = HowTo;

HowTo.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechText = "Welcome to the Grilling Guide. You can ask a question like, How do I grill chicken breast? ... Now, what can I help you with.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "For instructions on what you can say, please say help me.";
    response.ask(speechText, repromptText);
};

HowTo.prototype.intentHandlers = {
    "RecipeIntent": function (intent, session, response) {
        var itemSlot = intent.slots.Item,
            itemName;
        if (itemSlot && itemSlot.value){
            itemName = itemSlot.value.toLowerCase();
        }
        console.log("itemName: "  + itemName)
        var cardTitle = "Instructions to Grill " + itemName,
            speechOutput,
            repromptOutput;
        
        session.attributes.currentItemName = itemName.recipe;
        storage.loadItemName(session, itemName, function(recipe) {
        
        if (itemSlot == itemName) {
            speechOutput = {
                speech: recipe.Item.recipe.S,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.tellWithCard(speechOutput, cardTitle, recipe.Item.recipe.S);
        } else {
            var speech;
            if (itemName) {
                speech = "I'm sorry, I currently do not know how to grill " + itemName + ". What else can I help with?";
            } else {
                speech = "I'm sorry, I currently do not know how to grill that. What else can I help with?";
            }
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            repromptOutput = {
                speech: "What else can I help you grill?",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.ask(speechOutput, repromptOutput);
        }
        });
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "You can ask questions such as, How do I grill chicken breast or, you can say exit... Now, what can I help you with?";
        var repromptText = "You can say things like, How do I grill chicken breast, or you can say exit... Now, what can I help you with?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    },
    
    "AMAZON.NoIntent": function (intent, session, response) {
    trackEvent(
      'Intent',
      'AMAZON.NoIntent',
      'na',
      '100', // Event value must be numeric.
      function(err) {
        if (err) { 
            return next(err); 
        }
        var speechOutput = "Okay.";
        response.tell(speechOutput);
      });
    }
    
};

exports.handler = function (event, context) {
    var howTo = new HowTo();
    howTo.execute(event, context);
};


