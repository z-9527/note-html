import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

// 清除缓存
async function importFresh(modulePath) {
  const cacheBustingModulePath = `${modulePath}?update=${Date.now()}`
  return (await import(cacheBustingModulePath)).default
}

async function getFilesSync(filePath, result) {
  try {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      const filePaths = fs.readdirSync(filePath);
      for await (let item of filePaths) {
        const itemFilePath = path.join(filePath, item);
        await getFilesSync(itemFilePath, result);
      }
    } else {
      const file = await importFresh(filePath);
      Object.assign(result, file);
    }
  } catch (error) {
    console.log("error: ", error);
  }
}

// 可单独作为插件使用

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      async configureServer(server) {
        server.middlewares.use(async function (req, res, next) {
          const apiMap = {};
          await getFilesSync(path.join(process.cwd(), "mock"), apiMap);
          proxyApi(apiMap, req, res, next);
        });
        function proxyApi(apiMap, req, res, next) {
          const method = req.method.toLowerCase();
          const baseUrl = req._parsedUrl.pathname;
          for (const [key, handle] of Object.entries(apiMap)) {
            const arr = key.split(" ").reverse();
            const api = arr[0];
            const _method = arr[1] ? arr[1].toLowerCase() : "get";
            if (_method === method && api === baseUrl) {
              if (typeof handle === "function") {
                // 可以参照koa或者express的方法封装一下res,这样外面在使用时更方便
                handle(req, res);
              } else {
                // res.writeHead(200, {
                //   "Content-Type": "application/json",
                // });
                res.end(JSON.stringify(handle));
              }
              return;
            }
          }
          next();
        }
      },
    },
  ],
});
