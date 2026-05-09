import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cognitoService } from '@/services/cognitoService';
import { useUser } from '@/contexts/UserContext';
import { ROLE_HOME, type Role } from '@/lib/roles';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUserFromSession } = useUser();
  const [error, setError] = useState<string>('');
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        console.error('[AuthCallback] OAuth error:', errorParam, errorDescription);
        setError(errorDescription || errorParam);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!code) {
        console.error('[AuthCallback] No authorization code found');
        setError('Authorization code not found');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        console.log('[AuthCallback] Exchanging authorization code for tokens...');
        const result = await cognitoService.handleOAuthCallback(code);

        if (!result.success || !result.session) {
          console.error('[AuthCallback] Token exchange failed:', result.error);
          setError(result.error || 'Authentication failed');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        console.log('[AuthCallback] Token exchange successful');
        
        const userData = updateUserFromSession(result.session);
        console.log('[AuthCallback] User authenticated:', userData.email, 'Role:', userData.role);

        const redirectPath = ROLE_HOME[userData.role as Role] || ROLE_HOME.patient;
        console.log('[AuthCallback] Navigating to:', redirectPath);
        
        navigate(redirectPath, { replace: true });
      } catch (err) {
        console.error('[AuthCallback] Unexpected error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, updateUserFromSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {error ? (
          <>
            <div className="text-red-500 text-lg font-semibold mb-4">
              Authentication Error
            </div>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Completing Sign In
            </h2>
            <p className="text-gray-600">Please wait while we set up your account...</p>
          </>
        )}
      </div>
    </div>
  );
}
