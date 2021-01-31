export class AjaxResult {
  public headerScripts: {[scriptId: string]: string} = {};
  public footerScripts: {[scriptId: string]: string} = {};
  public css: {[cssId: string]: string} = {};
  public body = '';

  protected values(obj: object): any[] {
    const result = [];
    for (const key in obj) {
      result.push(obj[key]);
    }
    return result;
  }

  public headerScriptsArray() {
    return this.values(this.headerScripts);
  }
  public footerScriptsArray() {
    return this.values(this.footerScripts);
  }
  public cssArray() {
    return this.values(this.css);
  }
  public hasHeaderScripts(): boolean {
    return this.headerScripts && 0 < Object.keys(this.headerScripts).length;
  }
  public hasFooterScripts(): boolean {
    return this.footerScripts && 0 < Object.keys(this.footerScripts).length;
  }
  public hasCss(): boolean {
    return this.css && 0 < Object.keys(this.css).length;
  }
}
