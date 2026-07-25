import { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="w-full max-w-[380px] mx-auto bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 p-6 md:p-8">
      {children}
    </div>
  );
}
