const Room = require('./Room')

class Game {

    constructor(clientDB) {

        this.clientDB = clientDB;
        this.rooms = new Map();
    }


    findRoom(roomname, callback) {

        this.clientDB.query(`select * from rooms where roomid = ${roomname};`, (err, data) => {
            if (err) console.log(err);
            callback(data.rows);
        });
    }

    messagePlayer(socket, data) {

        let room = this.rooms.get(data.roomname);

        if (data.messagetype == 'newroom') {
            this.newRoomCommand(data, socket, room);
            return;

        }

        if (data.messagetype == 'newplayer') {
            this.newPlayerCommand(data, socket, room);
            return;
        }

        if (room == undefined) { socket.close(1001, 'Room no found'); return; }
        room.findPlayer(data.playername, (sqlplayerdata) => {
            if (sqlplayerdata.length == 0) {
                socket.close(1001, 'Player not found'); return;
            }


        });
    }

    newRoomCommand(data, socket, room) {
        if (room == undefined) {
            this.findRoom(data.roomname, (sqldata) => {
                if (sqldata.length > 0) {
                    socket.close(1001, 'This room is exist yet'); return;
                } else {
                    room = new Room(this.clientDB, data.roomname, data.password, data.numofPlayers, data.playername, true);
                    room.clearPlayers();
                    room.addPlayer(socket, data);
                    this.rooms.set(data.roomname, room);
                    return;
                }
            });
        } else {
            socket.close(1001, 'This room is exist yet'); return;
        }
    }

    newPlayerCommand(data, socket, room) {
        this.findRoom(data.roomname, (sqldata) => {
            if (sqldata.length == 0) {
                socket.close(1001, 'This room is not exist yet'); return;
            } else {
                let sqldataroom = sqldata[0];
                if (data.password != sqldataroom.password) { socket.close(1001, 'incorrect password'); return; }
                if (sqldataroom.players >= sqldataroom.numofplayers) { socket.close(1001, 'room full'); return; }

                room = new Room(this.clientDB, sqldataroom.roomid, data.password, sqldataroom.numofPlayers, null, false);
                room.findPlayer(data.playername, (sqlplayerdata) => {
                    if (sqlplayerdata.length > 0) {
                        socket.close(1001, 'This player is in room yet'); return;
                    } else {
                        room.addPlayer(socket, data);
                        return;
                    }


                });
            }
        });
        //return room;
    }
}

module.exports = Game
