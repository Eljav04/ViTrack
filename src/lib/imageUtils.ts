let BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5286';


export function getImageUrl(path: string | null | undefined): string {
    if (!path) return '';

    // If it's already a full URL or data URL, return as is
    if (path.startsWith('http') || path.startsWith('data:')) {
        return path;
    }

    // Clean the path (remove leading slash if exists)
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    BASE_URL = BASE_URL.startsWith('/') ? BASE_URL.substring(1) : BASE_URL;

    return `${BASE_URL}/${cleanPath}`;
}

export function getInitials(firstname?: string, lastname?: string): string {
    const f = firstname?.charAt(0) || '';
    const l = lastname?.charAt(0) || '';
    return (f + l).toUpperCase() || '?';
}

export function getRandomColor(name: string): string {
    const colors = [
        'bg-red-500',
        'bg-blue-500',
        'bg-green-500',
        'bg-yellow-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-indigo-500',
        'bg-teal-500',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % colors.length;
    return colors[index];
}
