'use strict';

const AWS = require('aws-sdk');
const myDocumentClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
  const chosenTicketParams = {
    TableName: 'tickets'
  };
  
  const chosenTickets = await myDocumentClient.scan(chosenTicketParams).promise();

  let promises = []

  chosenTickets.Items.forEach(function (item){
    const params = {
      TableName : 'tickets',
      Key: {
        "ticket": item.ticket
      }
    };

    promises.push(myDocumentClient.delete(params).promise());
  });

  await Promise.all(promises);

  const playersParams = {
    TableName: 'players'
  };
  
  const players = await myDocumentClient.scan(playersParams).promise();

  promises = [];

  players.Items.forEach(function (item){
    const params = {
      TableName : 'players',
      Key: {
        "name": item.name
      }
    };

    promises.push(myDocumentClient.delete(params).promise());
  });

  await Promise.all(promises);

  const boardsParams = {
    TableName: 'boards'
  };
  
  const boards = await myDocumentClient.scan(boardsParams).promise();

  promises = [];

  boards.Items.forEach(function (item){
    const params = {
      TableName : 'boards',
      Key: {
        "ticket": item.ticket,
        "player": item.player
      }
    };

    promises.push(myDocumentClient.delete(params).promise());
  });

  await Promise.all(promises);
    
  const response = {
      statusCode: 200,
      "headers": {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({"result" : "Game reset"})
  };
  return response;
};
