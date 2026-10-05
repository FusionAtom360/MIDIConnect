interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 shadow-xl ${className}`}>
      {title && <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>}
      {children}
    </div>
  );
}
