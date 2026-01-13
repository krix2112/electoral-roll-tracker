import React from 'react';
import { Card } from './Card';
import { cn } from '../../lib/utils';

const StatCard = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <Card
            ref={ref}
            className={cn(
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1 hover:shadow-lg",
                className
            )}
            {...props}
        >
            {children}
        </Card>
    );
});

StatCard.displayName = 'StatCard';

export { StatCard };
