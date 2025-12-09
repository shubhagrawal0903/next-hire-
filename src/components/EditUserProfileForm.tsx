"use client";

import { useState, useEffect } from 'react';
import { useUser } from "@clerk/nextjs";

interface ProfileFormData {
  bio: string;
  location: string;
  headline: string;
  skills: string;
  experience: any[];
  education: any[];
  socialLinks: any;
}

export default function EditUserProfileForm() {
  const { user, isLoaded } = useUser();

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    bio: '',
    location: '',
    headline: '',
    skills: '',
    experience: [],
    education: [],
    socialLinks: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch existing profile data when user is loaded
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isLoaded || !user) return;

      try {
        setIsFetching(true);
        const response = await fetch('/api/user/profile');

        if (response.ok) {
          const data = await response.json();

          // Populate form with fetched data
          setFormData({
            bio: data.bio || '',
            location: data.location || '',
            headline: data.headline || '',
            skills: Array.isArray(data.skills) ? data.skills.join(', ') : '',
            experience: data.experience || [],
            education: data.education || [],
            socialLinks: data.socialLinks || null,
          });
        } else if (response.status === 404) {
          // Profile not found - leave form blank (already initialized with empty values)
          console.log('Profile not found. User can create a new profile.');
        } else {
          console.error('Error fetching profile:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [isLoaded, user]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      // Convert skills string to array
      const skillsArray = formData.skills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Prepare update payload
      const updatePayload = {
        bio: formData.bio || undefined,
        location: formData.location || undefined,
        headline: formData.headline || undefined,
        skills: skillsArray,
        experience: formData.experience,
        education: formData.education,
        socialLinks: formData.socialLinks,
      };

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: data.message || 'Profile updated successfully!',
        });
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to update profile. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Reset form to initial state or redirect
    window.location.reload();
  };

  if (!isLoaded || isFetching) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-r-4 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-10 text-text-muted">
        Please sign in to edit your profile.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-card rounded-xl shadow-lg border border-border">
      <h2 className="text-3xl font-bold text-text-primary mb-6">Edit Your Profile</h2>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Headline */}
        <div>
          <label htmlFor="headline" className="block text-sm font-semibold text-text-primary mb-2">
            Professional Headline
          </label>
          <input
            type="text"
            id="headline"
            name="headline"
            value={formData.headline}
            onChange={handleChange}
            placeholder="e.g., Senior Frontend Developer at XYZ Corp"
            className="w-full px-4 py-3 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-text-primary mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., San Francisco, CA"
            className="w-full px-4 py-3 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        {/* Skills */}
        <div>
          <label htmlFor="skills" className="block text-sm font-semibold text-text-primary mb-2">
            Skills
          </label>
          <input
            type="text"
            id="skills"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            placeholder="e.g., React, Node.js, TypeScript, Python"
            className="w-full px-4 py-3 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <p className="mt-1 text-xs text-text-muted">Separate skills with commas</p>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-semibold text-text-primary mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={5}
            placeholder="Tell us about yourself, your experience, and what you're looking for..."
            className="w-full px-4 py-3 bg-input text-foreground rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-vertical"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-foreground"></div>
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-6 py-3 bg-card text-text-primary font-semibold rounded-lg border border-border shadow-md hover:bg-sidebar disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
