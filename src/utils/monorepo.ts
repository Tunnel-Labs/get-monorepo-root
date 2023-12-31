import fs from 'fs';
import path from 'pathe';
import { fileURLToPath } from 'url';

export function getMonorepoDirpath(curDirectory: string = process.cwd()) {
	curDirectory = curDirectory.startsWith('file://')
		? fileURLToPath(curDirectory)
		: curDirectory;

	if (fs.statSync(curDirectory).isFile()) {
		curDirectory = path.dirname(curDirectory);
	}

	let maybeRoot: string | undefined;
	while (curDirectory !== '/' && curDirectory !== '.') {
		if (fs.existsSync(path.join(curDirectory, 'package.json'))) {
			const packageJson = JSON.parse(
				fs.readFileSync(path.join(curDirectory, 'package.json'), 'utf8')
			);
			if (packageJson.workspaces !== void 0 || packageJson.root) {
				return curDirectory;
			} else {
				maybeRoot = curDirectory;
			}
		} else {
			const pnpmWorkspaceExists = fs.existsSync(
				path.join(curDirectory, 'pnpm-workspace.yaml')
			);
			const pnpmLockExists = fs.existsSync(
				path.join(curDirectory, 'pnpm-lock.yaml')
			);
			if (pnpmLockExists) {
				maybeRoot = curDirectory;
			}
			if (pnpmWorkspaceExists) {
				return curDirectory;
			}
		}
		curDirectory = path.dirname(curDirectory);
	}

	return maybeRoot;
}
