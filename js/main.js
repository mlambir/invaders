function start_game(){
    jaws.switchGameState(MainGameState, {fps:50});
}

jaws.start(ShowTextState, {}, {title:"Fiqus Invaders!", other:"apreta espacio para iniciar"});