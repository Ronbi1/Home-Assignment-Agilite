import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message = 'Something went wrong. Please try again.' }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
      <AlertCircle size={18} className="flex-shrink-0" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
