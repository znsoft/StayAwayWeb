


class Game {
    static Direction = {
        CW: 0,
        CCW: 1
    };

    constructor(guid) {

        this.arrow = new Image();
        this.arrow.src = "/arrow.png";
        this.guid = guid;
        this.currentPlayer = null;
        //            this.players =
        this.isStarted = false;
        this.players = [new Player("", 0, true, [], States.Nothing, Phases.Nothing, 0)];
        this.selectedOtherCardPlace = null;
        this.me = this.players[0];
        this.Deck = new Deck(Cards.UnknownAction, 4, 2);
        this.moveOneCard = false;
        this.gameDirection = Game.Direction.CW;
        this.selectedOpponent = null;
        //this.selectedCard = null
        this.opponent = null;
        this.nextplayer = null;
        this.exchange = [];
        this.ViewlineTo = null;
        this.ShowOneCard = null;
        this.gamelog = [];
        this.width = 0;
        this.height = 0;
        this.doors = new Map();
        //events
        this.gameEnded = false;
        this.isBurn = false;
        this.shader = null;


        this.shader = null;//new Shadertoy(document.getElementById("shaderStart").innerText);
        //this.isBurn = true;

    }

    get isSecondAction() {
        this.Deck.table.length > 0;

    }

    findPlayerByNum(num) {
        for (var p of this.players) if (p.place == num) return p;
        return null;
    }

    parseGamelog(message) {
        let result = "";
        this.gamelog = message.gamelog;
        this.gamelog.forEach((v) => { result = result + v + "\r" });

        let q = document.getElementById("gamelog");
        q.value = result;
        q.scrollTop = q.scrollHeight;

    }

    parseYouBurned(message) {

        //youburned
        //this.isStarted = false;

        new TextLabels(message.text, message.text, 100, this.height / 3, "red", 5, 0);
        //this.gameEnded = true;
        //nimator.EndGame();
        this.shader = new Shadertoy("shaders/fire.glsl");
        this.isBurn = true;
    }

    parseGameEnd(message) {
        this.isStarted = false;

        new TextLabels(message.text, message.text, 100, this.height / 2, "red", 5, 0);
        this.gameEnded = true;
        //nimator.EndGame();
    }

    parseChat(message) {
        let result = "";

        message.chat.forEach((v) => { result = result + v.player + ":" + v.message + "\r" });

        let q = document.getElementById("chat");
        q.value = result;
        q.scrollTop = q.scrollHeight;

    }


    parsePlayerList(message) {
        let j = 0;
        let selected = this.me.selected;
        //if (this.me.selected!=null) return;//заглушка чтобы карты не сбрасывались с мышки когда поступает пакет от сервера
        Lines.DeleteAll();
        this.ShowOneCard = null;
        this.exchange = [];
        this.players = [];
        message.playerlist.forEach((v, i) => {
            //if (v.isDead == true) return;

            let p = new Player(v.playername, v.num, i == 0, v.cards, findStateByNum(v.state), findPhaseByNum(v.phase), v.quarantineCount, v.Perseverance, v.isDead);
            p.avatar = v.avatar;
            p.Thing = v.thing;
            p.Infected = v.Infected;
            this.players.push(p);

            //if (p.state == States.SelectCardForChain) p.isEndTurnExchange = true;//чтобы сработали правильные проверки и подсказки при выборе карт 

            if (v.num == message.opponent) this.opponent = p;
            if (v.exchange == null) return;
            this.exchange.push({ currentplayer: p, nextplayer: v.exchange.nextplayer, card: findCardByNum(v.exchange.card) });

        });

        this.me = this.players[0];///
        this.nextplayer = message.nextplayer;
        this.me.opponent = this.opponent;
        if (message.deck != undefined) {
            let deck = message.deck;
            this.Deck = new Deck(deck.card, deck.deckCount, deck.dropCount, deck.drop, deck.table, deck);




            this.isStarted = true;
            this.currentPlayer = deck.currentPlayer;
            this.doors = new Map();
            if (deck.doors != undefined) deck.doors.forEach(v => { this.doors.set(v, true) });

        }


        this.players.forEach((v) => { v.isNear = this.isNearOpponent(v) })

    }







    isNearOpponent(player) {
        let pldist = Math.abs(player.place - this.me.place);
        return pldist == 1 || pldist == this.players.length - 1;
    }

    DrawPlayersCards(ctx, e, v, HiLightRLPlayers, HLOpponent, i, actions, HLAllNonQuarantine, isDoorbefore = false, HLThridPlayers) {
        let sy = game.width * 0.25;//.height / 4;//260;
        let sx = game.height * 0.25;//260;
        //if (v == this.me) v.moveOneCard = this.moveOneCard;//отключил перемещение карт мышкой
        if (v != this.me) {
            sx = game.height * 0.7;//750;
            sy = game.width * 0.5;
        }
        let ang = 2 * Math.PI * (i / (this.players.length + this.players.length / 5));// + 2.5));
        if (v != this.me) ang += 0.5;
        let x = Math.cos(ang) * sx;
        let y = - Math.sin(ang) * sy;
        //v.x = x;
        //v.y = y;
        ctx.save();

        if (v != this.me) ctx.scale(0.5, 0.5); // else x = this.height - Card.height;

        ctx.translate(y, x);

        ctx.rotate(ang);



        if (this.selectedOpponent == v) {
            ctx.scale(1.2, 1.2);
            ctx.fillStyle = "#503";
            ctx.strokeStyle = "#a52";
            ctx.roundRect(Player.x1 - 10, Player.y1 - 10, Player.x2 + 20, Player.y2 + 20, 20).stroke();
        }

        if (this.isNearOpponent(v) && HiLightRLPlayers == true && v != this.me
            || (HLOpponent && v.place == this.nextplayer)
            || (HLAllNonQuarantine == true && v.QuarantineCount == 0 && v != this.me)
            || (HLThridPlayers == true && v.QuarantineCount == 0 && v != this.me && Math.abs(this.me.place - v.place) == 3)
            || (v.state == States.IncomeExchange)


        ) {
            ctx.fillStyle = "#003";
            ctx.strokeStyle = "#a02";
            ctx.roundRect(Player.x1, Player.y1, Player.x2, Player.y2, 20).stroke();
        }

        v.Draw(ctx, e, actions);
        if (this.currentPlayer == v.place) ctx.drawImage(this.arrow, -30, -150, 100, 100);
        //if (this.currentPlayer == v.place) ctx.drawImage(this.arrow, -30, -150, 100, 100);

        ctx.save();
        ctx.translate(CardType.width * 3, -100);
        ctx.rotate(-1);
        ctx.scale(0.5, 0.5);

        if (isDoorbefore == true)
            Cards.Door.Draw(ctx, e);
        ctx.restore();

        ctx.restore();

    }



    drawStatePhase() {

        let stateText = "";
        if (this.opponent != null) stateText = "сейчас ходит " + this.opponent;
        let phaseText = "";



        switch (this.me.state) {
            case States.PanicOneTwo:
                stateText = "Выбери 3 игрока для смены мест";
                //phaseText = "или выбери заражение чтобы остановить время признаний";

                break;

            case States.PanicConfessionTime:
                stateText = "Покажи или не показывай всем свои карты";
                phaseText = "или выбери заражение чтобы остановить время признаний";

                break;
            case States.PanicMeet:
                stateText = "Выбери свою карту чтобы";
                phaseText = "подложить в колоду";

                break;

            case States.PanicForgot:
                stateText = "Выбери карту";
                phaseText = "которая останется на руке";
                break;
            case States.SelectCardForChain:
                stateText = "Выбери свою карту";
                phaseText = "для передачи следующему";
                break;

            case States.SelectCardAndPlayerForOutgoingExchange:
                stateText = "Выбери ник игрока и свою карту для обмена";

                break;


            case States.IncomeExchange:
                stateText = "Выбери свою карту \nдля обмена или отказа";

                break;
            case States.DefendPlaceChange:
                    stateText = "Выбери свою карту \nдля отказа от смены мест или пересадки";
    
                    break;
            case States.DefendFireSelectCard:
                        stateText = "Выбери свою карту Никакого шашлыка\nдля защиты от огнемета";
        
                    break;
            case States.SelectCard:
                stateText = "Выбери свою карту";
                switch (this.me.Phase) {
                    case Phases.Exchange:
                        phaseText = "для обмена";
                        break;
                    case Phases.Action:
                        phaseText = "для действия";
                        break;
                    case Phases.Answer:
                        phaseText = "для ответа";
                        break;

                }


                break;
            case States.SelectPlayer:
                stateText = "Выбери игрока";
                break;

        }
        if (this.isStarted == false) {
            stateText = "";
            phaseText = "";
        }

        new TextLabels("state", stateText + '\n' + phaseText, game.width / 2 - 200, game.height / 2 + 55, "#000", 2, 0);
        //new TextLabels("phase", phaseText, game.width/2-150, game.height/2+44, "#000", 2, 0);


    }

    Draw(ctx, e, w, h) {


        if (this.gameEnded == true) if (Math.random() > 0.7) Animator.EndGame(this);



        this.width = w;
        this.height = h;
        ctx.clearRect(0, 0, w, h);



        ctx.save();

        ctx.save();
        //ctx.translate(-10, -200);
        TextLabels.DrawAll(ctx, e);
        if (e != undefined) TextLabels.Delete("Hint");

        ctx.restore();



        ctx.translate(w / 2, h / 2); //центр экрана это (0,0)

        if (this.me.selectedCard == null || this.me.Phase == Phases.Nothing) Button.DeleteAll();

        if (this.me.selectedCard != null) if (this.me.selectedCard.card.Description != undefined) {
            //.getAttribute('data-tooltip');
            new TextLabels("description", this.me.selectedCard.card.Description, 0, game.height - 152, "#000", 1.8, 0);
            //this.drawText(ctx, -this.width / 2, this.height / 2 - 100, this.me.selectedCard.card.Description);
            //canvas.setAttribute('data-tooltip',this.me.selectedCard.card.Description);
            if (e != undefined)
                //x = event.x - this.offsetLeft;
                //y = event.y - this.offsetTop;
                ctx.drawPoint(e.x, e.y, 5, 'red', [this.me.selectedCard.card.Description]);
        }

        this.drawStatePhase();

        let HLOpponent = false;
        let HiLightRLPlayers = false;
        let HLAllNonQuarantine = false;
        let HLThridPlayers = false;
        let HiLightText = "";
        let c = [];
        let card = null;
        switch (this.me.Phase) {
            case Phases.Exchange:
                HLOpponent = this.nextplayer != null;
                break;
            case Phases.Action:

                if (this.me.selectedCard != null) card = this.me.selectedCard.card;
                if (card == null) break;
                if (this.me.isNowMyTurn) {
                    c = card.GetActionArray(this.me);
                    c.forEach((v) => {
                        if (v.HiLightText != undefined) HiLightText = v.HiLightText;

                        // this.drawText(ctx, -10, 20, v.HiLightText);
                        if (v.HiLightRLPlayers == true) HiLightRLPlayers = true;
                        if (v.HLAllNonQuarantine == true) HLAllNonQuarantine = true;
                    });

                }


                break;
            case Phases.SecondAction:
                this.Deck.table.forEach((v) => card = v.card);
                if (card == null) break;


                if (this.me.isNowMyTurn && this.me.selectedCard == null) {
                    c = card.GetSecondActionArray(this.me, card);
                    c.forEach((v) => {
                        if (v.HiLightText != undefined) HiLightText = v.HiLightText;//this.drawText(ctx, -10, 20, v.HiLightText);
                        if (v.HiLightRLPlayers == true) HiLightRLPlayers = true;
                        if (v.HLAllNonQuarantine == true) HLAllNonQuarantine = true;
                        if (v.HLThridPlayers == true) HLThridPlayers = true;
                    });

                }


                break;

            case Phases.Answer:
                if (this.me.state == States.DefendPlaceChange) {




                }
                break;


        }
        new TextLabels("HiLightText", HiLightText, game.width / 2 + 200, game.height / 2 + 33, "#000", 1.5, 0);

        let central = this.me.place;

        this.players.sort((a, b) => a.place - b.place).forEach((v, i) => {
            let k = v.place;
            if (k == this.players.length) k = 0;
            let door = this.doors.get(k)
            let newplace = v.place - central;
            if (newplace < 0) newplace = newplace + this.players.length;
            this.DrawPlayersCards(ctx, e, v, HiLightRLPlayers, HLOpponent, newplace, c, HLAllNonQuarantine, door, HLThridPlayers);
        });





        ctx.save();
        ctx.translate(-100, -200);
        Button.DrawAll(ctx, e);
        ctx.restore();

        ctx.save();
        ctx.translate(-20, -200);
        if( this.isStarted == true)this.Deck.Draw(ctx, e);
        ctx.restore();
        /*
                    ctx.save();
                    ctx.translate(-10, -200);
                    TextLabels.DrawAll(ctx, e);
                    ctx.restore();
        */


        ctx.restore();
        ctx.save();
        Lines.DrawAll(ctx, this);
        ctx.restore();
        ctx.save();
        Animator.DrawAll(ctx, this);
        ctx.restore();

        if (this.shader != null) ctx.drawImage(this.shader.Draw(e, 300, 300), 0, 0, w, h);
    }

};

