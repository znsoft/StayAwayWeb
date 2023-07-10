

const avatars = ['/avatars/zebra.png', '/avatars/tiger.png', '/avatars/squirrel.png', '/avatars/rhino.png', '/avatars/rabbit.png', '/avatars/ostrich.png',
'/avatars/monkey.png', '/avatars/leopard.png', '/avatars/horse.png', '/avatars/giraffe.png', '/avatars/fox.png',
'/avatars/deer.png', '/avatars/cat.png', '/avatars/camel.png'];

const Phases = {
    Nothing: 0,
    Exchange: 1,
    Action: 2,
    Answer: 3,
    SecondAction: 4

};



const States = {
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
};


function findPhaseByNum(num) {
    for (i in Phases)
        if (Phases[i] == num) return Phases[i];
    return Phases.Nothing;

}

function findStateByNum(num) {
    for (i in States)
        if (States[i] == num) return States[i];
    return States.Nothing;

}


class Player {

    static x1 = -2 * CardType.width;
    static y1 = -20;
    static x2 = 5 * CardType.width;
    static y2 = 250;


    constructor(name, num, isMe, cards, state, Phase, QuarantineCount = 0, Perseverance, isDead) {
        this.Avatar = null;
        this.name = name;
        this.playername = name;
        this.place = num;
        this.isMe = isMe;
        this.cards = [];
        this.shader = null;
        this.isDead = isDead;
        if (this.isDead && this.isMe == false) {

            this.shader = new Shadertoy("shaders/fire.glsl");
            this.shader.FadeOut(() => this.shader = null);

        }
        cards.forEach((v) => {
            let cardtype = findCardByNum(v.cardnum);
            let card = new Card(cardtype, this, v.cardplace, v);
            if (v.toPlayer != undefined && v.ShowTo == true) card.ShowOneCard = { playername: v.toPlayer, cardplace: v.cardplace };
            this.cards.push(card);
        });

        this.Infected = false;
        this.Thing = false;
        this.state = state;
        this.QuarantineCount = QuarantineCount;
        this.selected = null;
        this.selectedCard = null;
        this.Phase = Phase;
        this.moveOneCard = false;
        this.move = null;
        this.x = 0;
        this.y = 0;
        this.transform = {};
        this.isNear = false;
        this.cardForExchangeOut = null;
        this.isPlayerSelected = false;
        this.Perseverance = [];
        if (Perseverance != undefined) {
            //p.Perseverance = v.Perseverance;
            for (let j in Perseverance) {
                let cardtype = findCardByNum(Perseverance[j].cardnum);
                let card = new Card(cardtype, this, j, Perseverance[j]);
                this.Perseverance.push(card);
            }
        }

    }

    set avatar(v) {

        this.Avatar = new Image();
        this.Avatar.src = avatars[v];

    }

    get isNear_() {

        return game.isNearOpponent(this);
    }

    toString() {

        let quarantine = this.QuarantineCount > 0 ? "(на карантине)" : "";
        return this.playername + ((this.Infected == true && this.Thing == false) ? " (заражен)" : (this.Thing == true ? " (нечто)" : "")) + quarantine;
    }


    get PanicCount() {
        return this.cards.filter(v => v.card.isPanic == true).length;

    }
    get InfectCount() {
        return this.cards.filter(v => v.card == Cards.Infect).length;

    }
    get isCardMovableNow() {

        if (this.Phase == Phases.Nothing) return false;
        if (this.selectedCard == null) return false;
        if (this.Phase == Phases.Action) {
            return this.selectedCard.card.isCardMovableForAction(this);
        }
    }

    get isEndTurnExchange() {
        return (this.Phase == Phases.Exchange && (this.state == States.SelectCard || this.state == States.SelectCardAndPlayerForOutgoingExchange) && this.cards.length < 5);
    }

    get isMyTurnToDefend() {
        return (this.Phase == Phases.Answer && this.state == States.DefendFireSelectCard && this.cards.length < 5);
    }
    get isStartTurnExchangeIn() {
        return (this.Phase == Phases.Answer && this.state == States.IncomeExchange && this.cards.length < 5);
    }

    get isAction() {

        return (this.Phase == Phases.Action);
    }

    get isNowMyTurn() {
        return this.Phase == Phases.Action || this.Phase == Phases.SecondAction;
    }

    get isINeedGetCard() {

        return this.Phase == Phases.Action && this.state == States.SelectCard && this.cards.length < 5;
    }


    findCardByPlace(place) {
        let c = this.cards.filter((v) => v.cardplace == place);
        if (c.length > 0) return c[0];
        return undefined;

    }

    Draw(ctx, e, actions) {
        let selectNearPlayersCards = false;
        let actionOnSelectSecondCard = undefined;
        let selectPlayer = false;
        let OnSelectPlayer = undefined;
        let HiLightRLPlayers = false;
        actions.forEach((v) => {
            if (v.selectNearPlayersCards != undefined) selectNearPlayersCards = v.selectNearPlayersCards;
            if (v.actionOnSelectSecondCard != undefined) actionOnSelectSecondCard = v.actionOnSelectSecondCard;
            if (v.selectPlayer != undefined) selectPlayer = v.selectPlayer;
            if (v.OnSelectPlayer != undefined) OnSelectPlayer = v.OnSelectPlayer;
            if (v.HiLightRLPlayers != undefined) HiLightRLPlayers = v.HiLightRLPlayers;
        });

        let errortext = '';
        let scr = ctx.getCanvasToWindow(0, 0);
        this.transform = ctx.getTransform();
        this.x = scr.x;//this.transform.e;
        this.y = scr.y;//this.transform.f

        let lm = (this.cards.length - 1) / 2;



        if (selectPlayer == true || game.me.state == States.SelectCardAndPlayerForOutgoingExchange) {
            if (e != undefined && e.type != 'mousemove') {

                let p = ctx.getWindowToCanvas(e);
                if (p != undefined)
                    if (p.x > Player.x1 && p.x < Player.x2 && p.y > Player.y1 && p.y < Player.y2) errortext = this.OnPlayerSelect(OnSelectPlayer, HiLightRLPlayers);
            }
        }

        if (e != undefined && !this.moveOneCard && !selectNearPlayersCards && !selectPlayer && e.type != 'mousemove') {

            //if (this.isMe)
            this.selected = null; this.selectedCard = null; this.move = null;//reset old selection
            //else { this.selected = null; this.selectedCard = null; }

        }

        this.Perseverance.forEach((v, z) => {
            let i = z - lm;
            let h = -150;
            let mx = -50;
            ctx.save();

            ctx.strokeStyle = "#af2";

            ctx.translate(i * 111 - mx, h);
            ctx.rotate(i / 50 * Math.PI);
            if (v.Draw(ctx, e)) this.OnPerseverenceCardSelect(v, z);
            ctx.restore();
        });


        //this.Perseverance
        this.cards.forEach((v, z) => {
            let i = z - lm;
            let h = 35;
            let mx = 0;
            ctx.save();

            ctx.strokeStyle = "#af2";
            //if (this.isMe)
            if (this.selected == z || v.ShowTo == true) { h = -5; ctx.scale(1.2, 1.2); mx = 10; ctx.strokeStyle = "#a00"; ctx.translate(0, -50); }
            ctx.translate(i * 111 - mx, h);

            if (e != undefined) {
                let c = ctx.getWindowToCanvas(e);
                if (this.moveOneCard && this.selected == z && this.isMe) {
                    this.move = { x: c.x - 20, y: c.y - 20 };
                    c.x = 1;
                    c.y = 1;

                }


            }

            if (this.isMe && this.selected == z && this.move != null && this.moveOneCard) {
                ctx.translate(this.move.x, this.move.y);
            } else ctx.rotate(i / 50 * Math.PI);


            if (v.Draw(ctx, e)) errortext = this.OnCardSelect(v, z, actionOnSelectSecondCard, selectNearPlayersCards);


            ctx.strokeStyle = "#af2";

            ctx.restore();
        });




        ctx.strokeStyle = "#005";
        ctx.font = 'bold 48px serif';
        ctx.fillText(this, 20, 20);
        ctx.strokeText(this, 20, 20);
        ctx.stroke();
        //ctx.drawImage(this.img, 0, 0, CardType.width, CardType.height);
        try {
            if (this.Avatar != null) ctx.drawImage(this.Avatar, -80, -60, 90, 90);
        } catch (e) { }
        if (errortext != '') TextLabels.ErrorLabelText(errortext);

        if (this.shader != null) ctx.drawImage(this.shader.Draw(undefined, 100, 100), Player.x1, Player.y1, Player.x2, Player.y2);

    }



    OnPlayerSelect(callback, isNearOnly) {
        if (this.isMe) return 'Выбери другого игрока';
        if (!this.isNear && isNearOnly == true) return 'Выбери ближайшего игрока';
        game.opponent = this;  //'это нужно если сейчас действует карта соблазн'
        game.selectedOpponent = this; // это нужно чтобы сработало "выделение" игрока
        this.isPlayerSelected = true; //видимо так надо будет переделать выделение в будущем , но тогда могут быть выделены несколько игроков, така что это спорная строчка
        if (this.selectedCard != null) this.selectedCard.card.RemoveOldAddNewButtons(this, this.selectedCard); //чтобы кнопки действий возникали 
        if (callback != undefined) callback(this);


    }

    OnPerseverenceCardSelect(v, z) {

        selectPerseverance(v);

    }

    OnCardSelect(v, z, actionOnSelectSecondCard, selectNearPlayersCards) {


        if (game.me.isMyTurnToDefend && !this.isMe) return 'Выбери никакого шашлыка';
        if (game.me.isMyTurnToDefend && this.isMe) {


        }

        if (game.me.isStartTurnExchangeIn && !this.isMe) return 'Выбери свою карту для обмена в ответ';
        if (game.me.isStartTurnExchangeIn && this.isMe) {
            let isInExchange = undefined;
            let c = v.card.GetAnswerArray(this, game.opponent);

            c.forEach((i) => {
                if (i.isInExchange != undefined) isInExchange = i.isInExchange;
            });

            if (isInExchange == undefined || isInExchange == false) return 'Выбери другую карту для обмена в ответ';
        }

        if (game.me.isEndTurnExchange && !this.isMe) return 'Выбери свою карту для обмена';
        if (game.me.isEndTurnExchange && this.isMe) {
            let isOutExchange = undefined;
            let c = v.card.GetExchangeArray(this, game.opponent);

            c.forEach((i) => {
                if (i.isOutExchange != undefined) isOutExchange = i.isOutExchange;
            });
            if (isOutExchange == undefined || isOutExchange == false) return 'Выбери другую карту для обмена';
            //outChangeAction(v);

        }



        if (this.PanicCount > 0 && !v.card.isPanic) return 'Выбери панику';

        if (selectNearPlayersCards && !this.isMe) {
            if (this.isNear) {
                this.selected = z; this.selectedCard = v;
                if (actionOnSelectSecondCard != undefined) actionOnSelectSecondCard(this.playername, v);
                return '';
            }
            return 'Выбери карту ближайшего игрока';
        }

        this.selected = z; this.selectedCard = v; v.card.RemoveOldAddNewButtons(this, v)
        return '';
    }


};


