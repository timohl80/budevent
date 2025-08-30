/**
 * Utility functions for admin-related functionality
 */

export interface AdminUser {
  email?: string | null;
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: AdminUser): boolean {
  const adminEmails = ['timohl@hotmail.com'];
  return user.email ? adminEmails.includes(user.email) : false;
}

/**
 * Admin access denied component props
 */
export interface AdminAccessDeniedProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

/**
 * Default admin access denied component
 */
export function AdminAccessDenied({ 
  title = "Access Denied", 
  message = "This page is only available to administrators.",
  showBackButton = true 
}: AdminAccessDeniedProps) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#111827] to-[#1F2937] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
        <p className="text-gray-300 mb-4">{message}</p>
        {showBackButton && (
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </a>
        )}
      </div>
    </main>
  );
}
