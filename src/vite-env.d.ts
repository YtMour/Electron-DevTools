/// <reference types="vite/client" />

// 扩展Window接口，添加Monaco编辑器环境
interface Window {
  MonacoEnvironment?: {
    getWorkerUrl(moduleId: string, label: string): string;
  };
}

// 声明Vue组件的类型
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 声明html-to-pdfmake模块
declare module 'html-to-pdfmake' {
  export default function htmlToPdfmake(html: string, options?: any): any;
}
