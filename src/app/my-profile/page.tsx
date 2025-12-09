import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserProfile } from '@/lib/actions/profile.actions';
import ProfileForm from '@/components/profile/ProfileForm';
import Image from 'next/image';

export default async function ProfilePage() {
    const user = await currentUser();

    if (!user) {
        redirect('/sign-in');
    }

    const profile = await getUserProfile();

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <div className="bg-zinc-900 border-b border-zinc-800">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="flex items-center space-x-6">
                        <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-zinc-800 shadow-xl">
                            <Image
                                src={user.imageUrl}
                                alt={user.fullName || 'User'}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">
                                {user.fullName}
                            </h1>
                            <p className="text-zinc-400">
                                {user.primaryEmailAddress?.emailAddress}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-2">My Profile</h2>
                    <p className="text-zinc-400">
                        Manage your personal information, skills, and resume.
                    </p>
                </div>

                <ProfileForm
                    initialData={profile}
                    resumeUrl={profile?.resumeUrl || null}
                />
            </div>
        </div>
    );
}
