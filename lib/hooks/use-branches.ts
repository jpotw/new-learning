import { useState, useCallback } from 'react';
import { useQA } from './use-qa';

export interface Branch {
  id: string;
  parentId: string | null;
  question: string;
  answer: string;
  createdAt: Date;
  children: Branch[];
}

export interface BranchNode {
  id: string;
  parentId: string | null;
  question: string;
  answer: string;
  createdAt: Date;
}

interface UseBranchesResult {
  branches: Branch[];
  currentBranchId: string | null;
  isLoading: boolean;
  error: string | null;
  createBranch: (parentId: string | null, question: string, answer: string) => void;
  selectBranch: (branchId: string) => void;
  getBranchPath: (branchId: string) => Branch[];
  deleteBranch: (branchId: string) => void;
}

/**
 * Hook for managing branching conversations
 */
export function useBranches(documentId: string): UseBranchesResult {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the QA hook for asking questions
  const { askQuestion } = useQA(documentId);

  /**
   * Create a new branch
   */
  const createBranch = useCallback((parentId: string | null, question: string, answer: string) => {
    const newBranch: Branch = {
      id: crypto.randomUUID(),
      parentId,
      question,
      answer,
      createdAt: new Date(),
      children: [],
    };

    setBranches((prevBranches) => {
      // If this is the first branch (root)
      if (prevBranches.length === 0) {
        return [newBranch];
      }

      // Create a deep copy of the branches
      const updatedBranches = JSON.parse(JSON.stringify(prevBranches));

      // If parent is null, add as a root branch
      if (parentId === null) {
        updatedBranches.push(newBranch);
        return updatedBranches;
      }

      // Helper function to recursively find and update the parent branch
      const addChildToBranch = (branches: Branch[]): boolean => {
        for (let i = 0; i < branches.length; i++) {
          if (branches[i].id === parentId) {
            branches[i].children.push(newBranch);
            return true;
          }
          
          if (branches[i].children.length > 0) {
            if (addChildToBranch(branches[i].children)) {
              return true;
            }
          }
        }
        return false;
      };

      // Add the new branch to its parent
      addChildToBranch(updatedBranches);
      return updatedBranches;
    });

    // Set the new branch as the current branch
    setCurrentBranchId(newBranch.id);
    
    return newBranch.id;
  }, []);

  /**
   * Select a branch to make it the current branch
   */
  const selectBranch = useCallback((branchId: string) => {
    setCurrentBranchId(branchId);
  }, []);

  /**
   * Get the path from root to the specified branch
   */
  const getBranchPath = useCallback((branchId: string): Branch[] => {
    const path: Branch[] = [];
    
    const findPath = (branches: Branch[], targetId: string): boolean => {
      for (const branch of branches) {
        if (branch.id === targetId) {
          path.push(branch);
          return true;
        }
        
        if (branch.children.length > 0) {
          if (findPath(branch.children, targetId)) {
            path.unshift(branch);
            return true;
          }
        }
      }
      
      return false;
    };
    
    findPath(branches, branchId);
    return path;
  }, [branches]);

  /**
   * Delete a branch and all its children
   */
  const deleteBranch = useCallback((branchId: string) => {
    setBranches((prevBranches) => {
      // Create a deep copy of the branches
      const updatedBranches = JSON.parse(JSON.stringify(prevBranches));
      
      // Helper function to recursively find and remove the branch
      const removeBranch = (branches: Branch[]): Branch[] => {
        return branches.filter(branch => {
          if (branch.id === branchId) {
            return false;
          }
          
          if (branch.children.length > 0) {
            branch.children = removeBranch(branch.children);
          }
          
          return true;
        });
      };
      
      // Remove the branch
      const result = removeBranch(updatedBranches);
      
      // If the current branch was deleted, set currentBranchId to null
      if (currentBranchId === branchId || getBranchPath(currentBranchId || '').some(b => b.id === branchId)) {
        setCurrentBranchId(null);
      }
      
      return result;
    });
  }, [currentBranchId, getBranchPath]);

  return {
    branches,
    currentBranchId,
    isLoading,
    error,
    createBranch,
    selectBranch,
    getBranchPath,
    deleteBranch,
  };
} 