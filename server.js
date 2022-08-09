
const PORT = process.env.PORT || 3000
const FRAME_RATE = 200
const CHAT_TAG = 'Stay away'

const express = require('express')
const http = require('http')
const morgan = require('morgan')
const path = require('path')
const { Server } = require('ws');
const { Client } = require('pg');

const INDEX = 'client/client.html';

const server = express()
    .use((req, res) => res.sendFile(INDEX, { root: __dirname }))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));


const clientdb = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});


 clientdb.connect();

clientdb.query('CREATE TABLE rooms (roomid text, playername text, currentplayer text, timestamp date, password text, last_thing text, score text, numofplayers integer, players integer);', (err, data) => {  if (err)  console.log(err);	});
clientdb.query('CREATE TABLE players (roomid text,playerid text, name text, password text, score text, isSpectator boolean, lastmsg integer);', (err, data) => {  if (err)  console.log(err);	});
clientdb.query('CREATE TABLE cards (roomid text,playerid text, name text, id text, isInDeck boolean , isInDrop boolean );', (err, data) => {  if (err)  console.log(err);	});
clientdb.query('CREATE TABLE chat (roomid text,msgid integer, chattext text, playername text, isPrivate boolean );', (err, data) => { if (err) console.log(err); });





const Game = require('./server/Game')
const game = new Game(clientdb)
const wsServer = new Server({ server });

wsServer.on('connection', (wsclient) => {
    wsclient.on('close', () => {
        console.log('close');
    });

    wsclient.on('message', function (data) {
    /* обработчик сообщений от клиента */
        game.messagePlayer(wsclient, data);
    });


    wsclient.send('hello');

});