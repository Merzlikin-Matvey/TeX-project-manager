import * as fs from 'fs';
import { Project } from './project';
import sqlite3 from 'sqlite3';

export interface Projects {
  [key: string]: Project;
}

interface ProjectRow {
  projectName: string;
  projectPath: string;
  template: string;
  last_opened: Date;
  full_path: string;
  full_tex_file_path: string;
}

export class ProjectsDatabase {
  private readonly databasePath: string;
  private db!: sqlite3.Database;

  constructor() {
    this.databasePath = this.getDatabasePath();
    this.createDatabase();
    this.db = new sqlite3.Database(
        this.databasePath,
        sqlite3.OPEN_READWRITE,
        (err) => {
          if (err) {throw err;}
        }
    );
  }

  private getDatabasePath(): string {
    return "C:\\Users\\merzl\\WebstormProjects\\TeX\\db.db";
  }

  private createDatabase() {
    if (!fs.existsSync(this.databasePath)) {
      fs.writeFileSync(this.databasePath, '');
    }
  }

  public getProject(projectPath: string) : Promise<Project | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM projects WHERE path = ?",
        [projectPath],
        (err, row: ProjectRow | undefined) => {
          if (err) {
            reject(err);
          } else if (row) {
            const project = new Project(
                row.projectName,
                row.projectPath,
                row.template,
                new Date(row.last_opened),
                row.full_path,
                row.full_tex_file_path
            );
            resolve(project);
          } else {
            resolve(undefined);
          }
        }
      );
    });
  }

  public addProject(project: Project): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
          `INSERT OR REPLACE INTO projects
         (projectName, projectPath, template, lastOpened, fullPath, fullTexFilePath)
         VALUES (?, ?, ?, ?, ?, ?)`,
          [
            project.name,
            project.path,
            project.template,
            project.last_opened.toISOString(),
            project.full_path,
            project.full_tex_file_path
          ],
          (err) => err ? reject(err) : resolve()
      );
    });
  }

  public removeProject(project: Project): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
          "DELETE FROM projects WHERE fullPath = ?",
          [project.full_path],
          (err) => err ? reject(err) : resolve()
      );
    });
  }

  public getProjects(): Promise<Projects> {
    return new Promise((resolve, reject) => {
      this.db.all(
          "SELECT * FROM projects",
          (err, rows: ProjectRow[]) => {
            if (err) return reject(err);
            const result: Projects = {};
            rows.forEach(row => {
              result[row.projectPath] = new Project(
                  row.projectName,
                  row.projectPath,
                  row.template,
                  new Date(row.last_opened),
                  row.full_path,
                  row.full_tex_file_path
              );
            });
            resolve(result);
          }
      );
    });
  }

  public updateProject(project: Project): Promise<void> {
    return this.addProject(project);
  }
}