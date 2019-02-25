import * as P5 from "p5";
import {getSketchHeight, getSketchWidth, getWorldHeight, getWorldWidth, ISlider} from "./sketch-utils";

export interface IOrbiterConfig {
  nCols: ISlider;
  nRows: ISlider;

  circleWidth: ISlider;
  circleHeight: ISlider;

  depthX: ISlider;
  depthY: ISlider;

  speedX: ISlider;
  axi: ISlider;
  axj: ISlider;

  speedY: ISlider;
  ayi: ISlider;
  ayj: ISlider;

  speedHue: ISlider;
  aHueI: ISlider;
  aHueJ: ISlider;
  hueMin: ISlider;
  hueMax: ISlider;
  hueShift: ISlider;
}

export function setup(sketch: P5): P5 {
  const canvasDiv: P5.Element = sketch.createDiv();
  const canvas: P5.Renderer = sketch.createCanvas(getSketchWidth(sketch), getSketchHeight(sketch));
  canvas.parent(canvasDiv);

  const buffer: P5 = sketch.createGraphics(getWorldWidth(sketch), getWorldHeight(sketch)) as unknown as P5;
  buffer.colorMode(sketch.HSB, 360, 10, 10, 100);
  return buffer;
}

export function draw(sketch: P5, buffer: P5, orbiterConfig: IOrbiterConfig, funcs: any): void {
  buffer.background(0, 0, 0, 10);

  [...Array(orbiterConfig.nRows.value()).keys()].forEach((i: number) => {
    [...Array(orbiterConfig.nCols.value()).keys()].forEach((j: number) => {
      const [x, y, hue]: [number, number, number] = getCircleDetails(orbiterConfig, funcs, i, j, sketch.frameCount);
      buffer.fill(hue, 10, 10);
      const relativeX: number = orbiterConfig.depthX.value() * x + getXShift(sketch, orbiterConfig, j);
      const relativeY: number = orbiterConfig.depthY.value() * y + getYShift(sketch, orbiterConfig, i);
      const circleWidth: number = orbiterConfig.circleWidth.value();
      const circleHeight: number = orbiterConfig.circleHeight.value();
      buffer.ellipse(relativeX, relativeY, circleWidth, circleHeight);
      // buffer.text(`${i}, ${j}`, relativeX, relativeY);
    });
  });

  Object.values(orbiterConfig).forEach((slider: ISlider) => slider.updateLabel());

  sketch.image(buffer as unknown as P5.Image, -200, -200);
}

export function windowResized(sketch: P5): void {
  sketch.resizeCanvas(getSketchWidth(sketch), getSketchHeight(sketch));
  // buffer.resizeCanvas(getWorldWidth(), getWorldHeight());
}

function getCircleDetails(orbiterConfig: IOrbiterConfig, funcs: any, i: number, j: number,
                          t: number): [number, number, number] {
  const x: number = getX(orbiterConfig, funcs, i, j, t);
  const y: number = getY(orbiterConfig, funcs, i, j, t);
  const hue: number = getHue(orbiterConfig, funcs, i, j, t);
  return [x, y, hue];
}

function getX(orbiterConfig: IOrbiterConfig, funcs: any, i: number, j: number, t: number): number {
  const p: number = orbiterConfig.speedX.value() * t +
    orbiterConfig.axi.value() * i +
    orbiterConfig.axj.value() * j;
  return funcs.fX(p);
}

function getY(orbiterConfig: IOrbiterConfig, funcs: any, i: number, j: number, t: number): number {
  const p: number = orbiterConfig.speedY.value() * t +
    orbiterConfig.ayi.value() * i +
    orbiterConfig.ayj.value() * j;
  return funcs.fY(p);
}

function getHue(orbiterConfig: IOrbiterConfig, funcs: any, i: number, j: number, t: number): number {
  const p: number = orbiterConfig.speedHue.value() * t +
    orbiterConfig.aHueI.value() * i +
    orbiterConfig.aHueJ.value() * j;
  return funcs.fHue(p);
}

function getXShift(sketch: P5, orbiterConfig: IOrbiterConfig, j: number): number {
  return (j + 1) * getWorldWidth(sketch) / (orbiterConfig.nCols.value() + 1);
}

// Dependent on what row we're in, we find how far down we need to translate the "origin"
function getYShift(sketch: P5, orbiterConfig: IOrbiterConfig, i: number): number {
  return (i + 1) * getWorldHeight(sketch) / (orbiterConfig.nRows.value() + 1);
}
