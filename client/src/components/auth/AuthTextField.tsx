import { useState, InputHTMLAttributes, forwardRef } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface AuthTextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  error?: string;
}

const AuthTextField = forwardRef<HTMLInputElement, AuthTextFieldProps>(
  ({ icon: Icon, error, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="space-y-1">
        <div
          className={`flex items-center gap-3 rounded-xl border bg-gray-50/80 px-4 py-3 text-sm transition-all duration-200 focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/10 ${
            error ? 'border-red-300 bg-red-50/50' : 'border-gray-200'
          }`}
        >
          <Icon size={18} className={`shrink-0 transition-colors duration-200 ${error ? 'text-red-400' : 'text-gray-400'}`} />
          <input
            ref={ref}
            type={inputType}
            className="flex-1 bg-transparent outline-none placeholder:text-gray-400 text-gray-900"
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>
        {error && <p className="px-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  },
);
AuthTextField.displayName = 'AuthTextField';

export default AuthTextField;
