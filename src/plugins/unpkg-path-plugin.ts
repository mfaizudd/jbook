import * as esbuild from 'esbuild-wasm';

export const unpkgPathPlugin = () => {
    return {
        name: 'unpkg-path-plugin',
        setup(build: esbuild.PluginBuild) {

            // Handle index.js
            build.onResolve({ filter: /(^index\.js$)/ }, (args: any) => {
                return { path: args.path, namespace: 'a' };
            });

            // Handle relative path
            build.onResolve({ filter: /^\.+\// }, (args: any) => {
                return {
                    path: new URL(args.path, `https://unpkg.com${args.resolveDir}/`).href,
                    namespace: 'a',
                };
            });

            // Handle main file of a module
            build.onResolve({ filter: /.*/ }, async (args: any) => {
                const unpkgPath = `https://unpkg.com/${args.path}`;
                return { path: unpkgPath, namespace: 'a' };
            })
        },
    };
};