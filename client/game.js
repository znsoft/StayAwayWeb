let socket = io();

let SocketClientWorker = {
    'socket':socket,
}
    


    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };



    class Player {
        constructor(name, num, isMe, cards, state, Phase) {
            this.name = name;
            this.num = num;
            this.isMe = isMe;
            this.cards = cards;
            this.Infected = false;
            this.Thing = false;
            this.state = state;
            this.Quarantine = false;
            this.selected = null;
            this.selectedCard = null;
            this.Phase = Phase;
            this.moveOneCard = false;
            this.move = null;
        }

        get InfectCount() {
            this.cards.filter(v => v == Cards.Infect).length;

        }
        get isCardMovableNow() {

            if (this.Phase == Phases.Nothing) return false;
            if (this.selectedCard == null) return false;
            if (this.Phase == Phases.Action) {
                return this.selectedCard.isCardMovableForAction(this);
            }
        }


        getWindowToCanvas(ctx, e) {
            if (e == undefined) return;
            //first calculate normal mouse coordinates
            e = e || window.event;
            var target = e.target || e.srcElement,
                style = target.currentStyle || window.getComputedStyle(target, null),
                borderLeftWidth = parseInt(style["borderLeftWidth"], 10),
                borderTopWidth = parseInt(style["borderTopWidth"], 10),
                rect = target.getBoundingClientRect(),
                offsetX = e.clientX - borderLeftWidth - rect.left,
                offsetY = e.clientY - borderTopWidth - rect.top;
            let x = (offsetX * target.width) / target.clientWidth;
            let y = (offsetY * target.height) / target.clientHeight;

            //then adjust coordinates for the context's transformations
            //const ctx = canvas.getContext("2d");
            var transform = ctx.getTransform();
            const invMat = transform.invertSelf();
            return {
                x: x * invMat.a + y * invMat.c + invMat.e,
                y: x * invMat.b + y * invMat.d + invMat.f
            };
        }

        Draw(ctx, e) {

            let lm = (this.cards.length - 1) / 2;

            if (e != undefined && !this.moveOneCard) {
                this.selected = null; this.selectedCard = null; this.move = null;
            }

            this.cards.forEach((v, z) => {
                let i = z - lm;
                let h = 35;
                let mx = 0;
                ctx.save();

                ctx.strokeStyle = "#af2";
                //if (this.isMe)
                if (this.selected == z) { h = -5; ctx.scale(1.2, 1.2); mx = 10; ctx.strokeStyle = "#a00"; }
                ctx.translate(i * 111 - mx, h);

                if (e != undefined) {
                    let c = this.getWindowToCanvas(ctx, e);
                    if (this.moveOneCard && this.selected == z && this.isMe) {
                        this.move = { x: c.x - 20, y: c.y - 20 };
                        c.x = 1;
                        c.y = 1;

                    }

                    if (c != undefined)
                        if (c.x > 0 && c.x < 90 && c.y > 0 && c.y < 150) { this.selected = z; this.selectedCard = v; } //else { this.selected = null; this.selectedCard = null; }
                }

                if (this.isMe && this.selected == z && this.move != null && this.moveOneCard) {
                    ctx.translate(this.move.x, this.move.y);
                } else

                    ctx.rotate(i / 50 * Math.PI);

                v.Draw(ctx);



                ctx.strokeStyle = "#af2";

                ctx.restore();
            });
            ctx.strokeStyle = "#005";
            ctx.font = 'bold 48px serif';
            ctx.fillText(this.name, 20, 20);
            ctx.strokeText(this.name, 20, 20);
            ctx.stroke();

        }





    };

    class Deck {
        constructor(upCard, cardsLeft) {
            this.upCard = upCard;
            this.cardsLeft = cardsLeft;
            this.Doors = [];
            this.Drop = 0;
        }
        Draw(ctx, e) {

            ctx.save();
            // ctx.globalCompositeOperation = 'destination-over';
            ctx.translate(this.cardsLeft * 3, this.cardsLeft * 3);
            ctx.rotate(Math.PI / 2);
            this.upCard.Draw(ctx);
            ctx.restore();

            for (let i = this.cardsLeft; i > 1; i--) {

                ctx.save();
                ctx.translate(i * 2, i * 2);
                ctx.rotate(Math.PI / 2);
                Cards.UnknownAction.Draw(ctx);
                ctx.restore();
            }


            ctx.save();
            // ctx.globalCompositeOperation = 'destination-over';
            ctx.translate(200, -50);
            ctx.rotate(Math.PI / 2.5);
            ctx.fillStyle = "#000";
            ctx.font = '16px serif';
            ctx.fillText("Drop", 10, 20);
            ctx.roundRect(0, 0, 95, 150, 10).stroke();
            //Cards.UnknownAction.Draw(ctx);

            ctx.restore();




        }

    };

    class Card {

        constructor(name, num, CardCaption, Description, img, Exchange, Action, Defend, isPanic = false, isUnknown = false) {
            this.name = name;
            this.num = num;
            this.isPanic = isPanic;
            this.isUnknown = isUnknown;
            this.CardCaption = CardCaption;
            this.Description = Description;
            this.img = img;
            this.Exchange = Exchange;
            this.Action = Action;
            this.Defend = Defend;
        }

        GetActionArray(player) {
            if (this.Action == null) return [];
            let check = null;
            if (Array.isArray(this.Action)) check = this.Action; else check = [this.Action];
            if (typeof (this.Action) == "function") check = this.Action(player);
            if (check == null || check == undefined) return [];
            if (!Array.isArray(check)) check = [check];
            return check;

        }

        isCardMovableForAction(player) {
            let c = this.GetActionArray(player);
            //Actions.Drop.
            return c.filter((v) => v.MayMove == true).length > 0;
            //v.hasOwnProperty("MayMove") &&
            //for (var c of check) { }

        }

        Draw(ctx) {

            //ctx.beginPath();
            ctx.fillStyle = "#000";
            ctx.font = '16px serif';
            ctx.fillText(this.name, 10, 20);
            ctx.font = '11px serif';
            let y = 30;
            for (var s of this.CardCaption.split("\n")) ctx.fillText(s, 1, y += 12);

            ctx.roundRect(0, 0, 95, 150, 10);
            ctx.fillStyle = this.isUnknown ? "#b92" : "#f5fb";
            ctx.fill();

            ctx.stroke(); // Draw it
            //ctx.closePath();
        }


    };


    class Game {
        get GetPlayers() { return null; }

        get GetMe() { return this.players[0]; }

        get GetDeck() { return new Deck(Cards.UnknownAction, 4); }

        constructor(guid) {

            this.guid = guid;
            this.players = this.GetPlayers;
            this.players = [new Player("Stay away game", 0, true, [Cards.Thing, Cards.Infect, Cards.Suspicion, Cards.Analysis, Cards.BurnFire], States.SelectCard, Phases.Action),
            new Player("ENEMY", 1, false, [Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction], States.Nothing, Phases.Nothing),
            new Player("ENEMY1", 2, false, [Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction], States.Nothing, Phases.Nothing),
            new Player("ENEMY2", 3, false, [Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction], States.Nothing, Phases.Nothing),
            new Player("ENEMY3", 4, false, [Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction], States.Nothing, Phases.Nothing),
                /*new Player("ENEMY4", 5, false, [Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction], States.Nothing, Phases.Nothing),
                new Player("ENEMY5", 6, false, [Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction], States.Nothing, Phases.Nothing),
                new Player("ENEMY6", 7, false, [Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction], States.Nothing, Phases.Nothing),
                new Player("ENEMY7", 8, false, [Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction], States.Nothing, Phases.Nothing),
                new Player("ENEMY8", 9, false, [Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction], States.Nothing, Phases.Nothing),
                new Player("ENEMY9", 10, false, [Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction], States.Nothing, Phases.Nothing),
                new Player("ENEMY10", 11, false, [Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction, Cards.UnknownAction], States.Nothing, Phases.Nothing)
                */
            ];
            this.me = this.players[0];
            this.Deck = new Deck(Cards.UnknownAction, 4);
            this.moveOneCard = false;
            this.gameDirection = Direction.CW;
            this.selectedOpponent = null;
        }

        drawText(ctx, x, y, text) {

            ctx.fillStyle = "#003";
            ctx.font = '16px serif';
            for (var s of text.split("\n")) ctx.fillText(s, x, y += 17);

        }




        isNearOpponent(player) {
            return player.num == this.me.num + 1 || player.num == this.players.length - 1;

        }


        Draw(ctx, e) {
            let HiLightRLPlayers = false;

            if (this.me.selectedCard != null) {
                let c = this.me.selectedCard.GetActionArray(this.me);
                c.forEach((v) => {
                    if (v.HiLightText != undefined) this.drawText(ctx, -10, 20, v.HiLightText);
                    if (v.HiLightRLPlayers == true) HiLightRLPlayers = true;
                    if (v.hasOwnProperty("Button")) {


                    }
                });

            }

            this.players.forEach((v, i) => {
                let s = 260;
                if (v == this.me) v.moveOneCard = this.moveOneCard;
                if (v != this.me) s = 750;
                let ang = 2 * Math.PI * (- i / (this.players.length + this.players.length / 5));// + 2.5));
                if (v != this.me) ang -= 0.5;
                let x = Math.cos(ang) * s;
                let y = - Math.sin(ang) * s;
                ctx.save();

                if (v != this.me) ctx.scale(0.5, 0.5);
                ctx.translate(y, x);
                ctx.rotate(ang);
                if (this.isNearOpponent(v) && HiLightRLPlayers == true) {
                    ctx.fillStyle = "#003";
                    ctx.strokeStyle = "#a02";
                    ctx.roundRect(-2 * 95, -20, 5 * 95, 250, 20).stroke();

                }

                v.Draw(ctx, e);
                ctx.restore();
            });

            ctx.save();
            ctx.translate(0, -100);
            this.Deck.Draw(ctx, e);
            ctx.restore();

        }

    };


    const Phases = {
        Nothing: 0,
        Exchange: 1,
        Action: 2,
        Answer: 3

    };

    const Actions = {
        Nothing: { id: - 1, },
        Drop: {
            id: 0, Button: { Text: "Drop", },
        },
        Change: { id: 1, HiLightText: "Select player", },
        SawOneCard: { id: 2, HiLightText: "Select card of a player", MayMove: true, HiLightRLPlayers: true },
        SawAllCards: { id: 3, HiLightText: "Select player", MayMove: true, HiLightRLPlayers: true },
        RejectExchange: {
            id: 4, Button: { Text: "Reject" },
        },
        Burn: { id: 5, HiLightText: "Select player", MayMove: true, HiLightRLPlayers: true },
        Defend: {
            id: 6, Button: { Text: "Defend" }
        },


    };

    const Algoritms = {
        MayGiveInfect: function (me, other) {
            if (me.Thing == true) return Actions.Change;
            if (me.Infected == true && other.Thing == true && me.InfectCount() > 1) return Actions.Change;
            return Actions.Nothing;
        },
        MayDropInfect: function (me) {
            if (me.Infected == true && me.InfectCount() == 1) return Actions.Nothing;
            return Actions.Drop;
        },
        SimpleExchange: (me, other) => Actions.Change,
        ActionSuspicion: (me) => [Actions.Drop, Actions.SawOneCard],
        ActionAnalysis: (me) => [Actions.Drop, Actions.SawAllCards],
        ActionBurnFire: (me) => [Actions.Drop, Actions.Burn],
        FireResistance: (Card) => {
            if (Card == Cards.BurnFire) return Actions.Defend;
            return Actions.Nothing;
        }

    };

    const Cards = {
        UnknownPanic: new Card("Panic", -2, "", "", "", null, null, null, true, true),
        UnknownAction: new Card("Event", -1, "", "", "", null, null, null, false, true),
        Thing: new Card("Thing", 0, "", "", "", null, null, null),
        Infect: new Card("Infect", 1, "", "", "", Algoritms.MayGiveInfect, Algoritms.MayDropInfect, null),
        Suspicion: new Card("Suspicion", 2, "Saw one\ncard of a player", "", "", Algoritms.SimpleExchange, Algoritms.ActionSuspicion, null),
        Analysis: new Card("Analysis", 3, "Saw all\nCards player", "", "", Algoritms.SimpleExchange, Algoritms.ActionAnalysis, null),
        BurnFire: new Card("�������", 4, "Burn \nplayer", "", "", Algoritms.SimpleExchange, Algoritms.ActionBurnFire, null),
        FireResist: new Card("Defend from Fire", 5, "Defend from Fire", "", "", Algoritms.SimpleExchange, null, Algoritms.FireResistance),

    };


    //----------------------------------------------------------------
    const Direction = {
        CW: 0,
        CCW: 1
    };

    const States = {
        Nothing: 0,
        SelectCard: 2,
        OutgoingExchange: 3,
        IncomeExchange: 4,
        PerseveranceSelectCard: 5,
        SelectPlayer: 6,
        SuspicionSelectCard: 7,
        Panic: 8


    };



    //---------------------------------------------------------

    var RAF = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        callback();
        window.setTimeout(callback, 200);
    };


    let game = new Game(123);
    var canvas = document.getElementById("canvas");
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    var ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = 'destination-over';
    var w = canvas.width;
    var h = canvas.height;



    window.addEventListener("mousemove", function (event) {

        if (game.moveOneCard)
            render(event);


    });

    window.addEventListener("mousedown", function (event) {
        render(event);
        if (game.me.selected != null) game.moveOneCard = game.me.isCardMovableNow;

    });

    window.addEventListener("mouseup", function (e) {

        game.moveOneCard = false;
    });



    function start() {





    }





    function update() {

        render();

        RAF(update);
    }



    function render(e) {
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(w / 2, h / 2);
        game.Draw(ctx, e);
        ctx.restore();
    }


    start();

    update();