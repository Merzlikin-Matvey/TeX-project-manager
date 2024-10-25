import * as fs from 'fs';
import * as path from 'path';

export function getFullProjectPath(name: string, basePath: string): string {
    return path.join(basePath, name);
}

export function createProject(projectPath: string): string {
    fs.mkdirSync(projectPath, { recursive: true });
    return projectPath;
}

export function isFolderExists(projectPath: string): boolean {
    return fs.existsSync(projectPath);
}
