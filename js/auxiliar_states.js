function ShowTextState(){

    var canvas = document.getElementsByTagName("canvas")[0];
    var context = canvas.getContext("2d");

    var shown_time = 0;

    this.setup = function(options) {

        jaws.canvas = canvas;


        this.title_text = "titulo";
        this.other_text = "start";

        if(options && options.title)
            this.title_text = options.title;
        if(options && options.other)
            this.other_text = options.other;

        this.shadow_colors = ["#FF66FF", "#66FFFF", "#FFFF66"];
        this.current_color_index = 0;

        shown_time = new Date().getTime();
    }

    var last_color_update = 0;
    var keydown_added = false;

    this.update = function() {
        var t = new Date().getTime();
        if(t > last_color_update + 250){
            this.current_color_index = (this.current_color_index + 1) % this.shadow_colors.length;
            last_color_update = t;
        }

        if(!keydown_added && t > shown_time + 1000){
            jaws.on_keydown("space", start_game);
            keydown_added = true;
        }
    }

    this.draw = function(){
        jaws.clear();

        context.textAlign = 'center';

        if(keydown_added && this.current_color_index%3){
            context.font = '9px SilkscreenNormal';
            context.fillStyle = '#FFFFFF';
            context.fillText( this.other_text, jaws.width/2, jaws.height - 20 );
        }

        for(var i = this.shadow_colors.length; i>=0; i--){
            context.font = '27px SilkscreenNormal';
            context.fillStyle = this.shadow_colors[(this.current_color_index + i) % this.shadow_colors.length];
            context.fillText( this.title_text, jaws.width/2 + i, jaws.height/2 - i);
        }

        context.font = '27px SilkscreenNormal';
        context.fillStyle = '#FFFFFF'
        context.fillText( this.title_text, jaws.width/2, jaws.height/2);


    }
}