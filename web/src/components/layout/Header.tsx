import { useEffect, useState } from "react";
import { Profile } from "../features/Profile";

export function Header() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const storedUsername = localStorage.getItem('user');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const handleClose = () => {
        setIsProfileOpen(false);
    };

    const handleSave = () => {
        localStorage.setItem('user', username);
        setIsProfileOpen(false);
    };

    return (
        <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-8 py-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3 select-none">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-2xl material-symbols-outlined">piano</span>
                    </div>
                    <div>
                        <div className="hidden sm:block">
                            <h1 className="text-xl font-bold text-white">MIDIConnect</h1>
                            <p className="text-xs text-gray-400">Collaborate in realtime</p>
                        </div>
                    </div>
                </div>

                <nav className="flex items-center gap-6">
                    <div className="text-white transition text-sm font-medium flex items-center gap-2 cursor-pointer" onClick={() => setIsProfileOpen(true)}>
                        {username || 'User'}
                        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center cursor-pointer" onClick={() => setIsProfileOpen(true)}>
                            <span className="text-sm material-symbols-outlined select-none">person</span>
                        </button>
                    </div>
                </nav>
            </div>
            <Profile
                isOpen={isProfileOpen}
                username={username}
                onUsernameChange={setUsername}
                onSave={handleSave}
                onClose={handleClose}
            />
        </header>
    );
}
