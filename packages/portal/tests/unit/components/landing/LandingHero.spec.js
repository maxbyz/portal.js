import { createLocalVue, shallowMount } from '@vue/test-utils';

import LandingHero from '@/components/landing/LandingHero.vue';

const localVue = createLocalVue();

const factory = (propsData) => shallowMount(LandingHero, {
  localVue,
  propsData,
  mocks: {
    $contentful: {
      assets: {
        responsiveBackgroundImageCSSVars: (img, sizes) => Object.keys(sizes)
      }
    }
  },
  stubs: ['b-container']
});

describe('components/landing/LandingHero', () => {
  describe('imageCSSVars', () => {
    describe('when there is a hero image available', () => {
      it('returns background style definitions', () => {
        const wrapper = factory({ headline: 'This page is awesome',
          heroImage: { image: { url: 'https://www.europeana.eu/example.jpg' } } });

        expect(wrapper.vm.imageCSSVars).toBeTruthy();
      });
    });
  });
});
