<template>
  <div
    data-qa="API requests"
  >
    <b-modal
      id="api-requests"
      size="xl"
      :title="$t('debug.apiRequests.title')"
      hide-footer
      data-qa="API requests modal"
      @hide="hideModal"
    >
      <template
        v-if="requests && requests.length > 0"
      >
        <ol>
          <li
            v-for="(request, index) of requests"
            :key="index"
            data-qa="logged API request"
          >
            <code>
              {{ request.method }}
              <a
                v-if="request.method === 'GET'"
                target="_blank"
                :href="request.url"
              >
                {{ request.url }}
              </a>
              <template
                v-else
              >
                {{ request.url }}
              </template>
            </code>
          </li>
        </ol>
        <InfoMessage
          v-if="!$store.getters['debug/settings'].apiKey"
          variant="icon"
        >
          <i18n
            path="debug.apiRequests.tip"
            tag="p"
          >
            <template #apiKeyLink>
              <b-link
                href="https://pro.europeana.eu/pages/get-api"
              >
                {{ $t('debug.apiRequests.apiKeyLinkText') }}<!-- This comment removes white space
                  -->
              </b-link>
            </template>
            <template #settingsPageLink>
              <b-link
                to="/debug"
              >
                {{ $t('debug.apiRequests.settingsPageLinkText') }}<!-- This comment removes white space
                  -->
              </b-link>
            </template>
          </i18n>
        </InfoMessage>
      </template>
      <InfoMessage
        v-else
        variant="icon"
      >
        {{ $t('debug.apiRequests.noRequests') }}
      </InfoMessage>
    </b-modal>
  </div>
</template>

<script>
  import InfoMessage from '../generic/InfoMessage';

  export default {
    components: {
      InfoMessage
    },

    data() {
      return {
        hash: '#api-requests'
      };
    },

    computed: {
      requests() {
        if (!this.$store.state.axiosLogger) {
          return null;
        }
        if (!this.$store.getters['debug/settings']?.apiKey) {
          return this.$store.state.axiosLogger.requests;
        }

        return this.$store.state.axiosLogger.requests.map((request) => {
          const url = new URL(request.url);
          if (url.searchParams.has('wskey')) {
            url.searchParams.set('wskey', this.$store.getters['debug/settings'].apiKey);
          }
          return {
            ...request,
            url: url.toString()
          };
        });
      }
    },

    watch: {
      $route(to, from) {
        this.$nextTick(() => {
          if (to.hash === this.hash) {
            this.showModal();
          } else if (from.hash === this.hash) {
            this.hideModal({ updateRoute: false });
          }
        });
      }
    },

    mounted() {
      if (this.$route.hash === this.hash) {
        this.showModal();
      }
    },

    methods: {
      showModal() {
        this.$store.commit('debug/updateSettings', { ...this.$store.getters['debug/settings'], enabled: true });
        this.$bvModal.show('api-requests');
      },

      hideModal({ updateRoute = true } = {}) {
        this.$bvModal.hide('api-requests');
        if (updateRoute) {
          this.$nuxt.context.app.router.push({ ...this.$route, hash: undefined });
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import '@europeana/style/scss/variables';

  .modal {
    &#api-requests {
      font-family: $font-family-sans-serif;

      .modal-title {
        font-size: 1.5rem;
        font-weight: 600;
      }

      ol {
        list-style: none;
        counter-reset: item;
        padding-left: 0;
      }

      li {
        counter-increment: item;
        margin-bottom: 10px;
        line-height: 1.2;
        padding-left: 2rem;
      }

      li::before {
        content: counter(item);
        margin-left: -2rem;
        background: #e83e8c;
        border-radius: 100%;
        color: white;
        width: 1.2rem;
        text-align: center;
        display: inline-block;
      }
    }
  }

  ::v-deep .alert {
    padding: 0;
    margin-bottom: 0;
  }
</style>
