import {AjaxResult} from './ajax-result';
import {AjaxGeneratedResult} from './ajax-generated-result';
declare var console;
export class WebsiteGenerationService {
  private static _instance = new WebsiteGenerationService();
  public static get(): WebsiteGenerationService {
    return WebsiteGenerationService._instance;
  }
  private constructor() {}
  public ping() {
    console.log('ping');
  }

  public async getAjaxContent(
    siteTreeId: string,
    pageTreeId?: string,
    dataTreeId?: string,
    templateTreeId?: string,
  ): Promise<AjaxResult> {
    const genericObject: AjaxGeneratedResult = new AjaxGeneratedResult();

    try {
      await genericObject.init(siteTreeId, pageTreeId, dataTreeId, templateTreeId);
    } catch (error) {
      throw Error('unable to init template');
    }

    return genericObject.generate();
  }
}
