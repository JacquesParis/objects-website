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
      if ('true' === document.querySelector('script[src="' + url + '"]').getAttribute('data-loading')) {
        return new Promise((resolve, reject) => {
          document.querySelector('script[src="' + url + '"]').addEventListener(
            'load',
            () => {
              window.setTimeout(() => {
                resolve(true);
              });
            },
            false,
          );
        });
      } else {
        return true;
      }
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.setAttribute('src', url);
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('data-loading', 'true');

      script.addEventListener(
        'load',
        () => {
          document.querySelector('script[src="' + url + '"]').setAttribute('data-loading', 'false');
          window.setTimeout(() => {
            resolve(true);
          });
        },
        false,
      );

      document.head.appendChild(script);
    });
  }
  private httpGetAsync(theUrl, callback) {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = () => {
      if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
        callback(xmlHttp.responseText);
      }
    };
    xmlHttp.open('GET', theUrl, true); // true for asynchronous
    xmlHttp.send(null);
  }

  public async loadJson(url): Promise<any> {
    if ('loadJson_' + url in (window as any).loadedObjects) {
      return (window as any).loadedObjects['loadJson_' + url];
    }
    return new Promise((resolve, reject) => {
      this.httpGetAsync(url, response => {
        (window as any).loadedObjects['loadJson_' + url] = JSON.parse(response);
        resolve((window as any).loadedObjects['loadJson_' + url]);
      });
    });
  }

  public async loadPopup(uri): Promise<string> {
    if ('loadPopup_' + uri in (window as any).loadedObjects) {
      return (window as any).loadedObjects['loadPopup_' + uri];
    }
    const popupTemplate = await this.loadJson(uri);

    let popup = popupTemplate.text;
    for (const id in popupTemplate.uris) {
      popup = popup.replace(
        new RegExp(id, 'g'),
        // eslint-disable-next-line no-undef
        (window as any).getPageHref({
          treeNode: {
            id: popupTemplate.uris[id].pageId,
            name: popupTemplate.uris[id].pageName,
          },
        }),
      );
    }
    (window as any).loadedObjects['loadPopup_' + uri] = popup;
    return popup;
  }

  public async getAjaxContent(
    objectTreesService: {getCachedOrRemoteObjectById: (treeId: string) => Promise<IObjectTree>},
    objectNodesService: {getCachedOrRemoteObjectById: (nodeId: string) => Promise<IObjectNode>},
    hrefBuilder: {
      getPageHref: (page: IObjectTree) => string;
      getAdminHref: (page: IObjectTree) => string;
      getPopupHref: (page: IObjectTree) => string;
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

  public async getTemplateContent(
    objectTreesService: {getCachedOrRemoteObjectById: (treeId: string) => Promise<IObjectTree>},
    objectNodesService: {getCachedOrRemoteObjectById: (nodeId: string) => Promise<IObjectNode>},
    hrefBuilder: {
      getServerUri: (uri: string) => string;
      getPageHref: (page: IObjectTree) => string;
      getAdminHref: (page: IObjectTree) => string;
      getPopupHref: (page: IObjectTree) => string;
    },
    siteTreeId: string,
    pageTreeId?: string,
    dataTreeId?: string,
    templateTreeId?: string,
  ): Promise<string> {
    if (!(window as any).websiteInitialized) {
      (window as any).websiteInitialized = true;
      (window as any).loadedObjects = {};
      (window as any).loadScript = (uri): Promise<boolean> => {
        return this.loadScript(hrefBuilder.getServerUri(uri));
      };
      (window as any).loadStyle = (uri): Promise<boolean> => {
        return this.loadStyle(hrefBuilder.getServerUri(uri));
      };
      (window as any).loadJson = (uri): Promise<any> => {
        return this.loadJson(hrefBuilder.getServerUri(uri));
      };
      (window as any).loadPopup = (uri): Promise<string> => {
        return this.loadPopup(hrefBuilder.getServerUri(uri));
      };
      (window as any).getPageHref = (page: IObjectTree): string => {
        return hrefBuilder.getPageHref(page);
      };
      (window as any).getAdminHref = (page: IObjectTree): string => {
        return hrefBuilder.getAdminHref(page);
      };
      (window as any).getPopupHref = (page: IObjectTree): string => {
        return hrefBuilder.getPopupHref(page);
      };
      (window as any).getServerUri = (uri): string => {
        return hrefBuilder.getServerUri(uri);
      };
    }

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
