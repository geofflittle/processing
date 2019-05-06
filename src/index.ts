import * as P5 from "p5";
import "./assets/styles/main.scss";
import { BLOB_CONTROLLER_CONFIGS, getPixels } from "./blobs";
import * as dat from "dat.gui";
import MIDIInput = WebMidi.MIDIInput;
import { GUI } from "dat.gui";
import MIDIMessageEvent = WebMidi.MIDIMessageEvent;
import { map } from "./math-utils";

export type ControllerValues = { [ key: string ]: number };
export interface ControllerConfig {
  min: number;
  max: number;
  initialValue: number;
  handlerId: number;
}
export type ControllerConfigs = { [ key: string ]: ControllerConfig };
export type Controllers = { [key: string]: dat.GUIController };
export type MidiHandlers = { [ key: number ]: (value: number) => void };
export interface ISketch {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  imageData: ImageData;
  frame: number;
  controllers: Controllers;
}

export function getInitialControllerValues(controllerConfigs: { [key: string]: ControllerConfig }): ControllerValues {
  // Given a controller configs dictionary, filter it down to an initial values dictionary
  return Object.entries(controllerConfigs)
      .reduce((accum: { [key: string]: number }, currentValue: [string, ControllerConfig]) => {
        accum[currentValue[0]] = currentValue[1].initialValue;
        return accum;
      }, {})
}

export function getControllers(gui: GUI, controllerConfigs: ControllerConfigs): [Controllers, MidiHandlers] {
  // Get an initial value object for dat.GUI
  const initialControllerValues: ControllerValues = getInitialControllerValues(controllerConfigs);

  return Object.entries(controllerConfigs)
      .reduce(([controllers, midiHandlers]: [Controllers, MidiHandlers], [controllerName, controllerConfig]: [string, ControllerConfig]) => {
        // Build the controller
        const controller: dat.GUIController = gui.add(initialControllerValues, controllerName, controllerConfig.min, controllerConfig.max);
        controllers[controllerName] = controller;

        // Build the midi data handler
        midiHandlers[controllerConfig.handlerId] = (value: number) => controller.setValue(map(value, 0, 127, controllerConfig.min, controllerConfig.max));
        return [controllers, midiHandlers];
      }, [{}, {}] as [Controllers, MidiHandlers]);

}

function setupAndGetSketch(): ISketch {
  const canvas: HTMLCanvasElement = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);

  const context: CanvasRenderingContext2D | null = canvas.getContext("2d");
  if (!context) {
    throw new Error("No context");
  }

  const imageData: ImageData = context.getImageData(0, 0, window.innerWidth, window.innerHeight);

  const gui: GUI = new dat.GUI({ name: "processing-gui" });
  const [ controllers, midiHandlers ]: [ Controllers, MidiHandlers ] = getControllers(gui, BLOB_CONTROLLER_CONFIGS);
    navigator.requestMIDIAccess().then((value: WebMidi.MIDIAccess) => {
      const inputEntries: IterableIterator<[string, MIDIInput]> = value.inputs.entries();
      for (let pair of inputEntries) {
        pair[1].onmidimessage = (midiMessageEvent: MIDIMessageEvent) => {
          const [handlerId, value]: [number, number] = [midiMessageEvent.data[1], midiMessageEvent.data[2]];
          midiHandlers[handlerId](value);
        };
      }
    });

  return { canvas, context, imageData, frame: 0, controllers };
}

function draw(sketch: ISketch): FrameRequestCallback {
  return () => {
    const { context, imageData, frame } = sketch;
    requestAnimationFrame(draw({ ...sketch, frame: frame + 1 }));

    const buf8: Uint8ClampedArray = getPixels(sketch);
    imageData.data.set(buf8);
    context.putImageData(imageData, 0, 0);
  }
}

const sketch: ISketch = setupAndGetSketch();
draw(sketch)(-1);



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