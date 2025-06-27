
import React from 'react';
import { MoreHorizontal, Trash2, Flag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface PostDropdownMenuProps {
  onDelete: () => Promise<boolean>;
  postId: string;
  onReport?: (reason: string) => Promise<boolean>;
}

const PostDropdownMenu: React.FC<PostDropdownMenuProps> = ({
  onDelete,
  postId,
  onReport
}) => {
  const handleDelete = async () => {
    try {
      await onDelete();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleReport = async (reason: string) => {
    if (!onReport) return;
    
    try {
      await onReport(reason);
    } catch (error) {
      console.error('Error reporting post:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Beitrag löschen</span>
        </DropdownMenuItem>
        
        {onReport && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleReport("Unangemessener Inhalt")}>
              <Flag className="mr-2 h-4 w-4" />
              <span>Beitrag melden</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostDropdownMenu;
