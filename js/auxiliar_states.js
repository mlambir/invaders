function MainMenuState(){
    this.setup = function() {
        this.shadow_colors = ["#FF66FF", "#66FFFF", "#FFFF66"];
        this.current_color_index = 0;
    }

    var last_color_update = 0;

    this.update = function() {
        jaws.on_keydown("space", start_game);

        var t = new Date().getTime();
        if(t > last_color_update + 250){
            this.current_color_index = (this.current_color_index + 1) % this.shadow_colors.length;
            last_color_update = t;
        }
    }

    /* step2. draw the update state on screen */
    this.draw = function(){
        jaws.clear();

        if(this.current_color_index%3){
            jaws.context.textAlign = 'center';
            jaws.context.font = '9px SilkscreenNormal';
            jaws.context.fillStyle = '#FFFFFF';
            jaws.context.fillText( "Apreta espacio para jugar!", jaws.width/2, jaws.height - 20 );
        }
        var title_text = "Fiqus invaders";
        for(var i = this.shadow_colors.length; i>=0; i--){
            jaws.context.font = '27px SilkscreenNormal';
            jaws.context.fillStyle = this.shadow_colors[(this.current_color_index + i) % this.shadow_colors.length];
            jaws.context.fillText( title_text, jaws.width/2 + i, jaws.height/2 - i);
        }

        jaws.context.font = '27px SilkscreenNormal';
        jaws.context.fillStyle = '#FFFFFF'
        jaws.context.fillText( title_text, jaws.width/2, jaws.height/2);


    }
}