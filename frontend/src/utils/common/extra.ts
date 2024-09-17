export function Truncate(word: string, limit: number): string {
    return word.length > limit ? word.substring(0, limit) + '...' : word;
}

export function convertToQueryStr(page: number, size: number, search: string) {
    return new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        search: search
    }).toString();
}
