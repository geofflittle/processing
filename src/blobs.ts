import { ControllerConfig, ControllerConfigs, Controllers, ControllerValues, getInitialControllerValues, ISketch, MidiHandlers } from "./index";
import { simplex3 } from "./noise";
import { map } from "./math-utils";
import * as dat from "dat.gui";
import { GUI } from "dat.gui";

export enum BlobControllerName {
    X_SPEED = "X_SPEED", Y_SPEED = "Y_SPEED", T_SPEED = "T_SPEED", ISO_VALUE = "ISO_VALUE", BAND = "BAND"
}

export type BlobControllerConfigs = { [key in BlobControllerName]: ControllerConfig };

export type BlobControllers = { [key in BlobControllerName]: dat.GUIController }

export const BLOB_CONTROLLER_CONFIGS: BlobControllerConfigs = {
    [BlobControllerName.X_SPEED]: { min: 0, max: 0.1, initialValue: 0.015, handlerId: 16 },
    [BlobControllerName.Y_SPEED]: { min: 0, max: 0.1, initialValue: 0.015, handlerId: 20 },
    [BlobControllerName.T_SPEED]: { min: 0, max: 0.25, initialValue: 0.015, handlerId: 24 },
    [BlobControllerName.ISO_VALUE]: { min: 0, max: 1, initialValue: 0.5, handlerId: 28 },
    [BlobControllerName.BAND]: { min: 0, max: 0.5, initialValue: 0.1, handlerId: 46 }
};

export function getPixels(sketch: ISketch): Uint8ClampedArray {
    const canvas: HTMLCanvasElement = sketch.canvas;
    const imageData: ImageData = sketch.imageData;
    const frame: number = sketch.frame;
    const controllers: BlobControllers = sketch.controllers as BlobControllers;

    const buf: ArrayBuffer = new ArrayBuffer(imageData.data.length);
    const buf8: Uint8ClampedArray = new Uint8ClampedArray(buf);
    const data: Uint32Array = new Uint32Array(buf);

    const xSpeed: number = controllers.X_SPEED.getValue();
    const ySpeed: number = controllers.Y_SPEED.getValue();
    const tSpeed: number = controllers.T_SPEED.getValue();
    const isoValue: number = controllers.ISO_VALUE.getValue();
    const band: number = controllers.BAND.getValue();

    for (let y = 0; y < canvas.height; ++y) {
        for (let x = 0; x < canvas.width; ++x) {
            const value: number = simplex3(x * xSpeed, y * ySpeed, frame * tSpeed);
            const onOrOff: number = Math.abs(value - isoValue) < band ? 255 : 0;
            data[y * canvas.width + x] = (255 << 24) | (onOrOff << 16) | (onOrOff << 8) | (onOrOff);
        }
    }
    return buf8;
}
