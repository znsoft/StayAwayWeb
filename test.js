
const PORT = process.env.PORT || 3000

const express = require('express')
const { Server } = require('ws');
//const { Client } = require('pg');

const INDEX = 'client/client.html';
const clientdb = {};
const Game = require('./server/Game')
const game = new Game(clientdb)
//const wsServer = new Server({ server });
let socket = {_socket:{remoteAddress:"1"}};
socket.close = (a,b)=>{console.log(a+' '+b);}
socket.send = (a,b)=>{console.log(a+' '+b);}
game.newRoomCommand({roomname:"1", password:"1", numofPlayers:0, playername:"1"}, socket, undefined);
console.log(game);
//game.messagePlayer(wsclient, JSON.parse(data));

