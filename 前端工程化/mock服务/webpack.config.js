const fs = require("fs");
const path = require("path");
const multer = require("multer");
const FS = require("fs-extra");


function getFilesSync(filePath, result) {
  try {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      const filePaths = fs.readdirSync(filePath);
      filePaths.forEach((item) => {
        const itemFilePath = path.join(filePath, item);
        getFilesSync(itemFilePath, result);
      });
    } else {
      delete require.cache[require.resolve(filePath)];  // 很关键不然会有缓存问题
      const file = require(filePath);
      Object.assign(result, file);
    }
  } catch (error) {
    console.log("error: ", error);
  }
}

// webpack@5
module.exports = {
  onBeforeSetupMiddleware(devServer) {
    const apiMap = {};
    getFilesSync(path.join(process.cwd(), "mock"), apiMap);
    for (const [key, handle] of Object.entries(apiMap)) {
      const arr = key.split(" ").reverse();
      const api = arr[0];
      const method = arr[1] ? arr[1].toLowerCase() : "get";
      devServer.app[method](
        api,
        typeof handle === "function"
          ? handle
          : (req, res) => {
              res.send(handle);
            }
      );
    }
    

    // 文件上传
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        FS.ensureDirSync(path.join(process.cwd(), "static", "upload"));
        cb(null, path.join(process.cwd(), "static", "upload"));
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname);
      },
    });

    let upload = multer({ storage: storage });
    devServer.app.post(
      "/upload",
      upload.single("file"),
      function (req, res, next) {
        res.send({
          error: 0,
          data: {
            ...req.file,
            // url: ,  // 需要配置webpack-der-server静态文件路径
          },
          msg: "上传成功",
        });
      }
    );
  },
};



// 另一种实现方式，注意这里要对未匹配的接口处理，返回html
function handleRouter(req, res, method) {
  const urlPath = req.path;
  const apiMap = {};
  getFilesSync(path.join(process.cwd(), 'mock'), apiMap);
  for (const [key, handle] of Object.entries(apiMap)) {
    const arr = key.split(' ').reverse();
    const api = arr[0];
    const _method = arr[1] ? arr[1].toLowerCase() : 'get';
    if (_method === method && api === urlPath) {
      if (typeof handle === 'function') {
        handle(req, res);
      } else {
        res.send(handle);
      }
      return;
    }
  }
  res.send({ msg: '暂无接口', urlPath });
}

app.post('*', function (req, res) {
  handleRouter(req, res, 'post');
});
app.get("*", function (req, res) {
  handleRouter(req, res, "get");
});




function startCallback(){
  if (isInteractive) {
    clearConsole();
  }

  const watcher = chokidar.watch(path.join(process.cwd(), "mock")).on('change', () => {
    console.log("checked dev-server proxy changes, restarting server");
    devServer.stopCallback(() => {
      watcher.close();
      devServer.startCallback(startCallback);
    });
  });

  if (env.raw.FAST_REFRESH && semver.lt(react.version, '16.10.0')) {
    console.log(
      chalk.yellow(
        `Fast Refresh requires React 16.10 or higher. You are using React ${react.version}.`
      )
    );
  }

  console.log(chalk.cyan('Starting the development server...\n'));
  openBrowser(urls.localUrlForBrowser);
}

devServer.startCallback(startCallback);




// function startCallback(){
//   if (isInteractive) {
//     clearConsole();
//   }

//   const watcher = chokidar.watch(path.join(process.cwd(), "mock")).on('change', () => {
//     console.log("checked dev-server proxy changes, restarting server");
//     devServer.stopCallback(() => {
//       watcher.close();
//       devServer.startCallback(startCallback);
//     });
//   });

//   if (env.raw.FAST_REFRESH && semver.lt(react.version, '16.10.0')) {
//     console.log(
//       chalk.yellow(
//         `Fast Refresh requires React 16.10 or higher. You are using React ${react.version}.`
//       )
//     );
//   }

//   console.log(chalk.cyan('Starting the development server...\n'));
//   openBrowser(urls.localUrlForBrowser);
// }

// devServer.startCallback(startCallback);