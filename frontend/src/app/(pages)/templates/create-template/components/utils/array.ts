import {areArraysEqual} from "@app/utils/common/array";

export function checkIfStringOrArrayOfStringIdsAreEqual(
    id1: string | string[],
    id2: string | string[]
) {
    if (Array.isArray(id1)) {
        return !Array.isArray(id2) || !areArraysEqual(id1, id2);
    } else {
        return Array.isArray(id2) || id1 !== id2;
    }
}