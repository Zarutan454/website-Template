
import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PostReportDialog from '../PostReportDialog';

interface PostMenuProps {
  isCurrentUserAuthor: boolean;
  postId: string;
  onDelete: (postId: string) => Promise<boolean>;
}

const PostMenu: React.FC<PostMenuProps> = ({
  isCurrentUserAuthor,
  postId,
  onDelete
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {isCurrentUserAuthor && (
          <>
            <DropdownMenuItem
              onClick={() => onDelete(postId)}
              className="text-red-500 focus:text-red-500"
            >
              Delete post
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {!isCurrentUserAuthor && (
          <DropdownMenuItem asChild>
            <PostReportDialog 
              postId={postId} 
              buttonLabel="Report post" 
              showIcon={true}
              variant="ghost"
              className="w-full justify-start px-2"
            />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PostMenu;
