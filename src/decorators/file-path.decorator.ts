import { SetMetadata } from '@nestjs/common';
import * as path from 'path';

export const FILE_PATH_KEY = 'file_path';

// Helper to convert absolute path to relative from project root
function getRelativePath(absolutePath: string): string {
  const projectRoot = process.cwd();
  return path.relative(projectRoot, absolutePath);
}

// This needs to be manually added to each controller file
export const FilePath = (absolutePath: string) => {
  const relativePath = getRelativePath(absolutePath);
  return SetMetadata(FILE_PATH_KEY, relativePath);
};
