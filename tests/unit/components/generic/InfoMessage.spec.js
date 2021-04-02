import { createLocalVue, shallowMount } from '@vue/test-utils';
import BootstrapVue from 'bootstrap-vue';
import InfoMessage from '../../../../src/components/generic/InfoMessage.vue';

const localVue = createLocalVue();
localVue.use(BootstrapVue);

const factory = () => shallowMount(InfoMessage, {
  localVue,
  mocks: {
    $t: () => {}
  }
});

describe('components/generic/InfoMessage', () => {
  it('show an info message', () => {
    const wrapper = factory();
    wrapper.setProps({ message: 'Some information to display' });

    const message =  wrapper.find('[data-qa="info notice"]');
    message.text().should.contain('Some information to display');
  });
});
