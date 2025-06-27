import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import { Spinner } from './spinner';
import { cn } from "../../lib/utils";

interface DataCardProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function DataCard({
  title,
  description,
  isLoading = false,
  className,
  headerClassName,
  contentClassName,
  icon,
  children
}: DataCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className={cn('flex flex-row items-center justify-between space-y-0 pb-2', headerClassName)}>
        <div>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent className={cn('pt-4', contentClassName)}>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Spinner size="md" text="Daten werden geladen..." />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
