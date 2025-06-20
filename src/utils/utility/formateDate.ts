export const formatDate = (date: unknown): string => {
    if (date === null || date === undefined) return '-';

    let parsedDate: Date | null = null;
    if (typeof date === 'string') {
        parsedDate = new Date(date);
    } else if (date instanceof Date) {
        parsedDate = date;
    }

    if (!parsedDate || isNaN(parsedDate.getTime())) return '-';

    return parsedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
};
