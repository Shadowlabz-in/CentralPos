import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-[calc(100vh-6rem)]">
      <div className="text-center space-y-4">
        <ShieldAlert size={64} className="mx-auto text-red-400" />
        <h1 className="text-3xl font-bold">403 Forbidden</h1>
        <p className="text-gray-500 max-w-sm">
          You do not have permission to access this page. Contact your administrator if you need
          access.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
        </div>
      </div>
    </div>
  );
}
