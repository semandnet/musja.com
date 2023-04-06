window.onload = function() {
    var canvas = document.getElementById("gameCanvas");
    canvas.width = 360;
    canvas.height = 480;
    var ctx = canvas.getContext("2d");

    POP.init();
};

var POP = {
    WIDTH: 360,
    HEIGHT: 480,
    nextBubble: 100,
    entities: [],
    wave: {
        total: 10,
        x: -25,
        y: -40,
        r: 50,
        time: 0,
        offset: 0
    },
    score: {
        taps: 0,
        hit: 0,
        escaped: 0,
        accuracy: 0
    },
    init: function() {
        var self = this;
        
        this.ctx = document.getElementById("gameCanvas").getContext("2d");

        this.Input.init();

        this.loop();

        POP.wave.total = Math.round(POP.WIDTH / POP.wave.r) + 1;
        
        POP.ctx.fillStyle = "#3b3a30";
        POP.ctx.fillRect(0, 0, POP.WIDTH, POP.HEIGHT);
    },

    update: function() {
        var i,
            checkCollision = false;

        POP.nextBubble -= 1;
        if (POP.nextBubble < 0) {
            POP.entities.push(new POP.Bubble());
            POP.nextBubble = (Math.random() * 100) + 100;
        }

        if (POP.Input.tapped) {
            POP.score.taps += 1;
            POP.entities.push(new POP.Touch(POP.Input.x, POP.Input.y));
            POP.Input.tapped = false;
            checkCollision = true;
        }

        for (i = 0; i < POP.entities.length; i += 1) {
            POP.entities[i].update();

            if (POP.entities[i].type === 'bubble' && checkCollision) {
                hit = POP.collides(POP.entities[i], 
                                    {x: POP.Input.x, y: POP.Input.y, r: 7});
                if (hit) {
                    for (var n = 0; n < 5; n += 1) {
                        POP.entities.push(new POP.Particle(
                            POP.entities[i].x,
                            POP.entities[i].y,
                            2,
                            'rgba(255,255,255,' + Math.random() * 1 + ')'
                        ));
                    }
                    POP.score.hit += 1;
                } else {
                    POP.entities.push(new POP.Particle(
                        POP.Input.x,
                        POP.Input.y,
                        2,
                        'rgba(255,0,0,' + Math.random() * 1 + ')'
                    ));
                }
                POP.entities[i].remove = hit;
                                    
            }

            if (POP.entities[i].remove) {
                POP.entities.splice(i, 1);
            }
        }

        POP.wave.time = new Date().getTime() * 0.002;
        POP.wave.offset = Math.sin(POP.wave.time * 0.8) * 5;

        POP.score.accuracy = (POP.score.hit / POP.score.taps) * 100;
        POP.score.accuracy = isNaN(POP.score.accuracy) ?
            0 :
            ~~(POP.score.accuracy);
    },

    render: function() {
        var i;

        POP.Draw.rect(0, 0, POP.WIDTH, POP.HEIGHT, "#3b3a30");


        for (i = 0; i < POP.wave.total; i++) {
                POP.Draw.circle(
                    POP.wave.x + POP.wave.offset + (i * POP.wave.r),
                    POP.wave.y,
                    POP.wave.r,
                    "#5a5c5b"
                );
            }

            for (i = 0; i < POP.entities.length; i += 1) {
                POP.entities[i].render();
            }

            POP.Draw.text("Hit: " + POP.score.hit, 20, 30, 14, "#e8ddcb");
            POP.Draw.text("Escaped: " + POP.score.escaped, 20, 50, 14, "#e8ddcb");
            POP.Draw.text("Accuracy: " + POP.score.accuracy + "%", 20, 70, 14, "#e8ddcb");
        },
    
        loop: function() {
            requestAnimFrame(POP.loop);
            POP.update();
            POP.render();
        },
    
        collides: function(a, b) {
            var distance_squared = (Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
            return (distance_squared < Math.pow(a.r + b.r, 2));
        }
    };
    
    POP.Draw = {
        clear: function() {
            POP.ctx.clearRect(0, 0, POP.WIDTH, POP.HEIGHT);
        },
    
        rect: function(x, y, w, h, col) {
            POP.ctx.fillStyle = col;
            POP.ctx.fillRect(x, y, w, h);
        },
    
        circle: function(x, y, r, col) {
            POP.ctx.fillStyle = col;
            POP.ctx.beginPath();
            POP.ctx.arc(x + 5, y + 5, r, 0, Math.PI * 2, true);
            POP.ctx.closePath();
            POP.ctx.fill();
        },
    
        text: function(string, x, y, size, col) {
            POP.ctx.font = size + "px Georgia";
            POP.ctx.fillStyle = col;
            POP.ctx.fillText(string, x, y);
        }
    };
    
    POP.Input = {
        x: 0,
        y: 0,
        tapped: false,
    
        onTouchStart: function(e) {
            e.preventDefault();
            POP.Input.set(e.touches[0].pageX, e.touches[0].pageY);
            POP.Input.tapped = true;
        },
    
        onTouchMove: function(e) {
            e.preventDefault();
            POP.Input.set(e.touches[0].pageX, e.touches[0].pageY);
        },
    
        onTouchEnd: function(e) {
            e.preventDefault();
            POP.Input.tapped = false;
        },
    
        start: function() {
            const gameCanvas = document.getElementById('gameCanvas');
            gameCanvas.addEventListener('touchstart', POP.Input.onTouchStart, false);
            gameCanvas.addEventListener('touchmove', POP.Input.onTouchMove, false);
            gameCanvas.addEventListener('touchend', POP.Input.onTouchEnd, false);
        },
        
        set: function(x, y) {
            this.x = x - POP.ctx.canvas.offsetLeft;
            this.y = y - POP.ctx.canvas.offsetTop;
        },
    
        init: function() {
            var self = this;
            document.addEventListener("mousedown", function(e) {
                self.tapped = true;
                self.set(e.pageX, e.pageY);
            }, false);
    
            document.addEventListener("mouseup", function(e) {
                self.tapped = false;
            }, false);
    
            POP.Input.start();
        }
    };
    
    POP.Bubble = function() {
        this.type = "bubble";
        this.r = (Math.random() * 20) + 10;
        this.speed = (Math.random() * 3) + 1;
        this.x = (Math.random() * (POP.WIDTH - this.r * 2)) + this.r;
        this.y = POP.HEIGHT + this.r;
        this.remove = false;
    
        this.update = function() {
            this.y -= this.speed;
            this.x += Math.sin(POP.wave.time) * 2;
    
            if (this.y < -this.r) {
                POP.score.escaped += 1;
                this.remove = true;
            }
        };
    
        this.render = function() {
            POP.Draw.circle(this.x, this.y, this.r, "rgba(218, 227, 243, 0.7)");
        };
    };
    
    POP.Touch = function(x, y) {
        this.type = "touch";
        this.x = x;
        this.y = y;
        this.r = 5;
        this.opacity = 1;
        this.speed = 0.5;
        this.remove = false;
    
        this.update = function() {
            this.opacity -= this.speed;
    
            if (this.opacity < 0) {
                this.remove = true;
            }
        };
    
        this.render = function() {
            POP.Draw.circle(this.x, this.y, this.r, 'rgba(255, 0, 0, ' + this.opacity + ')');
        };
    };
    
    POP.Particle = function(x, y, r, col) {
        this.type = "particle";
        this.x = x;
        this.y = y;
        this.r = r;
        this.col = col;
        this.dir = (Math.random() * 2 * Math.PI);
        this.speed = (Math.random() * 1) + 0.5;
        this.remove = false;
    
        this.update = function() {
            this.x += Math.cos(this.dir) * this.speed;
            this.y += Math.sin(this.dir) * this.speed;
            this.r -= 0.1;
    
            if (this.r < 0) {
                this.remove = true;
            }
        };
    
        this.render = function() {
            POP.Draw.circle(this.x, this.y, this.r, this.col);
        };
    };
    
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();
        