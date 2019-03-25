import { Cell, getIsocontour, getIsocontourCell, getIsocontours, LineSegmentDirection } from "./marchingSquares";
import { expect } from "chai";

describe("get isocontour", () => {

    it("computes case 0, all numbers are less than the isovalue", () => {
        expect(getIsocontour(1, 0, 0, 0, 0)).to.equal(0);
    });

    it("computes case 1, sw larger than the isovalue", () => {
        expect(getIsocontour(1, 0, 0, 0, 1)).to.equal(1);
    });

    it("computes case 2, se larger than the isovalue", () => {
        expect(getIsocontour(1, 0, 0, 1, 0)).to.equal(2);
    });

    it("computes case 3, all numbers are less than the isovalue", () => {
        expect(getIsocontour(1, 0, 0, 1, 1)).to.equal(3);
    });

    it("computes case 4, all numbers are less than the isovalue", () => {
        expect(getIsocontour(1, 0, 1, 0, 0)).to.equal(4);
    });

    it("computes case 5, all numbers are less than the isovalue", () => {
        expect(getIsocontour(1, 0, 1, 0, 1)).to.equal(5);
    });

    it("computes case 6, all numbers are less than the isovalue", () => {
        expect(getIsocontour(1, 0, 1, 1, 0)).to.equal(6);
    });

    it("computes case 7, all numbers are less than the isovalue", () => {
        expect(getIsocontour(1, 0, 1, 1, 1)).to.equal(7);
    });

    it("computes case 8, all numbers are less than the isovalue", () => {
        expect(getIsocontour(1, 1, 0, 0, 0)).to.equal(8);
    });

    it("computes case 9, all numbers are less than the isovalue", () => {
        expect(getIsocontour(1, 1, 0, 0, 1)).to.equal(9);
    });

    it("computes case 10, all numbers are less than the isovalue", () => {
        expect(getIsocontour(1, 1, 0, 1, 0)).to.equal(10);
    });

    it("computes case 11, all numbers are less than the isovalue", () => {
        expect(getIsocontour(1, 1, 0, 1, 1)).to.equal(11);
    });

    it("computes case 12, all numbers are less than the isovalue", () => {
        expect(getIsocontour(1, 1, 1, 0, 0)).to.equal(12);
    });

    it("computes case 13, all numbers are less than the isovalue", () => {
        expect(getIsocontour(1, 1, 1, 0, 1)).to.equal(13);
    });

    it("computes case 14, all numbers are less than the isovalue", () => {
        expect(getIsocontour(1, 1, 1, 1, 0)).to.equal(14);
    });

    it("computes case 15, all numbers are less than the isovalue", () => {
        expect(getIsocontour(1, 1, 1, 1, 1)).to.equal(15);
    });

});

describe("get isocontour cell", () => {

    it("handles case 0", () => {
        expect(getIsocontourCell(0, 1, 1, 1, 1)).to.deep.equal([]);
    });

    it("handles case 1", () => {
        expect(getIsocontourCell(4, 1, 2, 3, 5)).to.deep.equal([ {
            direction: LineSegmentDirection.S_TO_E,
            d0: 0.5,
            d1: 2 / 3
        } ]);
    });

    it("handles case 2", () => {
        expect(getIsocontourCell(4, 1, 2, 5, 3)).to.deep.equal([ {
            direction: LineSegmentDirection.W_TO_S,
            d0: 0.75,
            d1: 0.5
        } ]);
    });

    it("handles case 3", () => {
        expect(getIsocontourCell(4, 1, 2, 5, 5)).to.deep.equal([ {
            direction: LineSegmentDirection.W_TO_E,
            d0: 0.75,
            d1: 2 / 3
        } ]);
    });

    it("handles case 4", () => {
        expect(getIsocontourCell(4, 1, 5, 2, 3)).to.deep.equal([ {
            direction: LineSegmentDirection.N_TO_E,
            d0: 0.75,
            d1: 0.5
        } ]);
    });

    it("handles case 5", () => {
        expect(getIsocontourCell(4, 1, 5, 2, 5)).to.deep.equal([ {
            direction: LineSegmentDirection.N_TO_S,
            d0: 0.75,
            d1: 2 / 3
        } ]);
    });

    it("handles case 6", () => {
        expect(getIsocontourCell(4, 1, 5, 5, 2)).to.deep.equal([ {
            direction: LineSegmentDirection.W_TO_S,
            d0: 0.75,
            d1: 1 / 3
        }, {
            direction: LineSegmentDirection.N_TO_E,
            d0: 0.75,
            d1: 1 / 3
        }
        ]);
    });

});

describe("get isocontours", () => {

    it("gets it", () => {
        const values: number[][] = [
            [ 8, 9, 7, 6, 3 ],
            [ 7, 3, 5, 3, 2 ],
            [ 8, 1, 7, 8, 4 ],
            [ 8, 6, 4, 2, 6 ],
            [ 9, 8, 3, 7, 6 ] ];

        const row1: Cell[] = [
            [ { direction: LineSegmentDirection.S_TO_E, distances: [ 0.5, 2 / 3 ] } ],
            [ { direction: LineSegmentDirection.W_TO_S, distances: [ 2 / 3, 1 ] } ],
            [ { direction: LineSegmentDirection.S_TO_E, distances: [ 0, 1 / 3 ] } ],
            [ { direction: LineSegmentDirection.W_TO_N, distances: [ 1 / 3, 1 / 3 ] } ] ];
        const row2: Cell[] = [
            [ { direction: LineSegmentDirection.N_TO_S, distances: [ 0.5, 3 / 7 ] } ],
            [ { direction: LineSegmentDirection.N_TO_S, distances: [ 1, 2 / 3 ] } ],
            [ { direction: LineSegmentDirection.N_TO_E, distances: [ 0, 0.4 ] } ],
            [ { direction: LineSegmentDirection.W_TO_S, distances: [ 0.4, 0.75 ] } ] ];
        const row3: Cell[] = [
            [ { direction: LineSegmentDirection.N_TO_E, distances: [ 3 / 7, 0.8 ] } ],
            [ { direction: LineSegmentDirection.W_TO_S, distances: [ 0.8, 0.5 ] }, { direction: LineSegmentDirection.N_TO_E, distances: [ 2 / 3, 2 / 3 ] } ],
            [ { direction: LineSegmentDirection.W_TO_E, distances: [ 2 / 3, 0.5 ] } ],
            [ { direction: LineSegmentDirection.W_TO_S, distances: [ 0.5, 0.75 ] }, { direction: LineSegmentDirection.N_TO_E, distances: [ 0.75, 0.5 ] } ] ];
        const row4: Cell[] = [
            [],
            [ { direction: LineSegmentDirection.N_TO_S, distances: [ 0.5, 0.6 ] } ],
            [ { direction: LineSegmentDirection.S_TO_E, distances: [ 0.5, 0.6 ] } ],
            [ { direction: LineSegmentDirection.W_TO_N, distances: [ 0.6, 0.75 ] } ] ];
        const expectedIsocontour: Cell[][] = [ row1, row2, row3, row4 ];

        const actualIsocontour = getIsocontours(5, values);

        expect(actualIsocontour).to.deep.equal(expectedIsocontour);
    });

});