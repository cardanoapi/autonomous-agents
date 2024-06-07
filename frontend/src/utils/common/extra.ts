export function Truncate(word: string, limit: number): string {
    return word.length > limit ? word.substring(0, limit) + '...' : word;
}
