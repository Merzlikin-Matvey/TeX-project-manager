import * as fs from 'fs';
import { Project } from './project';
import sqlite3 from 'sqlite3';

export interface Projects {
  [key: string]: Project;
}

interface ProjectRow {
  name: string;
  path: string;
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
        err => { if (err) {throw err;} }
    );

    this.db.serialize(() => {
      const sql = `
        CREATE TABLE IF NOT EXISTS projects (
          name TEXT,
          path TEXT,
          template TEXT,
          last_opened TEXT,
          full_path TEXT PRIMARY KEY,
          full_tex_file_path TEXT
        )
      `;
      this.db.run(sql);
    });
  }

  private getDatabasePath(): string {
    return "C:\\Users\\merzl\\WebstormProjects\\TeX\\db.db";
  }

  private createDatabase() {
    if (!fs.existsSync(this.databasePath)) {
      fs.writeFileSync(this.databasePath, '');
    }
  }

  public getProject(full_path: string) : Promise<Project | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT * FROM projects WHERE full_path = ?",
        [full_path],
        (err, row: ProjectRow | undefined) => {
          if (err) {
            reject(err);
          } else if (row) {
            const project = new Project(
                row.name,
                row.path,
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
    console.log("Adding project:", project);
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO projects
        (name, path, template, last_opened, full_path, full_tex_file_path)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      this.db.run(sql,
          [
            project.name,
            project.path,
            project.template,
            project.last_opened.toISOString(),
            project.full_path,
            project.full_tex_file_path
          ],
          (err) => {
            if (err) {
              console.error("Error adding project:", err);
              reject(err);
            } else {
              resolve();
            }
          }
      );
    });
  }

  public removeProject(project: Project): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM projects WHERE full_path = ?`;
      this.db.run(
          sql,
          [project.full_path],
          (err) => {
            if (err) {
              console.error('!! Ошибка удаления проекта:', err);
              return reject(err);
            }
            console.log('>> Проект успешно удален:', project.full_path);
            resolve();
          }
      );
    });
  }

  public getProjects(): Promise<Projects> {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM projects';
      this.db.all(
        sql, (err, rows: ProjectRow[]) => {
          if (err) {
            console.error('!! Ошибка SELECT:', err);
            return reject(err);
          }
          console.log('>> Результат SELECT:', rows);
          
          const result: Projects = {};
          rows.forEach(row => {
            result[row.full_path] = new Project(
                row.name,
                row.path,
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
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE projects
        SET name = ?, path = ?, template = ?, last_opened = ?, full_tex_file_path = ?
        WHERE full_path = ?
      `;

      this.db.run(
        sql,
        [
          project.name,
          project.path,
          project.template,
          project.last_opened.toISOString(),
          project.full_tex_file_path,
          project.full_path
        ],
        (err) => {
          if (err) {
            console.error('!! Ошибка обновления проекта:', err);
            return reject(err);
          }
          console.log('>> Проект успешно обновлен:', project.full_path);
          resolve();
        }
      );
    });
  }
}