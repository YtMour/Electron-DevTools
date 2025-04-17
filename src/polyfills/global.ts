// 为Node.js模块在浏览器中运行提供polyfill

// 定义global变量
if (typeof window !== 'undefined' && !window.global) {
  (window as any).global = window;
}

// 定义process.env变量
if (typeof window !== 'undefined' && !window.process) {
  (window as any).process = {
    env: {
      NODE_ENV: import.meta.env.MODE, // Vite环境模式
    },
    browser: true,
    version: '',
    versions: { node: '' },
    platform: 'browser',
    nextTick(cb: (...args: any[]) => void, ...args: any[]) {
      setTimeout(() => cb(...args), 0);
    },
  };
}

// 定义Buffer变量
if (typeof window !== 'undefined' && !window.Buffer) {
  (window as any).Buffer = {
    isBuffer: () => false,
  };
}

export default {}; 