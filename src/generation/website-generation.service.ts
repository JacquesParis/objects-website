import {IObjectNode, IObjectTree} from '@jacquesparis/objects-model';
import {AjaxResult} from './ajax-result';
import {AjaxGeneratedResult} from './ajax-generated-result';
export class WebsiteGenerationService {
  private static _instance = new WebsiteGenerationService();
  public static get(): WebsiteGenerationService {
    return WebsiteGenerationService._instance;
  }
  private constructor() {}

  public async loadStyle(url): Promise<boolean> {
    if (document.querySelector('link[href="' + url + '"]')) {
      return true;
    }
    return new Promise(resolve => {
      const link = document.createElement('link');
      link.setAttribute('href', url);
      link.setAttribute('rel', 'stylesheet');
      link.addEventListener(
        'load',
        () => {
          window.setTimeout(() => {
            resolve(true);
          });
        },
        false,
      );
      document.head.appendChild(link);
    });
  }

  public async loadScript(url): Promise<boolean> {
    if (document.querySelector('script[src="' + url + '"]')) {
      return true;
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.setAttribute('src', url);
      script.setAttribute('type', 'text/javascript');

      script.addEventListener(
        'load',
        () => {
          window.setTimeout(() => {
            resolve(true);
          });
        },
        false,
      );

      document.head.appendChild(script);
    });
  }

  public async getAjaxContent(
    objectTreesService: {getCachedOrRemoteObjectById: (treeId: string) => Promise<IObjectTree>},
    objectNodesService: {getCachedOrRemoteObjectById: (nodeId: string) => Promise<IObjectNode>},
    hrefBuilder: {
      getPageHref: (page: IObjectTree) => string;

      getAdminHref: (page: IObjectTree) => string;
    },
    siteTreeId: string,
    pageTreeId?: string,
    dataTreeId?: string,
    templateTreeId?: string,
  ): Promise<AjaxResult> {
    const genericObject: AjaxGeneratedResult = new AjaxGeneratedResult();

    try {
      await genericObject.init(
        objectTreesService,
        objectNodesService,
        hrefBuilder,
        siteTreeId,
        pageTreeId,
        dataTreeId,
        templateTreeId,
      );
    } catch (error) {
      throw Error('unable to init template');
    }

    return genericObject.generate();
  }

  public async getTamplateContent(
    objectTreesService: {getCachedOrRemoteObjectById: (treeId: string) => Promise<IObjectTree>},
    objectNodesService: {getCachedOrRemoteObjectById: (nodeId: string) => Promise<IObjectNode>},
    hrefBuilder: {
      getServerUri: (uri: string) => string;
      getPageHref: (page: IObjectTree) => string;
      getAdminHref: (page: IObjectTree) => string;
    },
    siteTreeId: string,
    pageTreeId?: string,
    dataTreeId?: string,
    templateTreeId?: string,
  ): Promise<string> {
    (window as any).loadScript = uri => {
      return this.loadScript(hrefBuilder.getServerUri(uri));
    };
    (window as any).loadStyle = uri => {
      return this.loadStyle(hrefBuilder.getServerUri(uri));
    };

    const ajaxResult: AjaxResult = await this.getAjaxContent(
      objectTreesService,
      objectNodesService,
      hrefBuilder,
      siteTreeId,
      pageTreeId,
      dataTreeId,
      templateTreeId,
    );
    if (ajaxResult.hasCss()) {
      for (const cssId in ajaxResult.css) {
        if (!document.querySelector('style[data-template-id="css.' + cssId + '"]')) {
          const style = document.createElement('style');
          style.setAttribute('data-template-id', 'css.' + cssId);
          style.setAttribute('type', 'text/css');
          style.appendChild(document.createTextNode(ajaxResult.css[cssId]));
          document.head.appendChild(style);
        }
      }
    }
    if (ajaxResult.hasHeaderScripts()) {
      for (const scriptId in ajaxResult.headerScripts) {
        if (!document.querySelector('script[data-template-id="script.header.' + scriptId + '"]')) {
          const script = document.createElement('script');
          script.setAttribute('data-template-id', 'script.header.' + scriptId);
          script.setAttribute('type', 'text/javascript');
          script.appendChild(document.createTextNode(ajaxResult.headerScripts[scriptId]));
          document.head.appendChild(script);
        }
      }
    }
    if (ajaxResult.hasFooterScripts()) {
      for (const scriptId in ajaxResult.footerScripts) {
        if (!document.querySelector('script[data-template-id="script.footer.' + scriptId + '"]')) {
          const script = document.createElement('script');
          script.setAttribute('data-template-id', 'script.footer.' + scriptId);
          script.setAttribute('type', 'text/javascript');
          script.appendChild(document.createTextNode(ajaxResult.footerScripts[scriptId]));
          document.body.appendChild(script);
        }
      }
    }
    return ajaxResult.body;
  }
}
