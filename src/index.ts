import * as P5 from "p5";
import "./assets/styles/main.scss";
import {draw, IOrbiterConfig, setup, windowResized} from "./orbiters";
import {createSlider} from "./sketch-utils";

const p5: P5 = new P5((sketch: P5) => {

  const orbiterConfig: IOrbiterConfig = {
    nCols: createSlider(sketch, "sliders-container", "n&#8209;cols", 1, 50, 30),
    nRows: createSlider(sketch, "sliders-container", "n&#8209;rows", 1, 50, 30),

    circleWidth: createSlider(sketch, "sliders-container", "circle&#8209;width", 1, 30, 8),
    circleHeight: createSlider(sketch, "sliders-container", "circle&#8209;height", 1, 30, 8),

    depthX: createSlider(sketch, "sliders-container", "depth&#8209;x", 0, 300, 200),
    depthY: createSlider(sketch, "sliders-container", "depth&#8209;y", 0, 300, 200),

    speedX: createSlider(sketch, "sliders-container", "speed&#8209;x", 0, 0.1, 0.02, 0.01),
    axi: createSlider(sketch, "sliders-container", "alpha&#8209;x&#8209;i", 0, 1, 0.2, 0.01),
    axj: createSlider(sketch, "sliders-container", "alpha&#8209;x&#8209;j", 0, 1, 0.2, 0.01),

    speedY: createSlider(sketch, "sliders-container", "speed&#8209;y", 0, 0.1, 0.02, 0.01),
    ayi: createSlider(sketch, "sliders-container", "alpha&#8209;y&#8209;i", 0, 1, 0.2, 0.01),
    ayj: createSlider(sketch, "sliders-container", "alpha&#8209;y&#8209;j", 0, 1, 0.2, 0.01),

    speedHue: createSlider(sketch, "sliders-container", "speed&#8209;hue", 0, 1, 0.1, 0.01),
    aHueI: createSlider(sketch, "sliders-container", "alpha&#8209;hue&#8209;i", 0, 1, 0.5, 0.01),
    aHueJ: createSlider(sketch, "sliders-container", "alpha&#8209;hue&#8209;j", 0, 1, 0.5, 0.01),
    hueMin: createSlider(sketch, "sliders-container", "hue&#8209;min", 0, 360, 0),
    hueMax: createSlider(sketch, "sliders-container", "hue&#8209;max", 0, 360, 60),
    hueShift: createSlider(sketch, "sliders-container", "hue&#8209;shift", 0, 360, 180),
  };

  const funcs = {
    fX: (p: number) => p5.cos(p),
    fY: (p: number) => (1 / 2) * p5.sin(2 * p),
    fHue: (p: number) => p5.map(p5.cos(p), -1, 1, orbiterConfig.hueMin.value(),
      orbiterConfig.hueMax.value()) + orbiterConfig.hueShift.value(),
  };

  let buffer: P5;
  sketch.setup = () => {
    buffer = setup(sketch);
  };
  sketch.draw = () => draw(sketch, buffer, orbiterConfig, funcs);
  sketch.windowResized = () => windowResized(sketch);

});
