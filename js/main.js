import { Core } from "./core.js";
import { Game } from "./game.js";
window.onload = () => {
    let game;
    (new Core(160, 144)).run((event) => {
        event.keyboard
            .addAction("right", "ArrowRight", "KeyD")
            .addAction("up", "ArrowUp", "KeyW")
            .addAction("left", "ArrowLeft", "KeyA")
            .addAction("down", "ArrowDown", "KeyS")
            .addAction("fire1", "KeyZ")
            .addAction("fire2", "KeyX")
            .addAction("start", "Enter");
        game = new Game(event);
    }, (event) => game.update(event), (canvas) => game.redraw(canvas));
};
