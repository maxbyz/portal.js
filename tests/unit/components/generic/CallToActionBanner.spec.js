import { createLocalVue } from '@vue/test-utils';
import { shallowMountNuxt } from '../../utils';
import CallToActionBanner from '@/components/generic/CallToActionBanner';

const localVue = createLocalVue();

const factory = ({ propsData = {} } = {}) => shallowMountNuxt(CallToActionBanner, {
  localVue,
  propsData
});

describe('components/generic/CallToActionBanner', () => {
  describe('computed', () => {
    describe('html', () => {
      it('converts CTA text Markdown to HTML', () => {
        const wrapper = factory({ propsData: {
          name: 'CTA',
          text: '**Attention!**',
          link: {
            url: '/attention',
            text: 'Read more'
          },
          illustration: { image: {
            url: 'https://www.europeana.eu/illustration.svg',
            width: '100px',
            height: '1oopx'
          } }
        } });

        expect(wrapper.vm.html).toBe('<p><strong>Attention!</strong></p>\n');
      });
    });
  });
});
