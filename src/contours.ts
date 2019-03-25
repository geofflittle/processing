import * as P5 from "p5";
import { ISketchContext } from "./index";
import { getSketchHeight, getSketchWidth } from "./sketch-utils";
import { getSigmoid } from "./math-utils";

type TwoDPoint = [number, number];

interface IContoursConfig {
    contoursParamProviders: ICountoursParamProviders;
}

interface ICountoursParamProviders {
    // hueSpeed: () => number;
    // color: () => IColor;
}

interface IColor {
    h: number;
    s: number;
    v: number;
}

interface ITwoDShape {
    points: TwoDPoint[]
}

export function setup(sketchContext: ISketchContext): void {
    const canvasDiv: P5.Element = sketchContext.sketch.createDiv();
    const canvas: P5.Renderer = sketchContext.sketch.createCanvas(sketchContext.getSketchWidth(),
        sketchContext.getSketchHeight());
    canvas.parent(canvasDiv);

    const buffer: P5 = sketchContext.sketch.createGraphics(sketchContext.getWorldWidth(),
        sketchContext.getWorldHeight()) as unknown as P5;

    const contoursConfig: IContoursConfig = getContoursConfig(sketchContext.sketch);

    sketchContext.buffer = buffer;
    sketchContext.config = contoursConfig;
}

export function draw(sketchContext: ISketchContext): void {
    const sigmoid = getSigmoid(1, 10, 0.5);

    const buffer = sketchContext.buffer;
    if (!buffer) {
        return;
    }

    // buffer.colorMode(buffer.RGB, 1, 1, 1);
    buffer.noStroke();
    buffer.loadPixels();
    const pixelsLength = buffer.width + buffer.height;
    for (let i = 0; i < pixelsLength; i += 4) {
        const row = i / (buffer.width);
        const col = i % (buffer.width);
        const noise: number = buffer.noise(0.05 * row, 0.05 * col, 0.01 * sketchContext.sketch.frameCount);
        const sigmoidNoise: number = sigmoid(noise);
        const hue: number = Math.abs(sigmoidNoise - 0.5) < 0.05 ? 1 : 0;
        buffer.pixels[i] = hue * 255;
        buffer.pixels[i + 1] = hue * 255;
        buffer.pixels[i + 2] = hue * 255;
        buffer.pixels[i + 3] = 100;
    }

    // [...Array(Math.round(sketchContext.getSketchWidth())).keys()]
    //     .forEach((i: number): void => {
    //         [...Array(Math.round(sketchContext.getSketchWidth())).keys()]
    //             .forEach((j: number): void => {
    //                 const noise: number = buffer.noise(0.05 * i, 0.05 * j, 0.01 * sketchContext.sketch.frameCount);
    //                 const sigmoidNoise: number = sigmoid(noise);
    //                 const hue: number = Math.abs(sigmoidNoise - 0.5) < 0.05 ? 1 : 0;
    //                 if (i === 0 && j === 0) {
    //                     // console.log("noise", noise);
    //                     // console.log("sigmoidNoise", sigmoidNoise);
    //                     // console.log("hue", hue);
    //                 }
    //                 buffer.pixels[i * sketchContext.getSketchWidth() + j] = hue * 255;
    //                 buffer.pixels[i * sketchContext.getSketchWidth() + j + 1] = hue * 255;
    //                 buffer.pixels[i * sketchContext.getSketchWidth() + j + 2] = hue * 255;
    //                 buffer.pixels[i * sketchContext.getSketchWidth() + j + 3] = hue * 255;
    //                 buffer.pixels[i * sketchContext.getSketchWidth() + j + 4] = 100;
    //             })
    //     });

    buffer.pixels[0] = 255;
    buffer.pixels[1] = 255;
    buffer.pixels[2] = 255;
    buffer.pixels[3] = 100;

    buffer.pixels[4] = 255;
    buffer.pixels[5] = 255;
    buffer.pixels[6] = 255;
    buffer.pixels[7] = 100;

    buffer.updatePixels();

    sketchContext.sketch.image(buffer as unknown as P5.Image, -200, -200);
}

export function windowResized(sketch: P5): void {
    sketch.resizeCanvas(getSketchWidth(sketch), getSketchHeight(sketch));

}

function getContoursConfig(sketch: P5): IContoursConfig {
    // const gui = new dat.GUI({ name: "processing-gui" });
    // const initialConfig = {
    //     hueSpeed: 0.1,
    //     color: { h: 0, s: 1, v: 1 }
    // };
    // const hueSpeedController: dat.GUIController = gui.add(initialConfig, "hue_speed", 0, 0.5);
    // const colorController: dat.GUIController = gui.addColor(initialConfig, "color");
    return {
        contoursParamProviders: {
            // hueSpeed: () => hueSpeedController.getValue(),
            // color: () => colorController.getValue(),
        }
    };
}
