import { createLocalVue, shallowMount } from '@vue/test-utils';

import LandingSubSection from '@/components/landing/LandingSubSection.vue';

const localVue = createLocalVue();

const factory = (propsData) => shallowMount(LandingSubSection, {
  localVue,
  propsData,
  mocks: {
    $route: {
      params: {
        pathMatch: 'example-page'
      }
    }
  },
  stubs: ['b-container']
});

describe('components/landing/LandingSubSection', () => {
  it('displays a title', () => {
    const title = 'Title for an info card group';
    const wrapper = factory({ title });

    const titleElement = wrapper.find('h2');

    expect(titleElement.text()).toBe(title);
  });

  describe('methods', () => {
    describe('contentType', () => {
      it('checks the content type to display the relevant component', () => {
        const typeName = 'InfoCardGroup';
        const sections = [{ __typename: typeName }];
        const wrapper = factory({ headline: 'This page is awesome', sections });

        const infoCardGroup = wrapper.vm.contentType(sections[0], typeName);
        expect(infoCardGroup).toBe(true);
      });
    });
  });
});
