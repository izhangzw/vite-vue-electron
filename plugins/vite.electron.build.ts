import type { Plugin } from 'vite'
import fs from 'node:fs'
import * as electronBuilder from 'electron-builder'
import path from 'path'
/**
 * background.ts --> background.js
 */
const transferBackgroundTs2Js = () => {
  require('esbuild').buildSync({
    entryPoints: ['src/background.ts'],
    bundle: true,
    outfile: 'dist/background.js',
    platform: 'node',
    target: 'node16',
    external: ['electron']
  })
}

/**
 * 打包
 * 1. vite build
 * 2. electron build
 */
export const ElectronBuildPlugin = (): Plugin => {
  return {
    name: 'electron-build',
    // vite build 结束后执行
    closeBundle() {
      transferBackgroundTs2Js()
      const json = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      json.main = 'background.js'
      fs.writeFileSync('dist/package.json', JSON.stringify(json, null, 4))
      // 防止electron-builder 下载没用的文件
      fs.mkdirSync('dist/node_modules')

      // 配置打包选项
      electronBuilder.build({
        config: {
          directories: {
            output: path.resolve(process.cwd(), 'release'),
            app: path.resolve(process.cwd(), 'dist')
          },
          asar: true, // 压缩
          appId: 'com.izhangzw.vve',
          productName: 'VVE',
          nsis: {
            oneClick: false, // 取消一键安装
            allowToChangeInstallationDirectory: true, //允许选择安装目录
          }
        }
      })
    }
  }
}