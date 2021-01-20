const path = require('path');
const { name: packageName, version } = require('./package.json');

module.exports = {
  assetsDir: './assets',
  title: packageName,
  pagePerSection: true,
  version,
  sections: [
    {
      name: 'Introduction',
      content: 'README.md',
    },
    {
      name: 'API',
      exampleMode: 'expand',
      usageMode: 'expand',
      components: 'src/components/**/*.{jsx,tsx,ts,js}',
    },
    {
      name: 'Examples',
      sections: [
        {
          name: 'Basic',
          content: 'examples/basic.md',
        },
      ],
    },
  ],
  styleguideDir: './dist/doc',
  styleguideComponents: {
    StyleGuideRenderer: path.join(__dirname, 'styleguide/rsg/StyleGuideRenderer'),
  },
  getComponentPathLine(p) {
    let componentName = path.basename(p).split('.')[0];

    return `import { ${componentName} } from '${packageName}';`;
  },
  propsParser: (filePath, source, resolver, handlers) => {
    const { ext } = path.parse(filePath);

    return ext === '.tsx'
      ? require('react-docgen-typescript').parse(
          filePath,
          source,
          resolver,
          handlers,
        )
      : require('react-docgen').parse(source, resolver, handlers);
  },
  verbose: true,
  webpackConfig: {
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      alias: {
        [packageName]: path.resolve(__dirname, 'src'),
      },
    },
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(t|j)sx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
  },
};
