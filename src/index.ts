import * as P5 from "p5";
import "./assets/styles/main.scss";

const numCols: number = 150;
const numRows: number = 100;
const circleWidth: number = 10;
const circleHeight: number = 10;

const p5: P5 = new P5(() => {});

p5.setup = () => {
  const canvas: P5.Renderer = p5.createCanvas(p5.windowWidth - 100, p5.windowHeight - 100);
  canvas.parent("content");

  p5.frameRate(30);
  p5.ellipseMode(p5.CENTER);
};

function drawCircle(x: number, y: number) {
  p5.translate(x * circleWidth + circleWidth / 2, y * circleHeight + circleHeight / 2);
  const degrees = 2 * (p5.frameCount - 1) - 15 * x - 18 * y % 360;
  p5.rotate(p5.radians(degrees));
  p5.strokeWeight(0);
  p5.stroke(255);
  p5.fill(255);
  p5.ellipse(circleWidth * 2, 0, 5, 5);
}

p5.draw = () => {
  p5.background(0);
  [...Array(numCols).keys()].forEach((x: number) => {
    [...Array(numRows).keys()].forEach((y: number) => {
      p5.push();
      drawCircle(x, y);
      p5.pop();
    });
  });
};

p5.windowResized = () => {
  p5.resizeCanvas(p5.windowWidth - 10, p5.windowHeight - 10);
};
