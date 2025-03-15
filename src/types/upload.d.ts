import type { UploadFile, UploadFiles } from 'element-plus'

export interface CustomFile extends File {
  uid: number
}

export type UploadChangeHandler = (uploadFile: UploadFile, uploadFiles: UploadFiles) => void 