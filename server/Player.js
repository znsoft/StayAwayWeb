const Card = require('./Card')

class Player {
    constructor(clientDB, socket, roomid, playername, playerCaption, room, gamenum, quarantineCount = 0, Infected = false) {
        this.readyforstart = false;
        this.ip = null;
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
        this.Quarantine = null;
        this.avatar = null;
        this.isBurn = false;
        this.isReadyToStart = false;


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
        SelectCardAndPlayerForOutgoingExchange: 9,
        SelectCardForChain: 10,
        PanicConfessionTime: 11,
        PanicForgot: 12,
        PanicMeet: 13,
        PanicOneTwo: 14,
        DefendPlaceChange: 15,



    }

    isonline() {
        return this.socket.readyState == this.socket.OPEN;
    }

    send(data) {
        //console.log(data);
        data.timestamp = Date.now();
        let packet = JSON.stringify(data);
        this.socket.send(packet, { binary: false });
    }

    sendGUIDToPlayer() {
        this.lastseen = Date.now();
        this.send({ messagetype: 'playerguid', guid: this.cookieguid, playername: this.playername, roomname: this.roomid, password: this.room.password, quarantineCount: this.quarantineCount, infected: this.Infected, thing: this.thing, gamenum: this.gamenum });
    }

    insertPlayer() {
        this.room.log(this + " присоединился");
    }

    generateGUID() {
        return Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);
    }

    update(deckData) {


        if (!this.isonline()) {  return; }
        this.sendplayers(deckData);
        this.lastseen = Date.now();
        this.needupdate = false;

    }

    startPlay() {
        this.room.tableToDrop();
        this.opponent = this.room.nextplayer;
        this.phase = Player.Phases.Action;
        this.state = Player.States.SelectCard;
        this.getOneCardfromDeckForAction();
        this.room.log(this + " начинает ход");
        if (this.quarantineCount > 0) {
            this.quarantineCount--;
            if (this.quarantineCount == 0) {

                this.room.dropcards.push(this.Quarantine);
                this.Quarantine = null;
            }
        }


    }

    endTurn() {
        this.phase = Player.Phases.Exchange;
        this.state = Player.States.SelectCard;
        if (this.room.nextplayer.quarantineCount == 0 && this.quarantineCount == 0 && this.room.getDoor(this, this.room.nextplayer) == undefined) return;
        this.stopPlay();
        this.nowNextPlayer();

    }

    stopPlay() {
        this.phase = Player.Phases.Nothing;
        this.state = Player.States.Nothing;
        this.opponent = null;
    }


    findcardindex(place) {
        return this.cards.findIndex((v, i) => { return v.place == place });
        //return this.cards[cardindex];
    }

    nowNextPlayer() {

        this.stopPlay();
        let nextplayer = this.room.nextplayer;

        this.room.currentplayer = nextplayer;
        //this.room.calcNextPlayer();
        nextplayer.startPlay();

    }


    getOneCardfromDeckForAction() {
        this.room.giveOneCardfromDeckToPlayer(this);
        //this.cards.forEach((v, i) => { v.place = i });
    }

    dead() {
        this.dead2();
        return; 
        this.isDead = true;
        this.cards.forEach(v => this.room.dropcards.push(v));
        this.cards = [];
        this.stopPlay();
        this.room.killPlayer(this);
    }

    dead2() {
        this.cards.forEach(v => {
            this.room.dropcards.push(v);
            v.MoveFromTo({ type: "player", player: this, place: v.place }, { type: "drop" });
        });
        this.cards = [];
        this.stopPlay();
        this.isBurn = true;
        this.isDead = true;
        
    }   



    tableCard(place) {
        let index = this.findcardindex(place);
        let card = this.cards[index];
        card.MoveFromTo({ type: "player", player: this, place: place }, { type: "table" });
        this.room.tablecards.push(card);
        //console.log(place + ' ' + this.cards.length)
        this.cards.splice(index, 1);
        this.cards.forEach((v, i) => { v.place = i });
        //console.log('cards ' + this.cards.length)
    }

    dropOneCard(place) {
        let index = this.findcardindex(place);
        let card = this.cards[index];
        card.MoveFromTo({ type: "player", player: this, place: place }, { type: "drop" });
        this.room.dropcards.push(this.cards[index]);

        this.cards.splice(index, 1);
        this.cards.forEach((v, i) => { v.place = i });
    }

    ShowYourCardToPlayer(player, place) {
        let cardindex = this.findcardindex(place);
        let card = this.cards[cardindex];
        this.room.ShowMyCardToPlayer(player, this, card);

    }

    ExchangePlace(nextplayer) {
        let place = nextplayer.place;
        nextplayer.place = this.place;
        this.place = place;
        this.room.calcNextPlayer();
        this.room.log(nextplayer + " пересаживается");

    }

    dropQuarantine() {

        if (this.quarantineCount > 0) this.room.dropcards.push(this.Quarantine);
        this.quarantineCount = 0;
        this.Quarantine = null;


    }

    actionPanic(data) {
        if (this.phase != Player.Phases.Action) throw 'Error is not you Action now';
        if (this.state != Player.States.SelectCard) throw 'Error is not you state now';
        let cardindex = this.findcardindex(data.place);
        let mycard = this.cards[cardindex];
        if (!mycard.card.isPanic) throw 'Вы выбрали не панику';
        this.tableCard(data.place);
        this.phase = Player.Phases.SecondAction;
        this.room.log(this + " паникует ");
        switch (mycard.card) {
            case Card.CardsByPlayers.PanicBetweenUs:
                //"Покажите все карты на руке соседнему игроку по вашему выбору"
                this.state = Player.States.SelectPlayer;


                break;
            case Card.CardsByPlayers.PanicChain:
                //"каждый игрок одновременно с остальными отдает одну карту следующему по порядку хода игроку. игнорируя все сыгранные карты карантин и заколоченная дверь. вы не можете отказаться от обмена. нечто может заразить другого передав заражение. ваш ход заканчивается"
                this.room.isPanicChain = true;
                this.room.players.forEach((v, k) => {
                    v.state = Player.States.SelectCardForChain;
                    v.phase = Player.Phases.SecondAction;
                });
                break;
            case Card.CardsByPlayers.PanicConfessionTime:
                //"Время признаний", "Начиная с вас и по порядку хода каждый показывает либо не показывает все карты на руке остальным игрокам. Время признаний завершается когда кто то из игроков показывает карту заражения"
                this.state = Player.States.PanicConfessionTime;
                this.room.PanicConfessionTime = this;
                this.room.log("время признаний для " + this);
                break;
            case Card.CardsByPlayers.PanicForgot:
                //"Забывчивость", "Сбросьте три карты с руки и возьмите 3 новые карты из колоды, сбрасывая паники ", "/forgot.jpg", null, null, Algoritms.Panic, null, true),
                this.state = Player.States.PanicForgot;

                break;
            case Card.CardsByPlayers.PanicFriend:
                //"Давай дружить", "поменяйтесь одной картой с любым игроком если он не на карантине", "/friend.jpeg", null, null, Algoritms.Panic, null, true),
                this.state = Player.States.SelectCardAndPlayerForOutgoingExchange;

                break;
            case Card.CardsByPlayers.PanicGoAway:
                //"Убирайся прочь", "Поменяйтесь местами с любым игроком если он не на карантине", "/goaway.jpg", null, null, Algoritms.Panic, null, true),
                this.state = Player.States.SelectPlayer;

                break;
            case Card.CardsByPlayers.PanicMeet:
                //"Свидание вслепую", "Поменяйте одну карту с руки на верхнюю карту колоды сбрасывая паники. 
                //Ваш ход заканчивается", "/meet.jpg", null, null, Algoritms.Panic, null, true),
                this.state = Player.States.PanicMeet;
                break;
            case Card.CardsByPlayers.PanicOldRopes:
                //"Старые веревки", "Все сыгранные карты карантин сбрасываются", "/oldropes.jpg", null, null, Algoritms.Panic, null, true),
                this.room.dropAllQuarantine();
                this.endTurn();
                break;
            case Card.CardsByPlayers.PanicOneTwo:
                //"Раз два", "Поменяйтесь местами с третим от вас игроком слева или справа (по вашему выбору). 
                //Игнорируйте все заколоченные двери. Если игрок на карантине, смены мес т не происходит", "/onetwo.jpg", null, null, Algoritms.Panic, null, true),
                this.state = Player.States.PanicOneTwo;
                //this.endTurn();
                break;
            case Card.CardsByPlayers.PanicParty:
                //"Вечеринка", "Все сыгранные карты карантин и заколоченная дверь сбрасываются. 
                //Затем начиная с вас и по часовой стрелке все парами меняются местами. 
                //в случае нечетного числа игроков последний игрок остается на месте", "/party.jpeg", null, null, Algoritms.Panic, null, true),
                this.room.dropAllQuarantine();
                this.room.dropAllDoors();


                let size = this.room.players.size;
                let central = this.place;

                let sortedPlayersfromThis = this.room.playersArray.sort((a, b) => {
                    let newplaceA = a.place - central;
                    if (newplaceA < 0) newplaceA += size;
                    let newplaceB = b.place - central;
                    if (newplaceB < 0) newplaceB += size;
                    return newplaceA - newplaceB;
                });

                for (let i = Math.floor(sortedPlayersfromThis.length / 2); i > 0; i--) {
                    let p1 = sortedPlayersfromThis[i * 2 - 1];
                    let p2 = sortedPlayersfromThis[i * 2 - 2];
                    p1.ExchangePlace(p2);
                }

                this.endTurn();
                this.room.log(" все парами поменялись местами ");
                break;
            case Card.CardsByPlayers.PanicThreeFour:
                //"Три четыре", "Все сыгранные карты закалоченная дверь сбрасываются", "/pthreefour.webp", null, null, Algoritms.Panic, null, true),
                this.room.dropAllDoors();
                this.endTurn();
                break;
            case Card.CardsByPlayers.PanicUPS:
                //"Уупс", "Покажите все свои карты на руке остальным игрокам", "/ups.jpg", null, null, Algoritms.Panic, null, true),
                this.endTurn();
                this.room.ShowMyCardsToAll(this);

                break;
        }

    }


    nowNexPlayerForPanicConfessionTime() {
        this.stopPlay();
        let nextplayer = this.room.nextplayer;
        if (nextplayer == this.room.PanicConfessionTime) { this.endPanicConfessionTime(); return; }
        nextplayer.state = Player.States.PanicConfessionTime;
        nextplayer.phase = Player.Phases.SecondAction;
        this.room.currentplayer = nextplayer;
        this.room.log("время признаний для " + nextplayer);
    }


    endPanicConfessionTime() {
        this.stopPlay();
        this.room.currentplayer = this.room.PanicConfessionTime;
        this.room.PanicConfessionTime = null;
        this.room.tableToDrop();
        this.room.currentplayer.endTurn();
        this.room.log("время признаний закончилось");
    }



    actionPanicConfessionTime(data) {
        this.room.ShowMyCardsToAll(this);
        this.room.log(this + " показывает карты ");
        this.nowNexPlayerForPanicConfessionTime();
    }

    actionPanicNoConfessionTime(data) {
        // this.room.ShowMyCardsToAll(this);
        this.room.log(this + " не показывает карты. ай яй");
        this.nowNexPlayerForPanicConfessionTime();
    }

    actionPanicStopConfessionTime(data) {
        this.room.ShowMyCardToAll(this, data.place);
        //this.room.ShowMyCardsToAll(this);
        this.room.log(this + " остановил время признаний");

    }


    actionAxe(data) {
        if (this.phase != Player.Phases.Action) throw 'Error is not you action now';
        if (this.state != Player.States.SelectCard) throw 'Error is not you state now';
        let otherPlayerName = data.otherPlayerName;
        let nextplayer = this.room.getPlayerByPlayerName(otherPlayerName);
        if (this.room.getDoor(this, nextplayer) == undefined && nextplayer.quarantineCount == 0) throw 'игрок не на карантине и между вами нет двери';

        let bymycardplace = data.bymycardplace;
        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.Axe) throw 'Error is not Axe card';
        this.tableCard(bymycardplace);
        this.room.removeDoor(this, nextplayer);
        nextplayer.dropQuarantine();
        this.room.log(this + " топор на  " + nextplayer);
        this.endTurn();
    }

    actionDoor(data) {
        if (this.phase != Player.Phases.Action) throw 'Error is not you action now';
        if (this.state != Player.States.SelectCard) throw 'Error is not you state now';
        let otherPlayerName = data.otherPlayerName;
        let nextplayer = this.room.getPlayerByPlayerName(otherPlayerName);
        if (this.room.getDoor(this, nextplayer) != undefined) throw 'Door is set between you';

        let bymycardplace = data.bymycardplace;
        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.Door) throw 'Error is not Door card';
        this.cards.splice(cardindex, 1);
        this.room.Door(this, nextplayer, mycard);
        this.room.log(this + " поставил дверь между  " + nextplayer);
        this.endTurn();
    }


    actionQuarantine(data) {
        if (this.phase != Player.Phases.Action) throw 'Error is not you action now';
        if (this.state != Player.States.SelectCard) throw 'Error is not you state now';

        let otherPlayerName = data.otherPlayerName;
        let nextplayer = this.room.getPlayerByPlayerName(otherPlayerName);
        if (this.room.getDoor(this, nextplayer) != undefined) throw 'Door is set between you';
        let bymycardplace = data.bymycardplace;

        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.Quarantine) throw 'Error is not Quarantine card';
        this.cards.splice(cardindex, 1);
        nextplayer.Quarantine = mycard;
        nextplayer.quarantineCount = 3;

        this.room.log(this + " посадил на карантин " + nextplayer);
        this.endTurn();
    }

    actionPanicGoAway(data) {

        if (this.phase != Player.Phases.SecondAction) throw 'Error is not you action now';
        if (this.state != Player.States.SelectPlayer) throw 'Error is not you state now';
        let otherPlayerName = data.opponent;
        let nextplayer = this.room.getPlayerByPlayerName(otherPlayerName);

        this.room.log(this + " меняется местами по панике с " + nextplayer);
        nextplayer.stopPlay();
        this.ExchangePlace(nextplayer);
        this.endTurn();

    }

    actionPanicForgot(data) {
        let cardindex = this.findcardindex(data.place);
        let mycard = this.cards[cardindex];
        //if (mycard.card == Card.CardsByPlayers.Thing) throw 'Эту карту нельзя скинуть';
        this.cards.splice(cardindex, 1);
        this.cards.forEach(v => {
            v.MoveFromTo({ type: "player", player: this }, { type: "drop" });
            this.room.dropcards.push(v);
        });
        this.cards = [];
        this.cards.push(mycard);
        for (let i = 3; i > 0; i--)        this.room.giveOneActionCardfromDeckToPlayer(this);
        this.cards.forEach((v, i) => { v.place = i });

        this.endTurn();
        //this.room.nowNextPlayer();
        this.room.log(this + " разменял 3 карты из колоды");


    }

    actionPanicOneTwo(data) {

        if (this.phase != Player.Phases.SecondAction) throw 'Error is not you action now';
        if (this.state != Player.States.PanicOneTwo) throw 'Error is not you state now';
        let otherPlayerName = data.otherPlayerName;
        let nextplayer = this.room.getPlayerByPlayerName(otherPlayerName);
        this.room.log(this + " меняется местами с " + nextplayer);
        nextplayer.stopPlay();
        this.ExchangePlace(nextplayer);
        this.endTurn();
    }

    actionPanicMeet(data) {
        let cardindex = this.findcardindex(data.place);
        let mycard = this.cards[cardindex];
        if (mycard.card == Card.CardsByPlayers.Thing) throw 'Эту карту нельзя скинуть';
        this.cards.splice(cardindex, 1);
        this.room.giveOneActionCardfromDeckToPlayer(this);
        this.cards.forEach((v, i) => { v.place = i });
        mycard.MoveFromTo({ type: "player", player: this }, { type: "deck" });
        this.room.deckcards.push(mycard);
        this.room.log(this + " подложил карту в колоду");
        this.stopPlay();
        this.room.nowNextPlayer();
    }


    actionChangeDirection(data) {
        if (this.phase != Player.Phases.Action) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you Action now');
        if (this.state != Player.States.SelectCard) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you state now');
        let cardindex = this.findcardindex(data.place);
        let mycard = this.cards[cardindex];
        if (mycard.card != Card.CardsByPlayers.ChangeDirection) throw 'Это не карта гляди по сторонам';
        this.tableCard(data.place);
        this.room.direction = this.room.direction == 0 ? 1 : 0;
        this.room.calcNextPlayer();
        this.endTurn();
        this.room.log(this + " развернул ход игры");
    }

    actionSelectPerseverance(data) {
        if (this.phase != Player.Phases.SecondAction) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you Action now');
        if (this.state != Player.States.PerseveranceSelectCard) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you state now');
        let card = this.Perseverance[data.place];
        this.cards.push(card);
        this.cards.forEach((v, i) => { v.place = i });
        this.Perseverance.splice(data.place, 1);
        this.Perseverance.forEach(v => {
            //v.MoveFromTo("")
            this.room.dropcards.push(v);
        });
        this.Perseverance = [];
        this.phase = Player.Phases.Action;
        this.state = Player.States.SelectCard;
        this.room.log(this + " выбрал карту и продолжает ход");
        this.room.tableToDrop();
    }


    actionStartPerseverance(data) {
        if (this.phase != Player.Phases.Action) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you Action now');
        if (this.state != Player.States.SelectCard) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you state now');
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
        if (this.phase != Player.Phases.Action) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you Action now');
        if (this.state != Player.States.SelectCard) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you state now');
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

        mycard.LineTo({ type: "player", player: nextplayer });
        if(this.cardForExchangeOut!=null)this.clearCardForExchangeOut(this);
        //card.MoveFromTo({type:"door",place:k}, {type: "drop"});
        this.cardForExchangeOut = data.place;
        this.state = Player.States.OutgoingExchange;
        if (this.room.isPanicChain) {

            this.room.ChainPanicEnd();


        } else {
            if (this.state != Player.States.SelectCardAndPlayerForOutgoingExchange &&
                this.phase != Player.Phases.SecondAction)
                if (this.room.getDoor(this, nextplayer) != undefined && this.state != Player.States.SelectCardAndPlayerForOutgoingExchange) throw 'Door is set between you';
            if (nextplayer.quarantineCount > 0) throw 'player on quarantine';

            nextplayer.phase = Player.Phases.Answer;
            nextplayer.state = Player.States.IncomeExchange;

            this.room.log(this + " обменивается картами с " + nextplayer);
        }


    }

    clearCardForExchangeOut(nextplayer){

        let cardindex = nextplayer.findcardindex(nextplayer.cardForExchangeOut);
        let cardForExchangeOut = nextplayer.cards[cardindex];
        cardForExchangeOut.ClearLineTo();
        nextplayer.cardForExchangeOut = null;
    }

    lineToCardForExchangeOut(nextplayer,to){

        let cardindex = nextplayer.findcardindex(nextplayer.cardForExchangeOut);
        let cardForExchangeOut = nextplayer.cards[cardindex];
        cardForExchangeOut.LineTo(to);
        
    }


    actionMist(data) {
        if (this.phase != Player.Phases.Answer) throw 'Error is not you answer now';
        if (this.state != Player.States.IncomeExchange) throw 'Error is not you state now';
        let nextplayer = this.room.getPlayerByPlayerName(data.opponent);
        if (nextplayer.cardForExchangeOut == null) throw 'Error no card for exchange';

        let mycardindex = this.findcardindex(data.place);
        let mycard = this.cards[mycardindex];
        if (mycard.card != Card.CardsByPlayers.Past) throw 'Error no card for reject exchange';
        //this.cards.splice(mycardindex, 1);
        this.dropOneCard(data.place);

        this.room.giveOneActionCardfromDeckToPlayer(this);
        this.stopPlay();

        let exchange2 = this.room.getNextPlayerFor(this);
        exchange2.phase = Player.Phases.Answer;
        exchange2.state = Player.States.IncomeExchange;
        this.lineToCardForExchangeOut(nextplayer,{ type: "player", player: exchange2 });
        this.room.log(this + " сыграл мимо");

    }

    actionFear(data) {
        if (this.phase != Player.Phases.Answer) throw 'Error is not you answer now';
        if (this.state != Player.States.IncomeExchange) throw 'Error is not you state now';
        let nextplayer = this.room.getPlayerByPlayerName(data.opponent);
        if (nextplayer.cardForExchangeOut == null) throw 'Error no card for exchange';

        let mycardindex = this.findcardindex(data.place);
        let mycard = this.cards[mycardindex];
        if (mycard.card != Card.CardsByPlayers.Fear) throw 'Error no card for reject exchange';
        //this.cards.splice(mycardindex, 1);
        this.dropOneCard(data.place);
 
        nextplayer.ShowYourCardToPlayer(this, nextplayer.cardForExchangeOut);
        this.clearCardForExchangeOut(nextplayer);
        //this.tableCard(bymycardplace);
        this.room.giveOneActionCardfromDeckToPlayer(this);
        this.stopPlay();
        this.room.nowNextPlayer();
        //this.room.currentplayer.endTurn();

        this.room.log(this + " отклонил и посмотрел");

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
        
        this.clearCardForExchangeOut(nextplayer);

        //this.tableCard(bymycardplace);
        this.room.giveOneActionCardfromDeckToPlayer(this);
        this.stopPlay();
        //this.room.currentplayer.endTurn();
        this.room.nowNextPlayer();

        this.room.log(this + " отклонил. нет спасибо");

    }

    actioninExchangeCard(data) {
        if (this.phase != Player.Phases.Answer) throw 'Error is not you answer now';
        if (this.state != Player.States.IncomeExchange) throw 'Error is not you state now';
        let nextplayer = this.room.getPlayerByPlayerName(data.opponent);
        if (nextplayer.cardForExchangeOut == null) throw 'Error no card for exchange';

        let othercardindex = nextplayer.findcardindex(nextplayer.cardForExchangeOut);
        let othercard = nextplayer.cards[othercardindex];
        othercard.MoveFromTo({ type: "player", player: nextplayer, place: nextplayer.cardForExchangeOut }, { type: "player", player: this });
        if (othercard.card == Card.CardsByPlayers.Infect) this.Infected = true;
        this.clearCardForExchangeOut(nextplayer);
        nextplayer.cards.splice(othercardindex, 1);

        let mycardindex = this.findcardindex(data.place);
        let mycard = this.cards[mycardindex];
        mycard.MoveFromTo({ type: "player", player: this, place: mycard.place }, { type: "player", player: nextplayer });
        if (mycard.card == Card.CardsByPlayers.Infect) nextplayer.Infected = true;
        this.cards.splice(mycardindex, 1);

        nextplayer.cards.push(mycard);

        this.cards.push(othercard);
        this.cards.forEach((v, i) => { v.place = i });

        nextplayer.cards.forEach((v, i) => { v.place = i });

        nextplayer.stopPlay();
        
        this.nowNextPlayer();
    }

    IncomeExchange(nextplayer) {
        if (nextplayer.cardForExchangeOut == null) this.room.CheckAndTryRestoreGameWhenError(this, 'Error no card for exchange');

        let othercardindex = nextplayer.findcardindex(nextplayer.cardForExchangeOut);
        let othercard = nextplayer.cards[othercardindex];
        if (othercard.card == Card.CardsByPlayers.Infect) this.Infected = true;
        othercard.MoveFromTo({ type: "player", player: nextplayer, place: nextplayer.cardForExchangeOut }, { type: "player", player: this });
        this.clearCardForExchangeOut(nextplayer);

        nextplayer.cards.splice(othercardindex, 1);

        this.cards.push(othercard);

        this.cards.forEach((v, i) => { v.place = i });

    }

    actionAnalysis(data) {
        if (this.phase != Player.Phases.Action) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you action now');
        if (this.state != Player.States.SelectCard) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you state now');
        let nextplayer = this.room.getPlayerByPlayerName(data.otherPlayerName);
        if (this.room.getDoor(this, nextplayer) != undefined) throw 'Door is set between you';
        if (nextplayer.quarantineCount > 0) throw 'player on quarantine';
        let bymycardplace = data.place;


        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.Analysis) throw 'Error is not Analysis card';
        this.tableCard(bymycardplace);
        this.endTurn();
        this.room.ShowMyCardsTo(this, nextplayer);

        this.room.log(this + " анализирует карты " + nextplayer);



    }

    actionShowAllCards(data) {
        if (this.phase != Player.Phases.Action) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you action now');
        if (this.state != Player.States.SelectCard) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you state now');

        let bymycardplace = data.place;


        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.Whiski) throw 'Error is not Whiski card';

        this.tableCard(bymycardplace);
        this.endTurn();
        this.room.ShowMyCardsToAll(this);
        this.room.log(this + " показывает карты всем");

    }

    actionShowAllCardsTo(data) {
        if (this.phase != Player.Phases.SecondAction) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you action now');
        if (this.state != Player.States.SelectPlayer) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you state now');

        let nextplayer = this.room.getPlayerByPlayerName(data.otherPlayerName);
       /// if (this.room.getDoor(this, nextplayer) != undefined) throw 'Door is set between you';
       // if (nextplayer.quarantineCount > 0) throw 'player on quarantine';

        this.endTurn();
        this.room.ShowMyCardsTo(nextplayer,this );

        this.room.log(this + " показал все карты " + nextplayer);

    }



    actionChangePlace(data) {
        if (this.phase != Player.Phases.Action) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you action now');
        if (this.state != Player.States.SelectCard) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you state now');
        let otherPlayerName = data.otherPlayerName;
        let nextplayer = this.room.getPlayerByPlayerName(otherPlayerName);

        // let otherCardPlace = data.place;
        let bymycardplace = data.bymycardplace;

        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.GetOff) throw 'Error is not ChangePlace card';

        //console.log(this.playername + " try Burn " + otherPlayerName);
        this.tableCard(bymycardplace);

        this.state = Player.States.Nothing;
        nextplayer.phase = Player.Phases.Answer;
        nextplayer.state = Player.States.DefendPlaceChange;
        this.room.log(this + " меняется местами с " + nextplayer);

        let defend = nextplayer.cards.filter((v) =>
            v.card.num == Card.CardsByPlayers.StayHere.num);
        //console.log(defend);
        if (defend.length > 0) { this.room.log(nextplayer + " есть чем отказать "); return; }

        nextplayer.stopPlay();
        this.ExchangePlace(nextplayer);
        this.endTurn();

    }

    actionChangePlaceNear(data) {
        if (this.phase != Player.Phases.Action) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you action now');
        if (this.state != Player.States.SelectCard) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you state now');
        let otherPlayerName = data.otherPlayerName;
        let nextplayer = this.room.getPlayerByPlayerName(otherPlayerName);
        if (this.room.getDoor(this, nextplayer) != undefined) throw 'Door is set between you';
        if (nextplayer.quarantineCount > 0) throw 'player on quarantine';
        let bymycardplace = data.bymycardplace;

        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.ChangePlace) throw 'Error is not ChangePlace card';

        //console.log(this.playername + " try Burn " + otherPlayerName);
        this.tableCard(bymycardplace);

        this.state = Player.States.Nothing;
        nextplayer.phase = Player.Phases.Answer;
        nextplayer.state = Player.States.DefendPlaceChange;
        this.room.log(this + " меняется местами с " + nextplayer);
        let defend = nextplayer.cards.filter((v) =>
            v.card.num == Card.CardsByPlayers.StayHere.num);
        //console.log(defend);
        if (defend.length > 0) return;
        nextplayer.stopPlay();
        this.ExchangePlace(nextplayer);

        this.endTurn();

    }

    actionAcceptChangePlace(data) {
        if (this.phase != Player.Phases.Answer) throw 'Error is not you answer now';
        if (this.state != Player.States.DefendPlaceChange) throw 'Error is not you defend now';
        this.room.currentplayer.ExchangePlace(this);
        this.room.tableToDrop();
        this.stopPlay();
        this.room.currentplayer.endTurn();
    }

    actionDefendFromChangePlace(data) {
        if (this.phase != Player.Phases.Answer) throw 'Error is not you answer now';
        if (this.state != Player.States.DefendPlaceChange) throw 'Error is not you defend now';
        let bymycardplace = data.bymycardplace;

        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.StayHere) throw 'Error is not defend card';
        this.room.tableToDrop();
        //console.log(this.playername + " defend from fire ");
        //this.tableCard(bymycardplace);
        this.dropOneCard(bymycardplace);
        this.room.giveOneActionCardfromDeckToPlayer(this);
        this.stopPlay();
        this.room.currentplayer.endTurn();

        this.room.log(this + " не хочет меняться местами");

    }

    actionPrepareBurn(data) {
        if (this.phase != Player.Phases.Action) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you action now');
        if (this.state != Player.States.SelectCard) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you state now');
        if (this.quarantineCount > 0) throw 'Вы на карантине';
        // let otherCardPlace = data.place;
        let bymycardplace = data.bymycardplace;

        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.BurnFire) throw 'Это не огнемет';
        this.tableCard(bymycardplace);

        this.state = Player.States.SelectPlayer;
        this.phase = Player.Phases.SecondAction;
        this.room.log(this + " играет огнемет");
    }

    actionBurnPlayer2(data) {
        if (this.phase != Player.Phases.SecondAction) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you action now');
        if (this.state != Player.States.SelectPlayer) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you state now');
        let otherPlayerName = data.otherPlayerName;
        let nextplayer = this.room.getPlayerByPlayerName(otherPlayerName);
        if (this.room.getDoor(this, nextplayer) != undefined) throw 'Door is set between you';
        if (nextplayer.quarantineCount > 0) throw 'player on quarantine';
        // let otherCardPlace = data.place;

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
        nextplayer.send({ messagetype: 'youburned', text: "вас сжег " + this })
        this.endTurn();
    }

    actionBurnPlayer(data) {
        if (this.phase != Player.Phases.Action) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you action now');
        if (this.state != Player.States.SelectCard) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you state now');
        let otherPlayerName = data.otherPlayerName;
        let nextplayer = this.room.getPlayerByPlayerName(otherPlayerName);
        if (this.room.getDoor(this, nextplayer) != undefined) throw 'Door is set between you';
        if (nextplayer.quarantineCount > 0) throw 'player on quarantine';
        // let otherCardPlace = data.place;
        let bymycardplace = data.bymycardplace;

        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.BurnFire) throw 'Это не огнемет';
        if (nextplayer.thing == true && this.Infected == true) throw 'Вы заражены и не можете сжечь нечто';
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
        nextplayer.send({ messagetype: 'youburned', text: "вас сжег " + this })
        this.endTurn();
    }

    actionDefendFromFire(data) {
        if (this.phase != Player.Phases.Answer) throw 'Error is not you answer now';
        if (this.state != Player.States.DefendFireSelectCard) throw 'Error is not you defend now';
        let bymycardplace = data.bymycardplace;

        let cardindex = this.findcardindex(bymycardplace);
        let mycard = this.cards[cardindex]; //
        if (mycard.card != Card.CardsByPlayers.FireResist) throw 'Error is not defend card';
        this.room.tableToDrop();
        console.log(this.playername + " defend from fire ");
        this.tableCard(bymycardplace);
        this.room.giveOneActionCardfromDeckToPlayer(this);
        this.stopPlay();
        this.room.currentplayer.endTurn();

        this.room.log(this + " никакого шашлыка");

    }


    actionShowMeCard(data) {
        if (this.phase != Player.Phases.Action) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you action now');
        if (this.state != Player.States.SelectCard) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you state now');
        let otherPlayerName = data.otherPlayerName;
        let nextplayer = this.room.getPlayerByPlayerName(otherPlayerName);
        if (this.room.getDoor(this, nextplayer) != undefined) throw 'Door is set between you';
        if (nextplayer.quarantineCount > 0) throw 'player on quarantine';
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


    actionDropCard(data) {
        if (this.phase != Player.Phases.Action) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you action now');
        if (this.state != Player.States.SelectCard) this.room.CheckAndTryRestoreGameWhenError(this, 'Error is not you state now');

        let cardplace = data.place;
        this.dropOneCard(cardplace);
        this.endTurn();
        this.room.log(this + " сбрасывает карту");
    }

    sendplayers(deckData) {
        if (this.room.nextplayer == null) return;
        let nextplayer = this.room.nextplayer.place;
        let currentplayer = this.room.currentplayer.place;
        let opponent =  this.room.getNextPlayerFor(this.room.currentplayer).place;// this.room.nextplayer.place;
        if (this.place != currentplayer) opponent = currentplayer;
        if (this.room.isPanicChain == true) {
            opponent = this.room.getNextPlayerFor(this).place;
        }
        let exchange = [];

        exchange.push(this.addCards(this, this));

        this.room.players.forEach((v, k) => {
            let p;
            if (v.playername == this.playername) { return; }

            else p = new Player(null, null, null, v.playername, null, null, v.quarantineCount);
            p.place = v.place;
            p.state = v.state;
            p.phase = v.phase;


            if (this.thing == true || this.room.gamestarted == false) p.Infected = v.Infected;//покажем нечте зараженных
            if (this.Infected == true || this.room.gamestarted == false) p.thing = v.thing;//покажем зараженным нечту

            exchange.push(this.addCards(v, p));
        });


        this.lastseen = Date.now;
        this.needupdate = false;
        //console.log()
        this.send({ messagetype: 'playerlist', playerlist: exchange, deck: deckData, nextplayer: nextplayer, currentplayer: currentplayer, opponent: opponent });
        //this.send({ messagetype: 'gamelog', gamelog: this.room.gamelog });
    }

    addCards(v, p) {
        let additionalData = this.room.additionalData;
        let cardsArray = [];
        let Perseverancecards = [];
        v.Perseverance.forEach((c, i) => {
            if (v.playername == this.playername) {
                Perseverancecards.push({ cardnum: c.card.num, cardplace: i })
            } else {
                Perseverancecards.push({ cardnum: Card.CardsByPlayers.UnknownAction.num, cardplace: i });
            }
        });



        v.cards.forEach((c, i) => {

            let cardplace = c.place;

            let str = { cardnum: -1, cardplace: cardplace };
            if (v.playername == this.playername || c.card.isPanic) str = { cardnum: c.card.num, cardplace: cardplace };
            c.GetMoveOut(str, v);
            if (v.cardForExchangeOut == cardplace) str.ShowTo = true;
            if (additionalData != undefined) {
                switch (additionalData.action) {
                    case "ShowOneCardToAll":

                        if (additionalData.Card.place != cardplace) break;
                        //console.log(additionalData);
                        if (v.playername != additionalData.PlayerFrom.playername) break;
                        str.ShowTo = true;
                        //str.toPlayer = additionalData.PlayerTo.playername;
                        //if (this.playername == additionalData.PlayerTo.playername)
                        str.cardnum = c.card.num;
                        break;
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
                    case "ShowAllCardsTo":
                        //PlayerTo: playerTo, PlayerFrom: playerFrom 
                        console.log(additionalData.PlayerFrom.playername);
                        if (v != additionalData.PlayerFrom) break;
                        console.log(additionalData.PlayerTo.playername);
                        str.ShowTo = true;
                        if (this == additionalData.PlayerTo) str.cardnum = c.card.num;
                        break;



                }



            }


            cardsArray.push(str);
        });

        return {
            playername: v.playername,
            avatar:v.avatar,
            cardForExchangeOut: v.cardForExchangeOut,
            Perseverance: Perseverancecards.length == 0 ? undefined : Perseverancecards,
            quarantineCount: v.quarantineCount,
            num: v.place,
            isDead: v.isDead,
            Infected: p.Infected,
            thing: p.thing,
            state: p.state,
            phase: p.phase,
            cards: cardsArray, exchange: null
        };


    }


}

module.exports = Player
