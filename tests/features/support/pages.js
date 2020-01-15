const { url } = require('../config/nightwatch.conf.js').test_settings.default.globals;

const pages = {
  '"Hammerflügel" record page': `${url}/en/record/09102/_GNM_693983`,
  '"Het laatste avondmaal" record page': `${url}/en/record/90402/RP_P_OB_70_879`,
  '"The Milkmaid" record page': `${url}/en/record/90402/SK_A_2344`,
  '"The pride of Glencoe, song" record page': `${url}/en/record/2059213/data_sounds_455`,
  '"World War I" entity page': `${url}/en/entity/topic/83-world-war-i`,
  'blog page': `${url}/en/blog`,
  'English home page': `${url}/en`,
  'entity page': `${url}/en/entity/topic/18-newspaper`,
  'exhibition chapter': `${url}/en/exhibition/the-pink-flowers/allium`,
  'exhibition page': `${url}/en/exhibition/the-pink-flowers`,
  'exhibitions page': `${url}/en/exhibitions`,
  'Fashion collection search page': `${url}/en/search?query=&theme=fashion`,
  'first page of results': `${url}/en/search?query=&page=1`,
  'home page': `${url}/en`,
  'Newspapers collection page': `${url}/en/entity/topic/18-newspaper`,
  'record page with a IIIF Image': `${url}/en/record/9200357/BibliographicResource_3000095247457`,
  'record page with a IIIF Presentation': `${url}/en/record/9200301/BibliographicResource_3000126341277`,
  'record page without isShownBy or hasView': `${url}/en/record/9200102/BibliographicResource_3000134083514`,
  'record page': `${url}/en/record/09102/_GNM_693983`,
  'search page': `${url}/en/search?query=`,
  'Swedish home page': `${url}/sv`
};

module.exports = {
  pageUrl(pageName) {
    return pageName.startsWith('/') ? `${url}${pageName}` : pages[pageName];
  }
};
