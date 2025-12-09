'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    User, MapPin, Briefcase, GraduationCap,
    Linkedin, Github, Globe, Plus, Trash2,
    Upload, FileText, Loader2, Save
} from 'lucide-react';
import { updateUserProfile, uploadProfileResume } from '@/lib/actions/profile.actions';
import { toast } from 'sonner';

interface ProfileFormProps {
    initialData: any;
    resumeUrl: string | null;
}

export default function ProfileForm({ initialData, resumeUrl: initialResumeUrl }: ProfileFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [resumeUrl, setResumeUrl] = useState(initialResumeUrl);

    const [formData, setFormData] = useState({
        headline: initialData?.headline || '',
        location: initialData?.location || '',
        bio: initialData?.bio || '',
        skills: initialData?.skills?.join(', ') || '',
        socialLinks: initialData?.socialLinks || { linkedin: '', github: '', portfolio: '' },
        experience: initialData?.experience || [],
        education: initialData?.education || [],
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            socialLinks: { ...prev.socialLinks, [name]: value }
        }));
    };

    const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const result = await uploadProfileResume(formData);
            setResumeUrl(result.resumeUrl);
            toast.success('Resume uploaded successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload resume');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Parse skills string to array
            const skillsArray = formData.skills.split(',').map((s: string) => s.trim()).filter(Boolean);

            await updateUserProfile({
                ...formData,
                skills: skillsArray,
                resumeUrl // Pass it just in case, though handled separately
            });

            toast.success('Profile updated successfully');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    // Dynamic List Helpers
    const addExperience = () => {
        setFormData(prev => ({
            ...prev,
            experience: [...prev.experience, { title: '', company: '', date: '' }]
        }));
    };

    const removeExperience = (index: number) => {
        setFormData(prev => ({
            ...prev,
            experience: prev.experience.filter((_: any, i: number) => i !== index)
        }));
    };

    const updateExperience = (index: number, field: string, value: string) => {
        const newExp = [...formData.experience];
        newExp[index] = { ...newExp[index], [field]: value };
        setFormData(prev => ({ ...prev, experience: newExp }));
    };

    const addEducation = () => {
        setFormData(prev => ({
            ...prev,
            education: [...prev.education, { degree: '', college: '', date: '' }]
        }));
    };

    const removeEducation = (index: number) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.filter((_: any, i: number) => i !== index)
        }));
    };

    const updateEducation = (index: number, field: string, value: string) => {
        const newEdu = [...formData.education];
        newEdu[index] = { ...newEdu[index], [field]: value };
        setFormData(prev => ({ ...prev, education: newEdu }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">

            {/* Resume Section */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-blue-500" />
                    Resume
                </h3>
                <div className="flex items-center justify-between bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50">
                    <div className="flex items-center space-x-4">
                        {resumeUrl ? (
                            <a
                                href={resumeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 hover:underline flex items-center"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                View Current Resume
                            </a>
                        ) : (
                            <span className="text-zinc-500">No resume uploaded</span>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleResumeUpload}
                            className="hidden"
                            id="resume-upload"
                            disabled={uploading}
                        />
                        <label
                            htmlFor="resume-upload"
                            className={`flex items-center px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg cursor-pointer transition-colors border border-zinc-700 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {uploading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Upload className="h-4 w-4 mr-2" />
                            )}
                            {resumeUrl ? 'Replace Resume' : 'Upload Resume'}
                        </label>
                    </div>
                </div>
                <p className="text-xs text-zinc-500 mt-2 ml-1">Accepted format: PDF (Max 5MB)</p>
            </div>

            {/* Basic Info */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                    <User className="mr-2 h-5 w-5 text-purple-500" />
                    Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Headline</label>
                        <input
                            type="text"
                            name="headline"
                            value={formData.headline}
                            onChange={handleInputChange}
                            placeholder="e.g. Senior Frontend Developer"
                            className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="e.g. New York, USA"
                                className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Bio</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Tell us about yourself..."
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    />
                </div>
            </div>

            {/* Skills */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5 text-yellow-500" />
                    Skills
                </h3>
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Skills (Comma separated)</label>
                    <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleInputChange}
                        placeholder="React, Next.js, TypeScript, Tailwind CSS"
                        className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
            </div>

            {/* Social Links */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                    <Globe className="mr-2 h-5 w-5 text-green-500" />
                    Social Links
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <input
                            type="text"
                            name="linkedin"
                            value={formData.socialLinks?.linkedin || ''}
                            onChange={handleSocialChange}
                            placeholder="LinkedIn URL"
                            className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="relative">
                        <Github className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <input
                            type="text"
                            name="github"
                            value={formData.socialLinks?.github || ''}
                            onChange={handleSocialChange}
                            placeholder="GitHub URL"
                            className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="relative">
                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <input
                            type="text"
                            name="portfolio"
                            value={formData.socialLinks?.portfolio || ''}
                            onChange={handleSocialChange}
                            placeholder="Portfolio URL"
                            className="w-full bg-zinc-800 border-zinc-700 text-white rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Experience */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white flex items-center">
                        <Briefcase className="mr-2 h-5 w-5 text-orange-500" />
                        Experience
                    </h3>
                    <button
                        type="button"
                        onClick={addExperience}
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </button>
                </div>

                {formData.experience.map((exp: any, index: number) => (
                    <div key={index} className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700/50 relative group">
                        <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Job Title"
                                value={exp.title}
                                onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Company"
                                value={exp.company}
                                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Date (e.g. 2020 - Present)"
                                value={exp.date}
                                onChange={(e) => updateExperience(index, 'date', e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Education */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white flex items-center">
                        <GraduationCap className="mr-2 h-5 w-5 text-pink-500" />
                        Education
                    </h3>
                    <button
                        type="button"
                        onClick={addEducation}
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add
                    </button>
                </div>

                {formData.education.map((edu: any, index: number) => (
                    <div key={index} className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700/50 relative group">
                        <button
                            type="button"
                            onClick={() => removeEducation(index)}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="Degree"
                                value={edu.degree}
                                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="College / University"
                                value={edu.college}
                                onChange={(e) => updateEducation(index, 'college', e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            />
                            <input
                                type="text"
                                placeholder="Date (e.g. 2016 - 2020)"
                                value={edu.date}
                                onChange={(e) => updateEducation(index, 'date', e.target.value)}
                                className="bg-zinc-800 border-zinc-700 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5 mr-2" />
                            Save Profile
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
