import { createLocalVue } from '@vue/test-utils';
import { shallowMountNuxt } from '../../utils';
import BootstrapVue from 'bootstrap-vue';
import sinon from 'sinon';

import ThemeBadges from '@/components/theme/ThemeBadges.vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const themes = [{ name: 'art', identifier: 'art', primaryImageOfPage: {
  image: { url: 'https://images.ctfassets.net/example.jpg' }
} }];

const themesAfterFetch = [{ prefLabel: 'art',
  primaryImageOfPage: {
    image: {
      url: 'https://images.ctfassets.net/example.jpg'
    }
  },
  url: '/art' }];

const props = { title: 'themes' };

const factory = ({ propsData = props, mocks } = {}) => {
  return shallowMountNuxt(ThemeBadges, {
    localVue,
    propsData,
    mocks: {
      $contentful: {
        assets: {
          optimisedSrc: (img) => img?.url,
          isValidUrl: () => true
        },
        query: sinon.stub().resolves({ data: { data: { themePageCollection: { items: themes } } } })

      },
      $i18n: {
        locale: 'de',
        isoLocale: () => 'de-DE'
      },
      $t: () => {},
      localePath: (path) => `/${path.params?.pathMatch || ''}`,
      $route: { query: { mode: null } },
      ...mocks
    },
    stubs: ['LinkBadge']
  });
};

describe('components/related/ThemeBadges', () => {
  describe('template', () => {
    describe('when themes are present', () => {
      it('shows a section with related collections chips', async() => {
        const wrapper = factory({ propsData: { ...props, themes } });

        const section = wrapper.find('[data-qa="related themes"]');
        expect(section.isVisible()).toBe(true);
      });
    });

    describe('when no themes are supplied', () => {
      describe('and no theme id\'s are supplied', () => {
        it('is not rendered', () => {
          const wrapper = factory();

          const relatedCollections = wrapper.find('[data-qa="related themes"]');
          expect(relatedCollections.exists()).toBe(false);
        });
      });
    });
  });

  describe('fetch', () => {
    describe('when theme id\'s are supplied', () => {
      it('fetches corresponding themes data', async() => {
        const wrapper = factory({ propsData: { ...props, themesIdentifiers: ['art'] } });

        await wrapper.vm.fetch();

        expect(wrapper.vm.themesData).toEqual(themesAfterFetch);
      });
    });
  });
});
