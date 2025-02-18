import { apiError, createAxios } from './utils.js';

export const BASE_URL = 'https://api.europeana.eu/annotation';
export const AUTHENTICATING = true;

export default (context = {}) => {
  const $axios = createAxios({ id: 'annotation' }, context);

  return {
    $axios,

    search(params) {
      return this.$axios.get('/search', {
        params: {
          ...this.$axios.defaults.params,
          ...params
        }
      })
        .then(response => response.data.items ? response.data.items : [])
        .catch(error => {
          throw apiError(error);
        });
    }
  };
};
