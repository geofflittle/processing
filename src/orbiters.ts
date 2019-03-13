import * as dat from "dat.gui";
import * as P5 from "p5";
import {ISketchContext} from "./index";
import {
  getSketchHeight,
  getSketchWidth,
  getWorldHeight,
  getWorldWidth,
} from "./sketch-utils";

export interface IOrbitersConfig {
  orbitersParamProviders: IOrbitersParamProviders;
  fX: (p: number) => number;
  fY: (p: number) => number;
  fHue: (p: number) => number;
}

export interface IOrbitersParamProviders {
  nCols: () => number;
  nRows: () => number;

  widthCircle: () => number;
  heightCircle: () => number;

  depthX: () => number;
  depthY: () => number;

  speedX: () => number;
  alphaXI: () => number;
  alphaXJ: () => number;
  alphaFX: () => number;
  betaFX: () => number;
  gammaFX: () => number;

  speedY: () => number;
  alphaYI: () => number;
  alphaYJ: () => number;
  alphaFY: () => number;
  betaFY: () => number;
  gammaFY: () => number;

  speedHue: () => number;
  alphaHueI: () => number;
  alphaHueJ: () => number;
  minHue: () => number;
  maxHue: () => number;
  cHue: () => number;
}

export function setup(sketchContext: ISketchContext): void {
  const canvasDiv: P5.Element = sketchContext.sketch.createDiv();
  const canvas: P5.Renderer = sketchContext.sketch.createCanvas(sketchContext.getSketchWidth(),
    sketchContext.getSketchHeight());
  canvas.parent(canvasDiv);

  const buffer: P5 = sketchContext.sketch.createGraphics(sketchContext.getWorldWidth(),
    sketchContext.getWorldHeight()) as unknown as P5;
  buffer.colorMode(sketchContext.sketch.HSB, 360, 10, 10, 100);

  const orbitersConfig: IOrbitersConfig = getOrbitersConfig(sketchContext.sketch);

  sketchContext.buffer = buffer;
  sketchContext.config = orbitersConfig;
}

export function draw(sketchContext: ISketchContext): void {
  (sketchContext.buffer as P5).background(0, 0, 0, 10);
  const orbitersConfig: IOrbitersConfig = sketchContext.config as IOrbitersConfig;
  const { orbitersParamProviders } = orbitersConfig;

  [...Array(orbitersParamProviders.nRows()).keys()].forEach((i: number) => {
    [...Array(orbitersParamProviders.nCols()).keys()].forEach((j: number) => {
      const [x, y, hue]: [number, number, number] = getCircleDetails(orbitersConfig, i, j,
        sketchContext.sketch.frameCount);
      (sketchContext.buffer as P5).fill(hue, 10, 10);
      const relativeX: number = orbitersParamProviders.depthX() * x + getXShift(sketchContext.sketch,
        orbitersParamProviders, j);
      const relativeY: number = orbitersParamProviders.depthY() * y + getYShift(sketchContext.sketch,
        orbitersParamProviders, i);
      const circleWidth: number = orbitersParamProviders.widthCircle();
      const circleHeight: number = orbitersParamProviders.heightCircle();
      (sketchContext.buffer as P5).ellipse(relativeX, relativeY, circleWidth, circleHeight);
      // buffer.text(`${i}, ${j}`, relativeX, relativeY);
    });
  });

  sketchContext.sketch.image(sketchContext.buffer as unknown as P5.Image, -200, -200);
}

function getOrbitersConfig(p5: P5): IOrbitersConfig {
  const orbitersParamProviders: IOrbitersParamProviders = getOrbitersParamProviders();
  return {
    orbitersParamProviders,
    fX: (p: number) =>
      orbitersParamProviders.alphaFX() * p5.cos(p) +
      orbitersParamProviders.betaFX() * p5.sin(p) +
      orbitersParamProviders.gammaFX() * p5.cos(p) * p5.sin(p),
    fY: (p: number) =>
      orbitersParamProviders.alphaFY() * p5.cos(p) +
      orbitersParamProviders.betaFY() * p5.sin(p) +
      orbitersParamProviders.gammaFX() * p5.cos(p) * p5.sin(p),
    fHue: (p: number) => p5.map(p5.cos(p), -1, 1, orbitersParamProviders.minHue(),
      orbitersParamProviders.maxHue()) + orbitersParamProviders.cHue(),
  };
}

function getOrbitersParamProviders(): IOrbitersParamProviders {
  const gui = new dat.GUI({name: "processing-gui"});
  const config = getInitialOrbitersConfig();
  const nColsController: dat.GUIController = gui.add(config, "n_cols", 1, 50);
  const nRowsController: dat.GUIController = gui.add(config, "n_rows", 1, 50);
  const widthCircleController: dat.GUIController = gui.add(config, "width_circle", 1, 50);
  const heightCircleController: dat.GUIController = gui.add(config, "height_circle", 1, 50);
  const depthXController: dat.GUIController = gui.add(config, "depth_x", 0, 500);
  const depthYController: dat.GUIController = gui.add(config, "depth_y", 0, 500);
  const speedXController: dat.GUIController = gui.add(config, "speed_x", 0, .5);
  const alphaXIController: dat.GUIController = gui.add(config, "alpha_x_i", 0, .5);
  const alphaXJController: dat.GUIController = gui.add(config, "alpha_x_j", 0, .5);
  const alphaFXController: dat.GUIController = gui.add(config, "alpha_f_x", 0, .5);
  const betaFXController: dat.GUIController = gui.add(config, "beta_f_x", 0, .5);
  const gammaFXController: dat.GUIController = gui.add(config, "gamma_x_j", 0, .5);
  const speedYController: dat.GUIController = gui.add(config, "speed_y", 0, .5);
  const alphaYIController: dat.GUIController = gui.add(config, "alpha_y_i", 0, .5);
  const alphaYJController: dat.GUIController = gui.add(config, "alpha_y_j", 0, .5);
  const alphaFYController: dat.GUIController = gui.add(config, "alpha_f_x", 0, .5);
  const betaFYController: dat.GUIController = gui.add(config, "beta_f_x", 0, .5);
  const gammaFYController: dat.GUIController = gui.add(config, "gamma_x_j", 0, .5);
  const speedHueController: dat.GUIController = gui.add(config, "speed_hue", 0, 1);
  const alphaHueIController: dat.GUIController = gui.add(config, "alpha_hue_i", 0, 1);
  const alphaHueJController: dat.GUIController = gui.add(config, "alpha_hue_j", 0, 1);
  const minHueController: dat.GUIController = gui.add(config, "min_hue", 0, 360);
  const maxHueController: dat.GUIController = gui.add(config, "max_hue", 0, 360);
  const cHueController: dat.GUIController = gui.add(config, "shift_hue", 0, 360);
  return {
    nCols: () => Math.round(nColsController.getValue()),
    nRows: () => Math.round(nRowsController.getValue()),
    widthCircle: () => widthCircleController.getValue(),
    heightCircle: () => heightCircleController.getValue(),
    depthX: () => depthXController.getValue(),
    depthY: () => depthYController.getValue(),
    speedX: () => speedXController.getValue(),
    alphaXI: () => alphaXIController.getValue(),
    alphaXJ: () => alphaXJController.getValue(),
    alphaFX: () => alphaFXController.getValue(),
    betaFX: () => betaFXController.getValue(),
    gammaFX: () => gammaFXController.getValue(),
    speedY: () => speedYController.getValue(),
    alphaYI: () => alphaYIController.getValue(),
    alphaYJ: () => alphaYJController.getValue(),
    alphaFY: () => alphaFYController.getValue(),
    betaFY: () => betaFYController.getValue(),
    gammaFY: () => gammaFYController.getValue(),
    speedHue: () => speedHueController.getValue(),
    alphaHueI: () => alphaHueIController.getValue(),
    alphaHueJ: () => alphaHueJController.getValue(),
    minHue: () => minHueController.getValue(),
    maxHue: () => maxHueController.getValue(),
    cHue: () => cHueController.getValue(),
  };
}

function getInitialOrbitersConfig() {
  return {
    n_cols: 30,
    n_rows: 30,
    width_circle: 8,
    height_circle: 8,
    depth_x: 50,
    depth_y: 50,
    speed_x: 0.02,
    alpha_x_i: 0.02,
    alpha_x_j: 0.02,
    alphaFX: 0.02,
    betaFX: 0.02,
    gammaFX: 0.02,
    speed_y: 0.02,
    alpha_y_i: 0.02,
    alpha_y_j: 0.02,
    alphaFY: 0.02,
    betaFY: 0.02,
    gammaFY: 0.02,
    speed_hue: 0.02,
    alpha_hue_i: 0.02,
    alpha_hue_j: 0.02,
    min_hue: 0,
    max_hue: 60,
    shift_hue: 180,
  };
}

export function windowResized(sketch: P5): void {
  sketch.resizeCanvas(getSketchWidth(sketch), getSketchHeight(sketch));
}

function getCircleDetails(orbitersConfig: IOrbitersConfig, i: number, j: number,
                          t: number): [number, number, number] {
  const x: number = getX(orbitersConfig, i, j, t);
  const y: number = getY(orbitersConfig, i, j, t);
  const hue: number = getHue(orbitersConfig, i, j, t);
  return [x, y, hue];
}

function getX(orbitersConfig: IOrbitersConfig, i: number, j: number, t: number): number {
  const p: number = orbitersConfig.orbitersParamProviders.speedX() * t +
    orbitersConfig.orbitersParamProviders.alphaXI() * i +
    orbitersConfig.orbitersParamProviders.alphaXJ() * j;
  return orbitersConfig.fX(p);
}

function getY(orbitersConfig: IOrbitersConfig, i: number, j: number, t: number): number {
  const p: number = orbitersConfig.orbitersParamProviders.speedY() * t +
    orbitersConfig.orbitersParamProviders.alphaYI() * i +
    orbitersConfig.orbitersParamProviders.alphaYJ() * j;
  return orbitersConfig.fY(p);
}

function getHue(orbitersConfig: IOrbitersConfig, i: number, j: number, t: number): number {
  const p: number = orbitersConfig.orbitersParamProviders.speedHue() * t +
    orbitersConfig.orbitersParamProviders.alphaHueI() * i +
    orbitersConfig.orbitersParamProviders.alphaHueJ() * j;
  return orbitersConfig.fHue(p);
}

function getXShift(sketch: P5, orbiterConfig: IOrbitersParamProviders, j: number): number {
  return (j + 1) * getWorldWidth(sketch) / (orbiterConfig.nCols() + 1);
}

// Dependent on what row we're in, we find how far down we need to translate the "origin"
function getYShift(sketch: P5, orbiterConfig: IOrbitersParamProviders, i: number): number {
  return (i + 1) * getWorldHeight(sketch) / (orbiterConfig.nRows() + 1);
}
