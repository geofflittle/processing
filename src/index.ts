import * as P5 from "p5";
import "./assets/styles/main.scss";

const p5: P5 = new P5(() => {});

p5.setup = () => {
  const canvas: P5.Renderer = p5.createCanvas(p5.windowWidth - 10, p5.windowHeight - 10);
  canvas.parent("content");
  p5.frameRate(30);
};

p5.draw = () => {
  p5.background(0);
  const y = (p5.frameCount * 2) % p5.height;
  p5.stroke(255);
  p5.line(0, y, p5.width, y);
};

p5.windowResized = () => {
  p5.resizeCanvas(p5.windowWidth - 10, p5.windowHeight - 10);
};
