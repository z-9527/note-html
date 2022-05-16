/**
 * feat 1.支持 mock 文件拆分：mock/ 文件夹下面的所有 js 都会被框架自动加载，因此你可以把接口合理的拆分到多个 mock 文件中
 * feat 2.支持模拟延迟（setTimeout 返回）
 * feat 3.支持 mock 动态数据
 *
 */
const Mock = require("mockjs");
// 项目接口 本地 mock 数据
module.exports = {
  // 支持值为 Object 和 Array
  "GET /api/users": { users: [1, 2] },
  
  // GET 可忽略
  "/api/users/1": { id: 1422 },

  "/api/error": (req, res) => {
    setTimeout(() => {
      // 模拟接口报错
      res.status(400).json({
        error: "模拟接口报错",
      });
    }, 1000);
  },

  // 支持mockjs和function,req和res参考express
  'GET /api/list': (req, res) => {
    const { pageSize = 10, pageIndex = 1 } = req.query;
    const startIndex = (pageIndex - 1) * pageSize + 1;
    setTimeout(() => {
      res.send(
        Mock.mock({
          success: 444,
          data: {
            [`data|${pageSize}`]: [
              {
                'id|+1': startIndex,
                name: '@name',
                'number|+1': startIndex,
                title: '@title',
                'price|1000-4000': 400,
                city: '@city',
                'age|20-30': 22,
                address: `@county(true)`,
                link: 'www.baidu.com',
                column: 'column',
                'status|+1': ['unpack', 'mailed', 'sending', 'received'],
                purchasePerson: '@csentence',
                time: '@date',
              },
            ],
            total: 100,
          },
        })
      );
    }, 1000);
  },
};
