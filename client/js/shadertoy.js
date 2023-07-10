window.shaderlog = {};

    class Shadertoy {

        load(fragmentUrl) {

            // if (typeof (window.localStorage) === "undefined") {

            //  if (typeof (window.shaderlog[fragmentUrl]) === 'undefined') {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", fragmentUrl, false);
            xmlhttp.send();
            if ((xmlhttp.status === 200)) {
                window.shaderlog[fragmentUrl] = xmlhttp.responseText;
                this.fragSrc = xmlhttp.responseText;
            }
            //   } else {
            //     this.fragSrc = window.shaderlog[fragmentUrl];
            // }
            return;
            // }


            if (window["localStorage"]["getItem"](fragmentUrl) === null || parseInt(window["localStorage"]["getItem"](fragmentUrl).split('\u0003')[1], 16) < window["Date"]["now"]()) {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open("GET", fragmentUrl, false);
                xmlhttp.send();
                if ((xmlhttp.status === 200)) {
                    window["localStorage"]["setItem"](fragmentUrl, xmlhttp.responseText + "\u0003" + ((86400000) + window["Date"]["now"]()).toString(16));
                    this.fragSrc = xmlhttp.responseText;
                }
            } else {
                this.fragSrc = window["localStorage"]["getItem"](fragmentUrl).split('\u0003')[0];
            }
        }







        constructor(shader) {

            this.a = document.createElement("canvas");
            this.alpha = 0.4;
            //this.d;
            this.g = this.a.getContext('webgl');
            // GUI: canvas
            //this.a.style = 'width:100%;height:100vh;float:left';
            this.fragSrc = shader;
            this.load(shader);
            this.o = (new Date / 1e3);

            this.g.u = this.g.uniform1f;
            this.g.uv = this.g.uniform2f;

            this.p = this.g.createProgram();

            // Basic vertex shader
            // shaderSource(s=createShader(VERTEX_SHADER),"attribute vec2 p;void main(){gl_Position=vec4(p,0,1);}");
            let s = this.g.createShader(35633);
            this.g.shaderSource(s, 'attribute vec2 p;void main(){gl_Position=vec4(p,1,1);}');

            // Compile and attach it to the program
            // compileShader(s);
            this.g.compileShader(s);

            // DEBUGS
            if (!this.g.getShaderParameter(s, this.g.COMPILE_STATUS)) {
                this.g.getShaderInfoLog(s).trim().split("\n").forEach(ss =>
                    console.warn("[vertex shader] " + ss))
                //throw new Error("Error while compiling shader")
            };


            //attachShader(p,s);
            this.g.attachShader(this.p, s);

            // Main program
            // shaderSource(s=createShader(FRAGMENT_SHADER),'...');
            let s1 = this.g.createShader(35632);
            this.g.shaderSource(s1, this.fragSrc);
            //this.g.shaderSource(s1 ,'precision mediump float;uniform float t,a,x,y;void main(){vec3 f=vec3(gl_FragCoord.rg/640.-.5,1.);f.g*=a;float c=.5+x/500.,v=.5+y/500.;mat2 m=mat2(cos(c),sin(c),-sin(c),cos(c)),s=mat2(cos(v),sin(v),-sin(v),cos(v));f.rb*=m;f.rg*=s;vec3 r=vec3(1.,.5,.5);r+=vec3(t*2.,t,-2.);r.rb*=m;r.rg*=s;float g=.1,b=1.;vec3 i=vec3(0.);for(int l=0;l<20;l++){vec3 o=r+g*f*.5;o=abs(vec3(1.)-mod(o,vec3(2.)));float e,n=e=0.;for(int d=0;d<20;d++)o=abs(o)/dot(o,o)-.53,n+=abs(length(o)-e),e=length(o);if(l>6)b*=1.-max(0.,.3-n*n*.001);i+=b+vec3(g,g*g,g*g*g*g)*n*n*n*.0015*b;b*=.73;g+=.1;}i=mix(vec3(length(i)),i,.85);gl_FragColor=vec4(i*.01,1.);}');

            // Compile and attach it to the program
            // compileShader(s);
            this.g.compileShader(s1);

            // DEBUGS
            if (!this.g.getShaderParameter(s1, this.g.COMPILE_STATUS)) {
                this.g.getShaderInfoLog(s1).trim().split("\n").forEach(ss =>
                    console.warn("[fragment shader] " + ss))
                //throw new Error("Error while compiling shader")
            };

            // attachShader(p,s);
            this.g.attachShader(this.p, s1);

            // Link and start the program
            //linkProgram(P);
            this.g.linkProgram(this.p);

            //useProgram(p);
            this.g.useProgram(this.p);

            // Define a big triangle the canvas, containing the viewport
            // bindBuffer(g=ARRAY_BUFFER, createBuffer());
            let g = 34962;
            this.g.bindBuffer(g, this.g.createBuffer());

            // enableVertexAttribArray(0);
            this.g.enableVertexAttribArray(0);

            // vertexAttribPointer(0, 2, BYTE, 0, 0, 0);
            this.g.vertexAttribPointer(0, 2, 5120, 0, 0, 0);

            // bufferData(g,new Int8Array([-3, 1, 1, -3, 1, 1]), STATIC_DRAW);
            this.g.bufferData(g, new Int8Array([-3, 1, 1, -3, 1, 1]), 35044);
            this.Draw();
        }

        Draw(e, w, h) {
            e = e || window.event;
            this.a.height = w;
            this.a.width = h;
            this.g.viewport(0, 0, w, h);
            // Current playback time (in 1/200 seconds)
            this.g.u(this.g.getUniformLocation(this.p, 't'), (new Date / 1e3) - this.o);
            this.g.u(this.g.getUniformLocation(this.p, 'time'), (new Date / 1e3) - this.o);
            this.g.uv(this.g.getUniformLocation(this.p, 'resolution'), w, h);
            if (e != undefined) this.g.uv(this.g.getUniformLocation(this.p, 'mouse'), e.clientX, e.clientY);

            // Current sapect ration
            this.g.u(this.g.getUniformLocation(this.p, 'a'), h / w);
            this.g.u(this.g.getUniformLocation(this.p, 'alpha'), this.alpha);
            // Mouse coordinates
            //this.g.u(this.g.getUniformLocation(this.p,'x'), x);
            //u(gf(p,'y'), y);

            // Draw
            // drawArrays(TRIANGLE_FAN,0,3);
            this.g.drawArrays(6, 0, 3);

            return this.a;
        }

        FadeOut(callback) {
            this.interval =
                setInterval(() => {
                    this.alpha = this.alpha - 0.01;
                    if (this.alpha <= 0) { callback(); clearInterval(this.interval); }
                }, 100);

        }



    }