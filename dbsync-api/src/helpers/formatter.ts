import {encodeDrep} from "./validator";

export function formatResult(result: Array<Record<string, any>>) {
    return result.map((item) => {
        const {has_script, drepId} = item.result
        return {...item.result, view: encodeDrep(drepId, has_script)}
    })
}

export function combineArraysWithSameObjectKey(array1: any, array2: any) {
    // Create a map for array2 based on the stake_address
    const map2 = new Map();
    array2.forEach((item: any) => {
        const {stakeAddress, ...rest} = item.json_build_object;
        map2.set(stakeAddress, rest);  // Use stake_address as the key
    });

    // Combine the data from array1 and array2 based on stake_address
    return array1.map((item1: any) => {
        const {stakeAddress, ...rest1} = item1.json_build_object;
        const matchedData = map2.get(stakeAddress);

        if (matchedData) {
            // Combine both objects if match is found
            return {
                json_build_object: {
                    ...rest1,
                    ...matchedData,
                    stakeAddress
                }
            };
        } else {
            // Return the original object if no match is found in array2
            return item1;
        }
    });
}
