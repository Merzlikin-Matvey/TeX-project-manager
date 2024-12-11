import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as vscode from "vscode";


export function getTemplatesPath() {
    return path.join(os.homedir(), 'tex_templates');
}

export function createTemplateFolder() {
    const templatesPath = getTemplatesPath();
    fs.mkdirSync(templatesPath, { recursive: true });
}

export function getTemplateNames() {
    const templatesPath = getTemplatesPath();
    return fs.readdirSync(templatesPath)
        .filter(template => path.extname(template) === '.tex')
        .map(template => ({ label: path.basename(template, '.tex') }));
}

export function moveTemplate(templateName: string, projectPath: string, projectName: string) {
    const templatesPath = getTemplatesPath();
    const templatePath = path.join(templatesPath, `${templateName}.tex`);
    const destinationPath = path.join(projectPath, `${projectName}.tex`);

    fs.copyFileSync(templatePath, destinationPath);

    vscode.window.showInformationMessage(`Template path: ${templatePath}`);
    vscode.window.showInformationMessage(`Destination path: ${destinationPath}`);
}

export function addDefaultTemplate() {
    const templatesPath = getTemplatesPath();
    const templates = fs.readdirSync(templatesPath)
        .filter(template => path.extname(template) === '.tex')
        .map(template => path.basename(template, '.tex'));
    if (templates.length === 0) {
        const defaultTemplatePath = path.join(__dirname, '..', 'templates', 'default.tex');
        const defaultTemplate = fs.readFileSync(defaultTemplatePath, 'utf8');
        fs.writeFileSync(path.join(templatesPath, 'default.tex'), defaultTemplate);
    }
}
