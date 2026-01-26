import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { getImageUrl, getInitials, getRandomColor } from "../../lib/imageUtils";
import { cn } from "./utils";

interface UserAvatarProps {
    firstname?: string;
    lastname?: string;
    imageUrl?: string | null;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function UserAvatar({ firstname, lastname, imageUrl, className, size = "md" }: UserAvatarProps) {
    const initials = getInitials(firstname, lastname);
    const bgColor = getRandomColor(`${firstname || ''}${lastname || ''}`);

    const sizeClasses = {
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-16 text-xl",
    };

    return (
        <Avatar className={cn(sizeClasses[size], className)}>
            {imageUrl && <AvatarImage src={getImageUrl(imageUrl)} alt={`${firstname} ${lastname}`} />}
            <AvatarFallback className={cn("text-white font-medium", bgColor)}>
                {initials}
            </AvatarFallback>
        </Avatar>
    );
}
