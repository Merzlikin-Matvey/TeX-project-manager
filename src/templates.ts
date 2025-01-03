import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as vscode from "vscode";

export class TemplateManager {
    private templatesPath: string;

    constructor() {
        this.templatesPath = path.join(os.homedir(), 'tex_templates');
    }

    public getTemplatesPath(): string {
        return this.templatesPath;
    }

    public createTemplateFolder() {
        fs.mkdirSync(this.templatesPath, { recursive: true });
    }

    public getTemplateNames() {
        return fs.readdirSync(this.templatesPath)
            .filter(template => path.extname(template) === '.tex')
            .map(template => ({ label: path.basename(template, '.tex') }));
    }

    public moveTemplate(templateName: string, projectPath: string, projectName: string) {
        const templatePath = path.join(this.templatesPath, `${templateName}.tex`);
        const destinationPath = path.join(projectPath, `${projectName}.tex`);

        fs.copyFileSync(templatePath, destinationPath);

        vscode.window.showInformationMessage(`Template path: ${templatePath}`);
        vscode.window.showInformationMessage(`Destination path: ${destinationPath}`);
    }

    public addDefaultTemplate() {
        const templates = fs.readdirSync(this.templatesPath)
            .filter(template => path.extname(template) === '.tex')
            .map(template => path.basename(template, '.tex'));
        if (templates.length === 0) {
            const defaultTemplatePath = path.join(__dirname, '..', 'templates', 'default.tex');
            const defaultTemplate = fs.readFileSync(defaultTemplatePath, 'utf8');
            fs.writeFileSync(path.join(this.templatesPath, 'default.tex'), defaultTemplate);
        }
    }
}