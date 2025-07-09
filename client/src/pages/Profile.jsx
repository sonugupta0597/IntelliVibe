import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Profile = () => {
  const { userInfo } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', profilePic: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
        const { data } = await axios.get('http://localhost:5001/api/auth/profile', config);
        setProfile(data);
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          profilePic: data.profilePic || '',
        });
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (userInfo?.token) fetchProfile();
  }, [userInfo]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // For demo: use a local URL. In production, upload to server/cloud.
    const url = URL.createObjectURL(file);
    setForm({ ...form, profilePic: url });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const { data } = await axios.put('http://localhost:5001/api/auth/profile', form, config);
      setProfile(data.user);
      setEditMode(false);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading profile...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="flex flex-col items-center gap-4 mb-8">
        <Avatar className="h-24 w-24 border-4 border-pink-400 shadow-lg">
          <AvatarImage src={form.profilePic || '/ai-avatar.png'} alt="Profile" />
          <AvatarFallback>{profile.firstName?.[0]}{profile.lastName?.[0]}</AvatarFallback>
        </Avatar>
        {editMode && (
          <Input type="file" accept="image/*" onChange={handlePicChange} className="w-48" />
        )}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-1">{profile.firstName} {profile.lastName}</h2>
          <p className="text-pink-200">{profile.role?.toUpperCase()}</p>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex flex-col gap-2">
          <label className="text-pink-100">First Name</label>
          <Input name="firstName" value={form.firstName} onChange={handleChange} disabled={!editMode} className="bg-white/20 text-white" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-pink-100">Last Name</label>
          <Input name="lastName" value={form.lastName} onChange={handleChange} disabled={!editMode} className="bg-white/20 text-white" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-pink-100">Email</label>
          <Input name="email" value={form.email} onChange={handleChange} disabled={!editMode} className="bg-white/20 text-white" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-pink-100">Profile Picture URL</label>
          <Input name="profilePic" value={form.profilePic} onChange={handleChange} disabled={!editMode} className="bg-white/20 text-white" />
        </div>
        <div className="flex gap-4 mt-4">
          {editMode ? (
            <>
              <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold">
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="secondary" onClick={() => { setEditMode(false); setForm(profile); }}>
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditMode(true)} className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold">
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 