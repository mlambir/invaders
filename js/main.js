function start_game(){
    jaws.switchGameState(MainGameState);
}

jaws.start(ShowTextState, {}, {title:"Fiqus Invaders!", other:"apreta espacio para iniciar"});