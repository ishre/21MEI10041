import React from 'react';
import { getRandomPostImage } from '../utils/randomImage';

interface PostCardProps {
  id: number;
  content: string;
  userName: string;
  commentsCount?: number;
}

const PostCard: React.FC<PostCardProps> = ({ id, content, userName, commentsCount }) => {
  const image = getRandomPostImage();
  return (
    <div className="border p-4 rounded shadow-md mb-4">
      <div className="flex items-center mb-2">
        <img src={image} alt="Post" className="w-12 h-12 rounded-full mr-3" />
        <div>
          <h3 className="font-bold">{userName}</h3>
          <p className="text-sm">Post ID: {id}</p>
        </div>
      </div>
      <p>{content}</p>
      {commentsCount !== undefined && <p className="mt-2 text-sm">Comments: {commentsCount}</p>}
    </div>
  );
};

export default PostCard;
