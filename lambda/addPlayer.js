'use strict';

const AWS = require('aws-sdk');
const myDocumentClient = new AWS.DynamoDB.DocumentClient();
const NUM_TICKETS = 5;
const NUM_PICS = 9;

exports.handler = async (event, context, callback) => {
    const name = event["queryStringParameters"]['name'];
    const playerId = Math.floor(Math.random() * 100000);
    const params = {
        Item : {
            "name" : name,
            "id" : playerId
        },
        TableName : process.env.TABLE_NAME
    };
    
    await myDocumentClient.put(params).promise();
    
    // generate the tickets
    const tickets = new Set();
    
    while (tickets.size < NUM_TICKETS) {
        tickets.add(Math.floor(Math.random() * NUM_PICS) + 1);
    }
    
    const promises = [];
    
    tickets.forEach(function (ticket) {
        const ticketParams = {
        Item : {
            "ticket" : ticket,
            "player" : playerId
        },
        TableName : "boards"
        };
       promises.push(myDocumentClient.put(ticketParams).promise());
    });
    
    await Promise.all(promises);
    
    const response = {
        statusCode: 200,
        "headers": {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({"result" : "Name added"})
    };

    return response;
};
