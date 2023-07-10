class Lines {
    static lines = new Map();
    static shader = new Shadertoy("shaders/pixelpad.glsl");
    static width = 10;
    constructor(card, to) {
        this.card = card;
        //this.from = from;
        this.to = to;

        this.startpos = card;
        Lines.lines.set(card, this);
    }

    static AddLine(card, lineTo) {

        new Lines(card, lineTo);

    }

    static DrawAll(ctx, game) {
        Lines.lines.forEach((v, k) => {
            try {
                v.endpos = Animator.getPosition(game, v.to);
                v.Draw(ctx);
            } catch (e) { }
        });


    }


    static Delete(id) {
        Lines.lines.delete(id);

    }

    static DeleteAll() {
        Lines.lines.clear();
    }

    Draw(ctx) {
        ctx.save();
        //ctx.beginPath(); // Start a new path
        //ctx.moveTo(this.startpos.x, this.startpos.y); // Move the pen to (30, 50)
        //ctx.lineTo(this.endpos.x, this.endpos.y); // Draw a line to (150, 100)
        //ctx.stroke(); // Render the path
        let xx = this.endpos.x - this.startpos.x;
        let yy = this.endpos.y - this.startpos.y;
        let d = Math.sqrt(xx * xx + yy * yy);
        let ang = Math.atan2(yy, xx);
        ctx.translate(this.startpos.x, this.startpos.y);
        ctx.rotate(ang);
        ctx.drawImage(Lines.shader.Draw(undefined, 100, 100), 0, -Lines.width / 2, d, Lines.width);

        ctx.restore();

    }



}

