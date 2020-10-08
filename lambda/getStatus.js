'use strict';

// returns a list of tickets for the player and whether they have matched or not

const AWS = require('aws-sdk');
const myDocumentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    const teamName = event["queryStringParameters"]['name'];
    
    // get the player ID
    const params = {
        Key: {
         "name": teamName
        }, 
        TableName: "players"
    };
    
    const result = await myDocumentClient.get(params).promise();
    const id = result.Item.id;
    
    // get the tickets for that player
    const ticketParams = {
        TableName: 'boards',
        IndexName : 'boards_tickets',
        KeyConditionExpression: 'player = :rangeKey',
        ExpressionAttributeValues: {
          ':rangeKey': id
        }
    };
    
    const tickets = await myDocumentClient.query(ticketParams).promise();
    
    // get the tickets so far
    const chosenTicketParams = {
        TableName: 'tickets'
    };
    
    const chosenTickets = await myDocumentClient.scan(chosenTicketParams).promise();
    
    const ticketsList = [];
    const chosenTicketsList = [];
    
    tickets.Items.forEach(function (item) {
        ticketsList.push(item.ticket);
    });

    let mostRecentTicket = 0;
    
    chosenTickets.Items.forEach(function (item) {
        chosenTicketsList.push(item.ticket);

        if (item.chosenOrder === chosenTickets.Items.length) {
          mostRecentTicket = item.ticket;
        }
    });

    const ticketsJSON = [];
    
    ticketsList.forEach(function (ticket) {
        ticketsJSON.push(
            {
                "ticket": ticket,
                "matched": chosenTicketsList.includes(ticket)
            }
        );
    });
    
    const responseBody = {
        "tickets" : ticketsJSON,
        "latest" : mostRecentTicket
    };
    
    console.log(responseBody);
    
    const response = {
        statusCode: 200,
        body: JSON.stringify(responseBody)
    };
    return response;
    
};
