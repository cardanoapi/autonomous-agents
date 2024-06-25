export const convertLovelaceToAda = (lovelace?: number) => {
    if (lovelace) {
        return Number((lovelace / 10e6).toFixed(3));
    }

    return '0';
};
