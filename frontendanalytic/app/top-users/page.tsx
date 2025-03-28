// app/top-users/page.tsx
import React from 'react';
import UserCard from '../../components/UserCard';

interface User {
  id: string;
  name: string;
  postsCount: number;
}

async function getTopUsers(): Promise<User[]> {
  const res = await fetch('http://localhost:3005/users', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch top users');
  return res.json();
}

export default async function TopUsersPage() {
  const users: User[] = await getTopUsers();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Top Users</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map(user => (
          <UserCard key={user.id} id={user.id} name={user.name} postsCount={user.postsCount} />
        ))}
      </div>
    </div>
  );
}
