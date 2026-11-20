import { useState } from 'react';
import { User } from 'lucide-react';

const PROFILE_IMAGE_URL =
  'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100';

interface AvatarBadgeProps {
  alt?: string;
}

export function AvatarBadge({ alt = 'MIMO Profile' }: AvatarBadgeProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white shrink-0 border border-white/30"
        aria-label={alt}
      >
        <User size={18} />
      </div>
    );
  }

  return (
    <img
      src={PROFILE_IMAGE_URL}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className="w-10 h-10 rounded-full object-cover shrink-0 border border-white/30"
    />
  );
}
