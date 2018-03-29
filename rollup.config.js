import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';

const env = process.env.NODE_ENV;
const config = {
  input: 'src/index.js',
  plugins: [
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'node_modules/react/react.js': ['default'],
      },
    }),
  ],
};

if (env === 'es' || env === 'cjs') {
  config.output = { format: env };
  config.plugins.push(
    babel({
      plugins: ['external-helpers'],
    })
  );
}

if (env === 'development' || env === 'production') {
  config.output = { format: 'umd', name: 'SRU' };
  config.plugins.push(
    nodeResolve({
      jsnext: true,
      preferBuiltins: true,
      module: true,
    }),
    replace({ 'process.env.NODE_ENV': JSON.stringify(env) })
  );
  config.plugins.push(babel({ plugins: ['external-helpers'] }));
}

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
