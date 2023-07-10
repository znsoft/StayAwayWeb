

class TextLabels {

    constructor(id, text, x = 0, y = undefined, c = "#000", s = 1, t = 3000) {
        this.id = id;
        this.text = text;
        this.x = x;
        this.y = y;
        this.c = c;
        this.s = s;
        this.t = t;
        this.isHint = false;
        this.e = undefined;
        TextLabels.labels.set(id, this);

        if (t > 0) setTimeout(() => {
            TextLabels.Delete(id);
        }, t);


    }
    static lastY = 230;
    static offsetY = 0;
    static labels = new Map();

    static hint(x, y, text, c) {
        let tl = new TextLabels("Hint", text, x, y, c, 1, 0);
        tl.isHint = true;

    }



    static ErrorLabelText(text) {
        TextLabels.lastY = game.height / 2 + 100;
        new TextLabels(TextLabels.labels.size, text, game.width / 2 + 100);//, 0, TextLabels.lastY);


    }

    static DrawAll(ctx, e) {
        let offset = 0;
        TextLabels.labels.forEach((v, k) => { offset = v.Draw(ctx, e, offset) });
        //TextLabels.lastY -= 17;
    }

    static Delete(id) {
        TextLabels.labels.delete(id);

    }

    static DeleteAll() {
        TextLabels.labels.clear();
    }

    Draw(ctx, e, offset = 0) {
        let y = this.y;
        let l = 0;
        if (this.y == undefined) y = TextLabels.lastY;
        y += offset;

        ctx.save();
        ctx.translate(this.x, y);
        ctx.fillStyle = this.c;
        ctx.font = '16px serif';
        ctx.scale(this.s, this.s);
        ctx.strokeStyle = 'white';
        // this.fillStyle = "white";

        if (this.text != undefined)
            if (this.isHint) {
                ctx.drawPoint(this.x, this.y, 5, this.c, this.text);
                //ctx.drawPoint(this.x, this.y, 5, this.c, [this.text.replace("\n","<br>")]);
            } else
                for (var s of this.text.split("\n")) {
                    //ctx.strokeText(s, 0, l += 17);
                    ctx.fillText(s, 0, l += 17);//+= 17);
                }

        //TextLabels.lastY = y;
        ctx.restore();
        //ctx.fillText(this.text);//, 3, this.text.length);
        return l + offset;

    }


}
