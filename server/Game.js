const Room = require('./Room')

class Game {

    constructor(clientDB) {

        this.clientDB = clientDB;
        this.rooms = new Map();
    }



    findRoom(roomname, callback) {
        let room = this.rooms.get(roomname);
        if (room == undefined) callback([]); else callback([room]);
        /*
        this.clientDB.query(`select * from rooms where roomid = $1;`, [roomname], (err, data) => {
            if (err) console.log(err);
            //console.log(data);
            if (data == undefined) callback([]);
            else
                callback(data.rows);
        });
        */
    }

    messagePlayer(socket, data) {
        
        if (data.messagetype == 'ping') return;
        //console.log(data);
        /*if (data.messagetype == 'query') {

            this.clientDB.query(data.query, (err, data) => {
                if (err) data = err;
                
                let packet = JSON.stringify({ messagetype: 'queryresult', data: data });
                socket.send(packet, { binary: false });
                
            });

            return;
        }
        */
        let room = this.rooms.get(data.roomname);

        if (data.messagetype == 'newroom') {
            this.newRoomCommand(data, socket, room);
            return;
        }


        if (data.messagetype == 'newplayer') {
            this.newPlayerCommand(data, socket, room);
            return;
        }

        if (room == undefined) this.findRoom(data.roomname, (sqldata) => {
            if (sqldata.length == 0) {
                socket.close(1001, 'Room no found'); return;
            } else {
                room = new Room(this.clientDB, data.roomname, data.password, data.numofPlayers, data.playername, false);

                this.rooms.set(data.roomname, room);
                this.doPlayer(room, data, socket);

                return;
            }
        }); else this.doPlayer(room, data, socket);


    }

    doPlayer(room, data, socket) {

        if (data.messagetype == 'chatmessage') {
            //room.addChatMessage(sqlplayer,data.message);
            room.doChat(socket,  data);
            return;
        }

        room.findPlayer(data.playername, (sqlplayerdata) => {

            if (sqlplayerdata.length == 0) {
                socket.close(1001, 'Player ' + data.playername + ' not found in room ' + data.roomname);        return; }


            let sqlplayer = sqlplayerdata[0];

            if (data.messagetype == 'logoutgame') {
                room.logoutgame(sqlplayer);
                return;
            }

            if (data.messagetype == 'startgame') {
                room.startgame(sqlplayer);
                return;
            }

            if (data.messagetype == 'restoreplayer') {
                if (data.guid != sqlplayer.guid) { socket.close(1001, 'Player not found'); return; }
                room.restorePlayer(socket, data);
                return;
            }




            if (data.messagetype == 'playeraction') {
                room.doAction(socket,  data);
                return;
            }



        });
    }

    doAction(room, data) { }

    newRoomCommand(data, socket, room) {
        if (room == undefined) {
            this.findRoom(data.roomname, (sqldata) => {
                if (sqldata.length > 0) {
                    socket.close(1001, 'This room is exist yet'); return;
                } else {
                    room = new Room(this.clientDB, data.roomname, data.password, data.numofPlayers, data.playername, true, 0);
                    //room = new Room(this.clientDB, data.roomname, data.password, data.numofPlayers, data.playername, true, 0);
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
        //console.log(socket._socket.remoteAddress);
        //console.log(socket._socket.address());

        if (room == undefined) this.findRoom(data.roomname, (sqldata) => {
            if (sqldata.length == 0) {
                room = new Room(this.clientDB, data.roomname, data.password, 1, data.playername, true,0);
                room.clearPlayers();
                room.addPlayer(socket, data);
                this.rooms.set(data.roomname, room);
                return;
            }
            let sqldataroom = sqldata[0];
            if (data.password != sqldataroom.password) { socket.close(1001, 'incorrect password'); return; }
            
            room = new Room(this.clientDB, sqldataroom.roomid, data.password, sqldataroom.numofPlayers, null, false, sqldataroom.gamenum);
            room.gamestarted = sqldataroom.gamestarted;
            this.rooms.set(data.roomname, room);
            this.newPlayer(room, data, socket);
            return;
        }); else {
          //  console.log(data);
            if (data.password != room.password) { socket.close(1001, 'incorrect password'); return; }
            //if (room.gamestarted == true) { socket.close(1001, 'Room full'); return; }
            this.newPlayer(room, data, socket);
        }
        //return room;
    }


    checkUpdatesforPlayers() {

        this.rooms.forEach((v, k) => {
            v.updatePlayers();
        });
    }

    newPlayer(room, data, socket) {
        room.findPlayer(data.playername, (sqlplayerdata) => {
            if (sqlplayerdata.length > 0) {
                let sqlplayer = sqlplayerdata[0];
                if (sqlplayer.cookieguid != data.guid && sqlplayer.isonline()) {
                    // only for test  testing
                    socket.close(1001, 'Игрок с этим именем уже в игре'); return;
                }
                room.restorePlayer(socket, data);
                sqlplayer.needupdate = true;
                return;
            } else {
                if (room.gamestarted == true) {
                    room.addSpectator(socket, data);
                   
                    return;
                    //socket.close(1001, 'Room full'); return;
                }
                room.addPlayer(socket, data);
                return;
            }
        });
    }
}

module.exports = Game
