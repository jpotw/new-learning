'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBranches } from '@/lib/hooks/use-branches';
import { BranchNode } from './branch-node';
import { BranchControls } from './branch-controls';

interface BranchContainerProps {
  documentId: string;
  title?: string;
  className?: string;
}

/**
 * Container component for the branching ideas feature
 */
export function BranchContainer({
  documentId,
  title = 'Branching Ideas',
  className,
}: BranchContainerProps) {
  const {
    branches,
    currentBranchId,
    isLoading,
    error,
    createBranch,
    selectBranch,
    getBranchPath,
    deleteBranch,
  } = useBranches(documentId);

  // Get the current branch path
  const currentPath = currentBranchId ? getBranchPath(currentBranchId) : [];

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          {/* Display error if any */}
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Display loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {/* Display branches */}
          <div className="flex flex-col space-y-2">
            {branches.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground">
                No branches yet. Start a conversation to create branches.
              </div>
            ) : (
              <div className="space-y-2">
                {branches.map((branch) => (
                  <BranchNode
                    key={branch.id}
                    branch={branch}
                    level={0}
                    isSelected={currentBranchId === branch.id}
                    onSelect={selectBranch}
                    onDelete={deleteBranch}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Branch controls */}
          <BranchControls
            documentId={documentId}
            currentBranchId={currentBranchId}
            createBranch={createBranch}
          />
        </div>
      </CardContent>
    </Card>
  );
} 