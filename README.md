
A script to generate a `index.[tj]s` file that re-exports from other `[tj]s` files in the folder.
The output follows `ESMoule` syntax rather than `CommonJS`.

## Install
```bash
npm i -g xported
```


## Usage
`cd your/working/dir && xported`

The default compiler option is the following:
`
--allowJs --module commonjs --esModuleInterop --moduleResolution node --target ES2019
`
more options can be added via the `-c` option.

e.g.

`xported -c "--experimentalDecorators"`


**NB**
Do not overwrite the existing compiler options.

### Available options:
```
 -e,--ext                                           '.js' | '.ts', default to '.ts'.
 -c,--compilerOption                                 Extra tsc compilerOption.
```
