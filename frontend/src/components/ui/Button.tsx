interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export function Button({ 
    variant = 'primary', 
    size = 'md', 
    className = '',
    children,
    ...props 
}: ButtonProps) {
    const baseStyles = 'rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:bg-blue-500 select-none cursor-pointer',
        secondary: 'bg-gray-700 hover:bg-gray-600 text-white select-none cursor-pointer',
        danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-500/50 select-none cursor-pointer',
        success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-500/50 select-none cursor-pointer',
    };
    
    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };
    
    return (
        <button 
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
