import * as P5 from "p5";
import "./assets/styles/main.scss";
import { draw, setup, windowResized } from "./fracture";
// import {draw, setup, windowResized} from "./orbiters";
import { getNECorner, getNWCorner, getSECorner, getSketchHeight, getSketchWidth, getSWCorner, getWorldHeight, getWorldWidth } from "./sketch-utils";

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

const p5: P5 = new P5((sketch: P5) => {
  const sketchContext: ISketchContext = {
    sketch,
    buffer: undefined,
    config: undefined,
    getSketchWidth: () => getSketchWidth(sketch),
    getSketchHeight: () => getSketchHeight(sketch),
    getWorldWidth: () => getWorldWidth(sketch),
    getWorldHeight: () => getWorldHeight(sketch),
    getNWCorner: () => getNWCorner(sketch),
    getNECorner: () => getNECorner(sketch),
    getSECorner: () => getSECorner(sketch),
    getSWCorner: () => getSWCorner(sketch),
  };
  sketch.setup = () => setup(sketchContext);
  sketch.draw = () => draw(sketchContext);
  sketch.windowResized = () => windowResized(sketch);
});
