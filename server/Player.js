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
        this.isDead = false;

    }

    toString() {
        return this.playername;
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
        DefendFireSelectCard: 7,
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
        this.send({ messagetype: 'playerguid', guid: this.cookieguid, playername: this.playername, roomname: this.roomid, password: this.room.password, quarantineCount: this.quarantineCount, infected: this.Infected, thing: this.thing, gamenum: this.gamenum });
    }

    insertPlayer() {
        this.room.log(this + " входит в игру");
    }

    generateGUID() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    update(deckData) {


        if (!this.isonline()) {
 
            return;
        }
        this.sendplayers(deckData);
        this.lastseen = Date.now();
        this.needupdate = false;

    }

    actionoutExchangeCard(data) {
        if (this.phase != Player.Phases.Exchange) throw 'Error is not you Exchange now';
        if (this.state != Player.States.SelectCard)  throw 'Error is not you state now'; 
        let nextplayer = this.room.getPlayerByPlayerName(data.opponent);
        this.cardForExchangeOut = data.place;
        this.state = Player.States.OutgoingExchange;
        nextplayer.phase = Player.Phases.Answer;
        nextplayer.state = Player.States.IncomeExchange;
        this.room.log(this + " обменивается картами с " + nextplayer );


    }

    startPlay() {

        this.phase = Player.Phases.Action;
        this.state = Player.States.SelectCard;
        this.getOneCardfromDeckForAction();
        this.room.log(this + " начинает ход");

    }

    endTurn() {
        this.phase = Player.Phases.Exchange;
        this.state = Player.States.SelectCard;

    }

    stopPlay() {
        this.phase = Player.Phases.Nothing;
        this.state = Player.States.Nothing;

    }


    actioninExchangeCard(data) {
        if (this.phase != Player.Phases.Answer) throw 'Error is not you answer now';
        if (this.state != Player.States.IncomeExchange) throw 'Error is not you state now';
        let nextplayer = this.room.getPlayerByPlayerName(data.opponent);
        if (nextplayer.cardForExchangeOut == null)  throw  'Error no card for exchange'; 

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

    actionShowAllCards(data) {
        if (this.phase != Player.Phases.Action) throw 'Error is not you action now'; 
        if (this.state != Player.States.SelectCard) throw 'Error is not you state now'; 
        
        let bymycardplace = data.place;
        

        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.Whiski) throw 'Error is not Whiski card'; 
        //this.ShowAllCards = true;
        //check and validate card here
        this.tableCard(bymycardplace);
        this.endTurn();
        this.room.ShowMyCardsToAll(this);
        this.room.log(this + " показывает карты всем");

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
        if (this.phase != Player.Phases.Action) throw 'Error is not you action now'; 
        if (this.state != Player.States.SelectCard) throw 'Error is not you state now'; 
        let otherPlayerName = data.otherPlayerName;
        let nextplayer = this.room.getPlayerByPlayerName(otherPlayerName);
       // let otherCardPlace = data.place;
        let bymycardplace = data.bymycardplace;

        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.BurnFire) throw 'Error is not burn card'; 

        //console.log(this.playername + " try Burn " + otherPlayerName);
        this.tableCard(bymycardplace);

        this.state = Player.States.Nothing;
        nextplayer.phase = Player.Phases.Answer;
        nextplayer.state = Player.States.DefendFireSelectCard;
        this.room.log(this + " играет огнемет на " + nextplayer);
        let defend = nextplayer.cards.filter((v)=>
            v.card.num == Card.CardsByPlayers.FireResist.num);
        //console.log(defend);
        if(defend.length>0)return;
        this.room.log(nextplayer+" выбывает");
        nextplayer.dead();
        this.endTurn();
        //nextplayer.cards.fil


    }



    actionDefendFromFire(data) {
        if (this.phase != Player.Phases.Answer) throw 'Error is not you answer now'; 
        if (this.state != Player.States.DefendFireSelectCard) throw 'Error is not you defend now'; 
        let bymycardplace = data.bymycardplace;

        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.FireResist) throw 'Error is not defend card'; 

        console.log(this.playername + " defend from fire ");
        this.tableCard(bymycardplace);
        this.room.giveOneActionCardfromDeckToPlayer(this);
        this.stopPlay();
        this.room.currentplayer.endTurn();

        this.room.log(this + " никакого шашлыка");

    }


    actionShowMeCard(data) {
        if (this.phase != Player.Phases.Action) throw 'Error is not you action now'; 
        if (this.state != Player.States.SelectCard) throw 'Error is not you state now'; 
        let otherPlayerName = data.otherPlayerName;
        let otherCardPlace = data.place;
        let bymycardplace = data.bymycardplace;

        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.Suspicion) throw 'Error is not suspicion card';

        //check and validate card here
        this.tableCard(bymycardplace);

        this.room.ShowOneOtherCardToPlayer(this, otherPlayerName, otherCardPlace);
        this.endTurn();
        this.room.log(this + " подозревает " + otherPlayerName);


    }


    dead(){
        this.isDead = true;
        this.cards.forEach(v=>this.room.dropcards.push(v));
        this.cards = [];
        this.place = null;
        this.stopPlay();
        this.room.killPlayer(this);
        //
                //.delete()
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
        if (this.phase != Player.Phases.Action) throw 'Error is not you action now'; 
        if (this.state != Player.States.SelectCard) throw 'Error is not you drop now'; 

        let cardplace = data.place;
        this.dropOneCard(cardplace);
        this.endTurn();
        this.room.log(this + " сбрасывает карту");
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
        this.send({ messagetype: 'gamelog', gamelog: this.room.gamelog });
    }

    addCards(v, p) {
        let additionalData = this.room.additionalData;
        let cardsArray = [];
        
        v.cards.forEach((c, i) => {

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
                    case "ShowAllCards":
                        if (v.playername != additionalData.Player.playername) break;
                        str.ShowTo = true;
                        str.cardnum = c.card.num;
                        break;

                }



            }


            cardsArray.push(str);
        });
        
            return { playername: v.playername, cardForExchangeOut: v.cardForExchangeOut, quarantineCount: v.quarantineCount, num: v.place, isDead: v.isDead, Infected: p.Infected, thing: p.thing, state: p.state, phase: p.phase, cards: cardsArray, exchange: null };


    }


}

module.exports = Player
