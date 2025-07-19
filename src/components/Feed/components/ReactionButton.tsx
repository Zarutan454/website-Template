import * as React from 'react';
import { Heart } from 'lucide-react';

const REACTIONS = [
  { key: 'like', icon: '👍', label: 'Like' },
  { key: 'love', icon: '❤️', label: 'Love' },
  { key: 'haha', icon: '😂', label: 'Haha' },
  { key: 'wow', icon: '😮', label: 'Wow' },
  { key: 'sad', icon: '😢', label: 'Sad' },
  { key: 'angry', icon: '😡', label: 'Angry' },
];

interface ReactionButtonProps {
  isActive?: boolean;
  count?: number;
  onLike: () => void;
  onReactionSelect?: (reaction: string) => void;
  disabled?: boolean;
}

const ReactionButton: React.FC<ReactionButtonProps> = ({ isActive, count, onLike, onReactionSelect, disabled }) => {
  const [showReactions, setShowReactions] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Keyboard-Handling für Accessibility
  React.useEffect(() => {
    if (!showReactions) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowReactions(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showReactions]);

  const handleLike = () => {
    if (onLike) onLike();
  };

  const handleReaction = (reaction: string) => {
    if (onReactionSelect) onReactionSelect(reaction);
    setShowReactions(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 ${isActive ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-dark-200'}`}
        aria-label="Gefällt mir"
        onClick={handleLike}
        onMouseEnter={() => setShowReactions(true)}
        onMouseLeave={() => setTimeout(() => setShowReactions(false), 200)}
        disabled={disabled}
      >
        <Heart className={`h-5 w-5 ${isActive ? 'fill-current text-blue-600' : 'text-gray-400'}`} />
        {count !== undefined && <span className="ml-1 text-xs font-medium">{count}</span>}
      </button>
      {/* Reactions-Popover */}
      {showReactions && onReactionSelect && (
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 flex gap-2 bg-white dark:bg-dark-100 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg px-3 py-2 z-40 animate-fade-in"
          role="menu"
          aria-label="Reaktionen auswählen"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {REACTIONS.map(r => (
            <li
              key={r.key}
              className="list-none"
              role="menuitem"
            >
              <button
                type="button"
                className="text-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 hover:scale-125 transition-transform"
                aria-label={r.label}
                onClick={() => handleReaction(r.key)}
              >
                {r.icon}
              </button>
            </li>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReactionButton; 