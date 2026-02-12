import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
    const variants = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 border border-white/10',
        outline: 'border-2 border-primary/20 bg-transparent hover:bg-primary/5 text-primary hover:border-primary/50',
        ghost: 'bg-transparent hover:bg-primary/5 text-primary',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
        accent: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20',
    };

    const sizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 text-xs',
        lg: 'h-12 px-8 text-lg',
        icon: 'h-10 w-10',
    };

    return (
        <motion.button
            ref={ref}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={cn(
                'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </motion.button>
    );
});

Button.displayName = 'Button';

export { Button };
