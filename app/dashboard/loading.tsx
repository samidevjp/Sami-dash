import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-white">
      <Loader2 className="animate-spin" />
    </div>
  );
}
