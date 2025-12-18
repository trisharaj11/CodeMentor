import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { User, Mail, Calendar, Shield } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <Navbar />
      <div className="max-w-[1600px] mx-auto p-6">
        <div className="mb-8" data-testid="profile-header">
          <h1 className="text-4xl font-mono font-bold mb-2">Profile</h1>
          <p className="text-zinc-400">Manage your account information</p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
          <div className="flex items-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-emerald-500 rounded-full flex items-center justify-center" data-testid="profile-avatar">
              <span className="text-3xl font-mono font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-6">
              <h2 className="text-3xl font-mono font-bold mb-1" data-testid="profile-name">{user.name}</h2>
              <p className="text-zinc-400" data-testid="profile-role">{user.role}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center" data-testid="profile-email-section">
              <Mail className="w-5 h-5 text-violet-500 mr-4" />
              <div>
                <p className="text-zinc-400 text-sm">Email</p>
                <p className="text-zinc-100 font-medium" data-testid="profile-email">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center" data-testid="profile-joined-section">
              <Calendar className="w-5 h-5 text-emerald-500 mr-4" />
              <div>
                <p className="text-zinc-400 text-sm">Member Since</p>
                <p className="text-zinc-100 font-medium" data-testid="profile-joined-date">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center" data-testid="profile-id-section">
              <Shield className="w-5 h-5 text-amber-500 mr-4" />
              <div>
                <p className="text-zinc-400 text-sm">User ID</p>
                <p className="text-zinc-100 font-mono text-sm" data-testid="profile-id">{user.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
