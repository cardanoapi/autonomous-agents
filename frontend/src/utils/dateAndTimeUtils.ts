import { format } from 'date-fns';

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

export const formatDisplayDate = (date: string | Date, outputFormat = 'do MMM yyyy') =>
    format(new Date(date), outputFormat).toString();

export function convertCRONExpressionToReadableForm(cronExpression: string) {
    if (!cronExpression) {
        return '';
    }
    const response = determineCronTabAndSection(cronExpression);
    if (response) {
        const { tab, values } = response;
        const timeUnit = tab.split('-')[0];
        if (tab.includes('-option-one')) {
            return `Every 1 ${timeUnit}`;
        } else if (tab.includes('-option-two')) {
            return `Every ${values[0].value} ${timeUnit}`;
        } else {
            return `Between every ${values[0].value} ${timeUnit} and ${values[1].value} ${timeUnit} `;
        }
    } else {
        return '';
    }
}

export function determineCronTabAndSection(cronExpression: string) {
    const parts = cronExpression.split(' ');

    const [minute, hour, day, month, year] = parts;

    const determineSection = (field: string, tab: string) => {
        if (field === '*') {
            return {
                tab: `${tab}-option-one`,
                values: [{ name: `${tab}-option-one`, value: 1 }]
            };
        } else if (field.includes('/')) {
            return {
                tab: `${tab}-option-two`,
                values: [{ name: `${tab}-option-two`, value: field.split('/')[1] }]
            };
        } else if (field.includes('-')) {
            const values = field.split('-').map((item, index) => ({
                name: `${tab}-option-three-${index === 0 ? 'start' : 'end'}`,
                value: item
            }));
            return { tab: `${tab}-option-three`, values };
        }
    };

    const checkIfDoesNotBelongsToSection = (field: string) => {
        return !(field.includes('*') || field.includes('-'));
    };

    if (
        checkIfDoesNotBelongsToSection(minute) &&
        checkIfDoesNotBelongsToSection(hour) &&
        checkIfDoesNotBelongsToSection(day) &&
        checkIfDoesNotBelongsToSection(month)
    ) {
        return determineSection(year, 'Year');
    } else if (
        checkIfDoesNotBelongsToSection(minute) &&
        checkIfDoesNotBelongsToSection(hour)
    ) {
        return determineSection(day, 'Day');
    } else if (checkIfDoesNotBelongsToSection(minute)) {
        return determineSection(hour, 'Hour');
    } else {
        return determineSection(minute, 'Minute');
    }
}
