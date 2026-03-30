/// <reference types="node" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { existsSync } from 'fs'

const dataDir = resolve(__dirname, 'src/data')

function localOrPublic(name: string): string {
  const local = resolve(dataDir, `${name}.local.ts`)
  return existsSync(local)
    ? resolve(dataDir, `${name}.local.ts`)
    : resolve(dataDir, `${name}.ts`)
}

const DATA_FILES = ['ALL_EXPERIENCES', 'PROFILES', 'OUTPUT_META', 'USER', 'MIND']

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: DATA_FILES.map(name => ({
      find: new RegExp(`.*\\/data\\/${name}(\\.ts)?$`),
      replacement: localOrPublic(name),
    })),
  },
})
