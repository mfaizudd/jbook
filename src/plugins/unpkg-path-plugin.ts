import * as esbuild from 'esbuild-wasm';
import axios from 'axios';
import localforage from 'localforage';

const fileCache = localforage.createInstance({
    name: "filecache",
});

export const unpkgPathPlugin = (inputCode: string) => {
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

            build.onLoad({ filter: /.*/ }, async (args: any) => {
                console.log('onLoad', args);
                if (args.path === 'index.js') {
                    return {
                        loader: 'jsx',
                        contents: inputCode,
                    };
                }
                const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
                if (cachedResult) {
                    return cachedResult;
                }
                const { data, request } = await axios.get(args.path);
                const result: esbuild.OnLoadResult = {
                    loader: 'jsx',
                    contents: data,
                    resolveDir: new URL('./', request.responseURL).pathname
                };
                await fileCache.setItem(args.path, result);

                return result;
            });
        },
    };
};