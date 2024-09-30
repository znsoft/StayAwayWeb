
const PORT = process.env.PORT || 8000

const express = require('express')
const { Server } = require('ws');
//const { Client } = require('pg');

const INDEX = 'client/client.html';

const server = express()
    .use(express.static('client'))
    .use("/",(req, res) => res.sendFile(INDEX, { root: __dirname }))
    .listen(PORT, () => console.log(`Listening on ${PORT}`));


const clientdb = {};/*new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});


clientdb.connect();

clientdb.query('CREATE TABLE IF NOT EXISTS rooms (roomid text PRIMARY KEY, playername text, currentplayer text, nextplayer int, timestamp date, password text, last_thing text, score text, numofplayers integer, players integer, direction boolean NOT NULL DEFAULT true, gamestarted boolean NOT NULL DEFAULT false, gamenum int );', (err, data) => { if (err) console.log('rooms');});
clientdb.query('CREATE TABLE IF NOT EXISTS players (roomid text,playerid text, name text, password text, score text, isSpectator boolean, lastmsg integer, lastseen date, guid text NOT NULL , quarantineCount int, place int, Infected boolean NOT NULL DEFAULT false, thing boolean NOT NULL DEFAULT false, gamenum int, state int NOT NULL DEFAULT 0, phase int NOT NULL DEFAULT 0, needupdate boolean NOT NULL DEFAULT false, CONSTRAINT roomplayer PRIMARY KEY(roomid,playerid) );', (err, data) => { if (err) console.log('players');});
clientdb.query('CREATE TABLE IF NOT EXISTS cards (roomid text,playerid text, name text, cardid int, isInDeck boolean NOT NULL DEFAULT false, isInDrop boolean NOT NULL DEFAULT false,nextplayer int, isShowDoor boolean NOT NULL DEFAULT false, place int );', (err, data) => { if (err) console.log('cards');	});
clientdb.query('CREATE TABLE IF NOT EXISTS chat (roomid text,msgid integer, chattext text, playername text, isPrivate boolean );', (err, data) => { if (err) console.log('chat'); });
*/

const Game = require('./server/Game')
const game = new Game(clientdb)
const wsServer = new Server({ server });

wsServer.on('connection', (wsclient) => {
   

    wsclient.mysend = function (message) {

        if (wsclient.OPEN == wsclient.readyState) {
            wsclient.send(message); return;
        }
    }
    wsclient.senddata = function (data) {
        try {
            let message = JSON.stringify(data).toString();
            wsclient.mysend(message);
        } catch (e) { console.log(e)}
    }
    wsclient.on('close', () => {
        //console.log('close');
    });
    
    wsclient.on('message', function (data, isBinary) {
        try {
            //console.log(wsclient._socket.remoteAddress);
            game.messagePlayer(wsclient, JSON.parse(data));
        } catch (e) { console.log(e) }
    });

});

/**
 * Server side game loop, runs sends out update packets to all
 * clients every update.
 */
setInterval(() => {
    game.checkUpdatesforPlayers();
}, 1500)
