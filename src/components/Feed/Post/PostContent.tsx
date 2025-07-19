import * as React from 'react';
import { Link } from 'react-router-dom';

interface PostContentProps {
  content: string;
}

// Hilfsfunktion: Hashtags in Links umwandeln
function parseHashtagsToLinks(text: string): React.ReactNode[] {
  const regex = /(#\w+)/g;
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (regex.test(part)) {
      const tag = part.replace('#', '');
      return (
        <Link
          key={i}
          to={`/hashtag/${encodeURIComponent(tag)}`}
          className="text-blue-500 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-400 px-1"
          aria-label={`Hashtag ${tag}`}
        >
          {part}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

const PostContent: React.FC<PostContentProps> = ({ content }) => {
  return (
    <div className="whitespace-pre-line text-base break-words">
      {parseHashtagsToLinks(content)}
    </div>
  );
};

export default PostContent;
