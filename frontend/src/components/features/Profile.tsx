import { createPortal } from 'react-dom';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ProfileProps {
    isOpen: boolean;
    username: string;
    onUsernameChange: (value: string) => void;
    onSave: () => void;
    onClose: () => void;
}

export function Profile({
    isOpen,
    username,
    onUsernameChange,
    onSave,
    onClose
}: ProfileProps) {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave();
    };

    const modalContent = (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md px-4">
                <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6">

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <Input
                                label="Username"
                                value={username}
                                onChange={(e) => onUsernameChange(e.target.value)}
                                placeholder="Enter your username"
                                autoFocus
                                maxLength={20}
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                This will be displayed to other users in the session
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                className="flex-1"
                                onClick={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="flex-1"
                            >
                                Save
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );

    return createPortal(modalContent, document.body);
}
