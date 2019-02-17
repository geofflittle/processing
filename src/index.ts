import * as P5 from "p5";
import "./assets/styles/main.scss";
import {MathUtils} from "./math-utils";
import {Dictionary} from "lodash";

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
const HUE_RANGE: number = 360;
const NOISE_FRAME_COUNT_SPEED: number = .25;
const NOISE_SIGMOID: (x: number) => number = MathUtils.getSigmoid(1, 10, 0.5);

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

function getHue(i: number, j: number) {
  const noise: number = p5.noise(p5.map(i, 0, NUM_COLS, 0, 1), p5.map(j, 0, NUM_ROWS, 0, 1), p5.frameCount * .05);
  const noise2: number = NOISE_SIGMOID(noise);
  const range: number = 360;
  return range - p5.abs(range - (noise2 * (range * 2)));
  // return 2 * range * noise2 % range;
}

function drawCircle(xCenter: number, yCenter: number, i: number, j: number) {
  const rotationDegrees: number = getRotationDegrees(i, j);
  const xDelta: number = 0; // 50 * p5.cos(rotationDegrees);
  const yDelta: number = 0; // 50 * p5.sin(rotationDegrees);
  const hue: number = getHue(i, j);

  buffer.fill(hue, 360, 360);
  buffer.ellipse((i + 1) * xCenter + xDelta - 100, (j + 1) * yCenter + yDelta - 100, CIRCLE_WIDTH, CIRCLE_HEIGHT);
}

p5.setup = () => {
  const canvas: P5.Renderer = p5.createCanvas(getSketchWidth(), getSketchHeight());
  canvas.parent("content");
  buffer = p5.createGraphics(getSketchWidth(), getSketchHeight());

  // p5.frameRate(30);
  buffer.colorMode(p5.HSB, 360);
  p5.colorMode(p5.HSB, 360);
  p5.ellipseMode(p5.CENTER);
  p5.angleMode(p5.DEGREES);
  p5.strokeWeight(0);
};

p5.draw = () => {
  p5.background(0);
  const nSamples: number = 175000;
  // const counts: Dictionary<number> = {};
  Object.entries([...Array(nSamples).keys()]
    .map((i: number) => p5.noise(i))
    .map((x: number) => NOISE_SIGMOID(x))
    .map((x: number) => p5.map(x, 0, 1, 0, getSketchWidth()))
    .map((x: number) => Math.round(x))
    .reduce((countsAccum: Dictionary<number>, currentValue) => {
      countsAccum[currentValue] = countsAccum[currentValue] + 1 || 1;
      return countsAccum;
    }, {} as Dictionary<number>))
    .forEach((entry: [string, number]) => {
      console.log(entry);
      const x: number = parseInt(entry[0]);
      p5.line(x, getSketchHeight(), x, getSketchHeight() - entry[1]);
    });
  // buffer.background(0, 0, 0);
  // const xCenter: number = (p5.windowWidth + 200) / (NUM_COLS + 1);
  // const yCenter: number = (p5.windowHeight + 200) / (NUM_ROWS + 1);
  // [...Array(NUM_COLS).keys()].forEach((i: number) => {
  //   [...Array(NUM_ROWS).keys()].forEach((j: number) => {
  //     drawCircle(xCenter, yCenter, i, j);
  //   });
  // });
  // p5.image(buffer, 0, 0);
};

p5.windowResized = () => {
  p5.resizeCanvas(getSketchWidth(), getSketchHeight());
};
