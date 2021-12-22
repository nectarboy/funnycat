const clickcounter = document.getElementById('clickcounter');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

var screenwidth = 0;
var screenheight = 0;
function resizeScreen() {
    screenwidth = window.innerWidth;
    screenheight = window.innerHeight;

    canvas.width = screenwidth;
    canvas.height = screenheight;

    ctx.imageSmoothingEnabled = false;
};

window.onresize = resizeScreen;

loadAssets
(
[
    ['catimg', Image, 'src/le_chat.png'],
    ['meowsound', Audio, 'src/meow.wav'],
    ['promptsound', Audio, 'src/prompt.wav'],
    ['resetsound', Audio, 'src/reset.wav']
],

function() {

    // Background

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

    // Shadow

    const shadowcolor = '#444444';
    function setShadow(offset) {
        ctx.shadowColor = shadowcolor;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = ctx.shadowOffsetY = offset;
    }

    // Cat

    const cat = {
        sincounter: 0,
        sindiv: 10,
        circlediam: 30,
        scale: 2,
        shadowblur: 0,
        shadowoff: 8,
        specialspawnchance: 0.015,
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

            setShadow(Math.cos(this.sincounter/this.sindiv) * this.shadowoff);

            ctx.drawImage
            (
                this.sprite,
                0|(this.x - catwidth/2 + this.offx), 
                0|(this.y - catheight/2 + this.offy),
                catwidth,
                catheight
            );
        },

        checkSpecialSpawn() {
            if (Math.random() >= (1-this.specialspawnchance)) {
                // ... more here later
                playSound('promptsound');
            }
        }
    };

    // Loop

    function drawBg() {
        ctx.fillStyle = getBgColorString();
        ctx.fillRect(0, 0, screenwidth, screenheight);
    }

    var framerequested = false;
    function requestFrame() {
        if (framerequested)
            return;

        framerequested = true;
        requestAnimationFrame(draw); // hell yea
    }

    function draw() {
        framerequested = false;

        drawBg();
        cat.draw();
    }

    function loop() {
        cat.update();
        updateBgColor();

        requestFrame();
    }

    // Click Counter

    var catclicks = 0;
    var setstorageclicks = function() {};

    function displayCatClicks() {
        clickcounter.innerHTML = catclicks + ' clicks';
    }

    function resetCatClicks() {
        catclicks = 0;
        setstorageclicks();
        displayCatClicks();
        playSound('resetsound');

        console.log('reset cat clicks :0');
    }

    // init local data
    try {
        const nectarboy_funnycat_clicks = parseInt(window.localStorage.nectarboy_funnycat_clicks);
        if (nectarboy_funnycat_clicks > 0) {
            catclicks = nectarboy_funnycat_clicks;
            displayCatClicks();
        }
        else {
            window.localStorage.nectarboy_funnycat_clicks = '0';
        }

        setstorageclicks = function() {
            window.localStorage.nectarboy_funnycat_clicks = catclicks.toString();
        }
    }
    catch (e) {
        console.log(e);
        console.log('local storage fail :(')
    }

    function catClick() {
        catclicks++;
        setstorageclicks();
        displayCatClicks();

        cat.checkSpecialSpawn();

        playSound('meowsound');
    }

    // secret reset feature
    var timespressedresetkey = 0;
    const maxresetkeypresses = 5;
    const clickresetkey = 'KeyC';

    function checkForResetClicks(e) {
        if (e.code === clickresetkey) {
            timespressedresetkey++;

            if (timespressedresetkey === maxresetkeypresses) {
                playSound('promptsound');
                if (confirm('reset click counter to 0 ?') && confirm('are you absolutely sure ???')) {
                    resetCatClicks();
                }
                timespressedresetkey = 0;
            }
        }
        else {
            timespressedresetkey = 0;
        }
    }

    // Execute

    resizeScreen();
    setInterval(loop, 1000/59.998);

    canvas.onmousedown = function() {
        catClick();
    };
    document.onkeydown = function(e) {
        checkForResetClicks(e);
    };

});

// meowzers !!!!