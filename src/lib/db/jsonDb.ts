import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

const resolveAbsolutePath = (filePath: string): string =>
  path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

const ensureDirectoryExists = async (filePath: string): Promise<void> => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
};

const ensureFileExists = async (filePath: string): Promise<void> => {
  await ensureDirectoryExists(filePath);
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '{}', 'utf-8');
  }
};

const writeAtomic = async (target: string, contents: string): Promise<void> => {
  const tempFile = `${target}.tmp-${randomBytes(6).toString('hex')}`;
  await fs.writeFile(tempFile, contents, 'utf-8');
  await fs.rename(tempFile, target);
};

export const readJSON = async <T = Record<string, unknown>>(filePath: string): Promise<T> => {
  const resolvedPath = resolveAbsolutePath(filePath);
  await ensureFileExists(resolvedPath);

  const raw = await fs.readFile(resolvedPath, 'utf-8');
  if (!raw.trim()) {
    return {} as T;
  }

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON at ${resolvedPath}: ${(error as Error).message}`);
  }
};

export const writeJSON = async <T>(filePath: string, data: T): Promise<T> => {
  const resolvedPath = resolveAbsolutePath(filePath);
  await ensureDirectoryExists(resolvedPath);

  const payload = JSON.stringify(data, null, 2);
  await writeAtomic(resolvedPath, payload);
  return data;
};
