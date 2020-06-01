import {resolve as reso} from "path";

// ref: https://umijs.org/config/
export default {
  history: 'hash',
  targets: {
    chrome: 58,
    ie: 10
  },
  publicPath: "./",
  disableCSSModules: true,
  treeShaking: true,
  alias: {
    '@': reso(__dirname, './src'),
    '@a': reso(__dirname, './src/assets'),
    '@v': reso(__dirname, './public'),
    '@c': reso(__dirname, './src/components'),
    '@u': reso(__dirname, './src/utils'),
    '@services': reso(__dirname, './src/services')
  },
//   routes: [{  不要删，后期可能会自定义路由
//     path: '/',
//     redirect: '/manage/organization',
//   },
//   {
//     path: '/',
//     component:'../layouts/index.jsx',
// 		 routes:[
//       {
//         path: '/manage/organiZation',
//         component:'manage/organization/index.jsx',
//       },
//       {
//         path: '/manage/userStati',
//         component:'manage/userStati/index.jsx',
//       },
//       {
//         path: '/manage/rightsManagement',
//         component:'manage/rightsManagement/index.jsx',
//       },
//       {
//         path: '/manage/encryptedDogManagement',
//         component:'manage/encryptedDogManagement/index.jsx',
//       },
//       {
//         path: '/manage/topUpCenter',
//         component:'manage/topUpCenter/index.jsx',
//       },

//       {
//         path: '/register',
//         component:'register/index.jsx',
//       },

//       {
//         path: '/statireport/corporateTranslationStatistics',
//         component:'statireport/corporateTranslationStatistics/index.jsx',
//       },
//       {
//         path: '/statireport/reswordcount',
//         component:'statireport/reswordcount/index.jsx',
//       },
//       {
//         path: '/statireport/userTranslationDetailStatistics',
//         component:'statireport/userTranslationDetailStatistics/index.jsx',
//       },
//       {
//         path: '/statireport/userTranslationStatistics',
//         component:'statireport/userTranslationStatistics/index.jsx',
//       },

//       {
//         path: '/404',
//         component:'404',
//       },
//     ]
//   }],
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: { webpackChunkName: true },
      experimentalDecorators: true,
      dynamicImport: true,
      title: '安天',
      dll: true,
      routes: [{
          include: [/.*/],
          exlude: [
            /models\//,
            /services\//,
            /model\.(t|j)sx?$/,
            /service\.(t|j)sx?$/,
            /components\//
          ]
        }
      ],
      hardSource: false,
      locale: {
        enable: true, // default false
        default: 'zh-CN', // default zh-CN
        baseNavigator: true, // default true, when it is true, will use `navigator.language` overwrite default
      },

    }]
  ],
  proxy: {
    "/api": {
      // target: "http://10.240.50.106",
      // target:"http://10.240.17.28:8080",
      target: "http://10.240.50.105:8110",
      secure: false,
      changeOrigin: true,
      pathRewrite: {
        "^/api": "/api"
      }
    }
  },
}
