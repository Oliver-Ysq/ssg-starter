import { defineConfig } from "tsup"
export default defineConfig({
    entry: ["./src/node/cli.ts"],
    format: ['esm', 'cjs'],
    shims: true,
});
