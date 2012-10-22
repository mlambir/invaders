var player;
var enemies;
var canvas;
var context;
var explosions;
var info_tag;
var my_bullets;
var enemy_bullets;
var fps;

var enemies_dir = 1;
var enemies_x = 8;
var enemies_y = 5;


var STROKE_COLOR = "#DDD";

function isInsideCanvas(item){
    return !(item.rect().x < 0 || item.rect().right > jaws.width || item.rect().y < 0 || item.rect.bottom > jaws.height);
}

/* step0. set everything up, load sprites etc. */
function setup() {
    my_bullets = new jaws.SpriteList();
    enemy_bullets = new jaws.SpriteList();
    fps = document.getElementById("fps");
    info_tag = document.getElementsByTagName('info');

    canvas = document.getElementsByTagName('canvas')[0];
    context = canvas.getContext('2d');

    player = new Spaceship({x: canvas.width/2 +.5, y:canvas.height-15, context: context});
    //new jaws.Sprite({image: "img/plane.png", x: canvas.width/2, y:canvas.height-30, context: context});

    enemies = new jaws.SpriteList();

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

    if(jaws.pressed("space")) {
        var t = new Date().getTime();
        if(t-gun_cooldown > last_shot){
            my_bullets.push( new Bullet({x:player.rect().x + player.rect().width/2, y:player.y}, 0, -2 ));
            last_shot=t;
        }
    }

    my_bullets.update();
    enemy_bullets.update();
    explosions.update();

    var updated_dir = false;
    enemies.forEach(function(enemy){
        if(!updated_dir && !isInsideCanvas(enemy)){
            enemies_dir = enemies_dir * -1;
            updated_dir = true;
        }
    });
    if(updated_dir){
        enemies.forEach(function(enemy){
            enemy.move(0,5);
        });
    }

    enemies.update();


    explosions.removeIf(function(ex){return ex.frame > ex.frames;});

    forceInsideCanvas(player);
    my_bullets.removeIf(isOutsideCanvas);
    enemy_bullets.removeIf(isOutsideCanvas);

    jaws.collideManyWithMany(my_bullets, enemies).forEach(function(el){
        my_bullets.remove(el[0]);
        explosions.push(new Explosion(el[1]));
        enemies.remove(el[1]);
    });

    jaws.collideOneWithMany(player, enemies).forEach(function(){
        setup();
    });
    jaws.collideOneWithMany(player, enemy_bullets).forEach(function(){
        setup();
    });

}

/* step2. draw the update state on screen */
function draw() {
    jaws.clear();        // Same as: context.clearRect(0,0,jaws.width,jaws.height)

    player.draw();
    my_bullets.draw();  // will call draw() on all items in the list
    enemy_bullets.draw();
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

    var color = ["#FF66FF", "#66FFFF", "#FFFF66"][_.random(2)];

    this.draw_sprite = function(context){
        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(width, 0);
        context.lineTo(width/2, height);
        context.closePath();
        context.lineWidth = 1;
        context.strokeStyle = color;
        context.stroke();
    };

    this.update = function(){
        var n_enemies = enemies_x * enemies_y;
        var enemies_speed = 2 - 1.75 * (enemies.length/n_enemies);
        this.x = this.x + enemies_dir * enemies_speed;

        var left = this.rect().x;
        var y = this.y;
        var right = this.rect().right;

        var collisions = enemies.filter(function(item) {
            return item.y > y && item.x > left && item.x < right;
        });

        if(collisions.length == 0){
            if(Math.random() < .01){
                enemy_bullets.push( new Bullet({x:this.rect().x + this.rect().width/2, y:this.y}, 0, 2 ));
            }
        }
    };

    DynamicSprite.call(this, options, width, height);
}

Enemy.prototype = new DynamicSprite({});
Enemy.prototype.constructor = Enemy;

function Bullet(options, x_direction, y_direction) {
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
        this.move(x_direction, y_direction);
    };

    DynamicSprite.call(this, options, width, height);
}

Bullet.prototype = new DynamicSprite({});
Bullet.prototype.constructor = Bullet;

function Explosion(sprite){
    this.image = sprite.asCanvas();

    this.frame = 0;
    this.frames = 10;

    this.width = sprite.rect().width;
    this.height= sprite.rect().height;
    this.x = sprite.x - this.width/2;
    this.y = sprite.y - this.height/2;

    this.update = function(){
        this.frame++;
    };

    this.draw = function(){

        context.globalAlpha = 1 - this.frame/this.frames;

        var h = this.height;
        var w = this.width;
        var x = this.x;
        var y = this.y;
        var f = this.frame;

        context.drawImage(this.image, 0, 0, w/2, h/2,
                          x-f, y-f, w/2, h/2);

        context.drawImage(this.image, w/2, 0, w/2, h/2,
                          x+f+w/2, y-f, w/2, h/2);

        context.drawImage(this.image, 0, h/2, w/2, h/2,
                          x-f, y+f+h/2, w/2, h/2);

        context.drawImage(this.image, w/2, h/2, w/2, h/2,
                          x+f+w/2, y+f+h/2, w/2, h/2);

    }
}

jaws.start();  // Per default this will load assets, call setup(), then loop update() and draw() in 60 FPS.