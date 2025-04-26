<template>
  <div class="network-page">
    <router-view />
  </div>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.network-page {
  margin: 0 auto;
  max-width: 1280px;
  padding: 0 16px;
  
  .page-header {
    margin-bottom: 32px;
    
    .header-title {
      margin-bottom: 16px;
      
      h2 {
        font-size: 28px;
        font-weight: 600;
        color: var(--el-color-primary);
        margin: 0 0 8px 0;
      }
      
      .header-desc {
        font-size: 16px;
        color: var(--el-text-color-secondary);
        margin: 0;
        line-height: 1.5;
      }
    }
  }
  
  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
    
    .tool-card {
      height: 100%;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      border-radius: 12px;
      border: 1px solid var(--el-border-color-lighter);
      overflow: hidden;
      
      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        border-color: var(--el-color-primary-light-7);
      }
      
      .el-card__body {
        padding: 0;
      }
      
      .tool-content {
        padding: 20px;
        
        .tool-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: var(--el-color-primary-light-9);
          margin-bottom: 16px;
          
          .el-icon {
            font-size: 24px;
            color: var(--el-color-primary);
          }
        }
        
        .tool-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: var(--el-text-color-primary);
        }
        
        .tool-desc {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          margin: 0 0 20px 0;
          line-height: 1.5;
          min-height: 42px;
        }
      }
    }
  }
  
  .section-divider {
    margin: 40px 0;
    border-top: 1px solid var(--el-border-color-lighter);
  }
  
  @media screen and (max-width: 767px) {
    .page-header {
      margin-bottom: 24px;
      
      .header-title {
        h2 {
          font-size: 24px;
        }
        
        .header-desc {
          font-size: 14px;
        }
      }
    }
    
    .tools-grid {
      grid-template-columns: 1fr;
      gap: 16px;
      margin-bottom: 32px;
      
      .tool-card {
        &:hover {
          transform: translateY(-4px);
        }
        
        .tool-content {
          padding: 16px;
          
          .tool-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 12px;
            
            .el-icon {
              font-size: 20px;
            }
          }
          
          .tool-title {
            font-size: 16px;
            margin-bottom: 6px;
          }
          
          .tool-desc {
            font-size: 13px;
            margin-bottom: 16px;
            min-height: auto;
          }
        }
      }
    }
  }
}
</style> 