import * as P5 from "p5";

const MARGIN_X: number = 5;
const MARGIN_Y: number = 5;

const PADDING_X: number = 400;
const PADDING_Y: number = 400;

export interface ISlider {
  value: () => number;
  updateLabel: () => void;
}

// The sketch is inside the window with margin width on either side and margin height above and below
export function getSketchWidth(sketch: P5): number {
  return sketch.windowWidth - 2 * MARGIN_X;
}

export function getSketchHeight(sketch: P5): number {
  return sketch.windowHeight - 2 * MARGIN_Y;
}

// The world includes the window and more
export function getWorldWidth(sketch: P5): number {
  return sketch.windowWidth + PADDING_X;
}

export function getWorldHeight(sketch: P5): number {
  return sketch.windowHeight + PADDING_Y;
}

export function createSlider(sketch: P5, parentId: string, labelHtml: string, min: number, max: number, value?: number,
                             step?: number): ISlider {
  const div: P5.Element = sketch.createDiv();
  div.class("slider-container");
  div.parent(parentId);

  const label: P5.Element = sketch.createDiv(labelHtml);
  label.class("slider-label");
  label.parent(div);

  const slider: P5.Element = sketch.createSlider(min, max, value, step);
  slider.class("slider");
  slider.parent(div);

  const val: P5.Element = sketch.createDiv(slider.value() as string);
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
