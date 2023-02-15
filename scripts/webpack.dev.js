const path = require("path");

const outputPath = path.resolve(__dirname, "../public");

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "../example/app.tsx"),
  output: {
    path: outputPath,
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  devtool: "cheap-source-map",
  devServer: {
    hot: true,
    allowedHosts: "all",
    static: {
      directory: outputPath,
    },
    port: 3000
  },
  // externals: [{
  //   'react': 'React',
  //   'react-dom': 'ReactDOM',
  //   'antd': 'antd',
  //   '@ant-design/icons': 'icons'
  // }],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-react"
              ],
              plugins: [
                ["@babel/plugin-proposal-class-properties", {"loose": true}]
              ],
              cacheDirectory: true
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                "@babel/preset-react"
              ],
              plugins: [
                ["@babel/plugin-proposal-class-properties", {"loose": true}]
              ],
              cacheDirectory: true
            }
          },
          {
            loader: 'ts-loader',
            options: {
              silent: true,
              transpileOnly: true
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.less$/i,
        use: [
          {
            loader: "style-loader",
            options: {attributes: {title: "less"}}
          },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[local]-[hash:5]"
              }
            }
          },
          "less-loader"
        ]
      },
      // {
      //   test: /\.(gif|png|jpe?g|webp|svg|woff|woff2|eot|ttf)$/i,
      //   use: [
      //     {
      //       loader: 'url-loader',
      //       options: {
      //         limit: 1024 * 2,
      //         name: 'img_[name]_[contenthash:4].[ext]'
      //       }
      //     }
      //   ]
      // },
    ]
  },
}
