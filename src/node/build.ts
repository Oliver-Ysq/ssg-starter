import { InlineConfig, build as viteBuild } from "vite"
import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH } from "./constants"
import path from "path"
import type { RollupOutput } from "rollup"
import * as fs from "fs-extra"
import { writeFile } from "fs/promises"

export const bundle = async (root: string) => {
  try {
    const resolveViteConfig = (isServer: boolean): InlineConfig => {
      return {
        mode: 'production',
        root,
        build: {
          ssr: isServer,
          outDir: isServer ? '.temp' : 'build',
          rollupOptions: {
            input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
            output: {
              format: 'esm'
            }
          }
        }
      }
    }
    const clientBuild = async () => {
      return viteBuild(resolveViteConfig(false))
    }
    const serverBuild = async () => {
      return viteBuild(resolveViteConfig(true))
    }
    console.log("Building client & server bundle")
    // client server 分别打包
    const [clientBundle, serverBundle] = await Promise.all([clientBuild(), serverBuild()])
    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput]
  } catch (err) {
    console.log(err)
  }
}

export const renderPage = async (render: () => string, root: string, clientBundle: RollupOutput) => {
  const appHtml = render()
  // 需要把客户端的脚本注入进来，绑定dom操作等
  const clientChunk = clientBundle.output.find(chunk => chunk.type === "chunk" && chunk.isEntry)
  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>title</title>
      <meta name="description" content="xxx">
    </head>
    <body>
      <div id="root">${appHtml}</div>
      <script src="/${clientChunk.fileName}" type="module"></script>
      </body>
  </html>`.trim()
  // 将SSR处理后的产物写入index.html
  await fs.ensureDir(path.join(root, "build"));
  await writeFile(path.join(root, 'build/index.html'), html)
  // 移除SSR产物
  await fs.remove(path.join(root, ".temp"))
}

export const build = async (root: string) => {
  // 1. bundle（代码打包） - client端 + server端
  const [clientBundle] = await bundle(root)
  // 2. 引入server-entry模块
  const serverEntryPath = path.join(root, '.temp', 'ssr-entry.js')
  const { render } = await import(serverEntryPath)
  // 3. 服务端渲染，产出HTML
  await renderPage(render, root, clientBundle)
}
