export function Truncate(word: any, limit: number): string {
    if (typeof word !== 'string') {
        return '';
    }
    return word.length > limit ? word.substring(0, limit) + '...' : word;
}

export function convertToQueryStr(page: number, size: number, search: string) {
    return new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        search: search
    }).toString();
}

export function capitalizeFirstLetter(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
