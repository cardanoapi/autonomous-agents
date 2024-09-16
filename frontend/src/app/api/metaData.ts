import { baseAPIurl } from './config';

export async function fetchMetadataHash(url: string) {
    const res = await fetch(`${baseAPIurl}/metadata?metadata_url=${url}`);
    if (res.ok) {
        return await res.json();
    } else {
        throw new Error('Not a valid url');
    }
}
