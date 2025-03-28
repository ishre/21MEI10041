import Link from 'next/link';
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white p-4">
      <nav className="container mx-auto flex justify-between">
        <div className="font-bold">Social Media Analytics</div>
        <div>
          <Link href="/top-users"><span className="mr-4 cursor-pointer">Top Users</span></Link>
          <Link href="/trending-posts"><span className="mr-4 cursor-pointer">Trending Posts</span></Link>
          <Link href="/feed"><span className="cursor-pointer">Feed</span></Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
