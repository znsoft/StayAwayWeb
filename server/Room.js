const Player = require('./Player')

class Room {
    constructor(clientDB, roomname, password, numofPlayers, playername, isNewDBObject, gamenum) {
        this.gamestarted = false;
        this.players = new Map()
        this.clientDB = clientDB;
        this.roomname = roomname;
        this.password = password;
        this.numofPlayers = numofPlayers;
        this.playername = playername;
        this.isNewDBObject = isNewDBObject;
        if (isNewDBObject == true) this.insertRoom();
        this.deckcards = [];
        this.dropcards = [];
        this.cardscount = 0;
        this.gamenum = gamenum;

    }

    insertRoom() {
        //console.trace('INSERT ROOM');
        this.clientDB.query(`INSERT INTO rooms as r (roomid, playername, timestamp , password , gamenum )
                             VALUES ($1, $2, $3, $4,  0)
                                ON CONFLICT (roomid) DO
                                UPDATE SET (playername, timestamp , password ,  gamenum  ) = ( EXCLUDED.playername,  EXCLUDED.timestamp , EXCLUDED.password ,  r.gamenum +1) ;`,
            [this.roomname, this.playername,  new Date(), this.password], (err, data) => {
                if (err) console.log(err);

            });


    }

    CardsByPlayers = {
        UnknownPanic: { num: -2, players: [], firstDeck: false, playDeck: false, isPanic: true },
        UnknownAction: { num: -1, players: [], firstDeck: false, playDeck: false, isPanic: false },
        Thing: { num: 0, players: [], firstDeck: false, playDeck: false, isPanic: false },
        Infect: { num: 1, players: [8, 8, 10, 12, 13, 15, 17, 20, 20], firstDeck: false, playDeck: true, isPanic: false },
        Suspicion: { num: 2, players: [4, 4, 4, 5, 6, 7, 8, 8, 8], firstDeck: true, playDeck: true, isPanic: false },
        Analysis: { num: 3, players: [0, 1, 2, 2, 2, 3, 3, 3, 3], firstDeck: true, playDeck: true, isPanic: false },
        BurnFire: { num: 4, players: [2, 2, 3, 3, 3, 4, 4, 5, 5], firstDeck: true, playDeck: true, isPanic: false },
        FireResist: { num: 5, players: [1, 1, 2, 2, 2, 2, 2, 3, 3], firstDeck: true, playDeck: true, isPanic: false },
        Temptation: { num: 6, players: [2, 2, 3, 4, 5, 5, 6, 7, 7], firstDeck: true, playDeck: true, isPanic: false },
        Perseverance: { num: 7, players: [2, 2, 3, 3, 3, 4, 5, 5, 5], firstDeck: true, playDeck: true, isPanic: false },
        GetOff: { num: 8, players: [2, 2, 2, 3, 3, 4, 4, 5, 5], firstDeck: true, playDeck: true, isPanic: false },
        ChangeDirection: { num: 9, players: [1, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: true, playDeck: true, isPanic: false },
        ChangePlace: { num: 10, players: [2, 2, 2, 3, 3, 4, 4, 5, 5], firstDeck: true, playDeck: true, isPanic: false },
        Whiski: { num: 11, players: [1, 1, 2, 2, 2, 2, 3, 3, 3], firstDeck: true, playDeck: true, isPanic: false },
        Axe: { num: 12, players: [1, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: true, playDeck: true, isPanic: false },

        NoThanks: { num: 13, players: [1, 1, 2, 2, 3, 3, 3, 4, 4], firstDeck: true, playDeck: true, isPanic: false },
        Fear: { num: 14, players: [0, 1, 2, 2, 3, 3, 3, 4, 4], firstDeck: true, playDeck: true, isPanic: false },
        Past: { num: 15, players: [1, 1, 2, 2, 2, 2, 2, 3, 3], firstDeck: true, playDeck: true, isPanic: false },
        StayHere: { num: 16, players: [1, 1, 2, 2, 2, 2, 2, 3, 3], firstDeck: true, playDeck: true, isPanic: false },
        Door: { num: 17, players: [1, 1, 1, 2, 2, 2, 2, 3, 3], firstDeck: true, playDeck: true, isPanic: false },
        Quarantine: { num: 18, players: [0, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: true, playDeck: true, isPanic: false },

        PanicOldRopes: { num: 19, players: [0, 0, 1, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true },
        PanicThreeFour: { num: 20, players: [1, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true },
        PanicUPS: { num: 21, players: [0, 0, 0, 0, 0, 0, 1, 1, 1], firstDeck: false, playDeck: true, isPanic: true },
        PanicConfessionTime: { num: 22, players: [0, 0, 0, 0, 1, 1, 1, 1, 1], firstDeck: false, playDeck: true, isPanic: true },
        PanicBetweenUs: { num: 23, players: [0, 0, 0, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true },
        PanicForgot: { num: 24, players: [1, 1, 1, 1, 1, 1, 1, 1, 1], firstDeck: false, playDeck: true, isPanic: true },
        PanicFriend: { num: 25, players: [0, 0, 0, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true },
        PanicMeet: { num: 26, players: [1, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true },
        PanicChain: { num: 27, players: [1, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true },
        PanicOneTwo: { num: 28, players: [0, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true },
        PanicGoAway: { num: 29, players: [0, 1, 1, 1, 1, 1, 1, 1, 1], firstDeck: false, playDeck: true, isPanic: true },
        PanicParty: { num: 30, players: [0, 1, 1, 1, 1, 2, 2, 2, 2], firstDeck: false, playDeck: true, isPanic: true },


    };


    startgame() {
        if (this.gamestarted == true) return;
        this.clientDB.query(`update rooms set numofplayers = (select count(*) from players as p inner join rooms as r on r.roomid=p.roomid and r.gamenum=p.gamenum  where p.roomid = $1) where roomid = $1`, [this.roomname,], (err, data) => { });

        this.clientDB.query(`delete from cards where roomid IN (SELECT roomid FROM rooms WHERE roomid = $1 and gamestarted = false);`, [this.roomname,], (err, data) => { });
        let last_thing = null;
        this.clientDB.query(`select last_thing from rooms WHERE roomid = $1`, [this.roomname], (err, data) => { if (err) console.log(err); last_thing = data.rows[0].last_thing; });

        let playercards = new Map();
        let m = new Map(Object.entries(this.CardsByPlayers));
        this.getPlayers((a) => {
            let l = a.length;

            //console.log(a);

            if (l < 4) return;
            this.gamestarted = true;

            //this.clientDB.query(`delete from cards where roomid IN (SELECT roomid FROM rooms WHERE roomid = $1 and gamestarted = false);`, [this.roomid,], (err, data) => { });

            a.forEach((v, i) => { playercards.set(v.playerid, []) });
            let thing = a[Math.round(Math.random() * (l - 1))];
            playercards.set(thing.playerid, [0]);
            this.clientDB.query(`update players set thing = true WHERE roomid = $1 and playerid = $2`, [this.roomname, thing.playerid], (err, data) => { if (err) console.log(err); });

            this.clientDB.query(`update rooms as r set currentplayer = r.last_thing WHERE roomid = $1`, [this.roomname], (err, data) => { if (err) console.log(err); });

            this.clientDB.query(`update rooms set last_thing = $1 WHERE roomid = $2`, [thing.playerid, this.roomname], (err, data) => { if (err) console.log(err); });

            let currentPlayer = last_thing;
            if (last_thing == null) {
                currentPlayer = a[Math.round(Math.random() * (l - 1))].playerid;
                this.clientDB.query(`update rooms as r set currentplayer = $2 WHERE roomid = $1`, [this.roomname, currentPlayer], (err, data) => { if (err) console.log(err); });
            }

            this.clientDB.query(`update players set (phase,state) = ($3,$4) WHERE roomid = $1 and playerid = $2`, [this.roomname, currentPlayer, Player.Phases.Action, Player.States.SelectCard], (err, data) => { if (err) console.log(err); });

            let res = [];
            let index = l - 4;
            m.forEach((v, k) => {
                if (v.firstDeck == false) return;
                let numofthiscards = v.players[index];
                for (; numofthiscards > 0; numofthiscards--)res.push(v.num);
            });


            playercards.forEach((v, k) => {
                let l = v.length;
                for (; l < 4; l++) {
                    let r = Math.round(Math.random() * (res.length - 1)); ////console.log(`r:${r} l:${res.length} c:${res[r]}`);
                    v.push(res[r]);
                    res.splice(r, 1);
                }

            });

            playercards.forEach((v, k) => {
                this.insertShuffle(v, k);
            });

            m.forEach((v, k) => {
                if (v.firstDeck == true) return;
                if (v.playDeck == false) return;
                let numofthiscards = v.players[index];
                for (; numofthiscards > 0; numofthiscards--)res.push(v.num);
            });

            this.insertShuffle(res);

            this.clientDB.query(`update cards set (isInDeck, place , playerid ) =(  false ,4, $2) WHERE roomid = $1 and isInDeck = true and place in (select max(place) from cards where  roomid = $1 and isInDeck = true); `, [this.roomname, currentPlayer], (err, data) => { });

            this.clientDB.query('update rooms set gamestarted = true where roomid = $1; ', [this.roomname], (err, data) => { if (err) console.trace(err); });
            this.needUpdateForAll();


        });

    }

    needUpdateForAll() {
        this.clientDB.query(`update players set needupdate = true where roomid = $1;`, [this.roomname], (err, data) => { if (err) console.trace(err); });
    }

    needUpdateForPlayer(playername) {
        this.clientDB.query(`update players set needupdate = true where roomid = $1 and playerid=$2;`, [this.roomname, playername], (err, data) => { if (err) console.trace(err); });
    }

    insertShuffle(res, playername = null) {
        let len = res.length - 1;

        for (; len >= 0; len--) {

            let r = Math.round(Math.random() * (res.length - 1));
            this.clientDB.query(`insert into cards (roomid , cardid , isInDeck, place , playerid ) values(  $1 ,$2, $3, $4, $5 ); `, [this.roomname, res[r], playername == null, len, playername], (err, data) => { if (err) console.trace(err); });
            res.splice(r, 1);

        }
    }

    getPlayers(callback) {

        this.clientDB.query(`select * from players where roomid = $1 and gamenum = $2;`,
            [this.roomname, this.gamenum], (err, data) => {
                if (err) console.log(err);
                if (data == undefined)
                    callback([]);
                else
                    callback(data.rows);
            });
    }

    updatePlayers() {
        this.getDeckAndDrop((deckData) => {
            this.players.forEach((v, k) => {
                v.update(deckData);
            });
        });
    }

    findPlayer(playername, callback) {
        let player = this.players.get(playername);
        if (player != undefined) {
            callback([player]);
            return;
        }
        this.clientDB.query(`select * from players where roomid = $1 and playerid = $2 and gamenum = $3;`,
            [this.roomname, playername, this.gamenum], (err, data) => {
                if (err) console.log(err);
                if (data == undefined)
                    callback([]);
                else
                    callback(data.rows);
            });
    }

    clearPlayers() {

    }

    addPlayer(socket, playerdata) {
        let player = new Player(this.clientDB, socket, this.roomname, playerdata.playername, playerdata.playername, this, this.gamenum, 0);
        this.players.set(playerdata.playername, player);
        player.sendGUIDToPlayer();
        player.insertPlayer();
        //this.needUpdateForPlayer(playerdata.playername);
        //player.sendplayers(undefined);
        return player.guid;
    }

    restorePlayer(socket, playerdata) {
        let player = new Player(this.clientDB, socket, this.roomname, playerdata.playername, playerdata.playername, this, this.gamenum, playerdata.quarantineCount, playerdata.Infected);
        player.guid = playerdata.guid;
        this.players.set(playerdata.playername, player);
        player.sendGUIDToPlayer();
        player.insertPlayer();
        //this.needUpdateForPlayer(playerdata.playername);
        //player.sendplayers(undefined);
        return player.guid;
    }

    sendplayers() {


    }


    findCardByNum(num) {

        let m = new Map(Object.entries(this.CardsByPlayers));
        for (i in m)
            if (m[i].num == num) return m[i];
        return this.CardsByPlayers.UnknownAction;
    }

    getDeckAndDrop(callback) {
        this.clientDB.query(`select cm.roomid as room,sum(case when cm.isInDeck=true then 1 else 0 end) as deck, sum(case when cm.isInDrop=true then 1 else 0 end) as drop , ca.cardid  as card , r.direction as direction
                                from cards as cm
                                    inner join cards as ca 
                                        on cm.roomid = ca.roomid and ca.place=0
                                        inner join rooms as r
                                            on cm.roomid = r.roomid and r.gamestarted = true
                                                where cm.roomid =$1 and ca.isInDeck = true group by room, card, direction; `, [this.roomname], (err, data) => {
            if (err) console.trace(err);
            if (data == undefined || data.rows == undefined) return callback(undefined);
            let row = data.rows[0];
            //console.log(data.rows);
            if (row == undefined) return callback(undefined);
            let card = this.findCardByNum(row.card);
            let deck = { deckCount: row.deck, dropCount: row.drop, card: card.isPanic ? this.CardsByPlayers.UnknownPanic.num : this.CardsByPlayers.UnknownAction.num, isGameStarted: true, direction:row.direction };
            //console.log(deck);
            callback(deck);
        });
    }



    doAction(socket, data) {
        let player = this.players.get(data.playername);
        if (player == undefined) { socket.close(1001, 'Player not found'); return; }
        //console.log(player[data.action]);
        if (data.action == undefined) return;

        player[data.action](data);

    }

}

module.exports = Room
