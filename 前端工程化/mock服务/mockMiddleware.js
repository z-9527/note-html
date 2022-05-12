/**
 * 实现了mock接口；upload接口；注意要配置upload的静态目录才能直接访问上传的文件
 */
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const FS = require('fs-extra');



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
      delete require.cache[require.resolve(filePath)];
      const file = require(filePath);
      Object.assign(result, file);
    }
  } catch (error) {
    console.log('error: ', error);
  }
}

/**
 * 
 * @param {*} options 
 * uploadFileName 上传文件名 默认file
 * uploadUrl 上传接口地址 默认为/upload
 * uploadDestination 上传文件目录  默认为根目录下的/static/upload文件中
 * @returns 
 */
module.exports = function mockMiddleware(
  options = {
    uploadFileName: 'file',
    uploadUrl: '/upload',
    uploadDestination: path.join(process.cwd(), 'static', 'upload'),
  }
) {
  return function (req, res, next) {
    const { uploadFileName, uploadUrl, uploadDestination } = options;
    const method = req.method.toLowerCase();
    const baseUrl = req.baseUrl;
    const apiMap = {};
    getFilesSync(path.join(process.cwd(), 'mock'), apiMap);
    for (const [key, handle] of Object.entries(apiMap)) {
      const arr = key.split(' ').reverse();
      const api = arr[0];
      const _method = arr[1] ? arr[1].toLowerCase() : 'get';
      if (_method === method && api === baseUrl) {
        if (typeof handle === 'function') {
          handle(req, res);
        } else {
          res.send(handle);
        }
        return;
      }
    }

    if (method === 'post' && baseUrl === uploadUrl) {
      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          FS.ensureDirSync(uploadDestination);
          cb(null, uploadDestination);
        },
        filename: function (req, file, cb) {
          cb(null, file.originalname);
        },
      });
      const upload = multer({ storage: storage }).single(uploadFileName);
      upload(req, res, (err) => {
        if (!err) {
          res.send({
            error: 0,
            data: {
              ...req.file,
            },
            msg: '上传成功',
          });
        }
      });

      return;
    }

    next();
  };
};
