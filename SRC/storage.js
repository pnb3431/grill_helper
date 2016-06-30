'use strict';

var AWS = require("aws-sdk");


var storage = (function () {
    var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
    
    

    function ItemName(session, data) {
        if (data) {
            this.data = data;
        } else {
            this.data = {
              AppID: "na",
              Description: {
                SSML: "<speak>Something went wrong. Please try again soon.</speak>",
                Text: "Something went wrong. Please try again soon."
              },
              Image: {
                largeURL: "na",
                smallURL: "na"
              },
              InvocationName: "na",
              Publsiher: "unknown",
              
              ItemName: "na"
            };
        }
        this._session = session;
    }

    return {
        loadItemName: function (session, itemSlot, callback) {
/*            if (session.attributes.currentItemName) {
                console.log('get ItemName from session=' + session.attributes.currentItemName);
                //callback(new ItemName(session, session.attributes.currentItemName));
                return;
            }*/

            dynamodb.getItem({
                TableName: 'ItemsAndRecipes',
                Key: {
                    'itemName' : {
                        S: itemSlot 
                    }
               }
            }, function (err, data) {
                var currentItemName;
                if (err) {
                    console.log(err, err.stack);
                    //WTF!
                    currentItemName = new ItemName(session);
                    session.attributes.currentItemName = currentItemName.data;
                    callback(currentItemName);
                    
                } else if (data) {
                    console.log(data);
                    //onsole.log(moment());
                    currentItemName = new ItemName(session, data);
                    console.log("data: " + data);
                    console.log("currentItemName: " + JSON.stringify(currentItemName));
                    callback(data);
                } else {
                    // This should nevere ever happen!!!
                    console.log(data);
                    currentItemName = new ItemName(session);
                    session.attributes.currentItemName = currentItemName.data;
                    callback(currentItemName);
                }
            });
        },
    };
})();
module.exports = storage;