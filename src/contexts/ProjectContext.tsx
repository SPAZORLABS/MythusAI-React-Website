import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, ProjectContextType } from '@/types';

// Create Project context
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Project provider component
interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isElectronReady, setIsElectronReady] = useState<boolean>(false);

  // Check for electron availability
  useEffect(() => {
    const checkElectron = () => {
      if (window.electron?.ipc) {
        setIsElectronReady(true);
      } else {
        // If electron is not available, retry after a short delay
        setTimeout(checkElectron, 100);
      }
    };
    checkElectron();
  }, []);

  // Load projects from storage when electron is ready
  useEffect(() => {
    const loadProjects = async () => {
      if (!isElectronReady) return;
      
      try {
        const storedProjects = await window.electron!.ipc.invoke('get-stored-projects');
        if (storedProjects) {
          setProjects(storedProjects);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [isElectronReady]);

  // Create a new project
  const createProject = async (projectData: Partial<Project>): Promise<Project> => {
    if (!isElectronReady) {
      throw new Error('Electron is not ready');
    }

    try {
      setIsLoading(true);
      
      const newProject: Project = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name: '',
        ...projectData
      };
      
      await window.electron!.ipc.invoke('save-project', newProject);
      
      // Update state
      setProjects([...projects, newProject]);
      setCurrentProject(newProject);
      
      return newProject;
    } catch (err) {
      console.error('Failed to create project:', err);
      setError('Failed to create project. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load a project
  const loadProject = async (projectId: string): Promise<Project> => {
    if (!isElectronReady) {
      throw new Error('Electron is not ready');
    }

    try {
      setIsLoading(true);
      
      // Find project in memory first
      let project = projects.find(p => p.id === projectId);
      
      // If not found in memory, try to load from storage
      if (!project) {
        project = await window.electron!.ipc.invoke('load-project', projectId);
      }
      
      if (project) {
        setCurrentProject(project);
        return project;
      } else {
        throw new Error('Project not found');
      }
    } catch (err) {
      console.error('Failed to load project:', err);
      setError('Failed to load project. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a project
  const updateProject = async (projectId: string, updates: Partial<Project>): Promise<Project> => {
    if (!isElectronReady) {
      throw new Error('Electron is not ready');
    }

    try {
      setIsLoading(true);
      
      // Find project index
      const projectIndex = projects.findIndex(p => p.id === projectId);
      
      if (projectIndex === -1) {
        throw new Error('Project not found');
      }
      
      // Create updated project object
      const updatedProject: Project = {
        ...projects[projectIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await window.electron!.ipc.invoke('save-project', updatedProject);
      
      // Update projects array
      const updatedProjects = [...projects];
      updatedProjects[projectIndex] = updatedProject;
      
      // Update state
      setProjects(updatedProjects);
      
      // Update current project if it's the one being updated
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      return updatedProject;
    } catch (err) {
      console.error('Failed to update project:', err);
      setError('Failed to update project. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a project
  const deleteProject = async (projectId: string): Promise<boolean> => {
    if (!isElectronReady) {
      throw new Error('Electron is not ready');
    }

    try {
      setIsLoading(true);
      
      await window.electron!.ipc.invoke('delete-project', projectId);
      
      // Update projects array
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      
      // Clear current project if it's the one being deleted
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(null);
      }
      
      return true;
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError('Failed to delete project. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear current project
  const clearCurrentProject = () => {
    setCurrentProject(null);
  };

  // Value to be provided by the context
  const value: ProjectContextType = {
    projects,
    currentProject,
    isLoading,
    error,
    isElectronReady,
    createProject,
    loadProject,
    updateProject,
    deleteProject,
    clearCurrentProject,
    setError
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// Custom hook to use the Project context
export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}; 