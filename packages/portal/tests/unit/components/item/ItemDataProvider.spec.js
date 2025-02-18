
import { createLocalVue, mount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import VueI18n from 'vue-i18n';
import ItemDataProvider from '@/components/item/ItemDataProvider';
import sinon from 'sinon';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(VueI18n);

import messages from '@/lang/en';

const i18n = new VueI18n({
  locale: 'en',
  messages: {
    en: messages
  }
});

const dataProvider = {
  en: ['Example organisation'],
  nl: ['Voorbeeld organisatie']
};

const dataProviderEntity = {
  id: 'http://data.europeana.eu/organization/002',
  prefLabel: {
    en: 'Example organisation',
    nl: 'Voorbeeld organisatie'
  },
  type: 'Organization',
  logo: {
    id: 'http://example.com/logo_url.jpg'
  }
};

const factory = (propsData) => mount(ItemDataProvider, {
  localVue,
  propsData,
  i18n,
  mocks: {
    $t: (key) => key,
    localePath: () => 'localizedPath',
    $apis: {
      entity: {
        imageUrl: (entity) => entity.logo.id
      }
    },
    $link: {
      to: route => route,
      href: () => null
    },
    getPrefLanguage: sinon.stub()
  }
});

describe('components/item/ItemDataProvider', () => {
  describe('when the provider is present as an entity', () => {
    it('displays the data provider attribution', () => {
      const wrapper = factory({ dataProviderEntity });

      const attribution = wrapper.find('[data-qa="data provider attribution"]');

      expect(attribution.exists()).toBe(true);
    });

    it('displays the data provider badge', () => {
      const wrapper = factory({ dataProviderEntity });

      const badge = wrapper.find('[data-qa="data provider badge"]');

      expect(badge.exists()).toBe(true);
    });
  });

  describe('when the provider is present as a langmap', () => {
    it('displays the data provider attribution', () => {
      const wrapper = factory({ dataProvider });

      const attribution = wrapper.find('[data-qa="data provider attribution"]');

      expect(attribution.exists()).toBe(true);
    });

    it('displays the data provider name', () => {
      const wrapper = factory({ dataProvider });

      const name = wrapper.find('[data-qa="data provider name"]');

      expect(name.exists()).toBe(true);
    });
  });

  describe('when there is NO displayable dataProvider data', () => {
    it('does not display the  attribution', () => {
      const wrapper = factory({ dataProvider: null });

      const attribution = wrapper.find('[data-qa="data provider attribution"]');

      expect(attribution.exists()).toBe(false);
    });
  });

  describe('computed', () => {
    describe('namePrefLanguage', () => {
      it('gets the pref language using the getPrefLanguage mixin', async()  => {
        const wrapper = factory({});
        sinon.spy(wrapper.vm, 'getPrefLanguage');

        await wrapper.setProps({ dataProvider });

        expect(wrapper.vm.getPrefLanguage.calledWith('edmDataProvider', { def: [{ prefLabel: dataProvider }] })).toBe(true);
      });
    });

    describe('displayName', () => {
      it('does a lang map for locale lookup on the name', () => {
        const wrapper = factory({ dataProvider, metadataLanguage: 'nl' });

        const name = wrapper.vm.displayName;

        expect(name).toBe('Voorbeeld organisatie');
      });
      describe('when the provider is an entity', () => {
        it('localises its prefLabel', () => {
          const wrapper = factory({ dataProviderEntity });

          const name = wrapper.vm.displayName;

          expect(name).toBe('Example organisation');
        });
      });
    });
  });
});
