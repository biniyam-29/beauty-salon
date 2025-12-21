import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
//   Clock, 
//   User, 
//   Phone, 
//   Scissors, 
//   CheckCircle2,
//   Trash2,
//   Filter,
  ArrowLeft,
//   ChevronLeft,
//   ChevronRight,
//   Edit3,
  Loader,
//   X
} from 'lucide-react';

export const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  variant = 'ghost', 
  className,
  ...props 
}) => {
  const baseClasses = 'p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500';
  
  const variantClasses = {
    primary: 'bg-rose-500 text-white hover:bg-rose-600',
    secondary: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {icon}
    </button>
  );
};

export interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  error?: string;
}

export const InputWithIcon: React.FC<InputWithIconProps> = ({ 
  icon, 
  error, 
  className,
  ...props 
}) => {
  return (
    <div>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input
          className={cn(
            'w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200',
            error ? 'border-rose-500' : 'border-gray-300',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-rose-600">{error}</p>
      )}
    </div>
  );
};

export interface StatusBadgeProps {
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'scheduled': return { className: 'bg-blue-100 text-blue-800', label: 'Scheduled' };
      case 'completed': return { className: 'bg-green-100 text-green-800', label: 'Completed' };
      case 'cancelled': return { className: 'bg-red-100 text-red-800', label: 'Cancelled' };
      case 'no_show': return { className: 'bg-orange-100 text-orange-800', label: 'No Show' };
      default: return { className: 'bg-gray-100 text-gray-800', label: status };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
};

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader className={`${sizeClasses[size]} animate-spin text-rose-500 mb-2`} />
      {text && <p className="text-gray-500">{text}</p>}
    </div>
  );
};

export interface EmptyStateProps {
  title?: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data found',
  description,
  icon = <Calendar className="w-16 h-16" />,
  action
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="text-gray-400 mb-4 mx-auto inline-block">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      {action}
    </motion.div>
  );
};

export const BackButton: React.FC<{
  onClick: () => void;
  label?: string;
}> = ({ onClick, label = 'Back to Dashboard' }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-2 text-rose-500 hover:text-rose-600 font-medium transition-colors duration-200 group"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
      {label}
    </motion.button>
  );
};

export interface PageHeaderProps {
  title: string;
  description: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12"
    >
      <h1 className="text-4xl font-bold text-gray-900 mb-3">
        {title}
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        {description}
      </p>
    </motion.div>
  );
};