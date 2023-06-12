const Player = require('./Player')
const Card = require('./Card')

class Room {
    constructor(clientDB, roomname, password, numofPlayers, playername, isNewDBObject, gamenum) {
        this.gamestarted = false;
        this.players = new Map(); //key == playername , 
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
        this.direction = 0;
        this.nextplayer = null;
        this.currentPlayer = null;
        this.additionalData = undefined;
    }

    get currentplayer() {

        return this.currentPlayer;

    }

    set currentplayer(v) {
        this.currentPlayer = v;

        this.calcNextPlayer();

    }

    insertRoom() {
        //console.trace('INSERT ROOM');
        /*
        this.clientDB.query(`INSERT INTO rooms as r (roomid, playername, timestamp , password , gamenum )
                             VALUES ($1, $2, $3, $4,  0)
                                ON CONFLICT (roomid) DO
                                UPDATE SET (playername, timestamp , password ,  gamenum  ) = ( EXCLUDED.playername,  EXCLUDED.timestamp , EXCLUDED.password ,  r.gamenum +1) ;`,
            [this.roomname, this.playername,  new Date(), this.password], (err, data) => {
                if (err) console.log(err);

            });
*/

    }




    calcNextPlayer() {
        let l = this.players.size;
        let place = this.currentplayer.place;
        let nextplace = (place + 1) % l;
        if (this.direction != 0) nextplace = place < 1 ? (l - 1) : (place - 1);
        this.getPlayers((a) => {
            a.forEach((v, i) => {
                if (v.place == nextplace) this.nextplayer = v;
            });
        });

    }


    startgame(player) {
        if (this.gamestarted == true) return;
        this.numofplayers = this.players.size;//.length;       // this.clientDB.query(`update rooms set numofplayers = (select count(*) from players as p inner join rooms as r on r.roomid=p.roomid and r.gamenum=p.gamenum  where p.roomid = $1) where roomid = $1`, [this.roomname,], (err, data) => { });
        player.readyforstart = true;
        if (this.numofplayers < 4) return;
        // this.clientDB.query(`delete from cards where roomid IN (SELECT roomid FROM rooms WHERE roomid = $1 and gamestarted = false);`, [this.roomname,], (err, data) => { });
        let last_thing = null;
        //this.clientDB.query(`select last_thing from rooms WHERE roomid = $1`, [this.roomname], (err, data) => { if (err) console.log(err); last_thing = data.rows[0].last_thing; });

        let playercards = new Map();
        //console.log(Card);
        let m = (new Card()).getCardTypes();
        this.getPlayers((a) => {
            let l = a.length;

            //console.log(a);

            

            this.gamestarted = true;

            //this.clientDB.query(`delete from cards where roomid IN (SELECT roomid FROM rooms WHERE roomid = $1 and gamestarted = false);`, [this.roomid,], (err, data) => { });

            a.forEach((v, i) => {
               
                playercards.set(v.playerid, []);
                let ppp = this.players.get(v.playerid);
                ppp.cards = [];
                ppp.place = i;
                this.players.set(v.playerid, ppp);

            });
            let thing = a[Math.round(Math.random() * (l - 1))];

            playercards.set(thing.playerid, [0]);

            //let ppp = this.players.get(thing.playerid);
            //ppp.cards = [0];
            //this.players.set(thing.playerid, ppp);
            //this.clientDB.query(`update players set thing = true WHERE roomid = $1 and playerid = $2`, [this.roomname, thing.playerid], (err, data) => { if (err) console.log(err); });

            //this.clientDB.query(`update rooms as r set currentplayer = r.last_thing WHERE roomid = $1`, [this.roomname], (err, data) => { if (err) console.log(err); });

            //this.clientDB.query(`update rooms set last_thing = $1 WHERE roomid = $2`, [thing.playerid, this.roomname], (err, data) => { if (err) console.log(err); });

            let currentPlayer = last_thing;
            if (last_thing == null) {
                currentPlayer = a[Math.round(Math.random() * (l - 1))].playerid;
                //this.clientDB.query(`update rooms as r set currentplayer = $2 WHERE roomid = $1`, [this.roomname, currentPlayer], (err, data) => { if (err) console.log(err); });
            }
            let curplayer = this.players.get(currentPlayer);
            //curplayer.phase = Player.Phases.Action;
            //curplayer.state = Player.States.SelectCard;
            this.currentplayer = curplayer;
            //console.log(this.currentplayer);
            this.players.set(currentPlayer, curplayer);
            //this.calcNextPlayer();
            //this.clientDB.query(`update players set (phase,state) = ($3,$4) WHERE roomid = $1 and playerid = $2`, [this.roomname, currentPlayer, Player.Phases.Action, Player.States.SelectCard], (err, data) => { if (err) console.log(err); });
            //console.log(this);
            let res = [];//тут будут все доступные для игры карты с учетом их количества каждого типа
            let index = l - 4;//количество игроков - 4  
            m.forEach((v, k) => {
                if (v.firstDeck == false) return;
                let numofthiscards = v.players[index];
                for (; numofthiscards > 0; numofthiscards--)res.push(v.num);//собираем массив доступных для игры карт
            });


            //this.players.forEach((v, k) => {
            playercards.forEach((v, k) => {
                let l = v.length;
                for (; l < 4; l++) {
                    let r = Math.round(Math.random() * (res.length - 1)); ////console.log(`r:${r} l:${res.length} c:${res[r]}`);
                    v.push(res[r]);//добавляем игроку карту
                    res.splice(r, 1);//удаляем карту из общего пула
                }

            });

            playercards.forEach((v, k) => {
               // console.log(v);
                this.insertShuffle(v, k);//перемешаем карты игрока и отдаем ему в руку
                //console.log();
            });
/* на время тестирования
            m.forEach((v, k) => {//подмешаем карты заражений и паники в оставшуюся колоду 
                if (v.firstDeck == true) return;
                if (v.playDeck == false) return;
                let numofthiscards = v.players[index];
                for (; numofthiscards > 0; numofthiscards--)res.push(v.num);
            });
*/
            this.insertShuffle(res);//оставшиеся карты перетасуем и закинем в деку
            this.currentplayer.startPlay();
            // this.currentplayer.getOneCardfromDeckForAction();
            //this.clientDB.query(`update cards set (isInDeck, place , playerid ) =(  false ,4, $2) WHERE roomid = $1 and isInDeck = true and place in (select max(place) from cards where  roomid = $1 and isInDeck = true); `, [this.roomname, currentPlayer], (err, data) => { });
            //a.forEach(v => { console.log(v.playername+' '+v.cards.length); });

            this.gamestarted = true;           // this.clientDB.query('update rooms set gamestarted = true where roomid = $1; ', [this.roomname], (err, data) => { if (err) console.trace(err); });
            this.needUpdateForAll();


        });

    }

    insertShuffle(res, playerid = null) {
        let len = res.length - 1;

        for (; len >= 0; len--) {

            let r = Math.round(Math.random() * (res.length - 1));
            if (playerid == null) {
                this.deckcards.push(new Card(this.clientDB, res[r], this, this.deckcards.length));


            } else {
                let p = this.players.get(playerid);
                p.cards.push(new Card(this.clientDB, res[r], this, p.cards.length));
                this.players.set(playerid, p);
                //playercards.set(v.playerid, [])
            };
            //this.clientDB.query(`insert into cards (roomid , cardid , isInDeck, place , playerid ) values(  $1 ,$2, $3, $4, $5 ); `, [this.roomname, res[r], playername == null, len, playername], (err, data) => { if (err) console.trace(err); });
            res.splice(r, 1);

        }
    }


    

    giveOneCardfromDeckToPlayer(player) {
        player.cards.push(this.deckcards.pop());
        player.cards.forEach((v, i) => { v.place = i });
        //player.cards.push(this.deckcards[this.deckcards.length - 1].card);
        //this.deckcards.pop();
    }



    needUpdateForAll() {
        this.players.forEach((v, k) => { v.needupdate = true });
        // this.clientDB.query(`update players set needupdate = true where roomid = $1;`, [this.roomname], (err, data) => { if (err) console.trace(err); });
    }

    needUpdateForPlayer(playername) {
        let p = this.players.get(playername);
        p.needupdate = true;
        this.players.set(playername, p);
        //this.clientDB.query(`update players set needupdate = true where roomid = $1 and playerid=$2;`, [this.roomname, playername], (err, data) => { if (err) console.trace(err); });
    }

    getPlayerByPlayerName(playername) { return this.players.get(playername); }

    getPlayers(callback) {
        callback(Array.from(this.players, ([name, value]) => (value)));
        /*this.clientDB.query(`select * from players where roomid = $1 and gamenum = $2;`,
            [this.roomname, this.gamenum], (err, data) => {
                if (err) console.log(err);
                if (data == undefined)
                    callback([]);
                else
                    callback(data.rows);
            });
            */
    }

    updatePlayers() {
        this.getDeckAndDrop((deckData) => {
            this.players.forEach((v, k) => {
                if (v.needupdate==true)
                    v.update(deckData);
                v.needupdate = false;
            });
        });
    }


    ShowMyCardToPlayer(playerTo, playerFrom, card) {

        this.getDeckAndDrop((deckData) => {
            this.players.forEach((v, k) => {
                //if (v.needupdate == true)
                this.additionalData = { action: "ShowOneCardToPlayer", PlayerTo: playerTo, PlayerFrom: playerFrom, Card: card };
                    v.update(deckData);
                v.needupdate = false;
            });
        });


    }

    findPlayer(playername, callback) {
       // console.log(this.players);
        let player = this.players.get(playername);

        if (player != undefined) {
            callback([player]);
            return;
        }
        callback([]);
        /*
        this.clientDB.query(`select * from players where roomid = $1 and playerid = $2 and gamenum = $3;`,
            [this.roomname, playername, this.gamenum], (err, data) => {
                if (err) console.log(err);
                if (data == undefined)
                    callback([]);
                else
                    callback(data.rows);
            });*/
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
        return player.cookieguid;
    }

    restorePlayer(socket, playerdata) {

        let player = this.players.get(playerdata.playername);//new Player(this.clientDB, socket, this.roomname, playerdata.playername, playerdata.playername, this, this.gamenum, playerdata.quarantineCount, playerdata.Infected);
        player.socket = socket;
        player.room = this;
        player.cookieguid = playerdata.guid;
        this.players.set(playerdata.playername, player);
        player.sendGUIDToPlayer();
        player.insertPlayer();
        //this.needUpdateForPlayer(playerdata.playername);
        //player.sendplayers(undefined);
        return player.cookieguid;
    }

    sendplayers() {


    }



    getDeckAndDrop(callback) {
        if (this.deckcards.length == 0 || this.startgame == false) {
            //
            //callback(undefined);
            return;
        }
        let card = this.deckcards[this.deckcards.length - 1];
        //console.log(card);

        //console.log(card.CardsByPlayers);
       // let card = Card.findCardByNum(lastcardofDeck);
        let deck = { deckCount: this.deckcards.length, dropCount: this.dropcards.length, card: card.card.isPanic ? card.CardsByPlayers.UnknownPanic.num : card.CardsByPlayers.UnknownAction.num, isGameStarted: true, direction: this.direction };
        //console.log(deck);
        callback(deck);

        /*
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
        */
    }

    doAction(socket, data) {
        console.log(data);
        this.additionalData = undefined;
        let player = this.players.get(data.playername);
        if (player == undefined) { socket.close(1001, 'Player not found'); return; }
        //console.log(player[data.action]);
        if (data.action == undefined) return;

        player[data.action](data);
        this.needUpdateForAll();
       
    }

    getPlayerNum(playerid) {



    }

    ShowOneOtherCardToPlayer(player, otherPlayerName, otherCardPlace) {
        let otherplayer = this.players.get(otherPlayerName);
        if (otherplayer == undefined) { socket.close(1001, 'Player not found'); return; }
        otherplayer.ShowYourCardToPlayer(player, otherCardPlace);

    }
}

module.exports = Room
