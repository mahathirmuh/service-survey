import React from 'react';
import { cn } from '../../lib/utils';

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingVariants = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
};

const spacingVariants = {
  none: '',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-6'
};

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  padding = 'md',
  spacing = 'md'
}) => {
  return (
    <div
      className={cn(
        'flex flex-col',
        paddingVariants[padding],
        spacingVariants[spacing],
        className
      )}
    >
      {children}
    </div>
  );
};

// Specialized card content components for different use cases
export const StatCardContent: React.FC<{
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}> = ({ icon, title, value, subtitle, className }) => {
  return (
    <CardContent className={cn('items-center text-center', className)} padding="lg">
      <div className="flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-gradient-to-r from-purple-100 to-blue-100">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-500">{subtitle}</p>
      )}
    </CardContent>
  );
};

export const ChartCardContent: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, children, className }) => {
  return (
    <CardContent className={className} padding="lg">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-600">{subtitle}</p>
        )}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </CardContent>
  );
};

export const ListCardContent: React.FC<{
  title: string;
  items: Array<{
    id: string;
    primary: string;
    secondary?: string;
    tertiary?: string;
    badge?: React.ReactNode;
  }>;
  emptyMessage?: string;
  className?: string;
}> = ({ title, items, emptyMessage = 'No items found', className }) => {
  return (
    <CardContent className={className} padding="lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.primary}</p>
                {item.secondary && (
                  <p className="text-sm text-gray-600">{item.secondary}</p>
                )}
                {item.tertiary && (
                  <p className="text-xs text-gray-500">{item.tertiary}</p>
                )}
              </div>
              {item.badge && (
                <div className="ml-3">
                  {item.badge}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </CardContent>
  );
};

export const PerformanceCardContent: React.FC<{
  title: string;
  rating: number;
  responseCount: number;
  className?: string;
  getRatingColor: (rating: number) => string;
}> = ({ title, rating, responseCount, className, getRatingColor }) => {
  return (
    <CardContent className={className} padding="lg">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">{title}</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(rating)}`}>
          {rating.toFixed(1)}
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Performance</span>
          <span>{rating.toFixed(1)}/5.0</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getRatingColor(rating).includes('red') ? 'bg-red-500' :
              getRatingColor(rating).includes('yellow') ? 'bg-yellow-500' :
              getRatingColor(rating).includes('green') ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${(rating / 5) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="text-sm text-gray-600">
        <span className="font-medium">{responseCount}</span> responses
      </div>
    </CardContent>
  );
};

export default CardContent;