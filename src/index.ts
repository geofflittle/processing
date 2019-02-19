import * as P5 from "p5";
import "./assets/styles/main.scss";
import {MathUtils} from "./math-utils";

const p5: P5 = new P5(() => {});

const NUM_COLS: number = 50;
const NUM_ROWS: number = 50;
const CIRCLE_WIDTH: number = 5;
const CIRCLE_HEIGHT: number = 5;
const ROTATION_DEGREES_SPEED: number = 4;
const SKETCH_WIDTH_BUFFER: number = 10;
const SKETCH_HEIGHT_BUFFER: number = 10;
const ROTATION_DEGREES_X_COEFF: number = 15;
const ROTATION_DEGREES_Y_COEFF: number = 20;
const TOTAL_DEGREES: number = 360;
const HUE_NOISE_SPEED: number = 0.075;
const NOISE_SIGMOID: (x: number) => number = MathUtils.getSigmoid(1, 10, 0.5);
const X_SHIFT: number = 10;
const Y_SHIFT: number = 50;

let buffer: any;

function getSketchWidth(): number {
  return p5.windowWidth - SKETCH_WIDTH_BUFFER;
}

function getSketchHeight(): number {
  return p5.windowHeight - SKETCH_HEIGHT_BUFFER;
}

// Gets the degrees a circle will be rotated around its center dependent on its row and column
function getRotationDegrees(i: number, j: number) {
  return ROTATION_DEGREES_SPEED * p5.frameCount +
    ROTATION_DEGREES_X_COEFF * i +
    ROTATION_DEGREES_Y_COEFF * j % TOTAL_DEGREES;
}

function getHue(i: number, j: number, rotationDegrees: number) {
  // Map the i's and j's so that they're "closer", from the perspective of the noise function
  const mappedI: number = p5.map(i, 0, NUM_COLS, 0, 1);
  const mappedJ: number = p5.map(j, 0, NUM_ROWS, 0, 1);
  const mappedDegrees: number = p5.map(rotationDegrees, 0, 360, 0, 1);
  // const noise: number = p5.noise(mappedI, mappedJ, mappedDegrees);
  // Transform the noise function so it favors the middle less
  // const noise2: number = NOISE_SIGMOID(noise);
  return p5.map(mappedJ + mappedI + mappedDegrees, 0, 3, 0, 120);
}

function drawCircle(xCenter: number, yCenter: number, i: number, j: number) {
  const rotationDegrees: number = getRotationDegrees(i, j);
  const xShift: number = X_SHIFT * p5.cos(rotationDegrees);
  const yShift: number = Y_SHIFT * p5.sin(rotationDegrees);
  const hue: number = getHue(i, j, rotationDegrees);

  buffer.fill(hue * (p5.random([0, 1])), 360, 360);
  buffer.ellipse((i + 1) * xCenter + xShift, (j + 1) * yCenter + yShift, CIRCLE_WIDTH, CIRCLE_HEIGHT);
}

p5.setup = () => {
  const canvas: P5.Renderer = p5.createCanvas(getSketchWidth(), getSketchHeight());
  canvas.parent("content");
  buffer = p5.createGraphics(getSketchWidth(), getSketchHeight());

  buffer.colorMode(p5.HSB, 360);
  p5.colorMode(p5.HSB, 360);
  p5.ellipseMode(p5.CENTER);
  p5.angleMode(p5.DEGREES);
  p5.strokeWeight(0);
};

p5.draw = () => {
  buffer.background(0, 0, 0, 45);
  p5.rectMode(p5.CORNERS);
  p5.strokeWeight(1);
  p5.noFill();
  p5.rect(0, 0, p5.width, p5.height);
  const xCenter: number = (p5.windowWidth + 200) / (NUM_COLS + 1);
  const yCenter: number = (p5.windowHeight + 200) / (NUM_ROWS + 1);
  [...Array(NUM_COLS).keys()].forEach((i: number) => {
    [...Array(NUM_ROWS).keys()].forEach((j: number) => {
      drawCircle(xCenter, yCenter, i, j);
    });
  });
  p5.image(buffer, 0, 0);
};

p5.windowResized = () => {
  p5.resizeCanvas(getSketchWidth(), getSketchHeight());
};
