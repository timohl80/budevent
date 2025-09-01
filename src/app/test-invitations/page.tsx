'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface Invitation {
  id: string;
  event_id: string;
  status: string;
  invited_at: string;
  responded_at: string | null;
  message: string | null;
  events: {
    id: string;
    title: string;
    description: string | null;
    starts_at: string;
    location: string | null;
    image_url: string | null;
    capacity: number | null;
    is_public: boolean;
    status: string;
  };
  invited_by_user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function TestInvitationsPage() {
  const { data: session, status } = useSession();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchInvitations();
    }
  }, [status]);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events/invitations');
      
      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }
      
      const data = await response.json();
      setInvitations(data.invitations || []);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError('Failed to load invitations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const respondToInvitation = async (invitationId: string, response: 'accepted' | 'declined') => {
    try {
      const res = await fetch(`/api/events/invitations/${invitationId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: response }),
      });

      if (res.ok) {
        // Refresh invitations
        await fetchInvitations();
        alert(`Invitation ${response} successfully!`);
      } else {
        const errorData = await res.json();
        alert(`Failed to respond to invitation: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error responding to invitation:', err);
      alert('Failed to respond to invitation. Please try again.');
    }
  };

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60A5FA] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please sign in to view invitations.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Event Invitations
          </h1>
          <p className="text-lg text-gray-600">
            View and respond to your event invitations
          </p>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchInvitations}
                className="px-6 py-2 bg-[#60A5FA] text-white rounded-lg hover:bg-[#4B89E8] transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : invitations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5v-5a7.5 7.5 0 1 0-15 0v5h5l-5 5-5-5h5V7a7.5 7.5 0 1 1 15 0v10z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No Invitations</h2>
              <p className="text-gray-600">You don't have any event invitations yet.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {invitation.events.title}
                      </h3>
                      <p className="text-gray-600">
                        Invited by <strong>{invitation.invited_by_user.name || invitation.invited_by_user.email}</strong>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        invitation.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : invitation.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {invitation.message && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        <strong>Personal message:</strong> {invitation.message}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">
                        {new Date(invitation.events.starts_at).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {invitation.events.location && (
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{invitation.events.location}</p>
                      </div>
                    )}
                  </div>

                  {invitation.events.description && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="text-gray-700">{invitation.events.description}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Invited on {new Date(invitation.invited_at).toLocaleDateString()}
                      {invitation.responded_at && (
                        <span> • Responded on {new Date(invitation.responded_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    {invitation.status === 'pending' && (
                      <div className="flex space-x-3">
                        <button
                          onClick={() => respondToInvitation(invitation.id, 'declined')}
                          className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => respondToInvitation(invitation.id, 'accepted')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
