export default function parseTimestamp(timestamp: string) {
    const dateObj = new Date(timestamp);

    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    let hours = dateObj.getUTCHours();
    const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
    // const seconds = String(dateObj.getUTCSeconds()).padStart(2, '0');

    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format and handle midnight (0 becomes 12)

    const hour = String(hours).padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minutes} ${period}`;
}
