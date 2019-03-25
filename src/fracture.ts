import * as P5 from "p5";
import { ISketchContext } from "./index";
import { getSketchHeight, getSketchWidth } from "./sketch-utils";
import * as dat from "dat.gui";
import { map, mod } from "./math-utils";
import MIDIMessageEvent = WebMidi.MIDIMessageEvent;
import MIDIInput = WebMidi.MIDIInput;

type TwoDPoint = [number, number];

interface IFractureConfig {
    fractureParamProviders: IFractureParamProviders;
}

interface IFractureParamProviders {
    nPoints: () => number;
    rotation: () => number;
    radius: () => number;
    mWeight0: () => number;
    mWeight1: () => number;
    fractures: () => number;
    hueSpeed: () => number;
    color: () => IColor;
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
    buffer.colorMode(sketchContext.sketch.HSB, 360, 1, 1, 100);

    const fractureConfig: IFractureConfig = getFractureConfig(sketchContext.sketch);

    sketchContext.buffer = buffer;
    sketchContext.config = fractureConfig;

    navigator.requestMIDIAccess().then((value: WebMidi.MIDIAccess) => {
        const inputEntries: IterableIterator<[string, MIDIInput]> = value.inputs.entries();
        for (let pair of inputEntries) {
            pair[1].onmidimessage = onMIDIMessage;
        }
    });
}

function getCentroid(shape: ITwoDShape): TwoDPoint {
    return shape.points.reduce((accum: TwoDPoint, point: TwoDPoint, i: number) => {
        const newPoint: TwoDPoint = [accum[0] + point[0], accum[1] + point[1]];
        if (i === shape.points.length - 1) {
            return [newPoint[0] / shape.points.length, newPoint[1] / shape.points.length];
        }
        return newPoint;
    }, [0, 0]);
}

function getMidPoint([x_0, y_0]: TwoDPoint, [x_1, y_1]: TwoDPoint, p: number): TwoDPoint {
    return [p * x_0 + (1 - p) * x_1, p * y_0 + (1 - p) * y_1];
}

function getSubShapes(shape: ITwoDShape, p: number, q: number): ITwoDShape[] {
    const shapeCentroid: TwoDPoint = getCentroid(shape);
    const subShapes: ITwoDShape[] = [];
    for (let i = 0; i < shape.points.length; i++) {
        const prevPoint: TwoDPoint = shape.points[mod(i - 1, shape.points.length)];
        const currPoint: TwoDPoint = shape.points[i];
        const nextPoint: TwoDPoint = shape.points[mod(i + 1, shape.points.length)];

        const firstMidPoint: TwoDPoint = getMidPoint(prevPoint, currPoint, p);
        const secondMidPoint: TwoDPoint = getMidPoint(currPoint, nextPoint, q);
        subShapes.push({
            points: [firstMidPoint, currPoint, secondMidPoint, shapeCentroid]
        });
    }
    return subShapes;
}

export async function draw(sketchContext: ISketchContext): Promise<void> {
    if (!sketchContext.buffer) {
        return;
    }
    const { buffer } = sketchContext;
    buffer.background(0, 0, 0, 40);
    const fractureConfig: IFractureConfig = sketchContext.config as IFractureConfig;
    const { fractureParamProviders } = fractureConfig;

    const rads: number = 2 * Math.PI / fractureParamProviders.nPoints();
    const shape0: ITwoDShape = {
        points: [...Array(fractureParamProviders.nPoints()).keys()]
            .map((i: number): TwoDPoint => [Math.cos(rads * i + fractureParamProviders.rotation()), Math.sin(rads * i + fractureParamProviders.rotation())])
            .map(([x, y]: TwoDPoint): TwoDPoint => [x * fractureParamProviders.radius() + sketchContext.getWorldWidth() / 2,
                y * fractureParamProviders.radius() + sketchContext.getWorldHeight() / 2])
    };

    const subShapes: ITwoDShape[] = [...Array(fractureParamProviders.fractures()).keys()].reduce((accum: ITwoDShape[], i: number): ITwoDShape[] => {
        const toFlatten: ITwoDShape[][] = accum.map((shape: ITwoDShape): ITwoDShape[] => getSubShapes(shape, fractureParamProviders.mWeight0(), fractureParamProviders.mWeight1()));
        let flattened: ITwoDShape[] = [];
        toFlatten.forEach((shapes: ITwoDShape[]) => flattened = flattened.concat(shapes));
        return flattened;
    }, [shape0]);

    buffer.strokeWeight(1);
    buffer.stroke(0);
    subShapes.forEach((shape: ITwoDShape) => {
        const [x, y]: TwoDPoint = getCentroid(shape);
        const { h, s, v }: IColor = fractureParamProviders.color();
        const hueNoise: number = buffer.noise(x, y, sketchContext.sketch.frameCount * fractureParamProviders.hueSpeed());
        const hue: number = mod(buffer.map(hueNoise, 0, 1, h - 60, h + 60), 360);
        buffer.fill(hue, s, v);
        buffer.beginShape();
        shape.points.forEach(([x, y]: TwoDPoint) => {
            buffer.vertex(x, y);
        });
        buffer.endShape(buffer.CLOSE);
    });

    sketchContext.sketch.image(buffer as unknown as P5.Image, -200, -200);
}

export function windowResized(sketch: P5): void {
    sketch.resizeCanvas(getSketchWidth(sketch), getSketchHeight(sketch));
}

let numPointsController: dat.GUIController;
let rotationController: dat.GUIController;
let radiusController: dat.GUIController;
let mWeight0Controller: dat.GUIController;
let mWeight1Controller: dat.GUIController;
let fracturesController: dat.GUIController;
let hueSpeedController: dat.GUIController;
let colorController: dat.GUIController;

function getFractureConfig(sketch: P5): IFractureConfig {
    const gui = new dat.GUI({ name: "processing-gui" });
    const initialConfig = {
        n_points: 3,
        rotation: 0,
        radius: 100,
        m_0_weight: 0.5,
        m_1_weight: 0.5,
        fractures: 0,
        hue_speed: 0.1,
        hue_distance: 1,
        color: { h: 0, s: 1, v: 1 }
    };
    numPointsController = gui.add(initialConfig, "n_points", 3, 30, 1);
    rotationController = gui.add(initialConfig, "rotation", 0, 2 * Math.PI);
    radiusController = gui.add(initialConfig, "radius", 1, 2500);
    mWeight0Controller = gui.add(initialConfig, "m_0_weight", 0, 2);
    mWeight1Controller = gui.add(initialConfig, "m_1_weight", 0, 2);
    fracturesController = gui.add(initialConfig, "fractures", 0, 10, 1);
    hueSpeedController = gui.add(initialConfig, "hue_speed", 0, 0.5);
    colorController = gui.addColor(initialConfig, "color");
    return {
        fractureParamProviders: {
            nPoints: () => numPointsController.getValue(),
            rotation: () => rotationController.getValue(),
            radius: () => radiusController.getValue(),
            mWeight0: () => mWeight0Controller.getValue(),
            mWeight1: () => mWeight1Controller.getValue(),
            fractures: () => fracturesController.getValue(),
            hueSpeed: () => hueSpeedController.getValue(),
            color: () => colorController.getValue(),
        }
    };
}

function onMIDIMessage(midiMessage: MIDIMessageEvent) {
    const data: Uint8Array = midiMessage.data;
    if (data[1] === 16) {
        numPointsController.setValue(map(data[2], 0, 127, 3, 30));
    }
    if (data[1] === 20) {
        rotationController.setValue(map(data[2], 0, 127, 0, 2 * Math.PI));
    }
    if (data[1] === 24) {
        radiusController.setValue(map(data[2], 0, 127, 1, 2500));
    }
    if (data[1] === 28) {
        mWeight0Controller.setValue(map(data[2], 0, 127, 0, 2));
    }
    if (data[1] === 46) {
        mWeight1Controller.setValue(map(data[2], 0, 127, 0, 2));
    }
    if (data[1] === 50) {
        fracturesController.setValue(map(data[2], 0, 127, 0, 10));
    }
    if (data[1] === 54) {
        hueSpeedController.setValue(map(data[2], 0, 127, 0, 0.5));
    }
    if (data[1] === 58) {
        colorController.setValue({ h: map(data[2], 0, 127, 0, 360), s: 1, v: 1 });
    }
}