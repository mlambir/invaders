var player;
var enemies;
var canvas;
var context;
var explosions;
var info_tag;
var bullets;
var fps;

var STROKE_COLOR = "#CCC";
/* step0. set everything up, load sprites etc. */
function setup() {
    bullets = new jaws.SpriteList();
    fps = document.getElementById("fps");
    info_tag = document.getElementsByTagName('info');

    canvas = document.getElementsByTagName('canvas')[0];
    context = canvas.getContext('2d');

    player = new Spaceship({x: canvas.width/2 +.5, y:canvas.height-15, context: context});
    //new jaws.Sprite({image: "img/plane.png", x: canvas.width/2, y:canvas.height-30, context: context});

    enemies = new jaws.SpriteList();
    var enemies_x = 6;
    var enemies_y = 4;

    for(var i = 0; i < enemies_x; i++){
        for(var j = 0; j < enemies_y; j++){
            enemies.push(new Enemy({x:(jaws.width/(enemies_x+1) )*(i+1), y: 20 + 15 * j}));
        }
    }
    jaws.on_keydown("esc", setup);
    jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);

    explosions = new jaws.SpriteList();
}

var gun_cooldown = 300;
var last_shot = 0;

/* step1. execute the game logic */
function update() {
    if(jaws.pressed("left"))  { player.x -= 1 }
    if(jaws.pressed("right")) { player.x += 1 }
    //if(jaws.pressed("up"))    { player.y -= 2 }
    //if(jaws.pressed("down"))  { player.y += 2 }
    if(jaws.pressed("space")) {
        var t = new Date().getTime();
        if(t-gun_cooldown > last_shot){
            bullets.push( new Bullet({x:player.rect().x + player.rect().width/2, y:player.y}) );
            last_shot=t;
        }
    }

    bullets.update();
    explosions.update();

    explosions.removeIf(function(ex){return ex.frame > ex.frames;})

    forceInsideCanvas(player);
    bullets.removeIf(isOutsideCanvas);


    jaws.collideManyWithMany(bullets, enemies).forEach(function(el){
        bullets.remove(el[0]);
        explosions.push(new Explosion(context, el[1]));
        enemies.remove(el[1]);
    });
}

/* step2. draw the update state on screen */
function draw() {
    jaws.clear();        // Same as: context.clearRect(0,0,jaws.width,jaws.height)

    player.draw();
    bullets.draw();  // will call draw() on all items in the list
    enemies.draw();
    explosions.draw();

    info_tag.innerHTML = "FPS: " + jaws.game_loop.fps + " Player position: " + player.x + "/" + player.y + ". W/H: " + canvas.width + "/" + canvas.height;
    fps.innerHTML = jaws.game_loop.fps
}

/* 2 functions that will help us remove bullets outside the canvas + keep the plane within the canvas. */
function isOutsideCanvas(item) { return (item.x < 0 || item.y < 0 || item.x > canvas.width || item.y > canvas.height) }
function forceInsideCanvas(item) {
    if(item.x < 0)                    { item.x = 0  }
    if(item.x + item.width > canvas.width)     { item.x = canvas.width - item.width }
    if(item.y < 0)                    { item.y = 0 }
    if(item.y + item.height  > canvas.height)  { item.y = canvas.height - item.height }
}

function DynamicSprite(options, width, height){
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    this.image = canvas;

    options["anchor"] = "center";


    if(this.draw_sprite)
        this.draw_sprite(context);

    jaws.Sprite.call(this, options);
}

DynamicSprite.prototype = new jaws.Sprite({});
DynamicSprite.prototype.constructor = DynamicSprite;

function Spaceship(options) {
    var width = 9;
    var height = 7;

    this.draw_sprite = function(context){
        context.beginPath();
        context.moveTo(width/2, 0);
        context.lineTo(0,height);
        context.lineTo(width, height);
        context.closePath();
        context.lineWidth = 1;
        context.strokeStyle = STROKE_COLOR;
        context.stroke();
    };

    DynamicSprite.call(this, options, width, height);
}

Spaceship.prototype = new DynamicSprite({});
Spaceship.prototype.constructor = Spaceship;

function Enemy(options) {
    var width = 15;
    var height = 10;

    this.draw_sprite = function(context){
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(width, 0);
        context.lineTo(width/2, height);
        context.closePath();
        context.lineWidth = 1;
        context.strokeStyle = STROKE_COLOR;
        context.stroke();
    };

    DynamicSprite.call(this, options, width, height);
}

Enemy.prototype = new DynamicSprite({});
Enemy.prototype.constructor = Enemy;

function Bullet(options) {
    var width = 1;
    var height = 2;

    this.draw_sprite = function(context){
        context.beginPath();
        context.moveTo(.5, 0);
        context.lineTo(.5,height);
        context.closePath();

        context.lineWidth = 1;
        context.strokeStyle = STROKE_COLOR;
        context.stroke();
    };

    this.update = function(){
        this.move(0, -2);
    };

    DynamicSprite.call(this, options, width, height);
}

Bullet.prototype = new DynamicSprite({});
Bullet.prototype.constructor = Bullet;

function Explosion(ctx, sprite){
    this.ctx = ctx;
    this.image = sprite.asCanvas();

    this.frame = 0;
    this.frames = 20;

    this.width = sprite.rect().width;
    this.height= sprite.rect().height;
    this.x = sprite.x - this.width/2;
    this.y = sprite.y - this.height/2;

    this.update = function(){
        this.frame++;
        this.y++;
    }

    this.draw = function(){
        context.drawImage(this.image, this.x, this.y);

    }
}

jaws.start();  // Per default this will load assets, call setup(), then loop update() and draw() in 60 FPS.