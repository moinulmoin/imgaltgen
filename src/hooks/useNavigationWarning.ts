import { useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface UseNavigationWarningProps {
  when: boolean;
  message?: string;
}

export function useNavigationWarning({ 
  when, 
  message = 'Are you sure you want to leave? Your upload progress will be lost.' 
}: UseNavigationWarningProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = useRef(pathname);

  // Update current path when pathname changes
  useEffect(() => {
    currentPath.current = pathname;
  }, [pathname]);

  // Handle browser-level navigation (refresh, close, external links)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!when) return;
      
      // Standard way to trigger the browser's navigation warning
      e.preventDefault();
      // Legacy support for older browsers
      const confirmationMessage = message;
      (e || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
    };

    if (when) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [when, message]);

  // Since Next.js 15 App Router doesn't expose route change events,
  // we provide wrapper methods for programmatic navigation with confirmation
  const confirmNavigation = useCallback((navigateFn: () => void) => {
    if (when) {
      const confirmed = window.confirm(message);
      if (confirmed) {
        navigateFn();
      }
    } else {
      navigateFn();
    }
  }, [when, message]);

  // Wrapper for router.push with confirmation
  const push = useCallback((href: string) => {
    confirmNavigation(() => router.push(href));
  }, [router, confirmNavigation]);

  // Wrapper for router.replace with confirmation  
  const replace = useCallback((href: string) => {
    confirmNavigation(() => router.replace(href));
  }, [router, confirmNavigation]);

  // Wrapper for router.back with confirmation
  const back = useCallback(() => {
    confirmNavigation(() => router.back());
  }, [router, confirmNavigation]);

  // Wrapper for router.forward with confirmation
  const forward = useCallback(() => {
    confirmNavigation(() => router.forward());
  }, [router, confirmNavigation]);

  return { 
    confirmNavigation,
    push,
    replace,
    back,
    forward,
    // Expose current pathname for components that need it
    currentPath: currentPath.current
  };
}