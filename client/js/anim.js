
    
    class Animator {
        static easetime = 0.3;
        static frames = 1000;
        static moves = new Map();
        constructor(card, from, to) {
            this.ctx = undefined;
            this.isMove = false;
            this.card = card;
            this.from = from;
            this.to = to;
            this.endpos = null;
            this.startpos = null;
            this.t = Animator.easetime;
            this.speed = this.t / Animator.frames;

            this.currentpos = null;

            this.starttime = Date.now();
            Animator.moves.set(card, this);


        }

        static EndGame(game) {
            let cards = game.Deck.cardsLeft;
            for (let t = 0; t < Math.random() * 88; t++) {
                let cardnum = Math.round(Math.random() * 29);


                let str = {
                    isMove: true,
                    from: {
                        type: "deck",
                    },
                    to: {
                        type: "coord",
                        x: Math.random() * game.width,
                        y: Math.random() * game.height
                    }

                };

                Animator.AddCardmove(new Card(findCardByNum(cardnum), "deck", 0, str), str.from, str.to);

            }



        }

        static AddCardmove(card, from, to) {
            new Animator(card, from, to);
        }


        static IsNotMove(card) {
            let a = Animator.moves.get(card);
            if (a == undefined) return true;
            //if(a.isMove == true)return false;
            return false;
        }

        static DrawAll(ctx, game) {
            Animator.moves.forEach((v, k) => {
                try {
                    if (v.isMove == false) {
                        v.StartMove(Animator.getPosition(game, v.from), Animator.getPosition(game, v.to));
                        //v.Move(ctx);
                    } else
                        v.Move(ctx);
                } catch (e) { }
            });


        }

        static getPosition(game, fromto) {
            if (fromto == undefined) return;
            //let coord = {x:player.x,y:player.y};
            let c = undefined;
            switch (fromto.type) {
                case "player":
                    let player = game.findPlayerByNum(fromto.player);
                    if (player == null) return { x: 0, y: 0 };
                    let coord = { x: player.x, y: player.y };

                    c = player.findCardByPlace(fromto.place);
                    if (c != undefined) coord = { x: c.x, y: c.y };
                    return coord;

                    break;
                case "deck":
                    c = game.Deck.getDeckCard();
                    if (c != undefined) return { x: c.x, y: c.y };
                    break;
                case "drop":
                    c = game.Deck.getDropCard();
                    if (c != undefined) return { x: c.x, y: c.y };
                    break;
                case "table":
                    c = game.Deck.getTableCard();
                    if (c != undefined) return { x: c.x, y: c.y };
                    break;
                case "door":

                    break;
                case "coord":
                    return fromto;

                    break;

            }


        }


        StartMove(startpos, endpos) {
            if (this.isMove == true) return;
            if (startpos == undefined) { Animator.Delete(this.card); return; }
            if (endpos == undefined) { Animator.Delete(this.card); return; }
            this.startpos = startpos; this.currentPos = startpos;
            this.endpos = endpos;
            this.delta = { x: endpos.x - startpos.x, y: endpos.y - startpos.y };
            this.len = Math.max(Math.abs(this.delta.x), Math.abs(this.delta.y));
            if (this.len > 1000) this.len = 1000;
            this.starttime = Date.now();
            this.t = Animator.easetime * this.len;
            this.isMove = true;
            setTimeout(() => {
                //console.log("endmove");
                Animator.Delete(this.card);
            }, this.t);

        }


        Draw(ctx) {

            ctx.save();

            ctx.translate(this.currentpos.x, this.currentpos.y);
            //console.log(this.currentpos);
            this.card.card.Draw(ctx);
            ctx.restore();
        }


        Move(ctx) {
            let deltatime = (Date.now() - this.starttime) / this.t;

            this.currentpos = { x: this.startpos.x + (this.delta.x * deltatime), y: this.startpos.y + (this.delta.y * deltatime) };
            this.Draw(ctx);

        }


        static Delete(card) {
            Animator.moves.delete(card);

        }

        static DeleteAll() {
            Animator.moves.clear();
        }


    }

