"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useAdminInvitations } from "@/hooks/admin/useAdminInvitations";

export function InvitationManagement() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "super_admin">("admin");

  const { invitations, loading, error, createInvitation, revokeInvitation } =
    useAdminInvitations();

  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const result = await createInvitation(email, role);
    if (result.success) {
      setEmail("");
      alert("Invitation sent successfully");
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    const result = await revokeInvitation(invitationId);
    if (result.success) {
      alert("Invitation revoked successfully");
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const canCreateSuperAdmin = session?.user?.role === "super_admin";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Invitation Management
        </h1>

        {/* Create Invitation Form */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 rounded-xl shadow-sm dark:shadow-gray-900/10 mb-8 transition-colors duration-200">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Send New Invitation
          </h2>

          <form
            onSubmit={handleCreateInvitation}
            className="flex flex-col lg:flex-row gap-4"
          >
            <div className="flex-1">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                required
              />
            </div>

            <div className="lg:w-48">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "admin" | "super_admin")
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
              >
                <option value="admin">Admin</option>
                {canCreateSuperAdmin && (
                  <option value="super_admin">Super Admin</option>
                )}
              </select>
            </div>

            <div className="lg:w-auto lg:self-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full lg:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </div>
                ) : (
                  "Send Invitation"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Pending Invitations */}
        <div className="dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm dark:shadow-gray-900/10 overflow-hidden transition-colors duration-200">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-amber-500 dark:text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Pending Invitations</span>
              {invitations.length > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs font-semibold rounded-full">
                  {invitations.length}
                </span>
              )}
            </h2>
          </div>

          {loading && (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-6 w-6 text-blue-500 dark:text-blue-400 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-gray-600 dark:text-gray-400">
                  Loading invitations...
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-400 dark:text-red-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-red-700 dark:text-red-400 font-medium">
                  Error: {error}
                </span>
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {invitations.map((invitation, index) => (
              <div
                key={invitation._id}
                className={`px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150 ${
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : "bg-gray-50/50 dark:bg-gray-800/50"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                        <svg
                          className="w-4 h-4 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {invitation.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-3 ${
                              invitation.role === "super_admin"
                                ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                                : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                            }`}
                          >
                            {invitation.role === "super_admin"
                              ? "Super Admin"
                              : "Admin"}
                          </span>
                          <span>Invited by: {invitation.invitedBy}</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1 text-amber-500 dark:text-amber-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Expires in: {invitation.hoursRemaining} hours
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:justify-end">
                    <button
                      onClick={() => handleRevokeInvitation(invitation._id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!loading && invitations.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No pending invitations
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  All invitations have been accepted or expired. Send a new
                  invitation to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
