export type Cell = [] | [ LineSegment ] | [ LineSegment, LineSegment ];

export type LineSegment = {
    direction: LineSegmentDirection;
    distances: [ number, number ];
};

export enum LineSegmentDirection {
    W_TO_N, W_TO_E, W_TO_S, N_TO_E, N_TO_S, S_TO_E
}

type IsocontourCellProvider = (isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number) => Cell;

const isocontourCellProviders: { [key: number]: IsocontourCellProvider } = {
    0: handleCase0,
    1: handleCase1,
    2: handleCase2,
    3: handleCase3,
    4: handleCase4,
    5: handleCase5,
    6: handleCase6,
    7: handleCase7,
    8: handleCase8,
    9: handleCase9,
    10: handleCase10,
    11: handleCase11,
    12: handleCase12,
    13: handleCase13,
    14: handleCase14,
    15: handleCase15,
};

export function getIsocontours(isovalue: number, values: number[][]): Cell[][] {
    return [ ...Array(values.length - 1).keys() ]
        .map((i: number) => [ ...Array(values[i].length - 1).keys() ]
            .map((j: number) => getIsocontourCell(isovalue, values[i][j], values[i][j + 1], values[i + 1][j], values[i + 1][j + 1])));
}

export function getIsocontourCell(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): Cell {
    const contour = getIsocontour(isovalue, nwValue, neValue, swValue, seValue);
    return isocontourCellProviders[contour](isovalue, nwValue, neValue, swValue, seValue);
}

export function getIsocontour(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): number {
    return getComposite(nwValue >= isovalue ? 1 : 0, neValue >= isovalue ? 1 : 0, seValue >= isovalue ? 1 : 0, swValue >= isovalue ? 1 : 0);
}

export function getComposite(nwBit: number, neBit: number, seBit: number, swBit: number): number {
    return (nwBit << 3) | (neBit << 2) | (swBit << 1) | (seBit << 0);
}

/**
 * Returns a percentage of how close the isovalue is to the left compared to the right.
 * For example, 4 is 50% between 3 and 5, 1/3 of the way between 3 and 6, 25% of the way between 3 and 7, etc.
 * @param isovalue
 * @param left
 * @param right
 */
function getPercentDifference(isovalue: number, left: number, right: number): number {
    return (left - isovalue) / (left - right);
}

// function getDistances(isovalue: number, left: number, center: number, right: number): [ number, number ] {
//     return [ getPercentDifference(isovalue, left, center), getPercentDifference(isovalue, center, right) ]
// }

function handleCase0(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [] {
    /*
     * No value is >= the isovalue
     * 0 - 0
     * |   |
     * 0 - 0
     */
    return []
}

function handleCase1(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [ LineSegment ] {
    /*
     * SE value is >= the isovalue, the isocontour line segment is from South to East
     * 0 - 0
     * |   |
     * 0 - 1
     */
    return [ {
        direction: LineSegmentDirection.S_TO_E,
        distances: [ getPercentDifference(isovalue, swValue, seValue), getPercentDifference(isovalue, neValue, seValue) ],
    } ]
}

function handleCase2(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [ LineSegment ] {
    /*
     * SW value is >= the isovalue, the isocontour line segment is from West to South
     * 0 - 0
     * |   |
     * 1 - 0
     */
    return [ {
        direction: LineSegmentDirection.W_TO_S,
        distances: [ getPercentDifference(isovalue, nwValue, swValue), getPercentDifference(isovalue, swValue, seValue) ]
    } ]
}

function handleCase3(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [ LineSegment ] {
    /*
     * SW and SE values are >= the isovalue, the isocontour line segment is from West to East
     * 0 - 0
     * |   |
     * 1 - 1
     */
    return [ {
        direction: LineSegmentDirection.W_TO_E,
        distances: [ getPercentDifference(isovalue, nwValue, swValue), getPercentDifference(isovalue, neValue, seValue) ]
    } ]
}

function handleCase4(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [ LineSegment ] {
    /*
     * NE value is >= the isovalue, the isocontour line segment is from North to East
     * 0 - 1
     * |   |
     * 0 - 0
     */
    return [ {
        direction: LineSegmentDirection.N_TO_E,
        distances: [ getPercentDifference(isovalue, nwValue, neValue), getPercentDifference(isovalue, neValue, seValue) ]
    } ]
}

function handleCase5(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [ LineSegment ] {
    /*
     * NE and SE values are >= the isovalue, the isocontour line segment is from North to South
     * 0 - 1
     * |   |
     * 0 - 1
     */
    return [ {
        direction: LineSegmentDirection.N_TO_S,
        distances: [ getPercentDifference(isovalue, nwValue, neValue), getPercentDifference(isovalue, swValue, seValue) ]
    } ]
}

function handleCase6(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [ LineSegment, LineSegment ] {
    /*
     * NE and SW values are >= the isovalue, the isocontour line segments are from West to South and North to East
     * 0 - 1
     * |   |
     * 1 - 0
     */
    const [ case2LineSegment ]: [ LineSegment ] = handleCase2(isovalue, nwValue, neValue, swValue, seValue);
    const [ case4LineSegment ]: [ LineSegment ] = handleCase4(isovalue, nwValue, neValue, swValue, seValue);
    return [ case2LineSegment, case4LineSegment ];
}

function handleCase7(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [ LineSegment ] {
    /*
     * NE, SW, and SE values are >= the isovalue, the isocontour line segment from West to North
     * 0 - 1
     * |   |
     * 1 - 1
     */
    return [ {
        direction: LineSegmentDirection.W_TO_N,
        distances: [ getPercentDifference(isovalue, nwValue, swValue), getPercentDifference(isovalue, nwValue, neValue) ]
    } ]
}

function handleCase8(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [ LineSegment ] {
    /*
     * NW is >= the isovalue, the isocontour line segment is from West to North
     * 1 - 0
     * |   |
     * 0 - 0
     */
    return handleCase7(isovalue, nwValue, neValue, swValue, seValue);
}

function handleCase9(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [ LineSegment, LineSegment ] {
    /*
     * NW and SE are >= the isovalue, the isocontour line segments are from West to North and South to East
     * 1 - 0
     * |   |
     * 0 - 1
     */
    return handleCase6(isovalue, nwValue, neValue, swValue, seValue);
}

function handleCase10(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [ LineSegment ] {
    /*
     * NW and SW are >= the isovalue, the isocontour line segments is from North to South
     * 1 - 0
     * |   |
     * 1 - 0
     */
    return handleCase5(isovalue, nwValue, neValue, swValue, seValue);
}

function handleCase11(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [ LineSegment ] {
    /*
     * NW, SW, and SE are >= the isovalue, the isocontour line segment is from North to East
     * 1 - 0
     * |   |
     * 1 - 1
     */
    return handleCase4(isovalue, nwValue, neValue, swValue, seValue);
}

function handleCase12(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [ LineSegment ] {
    /*
     * NW and NE are >= the isovalue, the isocontour line segment is from West to East
     * 1 - 1
     * |   |
     * 0 - 0
     */
    return handleCase3(isovalue, nwValue, neValue, swValue, seValue);
}

function handleCase13(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [ LineSegment ] {
    /*
     * NW, NE, and SE are >= the isovalue, the isocontour line segment is from West to South
     * 1 - 1
     * |   |
     * 0 - 1
     */
    return handleCase2(isovalue, nwValue, neValue, swValue, seValue);
}

function handleCase14(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [ LineSegment ] {
    /*
     * NW, NE, and SW are >= the isovalue, the isocontour line segment is from South to East
     * 1 - 1
     * |   |
     * 1 - 0
     */
    return handleCase1(isovalue, nwValue, neValue, swValue, seValue);
}

function handleCase15(isovalue: number, nwValue: number, neValue: number, swValue: number, seValue: number): [] {
    return handleCase0(isovalue, nwValue, neValue, swValue, seValue);
}
