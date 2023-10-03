import type { Plugin } from 'vite'
import type { AddressInfo } from 'node:net'
import { spawn } from 'child_process'
import fs from 'node:fs'

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
export const ElectronDevPlugin = (): Plugin => {
  return {
    name: 'electron-dev',
    configureServer(server) {
      transferBackgroundTs2Js()
      server?.httpServer?.once('listening', () => {
        // 读取vite地址信息
        const addressInfo = server.httpServer?.address() as AddressInfo;
        const host = `http://localhost:${addressInfo.port}`
        console.log("vite 服务地址", host)

        /**
         * 通过进程传参
         * require('electron') - 返回path
         * [] - 需要传的参数
         */
        let ElectronProcess = spawn(require('electron'), ['dist/background.js', host])

        // 文件变化的时候
        fs.watchFile('src/background.ts', () => {
          ElectronProcess.kill()
          transferBackgroundTs2Js()
          ElectronProcess = spawn(require('electron'), ['dist/background.js', host])
        })

        ElectronProcess.stderr.on('data', data => {
          console.log('ElectronProcess.stderr ', data.toString());
        })
      })
    }
  }
}