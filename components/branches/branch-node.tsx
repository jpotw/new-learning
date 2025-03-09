'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Branch } from '@/lib/hooks/use-branches';

interface BranchNodeProps {
  branch: Branch;
  level: number;
  isSelected: boolean;
  onSelect: (branchId: string) => void;
  onDelete: (branchId: string) => void;
}

/**
 * Component for displaying an individual branch node
 */
export function BranchNode({
  branch,
  level,
  isSelected,
  onSelect,
  onDelete,
}: BranchNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = branch.children.length > 0;
  
  // Calculate padding based on level
  const paddingLeft = `${level * 1.5}rem`;
  
  return (
    <div className="flex flex-col">
      {/* Branch node */}
      <div
        className={`flex items-center rounded-md border p-2 ${
          isSelected ? 'border-primary bg-primary/10' : 'border-border'
        }`}
        style={{ marginLeft: paddingLeft }}
      >
        {/* Expand/collapse button */}
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {/* Branch content */}
        <div
          className="flex-1 cursor-pointer truncate px-2"
          onClick={() => onSelect(branch.id)}
        >
          <div className="font-medium">{branch.question}</div>
        </div>
        
        {/* Delete button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(branch.id)}
        >
          <Trash className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
      
      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="mt-1 space-y-1">
          {branch.children.map((child) => (
            <BranchNode
              key={child.id}
              branch={child}
              level={level + 1}
              isSelected={isSelected}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
} 