

class Deck {

    static Table = { x: 0, y: 100, w: 2 * CardType.width + 10, h: CardType.height + 10 }
    static Drop = { x: 200, y: -50, w: CardType.width, h: CardType.height }
    static Deck = { x: 0, y: 0, w: CardType.width, h: CardType.height }

    constructor(upCard, cardsLeft, dropCount, drop = [], table = [], deck) {
        this.tableMove = {};
        this.dropMove = {};
        this.doorsMove = [];
        this.deckMove = {};



        this.upCard = new Card(findCardByNum(upCard), "deck", 0, {});
        this.cardsLeft = cardsLeft;
        this.Doors = [];
        this.Drop = dropCount;
        this.x = 0;
        this.y = 0;
        this.dropX = 0;
        this.dropY = 0;


        this.drop = drop.reverse().map((v, i) => new Card(findCardByNum(v), "drop", i, {}));
        this.table = table == undefined ? [] : table.map((v, i) => new Card(findCardByNum(v), "table", i, {}));
        if (deck == undefined) return;
        if (deck.dropmove != undefined) Animator.AddCardmove(this.drop[0], deck.dropmove.from, deck.dropmove.to);
        if (deck.tablemove != undefined) Animator.AddCardmove(this.table[0], deck.tablemove.from, deck.tablemove.to);
        if (deck.deckmove != undefined) Animator.AddCardmove(this.upCard, deck.deckmove.from, deck.deckmove.to);


    }

    getDropCard() {

        if (this.drop.length == 0) return undefined;
        return this.drop[0];


    }

    getTableCard() {

        if (this.table.length == 0) return undefined;
        return this.table[0];


    }

    getDeckCard() {

        return this.upCard;


    }

    Draw(ctx, e) {
        let scrDeck = ctx.getCanvasToWindow(0, 0);
        this.x = scrDeck.x;//this.transform.e;
        this.y = scrDeck.y;//this.transform.f
        ctx.save();
        // ctx.globalCompositeOperation = 'destination-over';
        ctx.translate(this.cardsLeft * 2 + Deck.Deck.x, this.cardsLeft * 2 + Deck.Deck.y);
        ctx.rotate(Math.PI / 2);
        this.upCard.Draw(ctx, e);

        ctx.restore();

        for (let i = this.cardsLeft; i > 1; i--) {

            ctx.save();
            ctx.translate(i * 2 + Deck.Deck.x, i * 2 + Deck.Deck.y);
            ctx.rotate(Math.PI / 2);
            Cards.UnknownAction.Draw(ctx);
            ctx.restore();
        }


        ctx.save();
        // ctx.globalCompositeOperation = 'destination-over';
        ctx.translate(Deck.Table.x, Deck.Table.y);
        //ctx.rotate(Math.PI / 2);

        this.table.forEach((v, i) => {

            ctx.save();
            ctx.translate(i * 102, i * 2);
            //ctx.rotate(Math.PI / 2);
            v.Draw(ctx, e);
            ctx.restore();

        });


        ctx.restore();


        ctx.save();
        // ctx.globalCompositeOperation = 'destination-over';
        ctx.translate(Deck.Drop.x, Deck.Drop.y);


        this.drop.forEach((v, i) => {

            ctx.save();
            ctx.translate(i * 1, i * 1 + 40);
            ctx.rotate(Math.PI / 1.5 + i / 120);
            v.Draw(ctx);

            ctx.restore();


        });


        ctx.rotate(Math.PI / 2.5);
        ctx.fillStyle = "#000";
        ctx.font = '16px serif';
        ctx.fillText("Сброс", 10, 20);
        ctx.roundRect(0, 0, Deck.Drop.w, Deck.Drop.h, 10).stroke();
        //if (this.Drop == 0)Cards.UnknownAction.Draw(ctx);

        ctx.restore();




    }

};

