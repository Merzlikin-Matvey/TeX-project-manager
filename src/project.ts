import * as path from 'path';

export class Project {
  name: string;
  path: string;
  full_path: string;
  tex_file_name: string;
  full_tex_file_path: string;
  template: string;
  last_opened: Date;

  constructor(projectName: string, projectPath: string, projectTemplate: string) {
    this.name = projectName;
    this.path = projectPath;
    this.tex_file_name = `${projectName}.tex`;
    this.template = projectTemplate;
    this.last_opened = new Date();

    this.full_path = path.join(this.path, this.name);
    this.full_tex_file_path = path.join(this.full_path, this.tex_file_name);
  }

  updateLastOpened() {
    this.last_opened = new Date();
  }
}