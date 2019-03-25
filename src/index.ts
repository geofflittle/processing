import * as P5 from "p5";
import "./assets/styles/main.scss";
// import { draw, setup, windowResized } from "./fracture";
// import {draw, setup, windowResized} from "./orbiters";
// import { draw, setup, windowResized } from "./contours";
import { getNECorner, getNWCorner, getSECorner, getSketchHeight, getSketchWidth, getSWCorner, getWorldHeight, getWorldWidth } from "./sketch-utils";
import HTML = Mocha.reporters.HTML;

export interface ISketchContext {
  sketch: P5;
  buffer: P5 | undefined;
  config: unknown | undefined;
  getSketchWidth: () => number;
  getSketchHeight: () => number;
  getWorldWidth: () => number;
  getWorldHeight: () => number;
  getNWCorner: () => [number, number];
  getNECorner: () => [number, number];
  getSECorner: () => [number, number];
  getSWCorner: () => [number, number];
}
//
// const p5: P5 = new P5((sketch: P5) => {
//   const sketchContext: ISketchContext = {
//     sketch,
//     buffer: undefined,
//     config: undefined,
//     getSketchWidth: () => getSketchWidth(sketch),
//     getSketchHeight: () => getSketchHeight(sketch),
//     getWorldWidth: () => getWorldWidth(sketch),
//     getWorldHeight: () => getWorldHeight(sketch),
//     getNWCorner: () => getNWCorner(sketch),
//     getNECorner: () => getNECorner(sketch),
//     getSECorner: () => getSECorner(sketch),
//     getSWCorner: () => getSWCorner(sketch),
//   };
//   sketch.setup = () => setup(sketchContext);
//   sketch.draw = () => draw(sketchContext);
//   sketch.windowResized = () => windowResized(sketch);
// });


/*
  Johan Karlsson, 2019
  https://twitter.com/DonKarlssonSan
  MIT License, see Details View
*/

class Particle {

  private x: number;
  private y: number;
  private angle: number;
  private offset: number;

  constructor(angle: number) {
    this.x = 0;
    this.y = 0;
    this.angle = angle;
    this.offset = Math.random() * Math.PI;
  }

  draw(context: CanvasRenderingContext2D, ticker: number, x0: number, y0: number): void {
    let noiseFactor = 0.3 * getSize();
    let n = Math.sin(this.angle + ticker + this.offset) * noiseFactor;
    let r = getSize() + n;
    this.x = r * 16 * Math.pow(Math.sin(this.angle), 3);
    this.y = -r * (13 * Math.cos(this.angle) - 5 * Math.cos(2 * this.angle) - 2 * Math.cos(3 * this.angle) - Math.cos(4 * this.angle));

    this.angle += 0.004;
    context.fillRect(Math.round(x0 + this.x), Math.round(y0 + this.y), 1, 1);
  }

}

interface Sketch {
  ticker: number;
  particles: Particle[],
  canvas: HTMLCanvasElement,
  bufferCanvas: HTMLCanvasElement
}

function setup(): Sketch {
  const canvas: HTMLCanvasElement = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const bufferCanvas: HTMLCanvasElement = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: Particle[] = getParticles();
  return {
    ticker: 0,
    particles,
    canvas,
    bufferCanvas
  };
}

function getSize(): number {
  return Math.min(window.innerWidth, window.innerHeight) * 0.022;
}

// function onResize(sketch: Sketch): (ev: UIEvent) => void {
//   return (event: UIEvent) => {
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
//     // size = Math.min(w, h) * 0.022;
//     setupParticles();
//   }
// }

function getParticles(): Particle[] {
  const particles = [];
  const size: number = Math.min(window.innerWidth, window.innerHeight) * 0.022;
  let nrOfParticles = size * size * 200;
  for(let angle = 0; angle < Math.PI * 2; angle += Math.PI * 2 / nrOfParticles) {
    let p = new Particle(angle);
    particles.push(p);
  }
  return particles;
}

function draw(sketch: Sketch): FrameRequestCallback {
  return (time: number) => {
    requestAnimationFrame(draw({
      ticker: sketch.ticker + 0.02,
      particles: getParticles(),
      canvas: sketch.canvas,
      bufferCanvas: sketch.bufferCanvas
    }));

    sketch.canvas.width = window.innerWidth;
    sketch.canvas.height = window.innerHeight;
    sketch.bufferCanvas.width = window.innerWidth;
    sketch.bufferCanvas.height = window.innerHeight;

    const bufferContext: CanvasRenderingContext2D | null = sketch.bufferCanvas.getContext("2d");
    if (!bufferContext) {
      throw new Error("No buffer context");
    }
    bufferContext.fillStyle = "black";
    bufferContext.fillRect(0, 0, window.innerWidth, window.innerHeight);
    bufferContext.fillStyle = "red";
    sketch.particles.forEach(p => {
      p.draw(bufferContext, sketch.ticker, window.innerWidth / 2, window.innerHeight * 0.45);
    });

    const context: CanvasRenderingContext2D | null = sketch.canvas.getContext("2d");
    if (!context) {
      throw new Error("No context");
    }
    context.drawImage(sketch.bufferCanvas, 0, 0);
  }
}

const sketch: Sketch = setup();
draw(sketch)(0);