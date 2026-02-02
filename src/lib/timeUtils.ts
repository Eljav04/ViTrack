
export const formatMinutesToHHMM = (minutes: number | null | undefined): string => {
    if (minutes === null || minutes === undefined) return '-';

    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = mins.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
};

export const formatMinutesToHoursMinutesLong = (minutes: number | null | undefined): string => {
    if (minutes === null || minutes === undefined) return '-';

    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;

    return `${hours} saat ${mins} dəq`;
};

export const formatMinutesToHoursMinutesShort = (minutes: number | null | undefined): string => {
    if (minutes === null || minutes === undefined) return '-';

    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;

    return `${hours}s ${mins}d`;
};

export const formatTimeHHMMString = (timeStr: string | null | undefined): string => {
    if (!timeStr) return '-';
    // Assume input is HH:MM:SS or HH:MM
    return timeStr.substring(0, 5);
};
