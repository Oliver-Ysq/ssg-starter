var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/node/cli.ts
var import_cac = require("cac");

// src/node/dev.ts
var import_vite = require("vite");

// src/node/plugin-island/indexHtml.ts
var import_promises = require("fs/promises");

// src/node/constants/index.ts
var import_path = require("path");
var PACKAGE_ROOT = (0, import_path.join)(__dirname, "..");
var DEFAULT_HTML_PATH = (0, import_path.join)(PACKAGE_ROOT, "template.html");
var CLIENT_ENTRY_PATH = (0, import_path.join)(
  PACKAGE_ROOT,
  "src",
  "runtime",
  "client-entry.tsx"
);

// src/node/plugin-island/indexHtml.ts
function pluginIndexHtml() {
  return {
    name: "island:index-html",
    apply: "serve",
    // 插入入口 script 标签
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              type: "module",
              src: `/@fs/${CLIENT_ENTRY_PATH}`
            },
            injectTo: "body"
          }
        ]
      };
    },
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          console.log(req.url, req.originalUrl, "here");
          let html = await (0, import_promises.readFile)(DEFAULT_HTML_PATH, "utf-8");
          try {
            html = await server.transformIndexHtml(
              req.url,
              html,
              req.originalUrl
            );
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.end(html);
          } catch (e) {
            return next(e);
          }
        });
      };
    }
  };
}

// src/node/dev.ts
var import_plugin_react = __toESM(require("@vitejs/plugin-react"), 1);
function createDevServer(root) {
  return (0, import_vite.createServer)({
    root,
    plugins: [pluginIndexHtml(), (0, import_plugin_react.default)()]
  });
}

// src/node/cli.ts
var import_path2 = __toESM(require("path"), 1);
var version = "1.0.0";
var cli = (0, import_cac.cac)("island").version(version).help();
cli.command("[root]", "start dev server").alias("dev").action(async (root) => {
  root = root ? import_path2.default.resolve(root) : process.cwd();
  const server = await createDevServer(root);
  await server.listen();
  server.printUrls();
});
cli.parse();
