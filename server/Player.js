const Card = require('./Card')

class Player {
    constructor(clientDB, socket, roomid, playername, playerCaption, room, gamenum, quarantineCount = 0, Infected = false) {
        this.readyforstart = false;
        this.clientDB = clientDB;
        this.socket = socket;
        this.playerid = playername;
        this.playername = playername;
        this.playerCaption = playerCaption;
        this.roomid = roomid;
        this.cookieguid = this.generateGUID();//guid for cookie
        this.id = this.generateGUID();
        this.room = room;
        this.quarantineCount = quarantineCount;
        this.Infected = Infected;
        this.cards = [];
        this.thing = false;
        this.place = 0;
        this.gamenum = gamenum;
        this.state = Player.States.Nothing;
        this.phase = Player.Phases.Nothing;
        this.exchange = null;
        this.needupdate = true;
        this.lastseen = Date.now();
        if (room != null) this.place = room.players.size;
        this.cardForExchangeOut = null;

    }

    static Phases = {
        Nothing: 0,
        Exchange: 1,
        Action: 2,
        Answer: 3

    }

    static States = {
        Nothing: 0,
        SelectCard: 2,
        OutgoingExchange: 3,
        IncomeExchange: 4,
        PerseveranceSelectCard: 5,
        SelectPlayer: 6,
        SuspicionSelectCard: 7,
        Panic: 8


    }

    isonline() {
        return this.socket.readyState == this.socket.OPEN;
    }

    send(data) {
        let packet = JSON.stringify(data);
        this.socket.send(packet, { binary: false });
    }

    sendGUIDToPlayer() {
        this.lastseen = Date.now();
        //this.clientDB.query(`update players set (needupdate, lastseen ) = (true, $2) WHERE guid = $1 ; `, [this.guid, new Date()], (err, data) => { });
        this.send({ messagetype: 'playerguid', guid: this.cookieguid, playername: this.playername, roomname: this.roomid, password: this.room.password, quarantineCount: this.quarantineCount, infected: this.Infected, thing: this.thing, gamenum: this.gamenum });
    }

    insertPlayer() {
        /*
        //console.trace(`gamenum = ${this.gamenum}`);
        //console.log(`gamenum = ${this.gamenum}`);
        this.clientDB.query(`INSERT INTO players (place , roomid ,playerid , name , lastseen , guid, quarantineCount, Infected , gamenum ,needupdate)
                            (select COALESCE(max(place)+1,0) as place , $1, $2, $3, $4, $5, $6, $7, $8, true from players where roomid = $1 and gamenum = $8) 
                            on conflict on CONSTRAINT roomplayer do
                            UPDATE SET ( gamenum , lastseen, guid, needupdate ) = (  EXCLUDED.gamenum , EXCLUDED.lastseen , EXCLUDED.guid, true );`,
            //and gamenum = $8)
            [this.roomid, this.playername, this.playerCaption, new Date(), this.guid, this.quarantineCount, this.Infected, this.gamenum], (err, data) => {
                if (err) console.log(err);
                //callback(data.rows);
            });


        this.clientDB.query(`delete from cards where roomid IN (SELECT roomid FROM rooms WHERE roomid = $1 and gamestarted = false); `, [this.roomid,], (err, data) => { });
        */
    }

    generateGUID() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    update(deckData) {

        //console.log(this.guid);
        if (!this.isonline()) {
            //console.log("offline");
            return;
        }
        this.sendplayers(deckData);
        this.lastseen = Date.now();
        this.needupdate = false;

    }

    outExchangeCard(data) {

        let nextplayer = this.room.getPlayerByPlayerName(data.opponent);
        if (this.phase == Player.Phases.Answer && nextplayer.state == Player.States.OutgoingExchange) {

            inExchangeCard(data);


            return;
        }
        this.cardForExchangeOut = data.place;
        this.state = Player.States.OutgoingExchange;
        nextplayer.phase = Player.Phases.Answer;
        nextplayer.state = Player.States.SelectCard;

    }

    startPlay() {

        this.phase = Player.Phases.Action;
        this.state = Player.States.SelectCard;
        this.getOneCardfromDeckForAction();

    }

    endTurn() {
        this.phase = Player.Phases.Exchange;
        this.state = Player.States.SelectCard;

    }

    stopPlay() {
        this.phase = Player.Phases.Nothing;
        this.state = Player.States.Nothing;

    }


    inExchangeCard(data) {

        let nextplayer = this.room.getPlayerByPlayerName(data.opponent);
        if (this.phase != Player.Phases.Answer ) {
            return;
        }

        if (nextplayer.cardForExchangeOut == null) {
            return;
        }

        let othercardindex = nextplayer.findcardindex(nextplayer.cardForExchangeOut);
        let othercard = nextplayer.cards[othercardindex];
        nextplayer.cards.splice(othercardindex, 1);
        let mycardindex = this.findcardindex(data.place);
        let mycard = this.cards[mycardindex];
        this.cards.splice(mycardindex, 1);
        nextplayer.cards.push(mycard);
        this.cards.push(othercard);
        nextplayer.cards.forEach((v, i) => { v.place = i });
        nextplayer.stopPlay();
        nextplayer.cardForExchangeOut = null;
        this.room.currentplayer = this;
        this.startPlay();
    }

    nowNextPlayer() {
        this.stopPlay();
        let nextplayer = this.room.nextplayer;


        this.room.currentplayer = nextplayer;
        //this.room.calcNextPlayer();
        nextplayer.startPlay();

    }


    giveCardfromUpDeck() {

        getOneCardfromDeckForAction();

    }

    ShowYourCardToPlayer(player, place) {
        let cardindex = this.findcardindex(place);
        let card = this.cards[cardindex];
        this.room.ShowMyCardToPlayer(player, this, card);

    }

    findcardindex(place) {
        return this.cards.findIndex((v, i) => { return v.place == place });
        //return this.cards[cardindex];
    }

    actionBurnPlayer(data) {
        let otherPlayerName = data.otherPlayerName;
       // let otherCardPlace = data.place;
        let bymycardplace = data.bymycardplace;

        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.BurnFire) { this.socket.close(1001, 'Error is not burn card'); return; }
        console.log("Burn " + otherPlayerName);


    }

    actionShowMeCard(data) {
        let otherPlayerName = data.otherPlayerName;
        let otherCardPlace = data.place;
        let bymycardplace = data.bymycardplace;

        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        //check and validate card here
        this.tableCard(bymycardplace);

        this.room.ShowOneOtherCardToPlayer(this, otherPlayerName, otherCardPlace);
        this.endTurn();


    }

    tableCard(place) {
        let index = this.findcardindex(place);
        this.room.tablecards.push(this.cards[index]);
        //console.log(place + ' ' + this.cards.length)
        this.cards.splice(index, 1);
        this.cards.forEach((v, i) => { v.place = i });
        //console.log('cards ' + this.cards.length)
    }

    dropOneCard(place) {
        let index = this.findcardindex(place);
        this.room.dropcards.push(this.cards[index]);
        //console.log(place + ' ' + this.cards.length)
        this.cards.splice(index, 1);
        this.cards.forEach((v, i) => { v.place = i });
        //console.log('cards ' + this.cards.length)
    }

    actionDropCard(data) {
        

        let cardplace = data.place;
        this.dropOneCard(cardplace);
        this.endTurn();
    }

    getOneCardfromDeckForAction() {
        this.room.giveOneCardfromDeckToPlayer(this);
        //this.cards.forEach((v, i) => { v.place = i });
    }

    sendplayers(deckData) {
 

        if (this.room.nextplayer == null) return;
        let nextplayer = this.room.nextplayer.place;
        let currentplayer = this.room.currentplayer.place;
        let opponent = this.room.nextplayer.place;
        if (this.place != currentplayer) opponent = currentplayer;
        let exchange = [];

        exchange.push(this.addCards(this, this));

        this.room.players.forEach((v, k) => {
            let p;
            if (v.playername == this.playername) { return; }

            else p = new Player(null, null, null, v.playername, null, null, v.quarantineCount);
            p.place = v.place;
            p.state = v.state;
            p.phase = v.phase;


            if (this.thing == true) p.Infected = v.Infected;//покажем нечте зараженных
            if (this.Infected == true) p.thing = v.thing;//покажем зараженным нечту

            exchange.push(this.addCards(v, p) );



        });


        this.lastseen = Date.now;
        this.needupdate = false;

        this.send({ messagetype: 'playerlist', playerlist: exchange, deck: deckData, nextplayer: nextplayer, currentplayer: currentplayer, opponent: opponent });
    }

    addCards(v, p) {
        let additionalData = this.room.additionalData;
        let cardsArray = [];
        
        v.cards.forEach((c, i) => {
            //console.log(card);
            //let card = vCard.num;
            let cardplace = c.place;
            
            let str = { cardnum: -1, cardplace: cardplace };
            if (v.playername == this.playername || c.card.isPanic)                str = { cardnum: c.card.num, cardplace: cardplace };

            if (v.cardForExchangeOut == cardplace) str.ShowTo = true;
            if (additionalData != undefined) {
                switch (additionalData.action) {
                    case "ShowOneCardToPlayer":
                        
                        if (additionalData.Card.place != cardplace) break;
                        //console.log(additionalData);
                        if (v.playername != additionalData.PlayerFrom.playername) break;
                        str.ShowTo = true;
                        str.toPlayer = additionalData.PlayerTo.playername;
                        if (this.playername == additionalData.PlayerTo.playername)
                            str.cardnum = c.card.num;
                        break;

                }



            }


            cardsArray.push(str);
            // } else {
            //     p.exchange = { nextplayer: v.nextplayerforcard, card: -1, cardplace: cardplace };
            // }
        });
        
            return { playername: v.playername, cardForExchangeOut: v.cardForExchangeOut, quarantineCount: v.quarantineCount, num: v.place, Infected: p.Infected, thing: p.thing, state: p.state, phase: p.phase, cards: cardsArray, exchange: null };


    }


}

module.exports = Player
