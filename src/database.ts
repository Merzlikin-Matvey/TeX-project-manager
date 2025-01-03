import * as fs from 'fs';
import { Project } from './project';

export interface Projects {
  [key: string]: Project;
}

export class Database {
  private databasePath: string;

  constructor(databasePath: string) {
    this.databasePath = databasePath;
    this.createDatabase();
  }

  private createDatabase() {
    if (!fs.existsSync(this.databasePath)) {
      fs.writeFileSync(this.databasePath, '{}');
    }
  }

  public getProject(projectPath: string): Project | undefined {
    const projects: Projects = JSON.parse(fs.readFileSync(this.databasePath, 'utf8'));
    const projectData = projects[projectPath];
    if (projectData) {
      return new Project(projectData.name, projectData.path, projectData.template, projectData.last_opened);
    }
    return undefined;
  }

  public addProject(project: Project) {
    const projects: Projects = JSON.parse(fs.readFileSync(this.databasePath, 'utf8'));
    projects[project.full_path] = project;
    fs.writeFileSync(this.databasePath, JSON.stringify(projects, null, 2), 'utf8');
  }

  public removeProject(project: Project) {
    const projects: Projects = JSON.parse(fs.readFileSync(this.databasePath, 'utf8'));
    delete projects[project.full_path];
    fs.writeFileSync(this.databasePath, JSON.stringify(projects, null, 2), 'utf8');
  }

  public getProjects(): Projects {
    if (!fs.existsSync(this.databasePath)) {
      return {};
    }
    return JSON.parse(fs.readFileSync(this.databasePath, 'utf8'));
  }

  public updateProject(project: Project) {
    const projects: Projects = JSON.parse(fs.readFileSync(this.databasePath, 'utf8'));
    projects[project.full_path] = project;
    fs.writeFileSync(this.databasePath, JSON.stringify(projects, null, 2), 'utf8');
  }
}