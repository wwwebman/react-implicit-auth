const path = require('path');
const { name: packageName, version } = require('./package.json');
const { theme, styles } = require('./styleguide/styles');

module.exports = {
  assetsDir: './assets',
  title: packageName,
  pagePerSection: true,
  version,
  theme,
  styles,
  skipComponentsWithoutExample: true,
  sections: [
    {
      name: 'Introduction',
      content: 'README.md',
    },
    {
      name: 'API Reference',
      exampleMode: 'expand',
      usageMode: 'expand',
      components: 'src/components/**/*.{jsx,tsx,ts,js}',
      pagePerSection: true,
      sectionDepth: 1,
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
    StyleGuideRenderer: path.join(
      __dirname,
      'styleguide/rsg/StyleGuideRenderer',
    ),
  },
  getComponentPathLine(p) {
    let componentName = path.basename(p).split('.')[0];

    return `import { ${componentName} } from '${packageName}';`;
  },
  propsParser: require('react-docgen-typescript').withCustomConfig(
    './tsconfig.json',
  ).parse,
  webpackConfig: {
    module: {
      rules: [
        {
          test: /\.(t|j)sx?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json'],
      alias: {
        [packageName]: path.resolve(__dirname, 'src'),
      },
    },
    devtool: 'source-map',
    devServer: {
      compress: true,
      https: true,
    },
  },
};
