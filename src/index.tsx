import * as esbuild from 'esbuild-wasm';
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import CodeEditor from './components/code-editor';
import { fetchPlugin } from './plugins/fetch-plugin';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';

const App = () => {
    const iframe = useRef<HTMLIFrameElement>(null)
    const [input, setInput] = useState('');
    const ref = useRef<esbuild.Service>();

    const startService = async () => {
        ref.current = await esbuild.startService({
            worker: true,
            wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
        });
    };

    useEffect(() => {
        startService();
    }, []);

    const onClick = async () => {
        if (!ref.current) {
            return;
        }

        if (iframe.current) {
            iframe.current.srcdoc = html;
        }

        const result = await ref.current.build({
            entryPoints: ['index.js'],
            bundle: true,
            write: false,
            plugins: [unpkgPathPlugin(), fetchPlugin(input)],
            define: {
                'process.env.NODE_ENV': '"production"',
                global: 'window'
            }
        });

        iframe.current?.contentWindow?.postMessage(result.outputFiles[0].text, '*');
    };
    const html = `
        <html>
            <head></head>
            <body>
                <div id="root"></div>
                <script>
                    window.addEventListener('message', e => {
                        try {
                            eval(e.data);
                        } catch(err) {
                            const root = document.querySelector('#root');
                            root.innerHTML = '<div style="color:red"><h1>Runtime error:</h1>'+err+'</div>';
                            throw err;
                        }
                    }, false);
                </script>
            </body>
        </html>
    `;

    return (
        <div>
            <CodeEditor />
            <textarea value={input} onChange={e => setInput(e.target.value)}></textarea>
            <div>
                <button onClick={onClick} type="submit">Submit</button>
            </div>
            <iframe ref={iframe} sandbox='allow-scripts' srcDoc={html} title='sandbox' />
        </div>
    );
};


ReactDOM.render(
    <App />,
    document.querySelector("#root")
);
