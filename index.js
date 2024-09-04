#!/usr/bin/env node

import { program } from 'commander';
import { select, confirm } from '@inquirer/prompts';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Simulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

program
    .version('1.0.1')
    .argument('<project-name>', 'create-cidc-react-native-app')
    .action(async (projectName) => {
        console.log('Starting scaffold...');
        await scaffoldProject(projectName);
    });

async function scaffoldProject(projectName) {
    // Step 1: Create the project folder
    const projectPath = path.join(process.cwd(), projectName);
    fs.ensureDirSync(projectPath);

    // Step 2: Copy the template project files
    const templatePath = path.join(__dirname, 'templates');
    fs.copySync(templatePath, projectPath);

    // Step 3: Check if package.json exists; if not, create one
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        console.log('No package.json found, creating one...');
        const packageJsonContent = {
            name: projectName,
            version: '1.0.0',
            main: 'index.js',
            scripts: {
                start: "react-native start",
            },
            dependencies: {
                "react": "18.2.0",
                "react-native": "0.71.3"
            }
        };
        fs.writeJsonSync(packageJsonPath, packageJsonContent, { spaces: 2 });
    }

    // Step 4: Ask if the user wants to install dependencies
    const installDependencies = await confirm({
        message: 'Do you want to install dependencies now?',
        default: true,
    });

    if (installDependencies) {
        console.log('Installing dependencies...');
        try {
            execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
        } catch (error) {
            console.error('Failed to install dependencies:', error.message);
        }
    } else {
        console.log('Skipping dependency installation. You can run `npm install` later.');
    }

    console.log(`Project ${projectName} has been created at ${projectPath}`);
}

program.parse(process.argv);
