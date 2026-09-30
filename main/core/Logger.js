export class Logger {
  static prefix = '[RewriteAI]';

  static log(...args) {
    console.log(this.prefix, ...args);
  }

  static warn(...args) {
    console.warn(this.prefix, ...args);
  }

  static error(...args) {
    console.error(this.prefix, ...args);
  }
}
