import React from 'react';
import { getRandomUserImage } from '../utils/randomImage';

interface UserCardProps {
  id: string;
  name: string;
  postsCount: number;
}

const UserCard: React.FC<UserCardProps> = ({ id, name, postsCount }) => {
  const image = getRandomUserImage();
  return (
    <div className="border p-4 rounded shadow-md flex items-center">
      <img src={image} alt="User" className="w-16 h-16 rounded-full mr-4" />
      <div>
        <h2 className="font-bold">{name}</h2>
        <p>User ID: {id}</p>
        <p>Posts: {postsCount}</p>
      </div>
    </div>
  );
};

export default UserCard;
