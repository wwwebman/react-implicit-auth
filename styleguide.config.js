const path = require('path');
const { name: packageName, version, description } = require('./package.json');
const { theme, styles } = require('./styleguide/styles');

module.exports = {
  title: description,
  pagePerSection: true,
  version,
  theme,
  styles,
  skipComponentsWithoutExample: true,
  sections: [
    {
      components: 'src/components/**/*.{jsx,tsx,ts,js}',
      content: 'README.md',
      exampleMode: 'expand',
      pagePerSection: true,
      sectionDepth: 1,
      usageMode: 'expand',
    },
  ],
  styleguideDir: './docs',
  styleguideComponents: {
    StyleGuideRenderer: path.join(
      __dirname,
      'styleguide/rsg/StyleGuideRenderer',
    ),
  },
  getComponentPathLine(p) {
    let componentName = path.basename(p).split('.')[0];

    if (componentName === 'Methods') {
      return '';
    }

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
        }
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
