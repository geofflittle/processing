import * as P5 from "p5";
import { ISketchContext } from "./index";
import { getSketchHeight, getSketchWidth } from "./sketch-utils";
import * as dat from "dat.gui";
import { mod } from "./math-utils";

type TwoDPoint = [ number, number ];

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
}

function getCentroid(shape: ITwoDShape): TwoDPoint {
    return shape.points.reduce((accum: TwoDPoint, point: TwoDPoint, i: number) => {
        const newPoint: TwoDPoint = [ accum[0] + point[0], accum[1] + point[1] ];
        if (i === shape.points.length - 1) {
            return [ newPoint[0] / shape.points.length, newPoint[1] / shape.points.length ];
        }
        return newPoint;
    }, [ 0, 0 ]);
}

function getMidPoint([ x_0, y_0 ]: TwoDPoint, [ x_1, y_1 ]: TwoDPoint, p: number): TwoDPoint {
    return [ p * x_0 + (1 - p) * x_1, p * y_0 + (1 - p) * y_1 ];
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
            points: [ firstMidPoint, currPoint, secondMidPoint, shapeCentroid ]
        });
    }
    return subShapes;
}

export function draw(sketchContext: ISketchContext): void {
    if (!sketchContext.buffer) {
        return;
    }
    const { buffer } = sketchContext;
    buffer.background(0, 0, 0, 40);
    const fractureConfig: IFractureConfig = sketchContext.config as IFractureConfig;
    const { fractureParamProviders } = fractureConfig;

    const rads: number = 2 * Math.PI / fractureParamProviders.nPoints();
    const shape0: ITwoDShape = {
        points: [ ...Array(fractureParamProviders.nPoints()).keys() ]
            .map((i: number): TwoDPoint => [ Math.cos(rads * i + fractureParamProviders.rotation()), Math.sin(rads * i + fractureParamProviders.rotation()) ])
            .map(([ x, y ]: TwoDPoint): TwoDPoint => [ x * fractureParamProviders.radius() + sketchContext.getWorldWidth() / 2,
                y * fractureParamProviders.radius() + sketchContext.getWorldHeight() / 2 ])
    };

    // const subShapes: ITwoDShape[] = getSubShapes(shape0, fractureParamProviders.mWeight0(), fractureParamProviders.mWeight1());

    const subShapes: ITwoDShape[] = [ ...Array(fractureParamProviders.fractures()).keys() ].reduce((accum: ITwoDShape[], i: number): ITwoDShape[] => {
        const toFlatten: ITwoDShape[][] = accum.map((shape: ITwoDShape): ITwoDShape[] => getSubShapes(shape, fractureParamProviders.mWeight0(), fractureParamProviders.mWeight1()));
        let flattened: ITwoDShape[] = [];
        toFlatten.forEach((shapes: ITwoDShape[]) => flattened = flattened.concat(shapes));
        return flattened;
    }, [ shape0 ]);

    buffer.strokeWeight(1);
    buffer.stroke(0);
    subShapes.forEach((shape: ITwoDShape) => {
        const [x, y]: TwoDPoint = getCentroid(shape);
        const { h, s, v }: IColor = fractureParamProviders.color();
        const hueNoise: number = buffer.noise(x, y, sketchContext.sketch.frameCount * fractureParamProviders.hueSpeed());
        const hue: number = mod(buffer.map(hueNoise, 0, 1, h - 60, h + 60), 360);
        buffer.fill(hue, s, v);
        buffer.beginShape();
        shape.points.forEach(([ x, y ]: TwoDPoint) => {
            buffer.vertex(x, y);
        });
        buffer.endShape(buffer.CLOSE);
    });

    sketchContext.sketch.image(buffer as unknown as P5.Image, -200, -200);
}

export function windowResized(sketch: P5): void {
    sketch.resizeCanvas(getSketchWidth(sketch), getSketchHeight(sketch));
}

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
    const numPointsController: dat.GUIController = gui.add(initialConfig, "n_points", 3, 30, 1);
    const rotationController: dat.GUIController = gui.add(initialConfig, "rotation", 0, 2 * Math.PI);
    const radiusController: dat.GUIController = gui.add(initialConfig, "radius", 1, 2500);
    const mWeight0Controller: dat.GUIController = gui.add(initialConfig, "m_0_weight", 0, 2);
    const mWeight1Controller: dat.GUIController = gui.add(initialConfig, "m_1_weight", 0, 2);
    const fracturesController: dat.GUIController = gui.add(initialConfig, "fractures", 0, 10, 1);
    const hueSpeedController: dat.GUIController = gui.add(initialConfig, "hue_speed", 0, 0.5);
    const colorController: dat.GUIController = gui.addColor(initialConfig, "color");
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
