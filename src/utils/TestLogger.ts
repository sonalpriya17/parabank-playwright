const DEBUG = !!process.env.DEBUG;

export class TestLogger {
  static log(tag: string, message: string): void {
    if (DEBUG) {
      console.log(`[${tag}] ${message}`);
    }
  }

  static warn(tag: string, message: string): void {
    console.warn(`[${tag}] ${message}`);
  }
}
