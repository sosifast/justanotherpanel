'use client';

import { useEffect, useRef } from 'react';

type ScriptsInjectorProps = {
    headerCode?: string | null;
    footerCode?: string | null;
};

export default function ScriptsInjector({ headerCode, footerCode }: ScriptsInjectorProps) {
    const headerRef = useRef(false);
    const footerRef = useRef(false);

    useEffect(() => {
        if (headerCode && !headerRef.current) {
            headerRef.current = true;
            try {
                const temp = document.createElement('div');
                temp.innerHTML = headerCode.trim();
                const elements = Array.from(temp.childNodes);

                elements.forEach((node) => {
                    // If it's a script tag, we need to recreate it to make it execute
                    if (node.nodeName === 'SCRIPT') {
                        const script = document.createElement('script');
                        const nodeScript = node as HTMLScriptElement;
                        Array.from(nodeScript.attributes).forEach(attr => {
                            script.setAttribute(attr.name, attr.value);
                        });
                        if (nodeScript.innerHTML) {
                            script.innerHTML = nodeScript.innerHTML;
                        }
                        document.head.appendChild(script);
                    } else {
                        document.head.appendChild(node.cloneNode(true));
                    }
                });
            } catch (e) {
                console.error('Error injecting header code', e);
            }
        }

        if (footerCode && !footerRef.current) {
            footerRef.current = true;
            try {
                const temp = document.createElement('div');
                temp.innerHTML = footerCode.trim();
                const elements = Array.from(temp.childNodes);

                elements.forEach((node) => {
                    // If it's a script tag, we need to recreate it to make it execute
                    if (node.nodeName === 'SCRIPT') {
                        const script = document.createElement('script');
                        const nodeScript = node as HTMLScriptElement;
                        Array.from(nodeScript.attributes).forEach(attr => {
                            script.setAttribute(attr.name, attr.value);
                        });
                        if (nodeScript.innerHTML) {
                            script.innerHTML = nodeScript.innerHTML;
                        }
                        document.body.appendChild(script);
                    } else {
                        document.body.appendChild(node.cloneNode(true));
                    }
                });
            } catch (e) {
                console.error('Error injecting footer code', e);
            }
        }
    }, [headerCode, footerCode]);

    return null;
}
