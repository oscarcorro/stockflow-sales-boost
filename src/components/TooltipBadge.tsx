
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TooltipBadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'critical' | 'warning' | 'success';
  children: React.ReactNode;
  tooltip: string;
  className?: string;
}

const TooltipBadge = ({ variant = 'default', children, tooltip, className }: TooltipBadgeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={variant} className={className}>
            {children}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TooltipBadge;
