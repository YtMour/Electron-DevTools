<template>
  <div ref="editorContainer" class="monaco-editor-container"></div>
</template>

<script lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, defineComponent } from 'vue';
import * as monaco from 'monaco-editor';

// 配置Monaco编辑器Worker
// 在Vite/Electron环境中正确处理Worker文件
window.MonacoEnvironment = {
  getWorkerUrl(moduleId: string, label: string): string {
    // 在开发环境中，worker文件路径需要特殊处理
    const baseUrl = '/node_modules/monaco-editor/esm/vs';

    if (label === 'json') {
      return `${baseUrl}/language/json/json.worker.js`;
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return `${baseUrl}/language/css/css.worker.js`;
    }
    if (label === 'html' || label === 'xml') {
      return `${baseUrl}/language/html/html.worker.js`;
    }
    if (label === 'typescript' || label === 'javascript') {
      return `${baseUrl}/language/typescript/ts.worker.js`;
    }
    
    return `${baseUrl}/editor/editor.worker.js`;
  }
};

// 接口定义
interface EditorMarker {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
  severity: number;
}

export default defineComponent({
  name: 'MonacoEditor',
  props: {
    value: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: 'javascript'
    },
    theme: {
      type: String,
      default: 'vs-dark'
    },
    options: {
      type: Object,
      default: () => ({})
    },
    markers: {
      type: Array as () => EditorMarker[],
      default: () => []
    }
  },
  emits: ['update:value', 'change'],
  setup(props, { emit }) {
    // 组件状态
    const editorContainer = ref<HTMLElement | null>(null);
    let editor: monaco.editor.IStandaloneCodeEditor | null = null;
    let contentChanged = false;

    // 监听值变化
    watch(() => props.value, (newValue) => {
      if (editor && !contentChanged) {
        const currentValue = editor.getValue();
        if (newValue !== currentValue) {
          editor.setValue(newValue);
        }
      }
      contentChanged = false;
    }, { deep: true });

    // 监听标记变化
    watch(() => props.markers, (newMarkers) => {
      if (editor) {
        try {
          monaco.editor.setModelMarkers(
            editor.getModel()!,
            'validation',
            newMarkers as monaco.editor.IMarkerData[]
          );
        } catch (error) {
          console.warn('Failed to set markers:', error);
        }
      }
    }, { deep: true });

    // 初始化编辑器
    onMounted(() => {
      // 注册YAML语言支持
      if (!monaco.languages.getLanguages().some(lang => lang.id === 'yaml')) {
        monaco.languages.register({ id: 'yaml' });
        monaco.languages.setMonarchTokensProvider('yaml', {
          tokenizer: {
            root: [
              [/^[\t ]*[A-Za-z_\-0-9]+\s*:/, 'keyword'],
              [/^[\t ]*-\s*/, 'keyword'],
              [/(?:true|false|null|1[eE][+-]?\d+|0[xX][0-9a-fA-F]+|0[oO][0-7]+)/, 'type'],
              [/[^#"']+/, 'string'],
              [/"[^"]*"/, 'string'],
              [/'[^']*'/, 'string'],
              [/#.*$/, 'comment'],
            ]
          }
        });
      }
      
      // 注册TOML语言支持
      if (!monaco.languages.getLanguages().some(lang => lang.id === 'toml')) {
        monaco.languages.register({ id: 'toml' });
        monaco.languages.setMonarchTokensProvider('toml', {
          tokenizer: {
            root: [
              // 键值对
              [/^[\t ]*[A-Za-z_\-0-9.]+\s*=/, 'keyword'],
              // 段落标题 [section] 或 [[array]]
              [/^\s*\[\[?[^\]]+\]\]?/, 'keyword.section'],
              // 字符串
              [/"(?:\\.|[^"\\])*"/, 'string'],
              [/'(?:\\.|[^'\\])*'/, 'string'],
              [/"""[\s\S]*?"""/, 'string.multiline'],
              [/'''[\s\S]*?'''/, 'string.multiline'],
              // 数值
              [/(?:true|false)/, 'keyword.constant'],
              [/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})/, 'number.date'],
              [/\d{4}-\d{2}-\d{2}/, 'number.date'],
              [/\d{2}:\d{2}:\d{2}(?:\.\d+)?/, 'number.date'],
              [/[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/, 'number'],
              [/0x[0-9a-fA-F]+/, 'number.hex'],
              [/0o[0-7]+/, 'number.octal'],
              [/0b[01]+/, 'number.binary'],
              // 数组
              [/\[/, 'delimiter.array'],
              [/\]/, 'delimiter.array'],
              // 注释
              [/#.*$/, 'comment'],
            ]
          }
        });
      }

      // 设置默认选项
      const defaultOptions = {
        value: props.value,
        language: props.language,
        theme: props.theme,
        automaticLayout: true,
        tabSize: 2,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on' as const,
        lineNumbersMinChars: 3, // 减少行号栏宽度
        folding: true,
        renderLineHighlight: 'all' as const,
        fontSize: 13,
        fontFamily: 'Consolas, "Courier New", monospace',
      };

      // 合并选项
      const options = {
        ...defaultOptions,
        ...props.options
      };

      try {
        // 创建编辑器
        if (editorContainer.value) {
          editor = monaco.editor.create(editorContainer.value, options);

          // 监听内容变化
          editor.onDidChangeModelContent(() => {
            if (editor) {
              const value = editor.getValue();
              contentChanged = true;
              emit('update:value', value);
              emit('change', value);
            }
          });

          // 设置初始标记
          if (props.markers.length > 0) {
            try {
              monaco.editor.setModelMarkers(
                editor.getModel()!,
                'validation',
                props.markers as monaco.editor.IMarkerData[]
              );
            } catch (error) {
              console.warn('Failed to set initial markers:', error);
            }
          }
          
          // 强制布局更新
          setTimeout(() => {
            editor?.layout();
          }, 100);
        }
      } catch (error) {
        console.error('Failed to initialize Monaco Editor:', error);
      }
    });

    // 监听窗口大小变化，重新布局编辑器
    const handleResize = () => {
      if (editor) {
        editor.layout();
      }
    };

    window.addEventListener('resize', handleResize);

    // 组件销毁前清理
    onBeforeUnmount(() => {
      // 移除窗口大小变化监听
      window.removeEventListener('resize', handleResize);
      
      if (editor) {
        editor.dispose();
        editor = null;
      }
    });

    return {
      editorContainer
    };
  }
});
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

/* 确保编辑器内部滚动条正常工作 */
:deep(.monaco-editor) {
  overflow: visible !important;
}

:deep(.monaco-editor .overflow-guard) {
  border-radius: 4px;
}

:deep(.monaco-editor, .monaco-editor-background) {
  background-color: var(--el-bg-color);
}

/* 自定义行号样式，减少宽度 */
:deep(.monaco-editor .margin-view-overlays .line-numbers) {
  width: auto !important;
  min-width: 2ch !important;
  padding-right: 4px;
}

/* 自定义滚动条样式 */
:deep(.monaco-scrollable-element > .scrollbar) {
  /* 滚动条基础样式 */
  background-color: transparent !important;
}

/* 滚动条滑块样式 */
:deep(.monaco-scrollable-element > .scrollbar > .slider) {
  background: rgba(100, 100, 100, 0.4) !important;
  border-radius: 6px !important;
  transition: background 0.2s ease;
}

/* 鼠标悬停时滚动条颜色变化 */
:deep(.monaco-scrollable-element > .scrollbar:hover > .slider) {
  background: rgba(100, 100, 100, 0.7) !important;
}

/* 滚动条按下时的样式 */
:deep(.monaco-scrollable-element > .scrollbar > .slider.active) {
  background: rgba(100, 100, 100, 0.8) !important;
}

/* 调整垂直滚动条宽度 */
:deep(.monaco-scrollable-element > .scrollbar.vertical) {
  width: 12px !important;
}

/* 调整水平滚动条高度 */
:deep(.monaco-scrollable-element > .scrollbar.horizontal) {
  height: 12px !important;
}

/* 调整滚动条轨道的内边距，使滑块看起来更小 */
:deep(.monaco-scrollable-element > .scrollbar.vertical > .slider) {
  width: 6px !important;
  left: 3px !important;
}

:deep(.monaco-scrollable-element > .scrollbar.horizontal > .slider) {
  height: 6px !important;
  top: 3px !important;
}
</style> 