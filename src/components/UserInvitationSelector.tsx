'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

interface UserInvitationSelectorProps {
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  onMessageChange: (message: string) => void;
  invitationMessage: string;
}

export default function UserInvitationSelector({
  selectedUserIds,
  onSelectionChange,
  onMessageChange,
  invitationMessage
}: UserInvitationSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteSection, setShowInviteSection] = useState(false);

  // Fetch approved users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/users/approved');
        
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await response.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const name = user.name?.toLowerCase() || '';
    const email = user.email.toLowerCase();
    return name.includes(searchLower) || email.includes(searchLower);
  });

  const handleUserToggle = (userId: string) => {
    const newSelection = selectedUserIds.includes(userId)
      ? selectedUserIds.filter(id => id !== userId)
      : [...selectedUserIds, userId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      // Deselect all filtered users
      const filteredUserIds = filteredUsers.map(user => user.id);
      onSelectionChange(selectedUserIds.filter(id => !filteredUserIds.includes(id)));
    } else {
      // Select all filtered users
      const filteredUserIds = filteredUsers.map(user => user.id);
      const newSelection = [...new Set([...selectedUserIds, ...filteredUserIds])];
      onSelectionChange(newSelection);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700">
            Invite Users
          </label>
          <button
            type="button"
            onClick={() => setShowInviteSection(!showInviteSection)}
            className="flex items-center space-x-1 text-sm text-[#60A5FA] hover:text-[#4B8E8] transition-colors"
          >
            <span>{showInviteSection ? 'Hide' : 'Show'}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showInviteSection ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {showInviteSection && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700">
            Invite Users
          </label>
          <button
            type="button"
            onClick={() => setShowInviteSection(!showInviteSection)}
            className="flex items-center space-x-1 text-sm text-[#60A5FA] hover:text-[#4B8E8] transition-colors"
          >
            <span>{showInviteSection ? 'Hide' : 'Show'}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showInviteSection ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        {showInviteSection && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowInviteSection(!showInviteSection)}
          className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-all duration-200 group"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] rounded-full group-hover:shadow-md transition-shadow duration-200">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-lg font-semibold text-gray-800 group-hover:text-[#60A5FA] transition-colors duration-200">
              Invite Users
            </div>
            <p className="text-sm text-gray-500">
              Select members to invite to your event
            </p>
          </div>
        </button>
        <div className="flex items-center space-x-2">
          {selectedUserIds.length > 0 && (
            <div className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              {selectedUserIds.length} selected
            </div>
          )}
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showInviteSection ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {showInviteSection && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Select Users to Invite</h3>
                <p className="text-blue-100 text-sm mt-1">
                  Choose from approved members in your community
                </p>
              </div>
              {filteredUsers.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  {selectedUserIds.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* User List */}
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">
                    {searchTerm ? 'No users found matching your search.' : 'No users available to invite.'}
                  </p>
                  {!searchTerm && (
                    <p className="text-gray-400 text-sm mt-1">
                      Make sure users are approved in the system
                    </p>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center p-4 hover:bg-white cursor-pointer transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                          className="w-5 h-5 text-[#60A5FA] focus:ring-[#60A5FA] focus:ring-2 rounded border-gray-300"
                        />
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-white text-sm font-semibold">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user.name || 'No name'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user.email}
                          </p>
                        </div>
                        {selectedUserIds.includes(user.id) && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Selection Summary */}
            {selectedUserIds.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-green-800 font-semibold">
                      {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
                    </p>
                    <p className="text-green-600 text-sm">
                      They'll receive email invitations when you create the event
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Message */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <label htmlFor="invitationMessage" className="text-sm font-semibold text-gray-700">
                  Personal Message (Optional)
                </label>
              </div>
              <textarea
                id="invitationMessage"
                name="invitationMessage"
                rows={3}
                value={invitationMessage}
                onChange={(e) => onMessageChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-200 shadow-sm resize-none"
                placeholder="Add a personal message to make your invitation more welcoming..."
              />
              <p className="text-xs text-gray-500 flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>This message will be included in the invitation email to make it more personal.</span>
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">How invitations work:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Selected users receive beautiful email invitations with event details</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>They can click the link to view the event and RSVP directly</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Only approved community members can be invited</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>You can invite more users later by editing the event</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
