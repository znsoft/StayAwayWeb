
    class CardType {
        static width = 95;
        static height = 150;
        static splace = 0;
        constructor(name, num, CardCaption, Description, img, Exchange, Answer, Action, SecondAction, isPanic = false, isUnknown = false) {
            this.name = name;
            this.num = num;
            this.isPanic = isPanic;
            this.isUnknown = isUnknown;
            this.CardCaption = CardCaption;
            this.Description = Description;
            this.img = new Image();
            this.img.src = img;
            this.Exchange = Exchange;//алгоритм который возвращает допустимые кнопки в фазе начала обмена относительно выбранной карты на своей руке
            this.Answer = Answer; //алгоритм который возвращает допустимые кнопки в фазе ответа относительно выбранной карты на своей руке
            this.Action = Action;//алгоритм который возвращает допустимые кнопки в фазе действия  относительно выбранной карты на своей руке
            this.SecondAction = SecondAction; //алгоритм который возвращает допустимые кнопки в фазе продолжения действия относительно карты на столе 
            CardType.splace++;
            this.place = CardType.splace;
            //this.opponent = null;//?????  opponent in card ???
            this.x = 0;
            this.y = 0;
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

        GetSecondActionArray(player, card) {
            if (this.SecondAction == null) return [];
            let check = null;
            if (Array.isArray(this.SecondAction)) check = this.SecondAction; else check = [this.SecondAction];
            if (typeof (this.SecondAction) == "function") check = this.SecondAction(player, card);
            if (check == null || check == undefined) return [];
            if (!Array.isArray(check)) check = [check];
            return check;

        }

        GetExchangeArray(player, other) {
            if (this.Exchange == null) return [];
            let check = null;
            if (Array.isArray(this.Exchange)) check = this.Exchange; else check = [this.Exchange];
            if (typeof (this.Exchange) == "function") check = this.Exchange(player, other);
            if (check == null || check == undefined) return [];
            if (!Array.isArray(check)) check = [check];
            return check;

        }

        GetAnswerArray(player, other) {
            if (this.Answer == null) return [];
            let check = null;
            if (Array.isArray(this.Answer)) check = this.Answer; else check = [this.Answer];
            if (typeof (this.Answer) == "function") check = this.Answer(player, other);
            if (check == null || check == undefined) return [];
            if (!Array.isArray(check)) check = [check];
            return check;

        }


        isCardMovableForAction(player) {
            let c = this.GetActionArray(player);
            return c.filter((v) => v.MayMove == true).length > 0;
        }

        RemoveOldAddNewButtons(player, z) {
            Button.DeleteAll();

            let c = [];
            switch (player.Phase) {
                case Phases.Nothing:


                    return;
                case Phases.Action:
                    c = this.GetActionArray(player);
                    break;
                case Phases.Exchange:
                    c = this.GetExchangeArray(player, game.opponent);//?????  opponent in card ???
                    break;

                case Phases.Answer:
                    c = this.GetAnswerArray(player, game.opponent);
                    break;
                case Phases.SecondAction:
                    game.Deck.table.forEach((v) => c = v.card.GetSecondActionArray(player, this));
                    break;


            }


            let x = 220;
            let y = 250;
            c.forEach((v) => {
                if (v.hasOwnProperty("Button")) {
                    new Button(v.Button.Text, v.Button.Text, x, y, v.Button.Text.length * 15, 30, v.Button.action, z);
                    x += v.Button.Text.length * 15 + 5;
                }
            });

        }

        Draw(ctx, e) {

            //ctx.beginPath();
            //if (this.isPanic && !this.isUnknown) ctx.scale(2.0, 2.0);
            ctx.fillStyle = "#000";
            ctx.font = '16px serif';
            //ctx.fillText(this.name, 10, 20);
            ctx.font = '16px serif';
            let y = CardType.height + 3;//16;
            for (var s of this.CardCaption.split("\n")) ctx.fillText(s, 1, y += 12);

            ctx.roundRect(0, 0, CardType.width, CardType.height, 10);


            ctx.clip();
            ctx.drawImage(this.img, 0, 0, CardType.width, CardType.height);



            ctx.fillStyle = this.isUnknown ? "#b92" : "#f5fb";
            ctx.fill();
            ctx.stroke();
            if (e != undefined) {
                let c = ctx.getWindowToCanvas(e);
                if (c != undefined)
                    if (c.x > 0 && c.x < CardType.width && c.y > 0 && c.y < CardType.height) {
                        let scr = ctx.getCanvasToWindow(c.x, c.y);
                        //                        TextLabels.hint(e.clientX/2, e.clientY/2, this.Description, 'black');
                        TextLabels.hint(scr.x / 2, scr.y / 2 - 30, this.Description, 'black');
                        if (e.type != 'mousemove')
                            return true;
                    }
            }
            return false;
        }


    };

