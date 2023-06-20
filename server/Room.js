const Player = require('./Player')
const Card = require('./Card')

class Room {
    constructor(clientDB, roomname, password, numofPlayers, playername, isNewDBObject, gamenum) {
        this.gamestarted = false;
        this.players = new Map(); //key == playername ,
        this.spectators = [];
        this.clientDB = clientDB;
        this.roomname = roomname;
        this.password = password;
        this.numofPlayers = numofPlayers;
        this.playername = playername;
        this.isNewDBObject = isNewDBObject;
        if (isNewDBObject == true) this.insertRoom();
        this.deckcards = [];
        this.dropcards = [];
        this.tablecards = [];
        this.cardscount = 0;
        this.gamenum = gamenum;
        this.direction = 0;
        this.nextplayer = null;
        this.currentPlayer = null;
        this.additionalData = undefined;
        this.gamelog = [];
        this.isPanicChain = false;
        //this.opponent = null;
    }

    get playersArray(){

        return Array.from(this.players, ([name, value]) => (value));

    }

    log(v) {
        this.gamelog.push(v.toString('utf8'));
        console.log(v.toString('hex'));
    }

    get currentplayer() {

        return this.currentPlayer;

    }

    set currentplayer(v) {
        this.currentPlayer = v;

        this.calcNextPlayer();

    }

    insertRoom() {


    }


    killPlayer(player) {

        this.spectators.push(player);
        this.players.delete(player.playername);
        this.getPlayers((playersArray) => {
            //this.players = new Map();
            playersArray.filter(pl => !pl.isDead).sort((a, b) => a.place - b.place).forEach((player, i) => { player.place = i });
            this.calcNextPlayer();
        });

    }


    getNextPlayerFor(player){
        let l = this.players.size;
        let place = player.place;
        let nextplace = (place + 1) % l;
        if (this.direction != 0) nextplace = place < 1 ? (l - 1) : (place - 1);
        let nextplayer = null;
        this.getPlayers((a) => {
            a.forEach((v, i) => {
                if (v.place == nextplace) nextplayer = v;
            });
        });
        return nextplayer;

    }

    calcNextPlayer() {
        this.nextplayer = this.getNextPlayerFor(this.currentplayer);
    }

    dropToDeckWithShuffle() {
        let res = this.dropcards;
        let len = res.length - 1;

        for (; len >= 0; len--) {

            let r = Math.round(Math.random() * (res.length - 1));

            this.deckcards.push(res[r]);

            res.splice(r, 1);

        }



    }


    isNotAllSelectCardForExchangeOut(){
        return this.playersArray.filter((v)=>v.cardForExchangeOut==null).length>0;
    }

    IsThingWin() {
        return this.playersArray.filter(v => (v.isDead == false && (v.Infected || v.thing))).length == this.playersArray.filter(v => (v.isDead == false)).length;
    }

    IsThingLoose() {
        return this.playersArray.filter(v => (v.isDead == false && v.thing)).length == 0;
    }

    checkEndGame() {
        if (this.gamestarted == false) return;
        let win = this.IsThingWin();
        let loose = this.IsThingLoose();
        if (!win && !loose) return;
        this.gamestarted = false;
        this.playersArray.forEach(v => {if(v.thing)this.log(v+" нечто");});
        
        this.log("Игра окончена");
        if (win) this.log("Нечто победил");
        if (loose) this.log("Нечто проиграл");
        this.playersArray.forEach(v => v.stopPlay());


    }

    ChainPanicEnd(){
        if(this.isNotAllSelectCardForExchangeOut())return;
        this.playersArray.forEach(v=>{

            let nextplayer = this.getNextPlayerFor(v);
            nextplayer.IncomeExchange(v);
            //v.IncomeExchange(nextplayer);
            v.stopPlay();

        }
        );
        this.isPanicChain = false;
        this.tableToDrop();
        this.nowNextPlayer();

    }

    startgame(player) {
        if (this.gamestarted == true) return;
        this.numofplayers = this.players.size;//.length;  
        player.readyforstart = true;
        if (this.numofplayers < 4) return;

        let last_thing = null;

        let playercards = new Map();
        //console.log(Card);
        let m = (new Card()).getCardTypes();
        this.getPlayers((a) => {
            let l = a.length;

            this.gamestarted = true;

            a.forEach((v, i) => {
                playercards.set(v.playerid, []);
                let ppp = this.players.get(v.playerid);
                ppp.cards = [];
                ppp.place = i;
                this.players.set(v.playerid, ppp);
            });

            let thing = a[Math.round(Math.random() * (l - 1))];
            thing.thing = true;
            playercards.set(thing.playerid, [0]);

            let currentPlayer = last_thing;
            if (last_thing == null) {
                currentPlayer = a[Math.round(Math.random() * (l - 1))].playerid;
            }
            let curplayer = this.players.get(currentPlayer);
            this.currentplayer = curplayer;
            this.players.set(currentPlayer, curplayer);
            let res = [];//тут будут все доступные для игры карты с учетом их количества каждого типа
            let index = l - 4;//количество игроков - 4  
            m.forEach((v, k) => {
                if (v.firstDeck == false) return;
                let numofthiscards = v.players[index];
                for (; numofthiscards > 0; numofthiscards--)res.push(v.num);//собираем массив доступных для игры карт
            });

            playercards.forEach((v, k) => {
                let l = v.length;
                for (; l < 4; l++) {
                    let r = Math.round(Math.random() * (res.length - 1)); ////console.log(`r:${r} l:${res.length} c:${res[r]}`);
                    v.push(res[r]);//добавляем игроку карту
                    res.splice(r, 1);//удаляем карту из общего пула
                }
            });

            playercards.forEach((v, k) => {
                this.insertShuffle(v, k);//перемешаем карты игрока и отдаем ему в руку
            });

            m.forEach((v, k) => {//подмешаем карты заражений и паники в оставшуюся колоду 
                if (v.firstDeck == true) return;
                if (v.playDeck == false) return;
                let numofthiscards = v.players[index];
                for (; numofthiscards > 0; numofthiscards--)res.push(v.num);
            });


            this.insertShuffle(res);//оставшиеся карты перетасуем и закинем в деку
            this.currentplayer.startPlay();

            this.gamestarted = true;           // this.clientDB.query('update rooms set gamestarted = true where roomid = $1; ', [this.roomname], (err, data) => { if (err) console.trace(err); });
            this.needUpdateForAll();
            this.log("игра началась");

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

            };
            res.splice(r, 1);

        }
    }


    nowNextPlayer() {
        this.currentplayer.stopPlay();
        let nextplayer = this.nextplayer;
        this.currentplayer = nextplayer;
        nextplayer.startPlay();

    }

    giveOneActionCardfromDeckToPlayer(player) {
        let card = undefined;

        while (true) {
            if (this.deckcards.length < 1) this.dropToDeckWithShuffle();

            card = this.deckcards.pop();
            if (!card.card.isPanic) break;
            this.dropcards.push(card);
        }
        player.cards.push(card);
        player.cards.forEach((v, i) => { v.place = i });

    }

    givethreePerseverenceCardsfromDeckToPlayer(player) {
        for (let i = 0; i < 3; i++)this.giveOnePerseverenceCardfromDeckToPlayer(player);


    }

    giveOnePerseverenceCardfromDeckToPlayer(player) {
        let card = undefined;

        while (true) {
            if (this.deckcards.length < 1) this.dropToDeckWithShuffle();

            card = this.deckcards.pop();
            if (!card.card.isPanic) break;
            this.dropcards.push(card);
        }
        player.Perseverance.push(card);

    }

    giveOneCardfromDeckToPlayer(player) {
        if (this.deckcards.length < 1) this.dropToDeckWithShuffle();
        player.cards.push(this.deckcards.pop());
        player.cards.forEach((v, i) => { v.place = i });

    }



    needUpdateForAll() {
        this.players.forEach((v, k) => { v.needupdate = true });
    }

    needUpdateForPlayer(playername) {
        let p = this.players.get(playername);
        p.needupdate = true;
        this.players.set(playername, p);
    }

    getPlayerByPlayerName(playername) { return this.players.get(playername); }

    getPlayers(callback) {
        callback(Array.from(this.players, ([name, value]) => (value)));

    }



    updatePlayers() {
        this.checkEndGame();
        this.getDeckAndDrop((deckData) => {
            this.players.forEach((v, k) => {
                if (v.needupdate == true)
                    v.update(deckData);
                v.needupdate = false;
                //v.send({ messagetype: 'gamelog', gamelog: this.gamelog });
            });
            this.spectators.forEach(v => v.update(deckData));

        });

        this.players.forEach((v, k) => {
            v.send({ messagetype: 'gamelog', gamelog: this.gamelog});
        });
        this.spectators.forEach((v) => {
            v.send({ messagetype: 'gamelog', gamelog: this.gamelog});
        });
    }


    ShowMyCardToPlayer(playerTo, playerFrom, card) {

        this.getDeckAndDrop((deckData) => {
            this.players.forEach((v, k) => {
                this.additionalData = { action: "ShowOneCardToPlayer", PlayerTo: playerTo, PlayerFrom: playerFrom, Card: card };
                v.update(deckData);
                v.needupdate = false;
            });
        });


    }

    ShowMyCardsToAll(player) {

        this.getDeckAndDrop((deckData) => {
            this.players.forEach((v, k) => {
                this.additionalData = { action: "ShowAllCards", Player: player };
                v.update(deckData);
                v.needupdate = false;
            });
        });


    }

    findPlayer(playername, callback) {
        let player = this.players.get(playername);

        if (player != undefined) {
            callback([player]);
            return;
        }
        callback([]);


    }

    clearPlayers() {

    }


    addPlayer(socket, playerdata) {

        let player = new Player(this.clientDB, socket, this.roomname, playerdata.playername, playerdata.playername, this, this.gamenum, 0);
        this.players.set(playerdata.playername, player);
        player.sendGUIDToPlayer();
        player.insertPlayer();

        return player.cookieguid;
    }

    restorePlayer(socket, playerdata) {

        let player = this.players.get(playerdata.playername);//new Player(this.clientDB, socket, this.roomname, playerdata.playername, playerdata.playername, this, this.gamenum, playerdata.quarantineCount, playerdata.Infected);
        player.socket = socket;
        player.room = this;
        player.cookieguid = playerdata.guid;
        this.players.set(playerdata.playername, player);
        player.sendGUIDToPlayer();

        return player.cookieguid;
    }

    sendplayers() {


    }

    tableToDrop() {
        if(this.isPanicChain==true)return;
        this.tablecards.forEach(v => this.dropcards.push(v));
        this.tablecards = [];
    }


    getDeckAndDrop(callback) {
        if (this.startgame == false) {
            return;
        }

        if (this.deckcards.length == 0) this.dropToDeckWithShuffle();
        if (this.deckcards.length == 0) return;
        let card = this.deckcards[this.deckcards.length - 1];
        let lastdrop = this.dropcards[this.dropcards.length - 1];
        let drop = this.dropcards.map((v) =>{ return v.card.isPanic?Card.CardsByPlayers.UnknownPanic.num:Card.CardsByPlayers.UnknownAction.num});
        let table = this.tablecards.map((v) => v.card.num);
        let deck = { table: table, drop: drop, deckCount: this.deckcards.length, dropCount: this.dropcards.length, 
            card: card.card.isPanic ? Card.CardsByPlayers.UnknownPanic.num : Card.CardsByPlayers.UnknownAction.num, 
            isGameStarted: true, direction: this.direction , currentPlayer:this.currentplayer.place};
        callback(deck);


    }

    doAction(socket, data) {
        let player = this.players.get(data.playername);
        if (player == undefined) { socket.close(1001, 'Player not found'); return; }
        if (data.action == undefined) return;
        if (player.isDead == true) { socket.close(1001, 'Player is dead'); return; }

        this.additionalData = undefined;
        this.tableToDrop();


        try { player["action" + data.action](data); } catch (e) {
            console.trace(e);
            socket.close(1001, e +' phase:'+ player.phase);
        };


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
