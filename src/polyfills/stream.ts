// 浏览器环境下的stream模块polyfill

import { EventEmitter } from './events';

// 创建一个基本的Readable流
class Readable extends EventEmitter {
  _read() {}
  pipe(dest: any) {
    return dest;
  }
  push(chunk: any) {
    if (chunk === null) {
      this.emit('end');
    } else {
      this.emit('data', chunk);
    }
    return true;
  }
}

// 创建一个基本的Writable流
class Writable extends EventEmitter {
  _write(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
    callback();
  }
  write(chunk: any) {
    this.emit('data', chunk);
    return true;
  }
  end(chunk?: any) {
    if (chunk) {
      this.write(chunk);
    }
    this.emit('finish');
    return this;
  }
}

// 创建一个基本的Transform流
class Transform extends Writable {
  _transform(chunk: any, encoding: string, callback: (error?: Error | null, data?: any) => void) {
    callback(null, chunk);
  }
  _flush(callback: (error?: Error | null, data?: any) => void) {
    callback();
  }
  push(chunk: any) {
    if (chunk === null) {
      this.emit('end');
    } else {
      this.emit('data', chunk);
    }
    return true;
  }
}

// 创建一个基本的PassThrough流
class PassThrough extends Transform {}

// 导出类和实用函数
export {
  Readable,
  Writable,
  Transform,
  PassThrough
};

// 默认导出
export default {
  Readable,
  Writable,
  Transform,
  PassThrough,
  Stream: EventEmitter
};

// 导出事件发射器作为Stream基类
export const Stream = EventEmitter; 