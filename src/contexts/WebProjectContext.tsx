// src/contexts/WebProjectContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import WebStore from '@/services/webStorage';
import { Project, ProjectContextType } from '@/types';

interface ProjectProviderProps {
  children: ReactNode;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Web storage for projects
const projectsStore = new WebStore<{ projects: Project[] }>({ 
  name: 'projects', 
  defaults: { projects: [] } 
});

export const WebProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isElectronReady] = useState<boolean>(true); // Always ready for web

  // Load projects from storage
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const storedData = projectsStore.store;
        if (storedData.projects) {
          setProjects(storedData.projects);
        }
      } catch (err) {
        console.error('Failed to load projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Save projects to storage whenever projects change
  const saveProjects = (updatedProjects: Project[]) => {
    try {
      projectsStore.store = { projects: updatedProjects };
    } catch (err) {
      console.error('Failed to save projects:', err);
      setError('Failed to save projects. Please try again.');
    }
  };

  // Create a new project
  const createProject = async (projectData: Partial<Project>): Promise<Project> => {
    try {
      setIsLoading(true);
      
      const newProject: Project = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        name: '',
        ...projectData
      };
      
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      setCurrentProject(newProject);
      saveProjects(updatedProjects);
      
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
    try {
      setIsLoading(true);
      
      // Find project in memory
      const project = projects.find(p => p.id === projectId);
      
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
      
      // Update projects array
      const updatedProjects = [...projects];
      updatedProjects[projectIndex] = updatedProject;
      
      // Update state
      setProjects(updatedProjects);
      saveProjects(updatedProjects);
      
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
    try {
      setIsLoading(true);
      
      // Update projects array
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      saveProjects(updatedProjects);
      
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

  const contextValue: ProjectContextType = {
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
    setError,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useWebProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useWebProject must be used within a WebProjectProvider');
  }
  return context;
};