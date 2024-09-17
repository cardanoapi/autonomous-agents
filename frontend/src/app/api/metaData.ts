import { baseAPIurl } from './config';

export async function fetchMetadataHash(url: string) {
    const encodedUri = encodeURIComponent(url);
    const res = await fetch(`${baseAPIurl}/metadata?metadata_url=${encodedUri}`);
    if (res.ok) {
        return await res.json();
    } else {
        throw new Error(await res.json());
    }
}
