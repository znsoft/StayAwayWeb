

class Button {
    //static height = 
    constructor(id, text, x, y, w, h, callback, p) {
        this.id = id;
        this.text = text;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.callback = callback;
        Button.buttons.set(id, this);
        this.p = p;
        //this.p1 = p1;

    }

    static buttons = new Map();

    static add() {


    }

    static DrawAll(ctx, e) {
        Button.buttons.forEach((v, k) => v.Draw(ctx, e));

    }

    static Delete(id) {
        Button.buttons.delete(id);

    }

    static DeleteAll() {
        Button.buttons.clear();
    }

    Draw(ctx, e) {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.fillStyle = "#000";
        ctx.font = '16px serif';
        ctx.fillText(this.text, 3, 16);
        ctx.roundRect(0, 0, this.w, this.h, 5).stroke();
        ctx.fillStyle = "green";
        ctx.roundRect(0, 0, this.w, this.h, 5).fill();//stroke();
        // if (e != undefined) {
        if (e != undefined && e.type != 'mousemove') {
            let c = ctx.getWindowToCanvas(e);

            if (c != undefined)
                if (c.x > 0 && c.x < this.w && c.y > 0 && c.y < this.h && this.callback != undefined) {

                    this.callback(this.p); game.me.selected = null; game.moveOneCard = false;
                }
        }
        ctx.restore();

    }

}


