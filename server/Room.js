const Player = require('./Player')

class Room {
    constructor(clientDB, roomname, password, numofPlayers, playername, isNewDBObject) {
        //this.clients = new Map()
        this.players = new Map()
        this.clientDB = clientDB;
        this.roomname = roomname;
        this.password = password;
        this.numofPlayers = numofPlayers;
        this.playername = playername;
        this.isNewDBObject = isNewDBObject;

    }



    findPlayer(playername, callback) {

        this.clientDB.query(`select * from players where roomid = ${this.roomname} and playerid = ${playername};`, (err, data) => {
            if (err) console.log(err);
            callback(data.rows);
        });
    }

    clearPlayers() {

    }

    addPlayer(socket, playerdata) {
        let player = new Player(this.clientDB, socket, playerdata.playername, playerdata.playername);
        this.players.set(playerdata.playername, player);

    }

}

module.exports = Room
