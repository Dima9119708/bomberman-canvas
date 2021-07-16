import stageTheme from "./music/stage-theme.mp3";
import deadMusic from "./music/just-died.mp3";
import putBomb from "./music/put-bomb.wav";
import explosion from "./music/explosion.mp3";

export default  {
    stageTheme: new Audio(stageTheme),
    dead: new Audio(deadMusic),
    putBomb: new Audio(putBomb),
    explosion: new Audio(explosion)
}