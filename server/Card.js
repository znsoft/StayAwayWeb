
class Card {


    constructor(clientDB, socket, roomid, playername, playerCaption, room, quarantineCount = 0, Infected = false) {
        this.clientDB = clientDB;
        this.socket = socket;
        this.playername = playername;
        this.playerCaption = playerCaption;
        this.roomid = roomid;
        this.guid = this.generateGUID();
        this.room = room;
        this.quarantineCount = quarantineCount;
        this.Infected = Infected;
    }


}

module.exports = Card
