import * as fs from 'fs';
import * as path from 'path';
import os from 'os';
import { Project } from './project';

export function getDatabasePath() {
  return path.join(os.homedir(), 'tex_projects.json');
}

export function createDatabase() {
  const databasePath = getDatabasePath();
  if (!fs.existsSync(databasePath)) {
    fs.writeFileSync(databasePath, '{}');
  }
}

export interface Projects {
  [key: string]: Project;
}

export function getProject(projectPath: string): Project | undefined {
  const databasePath = getDatabasePath();
  const projects: Projects = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
  const projectData = projects[projectPath];
  if (projectData) {
    return new Project(projectData.name, projectData.path, projectData.template);
  }
  return undefined;
}

export function addProject(project: Project) {
  const databasePath = getDatabasePath();
  const projects: Projects = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
  projects[project.full_path] = project;
  fs.writeFileSync(databasePath, JSON.stringify(projects, null, 2), 'utf8');
}

export function removeProject(project: Project) {
  const databasePath = getDatabasePath();
  const projects: Projects = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
  delete projects[project.full_path];
  fs.writeFileSync(databasePath, JSON.stringify(projects, null, 2), 'utf8');
}

export function getProjects() {
  const databasePath = getDatabasePath();
  if (!fs.existsSync(databasePath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(databasePath, 'utf8'));
}

export function updateProject(project: Project) {
  const databasePath = getDatabasePath();
  const projects: Projects = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
  projects[project.full_path] = project;
  fs.writeFileSync(databasePath, JSON.stringify(projects, null, 2), 'utf8');
}

