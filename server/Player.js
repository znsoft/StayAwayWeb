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
        this.opponent = null;
        this.Perseverance = [];
    }

    toString() {
        return this.playername;
    }

    static Phases = {
        Nothing: 0,
        Exchange: 1,
        Action: 2,
        Answer: 3,
        SecondAction: 4

    }

    static States = {
        Nothing: 0,
        SelectCard: 2,
        OutgoingExchange: 3,
        IncomeExchange: 4,
        PerseveranceSelectCard: 5,
        SelectPlayer: 6,
        DefendFireSelectCard: 7,
        Panic: 8,
        SelectCardAndPlayerForOutgoingExchange: 9


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

    actionPanic(data){
        if (this.phase != Player.Phases.Action) throw 'Error is not you Action now';
        if (this.state != Player.States.SelectCard) throw 'Error is not you state now';
        let cardindex = this.findcardindex(data.place);
        let mycard = this.cards[cardindex];
        if(!mycard.card.isPanic)throw 'Вы выбрали не панику';
        this.tableCard(data.place);
        this.phase = Player.Phases.SecondAction;

        switch(mycard.card){
            case Card.CardsByPlayers.PanicBetweenUs:
                //"Покажите все карты на руке соседнему игроку по вашему выбору"
                this.state = Player.States.SelectPlayerForShowCards;


                break;
            case Card.CardsByPlayers.PanicChain:
                //"каждый игрок одновременно с остальными отдает одну карту следующему по порядку хода игроку. игнорируя все сыгранные карты карантин и заколоченная дверь. вы не можете отказаться от обмена. нечто может заразить другого передав заражение. ваш ход заканчивается"
                this.state = Player.States.SelectCardForChain;

                break;
            case Card.CardsByPlayers.PanicConfessionTime:
                //"Время признаний", "Начиная с вас и по порядку хода каждый показывает либо не показывает все карты на руке остальным игрокам. Время признаний завершается когда кто то из игроков показывает карту заражения"
                this.state = Player.States.PanicConfessionTime;

                break;
            case Card.CardsByPlayers.PanicForgot:
                //"Забывчивость", "Сбросьте три карты с руки и возьмите 3 новые карты из колоды, сбрасывая паники ", "/forgot.jpg", null, null, Algoritms.Panic, null, true),
                this.state = Player.States.PanicForgot;

                break;
            case Card.CardsByPlayers.PanicFriend:
                //"Давай дружить", "поменяйтесь одной картой с любым игроком если он не на карантине", "/friend.jpeg", null, null, Algoritms.Panic, null, true),
                this.state = Player.States.PanicFriend;

            break;
            case Card.CardsByPlayers.PanicGoAway:
                //"Убирайся прочь", "Поменяйтесь местами с любым игроком если он не на карантине", "/goaway.jpg", null, null, Algoritms.Panic, null, true),


            break;
            case Card.CardsByPlayers.PanicMeet:
                //"Свидание вслепую", "Поменяйте одну карту с руки на верхнюю карту колоды сбрасывая паники. Ваш ход заканчивается", "/meet.jpg", null, null, Algoritms.Panic, null, true),


            break;
            case Card.CardsByPlayers.PanicOldRopes:
                //"Старые веревки", "Все сыгранные карты карантин сбрасываются", "/oldropes.jpg", null, null, Algoritms.Panic, null, true),

                break;
            case Card.CardsByPlayers.PanicOneTwo:
                //"Раз два", "Поменяйтесь местами с третим от вас игроком слева или справа (по вашему выбору). Игнорируйте все заколоченные двери. Если игрок на карантине, смены мес т не происходит", "/onetwo.jpg", null, null, Algoritms.Panic, null, true),

                break;
            case Card.CardsByPlayers.PanicParty:
                //"Вечеринка", "Все сыгранные карты карантин и заколоченная дверь сбрасываются. Затем начиная с вас и по часовой стрелке все парами меняются местами. в случае нечетного числа игроков последний игрок остается на месте", "/party.jpeg", null, null, Algoritms.Panic, null, true),

                break;
            case Card.CardsByPlayers.PanicThreeFour:
                //"Три четыре", "Все сыгранные карты закалоченная дверь сбрасываются", "/pthreefour.webp", null, null, Algoritms.Panic, null, true),

                break;
            case Card.CardsByPlayers.PanicUPS:
                //"Уупс", "Покажите все свои карты на руке остальным игрокам", "/ups.jpg", null, null, Algoritms.Panic, null, true),


                break;



        }

        
        

        

        //this.endTurn();

        this.room.log(this + " паникует ");


    }

    actionChangeDirection(data) {
        if (this.phase != Player.Phases.Action) throw 'Error is not you Action now';
        if (this.state != Player.States.SelectCard) throw 'Error is not you state now';
        let cardindex = this.findcardindex(data.place);
        let mycard = this.cards[cardindex];
        if (mycard.card != Card.CardsByPlayers.ChangeDirection) throw 'Это не карта гляди по сторонам';
        this.tableCard(data.place);
        this.room.direction = this.room.direction ==0?1:0;
        this.room.calcNextPlayer(); 
        this.endTurn();
        this.room.log(this + " развернул ход игры");
    }

    actionSelectPerseverance(data) {
        if (this.phase != Player.Phases.SecondAction) throw 'Error is not you Action now';
        if (this.state != Player.States.PerseveranceSelectCard) throw 'Error is not you state now';
        let card = this.Perseverance[data.place];
        this.cards.push(card);
        this.cards.forEach((v, i) => { v.place = i });
        this.Perseverance.splice(data.place, 1);
        this.Perseverance.forEach(v => this.room.dropcards.push(v));
        this.Perseverance = [];
        this.phase = Player.Phases.Action;
        this.state = Player.States.SelectCard;

        this.room.log(this + " выбрал карту и продолжает ход");
    }


    actionStartPerseverance(data) {
        if (this.phase != Player.Phases.Action) throw 'Error is not you Action now';
        if (this.state != Player.States.SelectCard) throw 'Error is not you state now';
        let cardindex = this.findcardindex(data.bymycardplace);
        let mycard = this.cards[cardindex];
        if (mycard.card != Card.CardsByPlayers.Perseverance) throw 'Это не карта упорство';
        this.state = Player.States.PerseveranceSelectCard;
        this.phase = Player.Phases.SecondAction;
        this.tableCard(data.bymycardplace);
        this.room.givethreePerseverenceCardsfromDeckToPlayer(this);
        this.room.log(this + " играет упорство");
    }

    actionStartTemptation(data) {
        if (this.phase != Player.Phases.Action) throw 'Error is not you Action now';
        if (this.state != Player.States.SelectCard) throw 'Error is not you state now';
        let cardindex = this.findcardindex(data.bymycardplace);
        let mycard = this.cards[cardindex];
        if (mycard.card != Card.CardsByPlayers.Temptation) throw 'Это не карта соблазн';
        this.state = Player.States.SelectCardAndPlayerForOutgoingExchange;
        this.phase = Player.Phases.SecondAction;
        this.tableCard(data.bymycardplace);
        //this.room.opponent = null;
        this.opponent = null;
        this.room.log(this + " играет соблазн");


    }

    actionoutExchangeCard(data) {
        //if (this.phase != Player.Phases.Exchange) throw 'Error is not you Exchange now';
        //if (this.state != Player.States.SelectCard)  throw 'Error is not you state now'; 
        let nextplayer = this.room.getPlayerByPlayerName(data.opponent);
        this.opponent = nextplayer;
        nextplayer.opponent = this;

        let cardindex = this.findcardindex(data.place);
        let mycard = this.cards[cardindex];
        if (mycard.card == Card.CardsByPlayers.Infect) {
            if (!(this.thing || nextplayer.thing && this.Infected)) throw 'you cant infect other, you not the thing';
        }


        this.cardForExchangeOut = data.place;
        this.state = Player.States.OutgoingExchange;
        nextplayer.phase = Player.Phases.Answer;
        nextplayer.state = Player.States.IncomeExchange;

        this.room.log(this + " обменивается картами с " + nextplayer);


    }

    startPlay() {
        this.opponent = this.room.nextplayer;
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
        this.opponent = null;
    }

    actionNoThanks(data) {
        if (this.phase != Player.Phases.Answer) throw 'Error is not you answer now';
        if (this.state != Player.States.IncomeExchange) throw 'Error is not you state now';
        let nextplayer = this.room.getPlayerByPlayerName(data.opponent);
        if (nextplayer.cardForExchangeOut == null) throw 'Error no card for exchange';

        let mycardindex = this.findcardindex(data.place);
        let mycard = this.cards[mycardindex];
        if (mycard.card != Card.CardsByPlayers.NoThanks) throw 'Error no card for reject exchange';
        //this.cards.splice(mycardindex, 1);
        this.dropOneCard(data.place);

        //nextplayer.cards.push(mycard);
        nextplayer.cardForExchangeOut == null

        //this.tableCard(bymycardplace);
        this.room.giveOneActionCardfromDeckToPlayer(this);
        this.stopPlay();
        this.room.currentplayer.endTurn();

        this.room.log(this + " отклонил. нет спасибо");

    }

    actioninExchangeCard(data) {
        if (this.phase != Player.Phases.Answer) throw 'Error is not you answer now';
        if (this.state != Player.States.IncomeExchange) throw 'Error is not you state now';
        let nextplayer = this.room.getPlayerByPlayerName(data.opponent);
        if (nextplayer.cardForExchangeOut == null) throw 'Error no card for exchange';

        let othercardindex = nextplayer.findcardindex(nextplayer.cardForExchangeOut);
        let othercard = nextplayer.cards[othercardindex];
        if (othercard.card == Card.CardsByPlayers.Infect) this.Infected = true;
        nextplayer.cards.splice(othercardindex, 1);
        let mycardindex = this.findcardindex(data.place);
        let mycard = this.cards[mycardindex];
        if (mycard.card == Card.CardsByPlayers.Infect) nextplayer.Infected = true;
        this.cards.splice(mycardindex, 1);
        nextplayer.cards.push(mycard);
        this.cards.push(othercard);
        this.cards.forEach((v, i) => { v.place = i });
        nextplayer.cards.forEach((v, i) => { v.place = i });
        nextplayer.stopPlay();
        nextplayer.cardForExchangeOut = null;
        this.nowNextPlayer();
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
        let defend = nextplayer.cards.filter((v) =>
            v.card.num == Card.CardsByPlayers.FireResist.num);
        //console.log(defend);
        if (defend.length > 0) return;
        this.room.log(nextplayer + " выбывает");
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


    dead() {
        this.isDead = true;
        this.cards.forEach(v => this.room.dropcards.push(v));
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
        if (this.state != Player.States.SelectCard) throw 'Error is not you state now';

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

            exchange.push(this.addCards(v, p));



        });


        this.lastseen = Date.now;
        this.needupdate = false;

        this.send({ messagetype: 'playerlist', playerlist: exchange, deck: deckData, nextplayer: nextplayer, currentplayer: currentplayer, opponent: opponent });
        this.send({ messagetype: 'gamelog', gamelog: this.room.gamelog });
    }

    addCards(v, p) {
        let additionalData = this.room.additionalData;
        let cardsArray = [];
        let Perseverancecards = [];
        if (v.playername == this.playername) v.Perseverance.forEach((c, i) => {
            Perseverancecards.push({ cardnum: c.card.num, cardplace: i });
        });



        v.cards.forEach((c, i) => {

            let cardplace = c.place;

            let str = { cardnum: -1, cardplace: cardplace };
            if (v.playername == this.playername || c.card.isPanic) str = { cardnum: c.card.num, cardplace: cardplace };

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

        return {
            playername: v.playername,
            cardForExchangeOut: v.cardForExchangeOut,
            Perseverance: Perseverancecards.length == 0 ? undefined : Perseverancecards,
            quarantineCount: v.quarantineCount,
            num: v.place,
            isDead: v.isDead,
            Infected: p.Infected,
            thing: p.thing,
            state: p.state, phase: p.phase, cards: cardsArray, exchange: null
        };


    }


}

module.exports = Player
