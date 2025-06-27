
import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, Flag, X } from 'lucide-react';

interface PostCardMenuProps {
  onClose: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  canDelete: boolean;
  isDeletingPost: boolean;
  darkMode: boolean;
}

const PostCardMenu: React.FC<PostCardMenuProps> = ({
  onClose,
  onDelete,
  onReport,
  canDelete,
  isDeletingPost,
  darkMode
}) => {
  return (
    <motion.div
      className={`absolute top-0 right-0 mt-8 ${darkMode ? 'bg-dark-200' : 'bg-white'} rounded-md shadow-md z-10 w-48 border ${darkMode ? 'border-dark-100' : 'border-gray-200'}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="py-1">
        {canDelete && (
          <button
            className={`flex items-center w-full px-4 py-2 text-left ${
              isDeletingPost ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:bg-red-500/10 hover:text-red-500'
            } transition-colors`}
            onClick={onDelete}
            disabled={isDeletingPost}
          >
            <Trash2 size={16} className="mr-2" />
            <span>
              {isDeletingPost ? 'Wird gelöscht...' : 'Löschen'}
            </span>
          </button>
        )}
        <button
          className="flex items-center w-full px-4 py-2 text-left hover:bg-orange-500/10 hover:text-orange-500 transition-colors"
          onClick={onReport}
        >
          <Flag size={16} className="mr-2" />
          <span>Melden</span>
        </button>
        <button
          className={`flex items-center w-full px-4 py-2 text-left ${darkMode ? 'hover:bg-dark-100' : 'hover:bg-gray-100'} transition-colors`}
          onClick={onClose}
        >
          <X size={16} className="mr-2" />
          <span>Schließen</span>
        </button>
      </div>
    </motion.div>
  );
};

export default PostCardMenu;
