'use strict';

const AWS = require('aws-sdk');
const myDocumentClient = new AWS.DynamoDB.DocumentClient();
const NUM_PICS = 9;

exports.handler = async (event, context, callback) => {
    
    // first get existing list of tickets
  const chosenTicketParams = {
    TableName: 'tickets'
  };
  
  const chosenTickets = await myDocumentClient.scan(chosenTicketParams).promise();
  
  // make array of IDs
  const chosenTicketIDs = []

  chosenTickets.Items.forEach(function (item){
    chosenTicketIDs.push(item.ticket);
  });

  // generate new ticket
  let candidate = Math.floor(Math.random() * NUM_PICS) + 1;
  let sanity = 0;

  while (chosenTicketIDs.includes(candidate) && sanity < 1000) {
    candidate = Math.floor(Math.random() * NUM_PICS) + 1;
    sanity++;
  }

  // store the ticket
  const params = {
    Item : {
        "ticket" : candidate,
        "chosenOrder" : chosenTicketIDs.length + 1
    },
    TableName : "tickets"
  };

  await myDocumentClient.put(params).promise();
  
  const response = {
      statusCode: 200,
      "headers": {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({"ticket" : candidate})
  };
  return response;
};