import { cac } from "cac";
import { createDevServer } from "./dev";
import path from "path"
import { build } from "./build";

// const version = require("../../package.json").version;
// import x from "../../package.json"
const version = "1.0.0"
const cli = cac("island").version(version).help();

cli
  .command("dev [root]", "start dev server")
  .alias("dev")
  .action(async (root: string) => {
    // 添加以下逻辑
    root = root ? path.resolve(root) : process.cwd();
    const server = await createDevServer(root);
    await server.listen();
    server.printUrls();
  });

cli.command("build [root]", "run build")
  .action(async (root: string) => {
    try {
      root = path.resolve(root)
      await build(root)
    } catch (err) {
      console.log(err)
    }
  })

cli.parse()
