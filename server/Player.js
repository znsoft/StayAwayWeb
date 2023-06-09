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
        this.guid = this.generateGUID();
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
        this.send({ messagetype: 'playerguid', guid: this.guid, playername: this.playername, roomname: this.roomid, password: this.room.password, quarantineCount: this.quarantineCount, infected: this.Infected, thing: this.thing, gamenum: this.gamenum });
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
        /*
        this.clientDB.query(`select * from players where guid = $1 and needupdate = true;`,
            [this.guid], (err, data) => {
                if (err) console.log(err);
                if (data == undefined || data.rows == undefined || data.rows.length == 0) return;
                this.sendplayers(deckData);
                this.clientDB.query(`update players set (needupdate, lastseen ) = (false, $2) WHERE guid = $1 ; `, [this.guid, new Date()], (err, data) => { });
            });*/
    }

    outExchangeCard(data) {

        this.phase = Player.Phases.Nothing;
        this.state = Player.States.Nothing
        nextplayer = this.room.nextplayer;
        nextplayer.phase = Player.Phases.Action;
        nextplayer.state = Player.States.SelectCard;

        this.room.currentplayer = nextplayer;
        this.room.calcNextPlayer();
        /*
        // console.trace(`outExchangeCard = ${this.gamenum}`);
        this.clientDB.query(`select * from cards where roomid = $1 and playerid=$2 and not nextplayer is null;`,
            [this.roomid, this.playername], (err, dta) => {
                //   console.log(data);
                if (dta == undefined || dta.rows == undefined) return;
                if (dta.rows.length > 0) return;
                this.clientDB.query(`update cards set nextplayer = $4 where roomid = $1 and playerid=$2 and place=$3;`, [this.roomid, this.playername, data.place, data.nextplayer], (err) => {
                    //  console.log(err);
                    this.clientDB.query(`update players set (phase, state ) =(  $3, $4) WHERE roomid = $1 and guid = $2; `, [this.roomid, data.guid, Player.Phases.Exchange, Player.States.OutgoingExchange], (err) => {
                        //   console.log(err);
                        this.clientDB.query(`update players set (phase, state ) =(  $3, $4) WHERE roomid = $1 and place=$2; `, [this.roomid, data.nextplayer, Player.Phases.Exchange, Player.States.IncomeExchange], (err) => {
                            //    console.log(err);
                            this.room.needUpdateForAll();

                        });
                    });
                });
            });*/

    }

    inExchangeCard(data) {
        nowNextPlayer();
        /*
        this.clientDB.query(`select r.nextplayer, r.currentplayer as oldplayer, p.playerid as currentplayer from rooms as r inner join players as p on  p.roomid = r.roomid and r.nextplayer = p.place and p.gamenum = r.gamenum where r.roomid = $1`, [this.roomid], (err, firstdata) => {
            if (firstdata == undefined || firstdata.rows == undefined) return;
            if (firstdata.rows.length == 0) return;
            row = firstdata.rows[0];
            this.clientDB.query(`update rooms set (currentplayer, nextplayer ) =(  $2, null) WHERE roomid = $1; `, [this.roomid, row.currentplayer], (err) => {

                this.clientDB.query(`update players set (phase, state ) =(  $3, $4) WHERE roomid = $1 and playerid = $2; `, [this.roomid, row.oldplayer, Player.Phases.Nothing, Player.States.Nothing], (err) => {
                    //   console.log(err);
                    this.clientDB.query(`update players set (phase, state ) =(  $3, $4) WHERE roomid = $1 and playerid=$2; `, [this.roomid, row.currentplayer, Player.Phases.Action, Player.States.SelectCard], (err) => {
                        //    console.log(err);
                        this.room.needUpdateForAll();

                    });
                });
            });
        });*/


    }

    nowNextPlayer() {
        this.phase = Player.Phases.Nothing;
        this.state = Player.States.Nothing
        nextplayer = this.room.nextplayer;
        nextplayer.phase = Player.Phases.Action;
        nextplayer.state = Player.States.SelectCard;

        this.room.currentplayer = nextplayer;
        this.room.calcNextPlayer();

        /*
        this.clientDB.query(`select r.nextplayer, r.currentplayer as oldplayer, p.playerid as currentplayer from rooms as r inner join players as p on  p.roomid = r.roomid and r.nextplayer = p.place and p.gamenum = r.gamenum where r.roomid = $1`, [this.roomid], (err, firstdata) => {
            if (firstdata == undefined || firstdata.rows == undefined) return;
            if (firstdata.rows.length == 0) return;
            row = firstdata.rows[0];
            this.clientDB.query(`update rooms set (currentplayer, nextplayer ) =(  $2, null) WHERE roomid = $1; `, [this.roomid, row.currentplayer], (err) => {

                this.clientDB.query(`update players set (phase, state ) =(  $3, $4) WHERE roomid = $1 and playerid = $2; `, [this.roomid, row.oldplayer, Player.Phases.Nothing, Player.States.Nothing], (err) => {
                    //   console.log(err);
                    this.clientDB.query(`update players set (phase, state ) =(  $3, $4) WHERE roomid = $1 and playerid=$2; `, [this.roomid, row.currentplayer, Player.Phases.Action, Player.States.SelectCard], (err) => {
                        //    console.log(err);
                        this.room.needUpdateForAll();

                    });
                });
            });
        });*/
    }


    giveCardfromUpDeck() {

        getOneCardfromDeckForAction();

    }

    actionDropCard(data) {
        this.phase = Player.Phases.Exchange;
        this.state = Player.States.SelectCard;
        this.room.currentplayer = this.room.nextplayer;
        this.room.calcNextPlayer();
        let cardplace = data.place;
        this.room.dropcards.push(this.cards[cardplace]);
        this.cards.slice(cardplace, 1);
        this.cards.forEach((v, i) => { v.place = i });
       
        /*
        //console.trace(data);
        //set nextplayer in rooms for next player by place%maxplace
        this.clientDB.query(`update rooms set nextplayer = (select p.place
                                from players as c 
                                inner join rooms as r on r.roomid = c.roomid and r.gamenum = c.gamenum and r.currentplayer = c.playerid 
                                inner join players as p on r.roomid = p.roomid and r.gamenum = p.gamenum  and (case when r.direction then (c.place+1)%r.numofplayers else case when c.place=0 then r.numofplayers-1 else c.place-1 end end) = p.place
                                where c.guid = $2 limit 1) where roomid=$1 `,
            [this.roomid, this.guid], (err) => {
                //console.log(err);
                this.clientDB.query(`update cards set (isInDeck, isInDrop , playerid ) =(  false ,true, null) where roomid = $1 and playerid=$2 and place=$3;`, [this.roomid, this.playername, data.place], (err) => {
                    // console.log(err);
                    this.clientDB.query(`update players set (phase, state ) =(  $3, $4) WHERE roomid = $1 and guid = $2; `, [this.roomid, data.guid, Player.Phases.Exchange, Player.States.SelectCard], (err) => {
                        // console.log(err);
                        

                    });
                });
        });*/
        
    }

    getOneCardfromDeckForAction() {
        this.room.giveOneCardfromDeckToPlayer(this);
        this.cards.forEach((v, i) => { v.place = i });
        

/*
        this.clientDB.query(`select * from cards where roomid = $1 and playerid=$2;`,
            [this.roomid, this.playername], (err, data) => {
                if (err) console.log(err);
                if (data == undefined || data.rows == undefined || data.rows.length == 0) return;
                if (data.rows.length < 5) {
                    this.clientDB.query(`update cards set (isInDeck, place , playerid ) =(  false ,4, $2) WHERE roomid = $1 and isInDeck = true and place in (select max(place) from cards where  roomid = $1 and isInDeck = true); `, [this.roomid, this.playername], (err, data) => { });
                    this.room.needUpdateForAll();
                }

            });
            */

    }

    sendplayers(deckData) {
        //let playersCards = new Map();

        /*        this.cards = [];
        this.clientDB.query(`select 
                        b.playerid as playername, b.quarantineCount as quarantineCount, b.place as num, 
                        b.Infected as Infected, b.thing as thing , b.state as state, b.phase as phase, 
                        c.cardid as cardnum, c.place as cardplace, r.direction as direction , 
                        r.nextplayer as nextplayer, r.currentplayer as currentplayer, 
                        c.nextplayer as nextplayerforcard
                        from players as b left join cards as c on c.roomid = b.roomid and c.playerid = b.playerid left join 
                        (select *  from players  where roomid=$1 and playerid=$2 and gamenum = $3) as p on p.roomid = b.roomid inner join rooms as r on r.roomid = b.roomid 
                        where b.roomid=$1 and b.gamenum = $3  
                            order by b.place=p.place desc,b.place>p.place desc,b.place asc,c.place asc`,
            [this.roomid, this.playername, this.gamenum], (err, data) => {
                if (err) console.log(err);
                // console.log(data);
                if (data == undefined || data.rows == undefined) { this.send({ messagetype: 'playerlist', playerlist: [] }); return; }*/


        let nextplayer = this.room.nextplayer.place;
        let currentplayer = this.room.currentplayer.place;
        let exchange = [];

       // nextplayer = this.room.nextplayer.place;
        //currentplayer = this.room.currentplayer.place;


        this.room.players.forEach((v, k) => {
            let p;
            // this.room.players.forEach((v, i) => {
            //let p =playersCards.get(v.playerid );

            //if (p == undefined)
            if (v.playername == this.playername) { p = this; }
            else p = new Player(null, null, null, v.playername, null, null, v.quarantineCount);
            p.place = v.place;
            p.state = v.state;
            p.phase = v.phase;


            if (this.thing == true) p.Infected = v.Infected;//покажем нечте зараженных
            if (this.Infected == true) p.thing = v.thing;//покажем зараженным нечту
            let cardsArray = [];
            v.cards.forEach((card, i) => {
                //console.log(card);
                //let card = vCard.num;
                let cardplace = card.place;

                // if (card.nextplayerforcard == null) {
                if (v.playername == this.playername || card.card.isPanic)
                    cardsArray.push({ cardnum: card.card.num, cardplace: cardplace });
                else cardsArray.push({ cardnum: -1, cardplace: cardplace });
                // } else {
                //     p.exchange = { nextplayer: v.nextplayerforcard, card: -1, cardplace: cardplace };
                // }
            });
            exchange.push({ playername: v.playername, quarantineCount: v.quarantineCount, num: v.place, Infected: p.Infected, thing: p.thing, state: p.state, phase: p.phase, cards: cardsArray, exchange: null });


            //playersCards.set(v.playername, p);

        });


        /*
        let exchange = [];
        playersCards.forEach((v, k) => {
            exchange.push({ playername: v.playername, quarantineCount: v.quarantineCount, num: v.place, Infected: v.Infected, thing: v.thing, state: v.state, phase: v.phase, cards: v.cards, exchange: v.exchange });
        });*/

        this.send({ messagetype: 'playerlist', playerlist: exchange, deck: deckData, nextplayer: nextplayer, currentplayer: currentplayer });
    }

}

module.exports = Player
