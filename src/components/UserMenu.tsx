"use client";

import { UserButton, useUser } from "@clerk/nextjs";

export default function UserMenu() {
  const { user } = useUser();
  if (!user) return null;

  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link 
          label="Dashboard" 
          href="/dashboard" 
          labelIcon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          } 
        />
        <UserButton.Link 
          label="My Profile" 
          href="/dashboard/profile" 
          labelIcon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          } 
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
