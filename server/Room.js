const Player = require('./Player')
const Card = require('./Card')

class Room {
    constructor(clientDB, roomname, password, numofPlayers, playername, isNewDBObject, gamenum) {
        this.gamestarted = false;
        this.players = new Map(); //key == playername ,
        this.spectators = new Map();
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
        this.doors = [];//new Map();
        this.cardscount = 0;
        this.gamenum = gamenum;
        this.direction = 0;
        this.nextplayer = null;
        this.currentPlayer = null;
        this.additionalData = undefined;
        this.gamelog = [];
        this.isPanicChain = false;
        this.chat = [];
        this.chatCount = 0;
        this.PanicConfessionTime = null;
        this.moves=[];
        //this.opponent = null;
    }

    

    addChatMessage(player, message) {
        this.chatCount++;
        this.chat.push({ id: this.chatCount, player: player.playername, message: message });
    }



    get playersArray() {

        return Array.from(this.players, ([name, value]) => (value));

    }

    Door(p1, p2, card) {
        let k = Math.max(p1.place, p2.place);// % (this.players.size - 1);
        if (Math.abs(p1.place - p2.place) == (this.players.size - 1)) k = 0;
        //if(k==this.players.size)k=0;
        //this.moves.push({card:v.card.num, moveto:{type: "door",place:k}, movefrom:{type:"player",place:p1.place}});
        card.MoveFromTo({type:"player",place:p1}, {type: "door",place:k} );
        this.doors[k] = card;
    }

    removeDoor(p1, p2) {
        let card = this.getDoor(p1, p2);
        if (card == undefined) return;
        let k = Math.max(p1.place, p2.place);
        if (Math.abs(p1.place - p2.place) == (this.players.size - 1)) k = 0;
        //if(k==this.players.size)k=0;
        //this.moves.push({card:card.card.num, moveto:{type: "drop"}, movefrom:{type:"door",place:k}});
        card.MoveFromTo({type:"door",place:k}, {type: "drop"});
        this.dropcards.push(card);
        this.doors[k] = undefined;//.delete(k);
    }

    getDoor(p1, p2) {

        let k = Math.max(p1.place, p2.place);
        if (Math.abs(p1.place - p2.place) == (this.players.size - 1)) k = 0;
        //if(k==this.players.size)k=0;
        return this.doors[k];//[.get(]k);

    }

    dropAllDoors() {
        //[].forEach()
        this.doors.forEach((v, k) => {
            if(v!=undefined)
            {
                v.MoveFromTo({type:"door",place:k},{type: "drop"});
                //this.moves.push({card:v.card.num, moveto:{type: "drop"}, movefrom:});
                this.dropcards.push(v);
            }});

        this.doors = [];//new Map();

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
        
        //addChatMessage(player, "")
        let doors = [];
        this.doors.forEach((v, k) => {
            if(v==undefined)return; //пустые двероместа не трогаем ) 
            doors[k]=v;
            //if (this.doors[k] == undefined) return;
           // console.log("дверь " + k+ " игрок "+player.place);

            if (k*1 < 1*player.place) return; //если игрок умирает то места смещаются , и если стояли двери то и двери нужно сместить

           //console.log("дверь " + k + " > игрок "+player.place);
            let newk = k - 1;
            let d = this.doors[newk];//.get(]newk);//проверяем свободно ли новое место для передвигаемой двери, и если не свободно и там уже есть дверь , 
            //console.log("предыдущее место " + d+" v="+v);
            if (d != undefined)
                this.dropcards.push(v);
            else  doors[newk] = v;//.set(k, v);// 
            doors[k] = undefined;//.delete(k);
        });
        this.doors = doors;
        this.spectators.set(player.playername,player);
        //this.spectators.push(player);
        player.place = null;
        this.players.delete(player.playername);
        this.getPlayers((playersArray) => {
            //this.players = new Map();
            playersArray.filter(pl => !pl.isDead).sort((a, b) => a.place - b.place).forEach((player, i) => {

                player.place = i
            });
            this.calcNextPlayer();
        });


    }


    getNextPlayerFor(player) {
        let l = this.players.size;
        if (player == null) return undefined;
        let place = player.place;
        let nextplace = (place + 1) % l;
        if (this.direction != 0) nextplace = place < 1 ? (l - 1) : (place - 1);
        let nextplayer = null;
        this.getPlayers((a) => {
            a.forEach((v, i) => {
                if (v.place == nextplace) nextplayer = v;
            });
        });
        if (nextplayer == null) console.log('how can it be , nextplayer is null');
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


    isNotAllSelectCardForExchangeOut() {
        return this.playersArray.filter((v) => v.cardForExchangeOut == null).length > 0;
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
        this.playersArray.forEach(v => { if (v.thing) this.log(v + " нечто"); });
        let endText = "Игра окончена";
        this.log(endText);
        if (win) endText = "Нечто победил";
        if (loose) endText = "Нечто проиграл";
        this.log(endText);
        this.players.forEach((v, k) => {
            v.send({ messagetype: 'gamelog', gamelog: this.gamelog });
        });
        this.spectators.forEach((v) => {
            v.send({ messagetype: 'gamelog', gamelog: this.gamelog });
        });
        this.playersArray.forEach(v => { 
            v.stopPlay(); 
           // v.socket.close(1001, endText);
         });


        this.gamestarted = false;
        this.players = new Map(); //key == playername ,
        this.spectators = new Map();

        this.deckcards = [];
        this.dropcards = [];
        this.tablecards = [];
        this.doors = [];//new Map();
        this.cardscount = 0;

        this.direction = 0;
        this.nextplayer = null;
        this.currentPlayer = null;
        this.additionalData = undefined;
        this.gamelog = [];
        this.isPanicChain = false;

    }

    dropAllQuarantine() {
        this.playersArray.forEach(v => v.dropQuarantine());
    }

    ChainPanicEnd() {
        if (this.isNotAllSelectCardForExchangeOut()) return;
        this.playersArray.forEach(v => {

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
            let lastThings = a.filter(v => v.thing == true);
            last_thing = lastThings[Math.round(Math.random() * (lastThings.length - 1))];

            console.log("lastthing "+last_thing);
            this.gamestarted = true;

            a.forEach((v, i) => {
                playercards.set(v.playerid, []);
                let ppp = this.players.get(v.playerid);
                ppp.cards = [];
                ppp.place = i;
                ppp.thing = false;
                this.players.set(v.playerid, ppp);
            });

            let thing = a[Math.round(Math.random() * (l - 1))];
            thing.thing = true;
            playercards.set(thing.playerid, [0]);

            let currentPlayer = last_thing;
            if (last_thing == null || last_thing == undefined) {
                currentPlayer = a[Math.round(Math.random() * (l - 1))].playerid;
            } else currentPlayer = last_thing.playerid;
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

            //this.deckcards.push(new Card(this.clientDB, Card.CardsByPlayers.Door.num, this, this.deckcards.length));

            this.currentplayer.startPlay();

            this.gamestarted = true;           // this.clientDB.query('update rooms set gamestarted = true where roomid = $1; ', [this.roomname], (err, data) => { if (err) console.trace(err); });
            this.players.forEach(v => v.sendGUIDToPlayer());
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
            card.MoveFromTo({type:"deck"},{type:"drop"});
            //this.moves.push({card:card.card.num, moveto: {type:"drop"}, movefrom:{type:"deck",place:0}});
            this.dropcards.push(card);
        }
        card.MoveFromTo({type:"deck"},{type:"player",player:player});
        //this.moves.push({card:card.card.num, moveto: {type:"player"}, movefrom:});
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
            card.MoveFromTo({type:"deck"},{type:"drop"});
            this.dropcards.push(card);
        }
        player.Perseverance.push(card);

    }

    giveOneCardfromDeckToPlayer(player) {
        if (this.deckcards.length < 1) this.dropToDeckWithShuffle();
        let card = this.deckcards.pop();
        card.MoveFromTo({type:"deck"},{type:"player",player:player,place:4});
        player.cards.push(card);
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

    getPlayerByPlace(place) {
        return this.playersArray.filter(v => v.place == place)[0];
    }

    getPlayers(callback) {
        callback(Array.from(this.players, ([name, value]) => (value)));

    }



    updatePlayers() {

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
            if (!v.isonline()) {

                if((Date.now()-v.lastseen)>10*60*1000){
                    this.killPlayer(v);this.isDead = true;
                    this.log(v+" выбывает по таймауту/отвалился инет");
                };
    
                return;
            }
            v.send({ messagetype: 'gamelog', gamelog: this.gamelog });
            v.send({ messagetype: 'chat', chat: this.chat });
        });
        this.spectators.forEach((v) => {
            v.send({ messagetype: 'gamelog', gamelog: this.gamelog });
            v.send({ messagetype: 'chat', chat: this.chat });
        });
        this.checkEndGame();
        this.moves.forEach(v=>v.ClearMove());
        this.moves=[];
    }


    ShowMyCardToAll(playerFrom, card) {

        this.getDeckAndDrop((deckData) => {
            this.players.forEach((v, k) => {
                this.additionalData = { action: "ShowOneCardToAll", PlayerFrom: playerFrom, Card: card };
                v.update(deckData);
                v.needupdate = false;
            });
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

    ShowMyCardsTo(playerTo, playerFrom) {

        this.getDeckAndDrop((deckData) => {
            this.players.forEach((v, k) => {
                this.additionalData = { action: "ShowAllCardsTo", PlayerTo: playerTo, PlayerFrom: playerFrom };
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
        let ip = socket._socket.remoteAddress;
        if (playerdata.playername.trim() == "") { socket.close(1011, 'Player error'); return; }
        let wasThing = playerdata.thing;
        let player = new Player(this.clientDB, socket, this.roomname, playerdata.playername, playerdata.playername, this, this.gamenum, 0);
        if (this.gamestarted == false && playerdata.thing == true) player.thing = true;
        this.players.set(playerdata.playername, player);
        player.sendGUIDToPlayer();
        player.insertPlayer();
        player.ip = ip;
        return player.cookieguid;
    }

    restorePlayer(socket, playerdata) {
        let ip = socket._socket.remoteAddress;
        if (playerdata.playername.trim() == "") { socket.close(1011, 'Player error'); return; }

        let player = this.players.get(playerdata.playername);//new Player(this.clientDB, socket, this.roomname, playerdata.playername, playerdata.playername, this, this.gamenum, playerdata.quarantineCount, playerdata.Infected);
        if (this.gamestarted == false && playerdata.thing == true) player.thing = true;
        player.socket = socket;
        player.room = this;
        player.cookieguid = playerdata.guid;
        this.players.set(playerdata.playername, player);
        player.sendGUIDToPlayer();
        player.ip = ip;
        return player.cookieguid;
    }

    sendplayers() {


    }

    tableToDrop() {
        if (this.isPanicChain == true) return;
        this.tablecards.forEach(v => {
            v.MoveFromTo({type:"table"},{type:"drop"});
            this.dropcards.push(v)});
        this.tablecards = [];
    }


    getDeckAndDrop(callback) {
        if (this.startgame == false) {
            return;
        }

        if (this.deckcards.length == 0) this.dropToDeckWithShuffle();
        if (this.deckcards.length == 0) return;
        let card = this.deckcards[this.deckcards.length - 1];
        let deckmove = card.GetMoveOut();
        let lastdrop = this.dropcards[this.dropcards.length - 1];
        let dropmove = {};
        let drop = this.dropcards.map((v) => { 
            dropmove = v.GetMoveOut(dropmove);
            return v.card.isPanic ? Card.CardsByPlayers.UnknownPanic.num : Card.CardsByPlayers.UnknownAction.num 
        });
        let table = this.tablecards.map((v) => v.card.num);
        
        let tablemove = {};
        this.tablecards.forEach(v=>{tablemove = v.GetMoveOut(tablemove);})

        let doors = [];
        let doorsmove = [];
        this.doors.forEach((v, k) => {
            if (v == undefined)return;
            doorsmove.push(v.GetMoveOut());
            doors.push(k);
        });

        //Array.from(this.doors, (v,k) => (k));doorsmove:doorsmove, //error
        let deck = {
            table: table, drop: drop, deckCount: this.deckcards.length, dropCount: this.dropcards.length,
            card: card.card.isPanic ? Card.CardsByPlayers.UnknownPanic.num : Card.CardsByPlayers.UnknownAction.num,
            isGameStarted: true, direction: this.direction, currentPlayer: this.currentplayer.place, doors: doors,
            dropmove:dropmove, tablemove:tablemove,  deckmove:deckmove

        };
        callback(deck);


    }

    doAction(socket, data) {
        let player = this.players.get(data.playername);
        if (player == undefined) { socket.close(1001, 'Player not found'); return; }
        if (data.action == undefined) return;
        if (player.isDead == true) { socket.close(1001, 'Player is dead'); return; }

        this.additionalData = undefined;
        //this.tableToDrop();


        try { player["action" + data.action](data); } catch (e) {
            console.trace(e);
            socket.close(1001, e);
        };


        this.needUpdateForAll();

    }

    doChat(socket, data) {
        //console.log(data);
        let player = this.players.get(data.playername);
        if(player==undefined)player = this.spectators.get(data.playername);
        if (player == undefined) { socket.close(1001, 'Player not found'); return; }
        //if (data.action == undefined) return;
        //if (player.isDead == true) { socket.close(1001, 'Player is dead'); return; }
        this.addChatMessage(player, data.message);



        //this.needUpdateForAll();

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
