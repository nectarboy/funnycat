var screenwidth = 0;
var screenheight = 0;
function resizescreen() {
    screenwidth = window.innerWidth;
    screenheight = window.innerHeight;

    canvas.width = screenwidth;
    canvas.height = screenheight;

    ctx.imageSmoothingEnabled = false;
};

window.onresize = resizescreen;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

loadAssets
(
[
    ['catimg', Image, 'src/le_chat.png'],
    ['meowsound', Audio, 'src/meow.wav']
],

function() {

    //'#f50a0a', '#ff7519', '#ffff24', '#54de2a', '#203ee6', '#7219a6'
    // im too lazy to type it all out so yuh
    function getColorList(arr) {
        const list = [];

        for (var i = 0; i < arr.length; i++) {
            const string = arr[i].slice(1);
            list[i] = 
            [
                0xff&(parseInt(string, 16) >> 16),
                0xff&(parseInt(string, 16) >> 8),
                0xff&(parseInt(string, 16) >> 0),
            ];
        }

        return list;
    }

    const bgcolorlist = getColorList(['#f50a0a', '#ff7519', '#ffff24', '#54de2a', '#203ee6', '#7219a6']);
    const bgcolorspeed = 30;
    var bgcolorindex = 0;
    var bgcolortick = 0;

    function updateBgColor() {
        if (bgcolortick === bgcolorspeed) {
            bgcolortick = 0;

            bgcolorindex++;
            if (bgcolorindex === bgcolorlist.length) {
                bgcolorindex = 0;
            }
        }
        else {
            bgcolortick++;
        }
    }

    function interpolate(a, b, i) {
        return 0|((1-i)*a + (i)*b);
    }

    function getBgColorString() {
        const progress = bgcolortick / bgcolorspeed;

        const now = bgcolorlist[bgcolorindex];
        const next = bgcolorlist
        [
            (bgcolorindex === bgcolorlist.length-1)
            ? 0
            : bgcolorindex+1
        ];
        const color = [0,0,0];

        var string = 'rgb(';
        string += (interpolate(now[0], next[0], progress)).toString() + ',';
        string += (interpolate(now[1], next[1], progress)).toString() + ',';
        string += (interpolate(now[2], next[2], progress)).toString() + ')';

        return string;
    }

    const cat = {
        sincounter: 0,
        sindiv: 10,
        circlediam: 30,
        scale: 2,
        shadowcolor: '#444444',
        shadowblur: 0,
        shadowoff: 8,
        x: 0,
        y: 0,
        offx: 0,
        offy: 0,
        sprite: assets['catimg'],

        update() {
            const sininput = this.sincounter/this.sindiv;
            this.x = Math.sin(sininput) * this.circlediam; // i love math
            this.y = Math.cos(sininput) * this.circlediam;
            this.sincounter++;

            this.offx = screenwidth/2;
            this.offy = screenheight/2;
        },

        draw() {
            const catwidth = this.sprite.width * this.scale;
            const catheight = this.sprite.height * this.scale;

            ctx.shadowColor = this.shadowcolor;
            ctx.shadowBlur = this.shadowblur;
            ctx.shadowOffsetX = ctx.shadowOffsetY = Math.cos(this.sincounter/this.sindiv) * this.shadowoff;

            ctx.drawImage
            (
                this.sprite,
                0|(this.x - catwidth/2 + this.offx), 
                0|(this.y - catheight/2 + this.offy),
                catwidth,
                catheight
            );
        },

        meow() {
            playSound('meowsound');
        }
    };

    function drawbg() {
        ctx.fillStyle = getBgColorString();
        ctx.fillRect(0, 0, screenwidth, screenheight);
    }

    var framerequested = false;
    function requestframe() {
        if (framerequested)
            return;

        framerequested = true;
        requestAnimationFrame(draw); // hell yea
    }

    function draw() {
        framerequested = false;

        drawbg();
        cat.draw();
    }

    function loop() {
        cat.update();
        updateBgColor();

        requestframe();
    }

    resizescreen();
    setInterval(loop, 1000/59.998);

    document.onmousedown = function() {
        cat.meow();
    };

});

// meowzers !!!!