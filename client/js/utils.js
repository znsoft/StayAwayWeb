CanvasRenderingContext2D.prototype.measureText = function (text, font) {
    const span = document.createElement('span');
    span.appendChild(document.createTextNode(text));
    Object.assign(span.style, {
        font: font,
        margin: '0',
        padding: '0',
        border: '0'
        , whiteSpace: 'pre-line'

    });
    document.body.appendChild(span);
    const { width, height } = span.getBoundingClientRect();
    span.remove();
    return { width, height };
}


CanvasRenderingContext2D.prototype.drawPoint = function (x, y, circleRadius, fillStyle, labels) {
    if (labels == "" || labels == undefined || labels == null) return;
    if (typeof (labels) != "string") return;
    this.beginPath();

    this.drawTooltip(x, y, labels);

    this.fillStyle = fillStyle;

    var point = new Path2D();

    point.arc(x, y, circleRadius, 0, 2 * Math.PI);

    this.fill(point);


    this.closePath();
}


CanvasRenderingContext2D.prototype.drawTooltip = function (x, y, label, alignY = 25) {

    const { width, height } = this.measureText(label, '20px Arial, Helvetica, sans-serif');

    const reactWidth = width + 10;
    const reactHeight = height + 10;
    const reactX = x + 12;
    const reactY = y - alignY;
    const labelX = reactX + ((reactWidth - width) / 2);
    const labelY = reactY + 22;

    this.beginPath();

    this.font = '20px Arial, Helvetica, sans-serif';
    let y1 = labelY;
    this.strokeStyle = 'red';
    this.fillStyle = "white";
    let labels = label.split("\n").forEach(s => {

        this.fillText(s, labelX, y1);
        y1 += alignY;
    });
    // this.strokeText(label, labelX, labelY);
    this.fillStyle = "green";
    this.strokeStyle = 'green';
    this.roundRect(reactX, reactY, reactWidth, reactHeight, 10).fill();


    //this.fillRect(reactX, reactY, reactWidth, reactHeight);


    this.closePath();
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

CanvasRenderingContext2D.prototype.getWindowToCanvas = function (e) {
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


    var transform = this.getTransform();
    const invMat = transform.invertSelf();
    return {
        x: x * invMat.a + y * invMat.c + invMat.e,
        y: x * invMat.b + y * invMat.d + invMat.f
    };
}

CanvasRenderingContext2D.prototype.getCanvasToWindow = function (x, y) {

    var invMat = this.getTransform();
    //const invMat = transform.invertSelf();
    return {
        x: x * invMat.a + y * invMat.c + invMat.e,
        y: x * invMat.b + y * invMat.d + invMat.f
    };
}



