import * as P5 from "p5";
import "./assets/styles/main.scss";

const MARGIN_X: number = 5;
const MARGIN_Y: number = 5;

const PADDING_X: number = 400;
const PADDING_Y: number = 400;

const p5: P5 = new P5(() => {
});

interface ISlider {
  value: () => number;
  updateLabel: () => void;
}

function createSlider(parentId: string, labelHtml: string, min: number, max: number, value?: number, step?: number):
    ISlider {
  const div: P5.Element = p5.createDiv();
  div.class("slider-container");
  div.parent(parentId);

  const label: P5.Element = p5.createDiv(labelHtml);
  label.class("slider-label");
  label.parent(div);

  const slider: P5.Element = p5.createSlider(min, max, value, step);
  slider.class("slider");
  slider.parent(div);

  const val: P5.Element = p5.createDiv(slider.value() as string);
  val.class("slider-value");
  val.parent(div);

  return {
    value(): number {
      return slider.value() as number;
    },
    updateLabel(): void {
      val.html(slider.value() as string);
    },
  };
}

const nColsSlider: ISlider = createSlider("sliders-container", "n&#8209;cols", 1, 50, 30);
const nRowsSlider: ISlider = createSlider("sliders-container", "n&#8209;rows", 1, 50, 30);

const circleWidthSlider: ISlider = createSlider("sliders-container", "circle&#8209;width", 1, 30, 8);
const circleHeightSlider: ISlider = createSlider("sliders-container", "circle&#8209;height", 1, 30, 8);

const depthX: ISlider = createSlider("sliders-container", "depth&#8209;x", 0, 300, 200);
const depthY: ISlider = createSlider("sliders-container", "depth&#8209;y", 0, 300, 200);

const speedXSlider: ISlider = createSlider("sliders-container", "speed&#8209;x", 0, 0.1, 0.02, 0.01);
const axiSlider: ISlider = createSlider("sliders-container", "alpha&#8209;x&#8209;i", 0, 1, 0.2, 0.01);
const axjSlider: ISlider = createSlider("sliders-container", "alpha&#8209;x&#8209;j", 0, 1, 0.2, 0.01);
const F_X: (p: number) => number = (p: number) => p5.cos(p);

const speedYSlider: ISlider = createSlider("sliders-container", "speed&#8209;y", 0, 0.1, 0.02, 0.01);
const ayiSlider: ISlider = createSlider("sliders-container", "alpha&#8209;y&#8209;i", 0, 1, 0.2, 0.01);
const ayjSlider: ISlider = createSlider("sliders-container", "alpha&#8209;y&#8209;j", 0, 1, 0.2, 0.01);
const F_Y: (p: number) => number = (p: number) => (1 / 2) * p5.sin(2 * p);

const speedHue: ISlider = createSlider("sliders-container", "speed&#8209;hue", 0, 1, 0.1, 0.01);
const aHueI: ISlider = createSlider("sliders-container", "alpha&#8209;hue&#8209;i", 0, 1, 0.5, 0.01);
const aHueJ: ISlider = createSlider("sliders-container", "alpha&#8209;hue&#8209;j", 0, 1, 0.5, 0.01);
const hueMin: ISlider = createSlider("sliders-container", "hue&#8209;min", 0, 360, 0);
const hueMax: ISlider = createSlider("sliders-container", "hue&#8209;max", 0, 360, 60);
const hueShift: ISlider = createSlider("sliders-container", "hue&#8209;shift", 0, 360, 180);
const F_HUE: (p: number) => number = (p: number) => p5.map(p5.cos(p), -1, 1, hueMin.value(),
  hueMax.value()) + hueShift.value();

const sliders: ISlider[] = [nColsSlider, nRowsSlider, circleWidthSlider, circleHeightSlider, depthX, depthY,
  speedXSlider, axiSlider, axjSlider, speedYSlider, ayiSlider, ayjSlider, speedHue, aHueI, aHueJ, hueMin, hueMax,
  hueShift];

// The sketch is inside the window with margin width on either side and margin height above and below
function getSketchWidth(): number {
  return p5.windowWidth - 2 * MARGIN_X;
}

function getSketchHeight(): number {
  return p5.windowHeight - 2 * MARGIN_Y;
}

// The world includes the window and more
function getWorldWidth(): number {
  return p5.windowWidth + PADDING_X;
}

function getWorldHeight(): number {
  return p5.windowHeight + PADDING_Y;
}

function getX(i: number, j: number, t: number): number {
  const p: number =
    speedXSlider.value() * t +
    axiSlider.value() * i +
    axjSlider.value() * j;
  return F_X(p);
}

function getY(i: number, j: number, t: number): number {
  const p: number =
    speedYSlider.value() * t +
    ayiSlider.value() * i +
    ayjSlider.value() * j;
  return F_Y(p);
}

function getHue(i: number, j: number, t: number): number {
  const p: number =
    speedHue.value() * t +
    aHueI.value() * i +
    aHueJ.value() * j;
  return F_HUE(p);
}

function getCircleDetails(i: number, j: number, t: number): [number, number, number] {
  const x: number = getX(i, j, t);
  const y: number = getY(i, j, t);
  const hue: number = getHue(i, j, t);
  return [x, y, hue];
}

let buffer: P5;
p5.setup = () => {
  const canvasDiv: P5.Element = p5.createDiv();
  const canvas: P5.Renderer = p5.createCanvas(getSketchWidth(), getSketchHeight());
  canvas.parent(canvasDiv);

  buffer = p5.createGraphics(getWorldWidth(), getWorldHeight()) as unknown as P5;
  buffer.colorMode(p5.HSB, 360, 10, 10, 100);
};

// Dependent on what column we're in, we find how far over we need to translate the "origin"
function getXShift(j: number): number {
  return (j + 1) * getWorldWidth() / (nColsSlider.value() + 1);
}

// Dependent on what row we're in, we find how far down we need to translate the "origin"
function getYShift(i: number): number {
  return (i + 1) * getWorldHeight() / (nRowsSlider.value() + 1);
}

p5.draw = () => {
  buffer.background(0, 0, 0, 10);

  [...Array(nRowsSlider.value()).keys()].forEach((i: number) => {
    [...Array(nColsSlider.value()).keys()].forEach((j: number) => {
      const [x, y, hue]: [number, number, number] = getCircleDetails(i, j, p5.frameCount);
      buffer.fill(hue, 10, 10);
      const relativeX: number = depthX.value() * x + getXShift(j);
      const relativeY: number = depthY.value() * y + getYShift(i);
      const circleWidth: number = circleWidthSlider.value();
      const circleHeight: number = circleHeightSlider.value();
      buffer.ellipse(relativeX, relativeY, circleWidth, circleHeight);
      // buffer.text(`${i}, ${j}`, relativeX, relativeY);
    });
  });

  sliders.forEach((slider: ISlider) => slider.updateLabel());

  p5.image(buffer as any, -200, -200);
};

p5.windowResized = () => {
  p5.resizeCanvas(getSketchWidth(), getSketchHeight());
  buffer.resizeCanvas(getWorldWidth(), getWorldHeight());
};
