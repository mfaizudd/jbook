import * as esbuild from 'esbuild-wasm';
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { fetchPlugin } from './plugins/fetch-plugin';
import { unpkgPathPlugin } from './plugins/unpkg-path-plugin';

const App = () => {
    const [input, setInput] = useState('');
    const [code, setCode] = useState('');
    const ref = useRef<esbuild.Service>();

    const startService = async () => {
        ref.current = await esbuild.startService({
            worker: true,
            wasmURL: 'https://unpkg.com/esbuild-wasm/esbuild.wasm'
        });
    };

    useEffect(() => {
        startService();
    }, []);

    const onClick = async () => {
        if (!ref.current) {
            return;
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

        // console.log(result);
        
        setCode(result.outputFiles[0].text);
    };

    return (
        <div>
            <textarea value={input} onChange={e=>setInput(e.target.value)}></textarea>
            <div>
                <button onClick={onClick} type="submit">Submit</button>
            </div>
            <pre>
                {code}
            </pre>
            <iframe sandbox='' src="/index.html" title='sandbox'>

            </iframe>
        </div>
    );
};

ReactDOM.render(
    <App />,
    document.querySelector("#root")
);
