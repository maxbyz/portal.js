<template>
  <section
    class="data-provider"
  >
    <transition
      appear
      name="fade"
    >
      <i18n
        v-if="dataProviderEntity || dataProvider"
        data-qa="data provider attribution"
        path="provider.providedBy"
        tag="div"
      >
        <template #provider>
          <LinkBadge
            v-if="dataProviderEntity && isEntityUri(dataProviderEntity.id)"
            :id="dataProviderEntity.id"
            data-qa="data provider badge"
            badge-variant="secondary"
            :link-to="collectionLinkGen(dataProviderEntity)"
            :title="collectionTitle(dataProviderEntity)"
            :img="$apis.entity.imageUrl(dataProviderEntity)"
            type="Organization"
          />
          <span
            v-else
            data-qa="data provider name"
            :lang="namePrefLanguage"
          >
            {{ displayName }}
          </span>
        </template>
      </i18n>
    </transition>
    <SmartLink
      v-if="isShownAt"
      :destination="isShownAt"
      class="text-decoration-none provider-link"
      @click.native="$matomo && $matomo.trackEvent('Item_external link', 'Click Provider Link', isShownAt);"
    >
      {{ $t('provider.linkText') }}
    </SmartLink>
  </section>
</template>

<script>
  import { isEntityUri } from '@/plugins/europeana/entity';
  import { langMapValueForLocale } from  '@/plugins/europeana/utils';
  import itemPrefLanguage from '@/mixins/europeana/item/itemPrefLanguage';
  import collectionLinkGenMixin from '@/mixins/collectionLinkGen';
  import europeanaEntityLinks from '@/mixins/europeana/entities/entityLinks';

  import LinkBadge from '../generic/LinkBadge';

  export default {
    name: 'ItemDataProvider',

    components: {
      SmartLink: () => import('@/components/generic/SmartLink'),
      LinkBadge
    },
    mixins: [
      itemPrefLanguage,
      collectionLinkGenMixin,
      europeanaEntityLinks
    ],
    props: {
      dataProvider: {
        type: Object,
        default: null
      },
      dataProviderEntity: {
        type: Object,
        default: null
      },
      metadataLanguage: {
        type: String,
        default: null
      },
      isShownAt: {
        type: String,
        default: null
      }
    },

    computed: {
      namePrefLanguage() {
        return this.getPrefLanguage('edmDataProvider', { def: [{ prefLabel: this.dataProvider }] });
      },
      displayName() {
        return langMapValueForLocale(this.dataProviderEntity?.prefLabel || this.dataProvider, this.namePrefLanguage).values[0];
      }
    },

    methods: {
      isEntityUri(uri) {
        return isEntityUri(uri);
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import '@europeana/style/scss/variables';
  @import '@europeana/style/scss/transitions';

  .data-provider {
    color: $black;

    p {
      margin-bottom: 0.25rem;
    }

    .provider-link {
      font-weight: 600;
    }
  }
</style>
