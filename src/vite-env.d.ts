/// <reference types="vite/client" />

// 扩展Window接口，添加Monaco编辑器环境
interface Window {
  MonacoEnvironment?: {
    getWorkerUrl(moduleId: string, label: string): string;
  };
}
