import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';

const env = process.env.NODE_ENV;
const config = {
  input: 'src/index.js',
  output: { format: 'umd', name: 'SRU' },
  plugins: [
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/react/react.js': ['default'],
      },
    }),
    nodeResolve({
      jsnext: true,
      preferBuiltins: true,
      module: true,
    }),
    replace({ 'process.env.NODE_ENV': JSON.stringify(env) }),
    babel({}),
  ],
};

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
    })
  );
}

export default config;
