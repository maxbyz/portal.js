<template>
  <div
    v-if="alphabeticallySortedThemes.length"
    data-qa="related themes"
    class="related-themes"
  >
    <h2 class="related-heading text-uppercase">
      {{ title || $t('related.themes.title') }}
    </h2>
    <div
      class="badges-wrapper d-flex flex-wrap"
    >
      <LinkBadge
        v-for="relatedTheme in alphabeticallySortedThemes"
        :id="relatedTheme.identifier"
        :key="relatedTheme.identifier"
        ref="options"
        :link-to="relatedTheme.url"
        :title="relatedTheme.prefLabel || ''"
        :img="imageUrl(relatedTheme, 28, 28)"
        :image-src-set="imageSrcSet(relatedTheme)"
        badge-variant="outline-primary"
      />
    </div>
  </div>
</template>

<script>
  import LinkBadge from '@/components/generic/LinkBadge';

  export default {
    name: 'ThemeBadges',

    components: {
      LinkBadge
    },

    props: {
      title: {
        type: String,
        default: ''
      },
      themesIdentifiers: {
        type: Array,
        default: () => []
      },
      themes: {
        type: Array,
        default: () => []
      }
    },

    data() {
      return {
        themesData: this.themes
      };
    },

    async fetch() {
      if (!this.themes.length) {
        const contentfulVariables = {
          locale: this.$i18n.isoLocale(),
          preview: this.$route.query.mode === 'preview',
          identifiers: this.themesIdentifiers
        };

        const contentfulResponse = await this.$contentful.query('themesById', contentfulVariables);

        this.themesData = contentfulResponse.data.data.themePageCollection.items.map(theme => ({
          prefLabel: theme.name,
          url: this.localePath({
            name: 'themes-all',
            params: {
              pathMatch: theme.identifier
            }
          }),
          primaryImageOfPage: theme.primaryImageOfPage
        }));
      }
    },

    computed: {
      alphabeticallySortedThemes() {
        // Slice to make a copy, as sort occurs in place
        return this.themesData.slice(0).sort((a, b) => a.prefLabel.localeCompare(b.prefLabel));
      }
    },

    methods: {
      imageUrl(theme, imageWidth, imageHeight) {
        if (this.$contentful.assets.isValidUrl(theme.primaryImageOfPage?.image?.url)) {
          return this.$contentful.assets.optimisedSrc(
            theme.primaryImageOfPage.image,
            { w: imageWidth, h: imageHeight, fit: 'thumb' }
          );
        }
      },

      imageSrcSet(theme) {
        if (this.$contentful.assets.isValidUrl(theme.primaryImageOfPage?.image?.url)) {
          const smallImage = this.$contentful.assets.optimisedSrc(theme.primaryImageOfPage.image, { w: 28, h: 28, fit: 'thumb' });
          const wqhdImage = this.$contentful.assets.optimisedSrc(theme.primaryImageOfPage.image, { w: 45, h: 45, fit: 'thumb' });
          const fourKImage = this.$contentful.assets.optimisedSrc(theme.primaryImageOfPage.image, { w: 67, h: 67, fit: 'thumb' });
          return `${smallImage} 28w, ${wqhdImage} 45w, ${fourKImage} 67w`;
        }
        return null;
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import '@europeana/style/scss/variables';

  .related-themes ::v-deep .badge-pill {
    margin-right: 0.5rem;
    margin-bottom: 0.5rem;

    @at-root .xxl-page & {
      @media (min-width: $bp-4k) {
        margin-right: 0.75rem;
        margin-bottom: 0.75rem;
      }
    }
  }
</style>

<docs lang="md">
  ```jsx
  <ThemeBadges
    :themes="[
      {
        primaryImageOfPage: {
          image: {
            url: 'https://images.ctfassets.net/i01duvb6kq77/5cZngU4uZxJ2AoN0ya76h/3a190c621e89bb50ccbc78b86e661f4c/StudioInterior.jpg'
          }
        },
        prefLabel: 'Art',
        url: 'https://www.europeana.eu/en/themes/art'
        },
        {
        primaryImageOfPage: {
          image: {
            url: 'https://images.ctfassets.net/i01duvb6kq77/4U2K7lU4mYwQBMX7xL7p4b/124d66feb71444696433413ae230290a/Tropaeolum_cv'
          }
        },
        prefLabel: 'Natural history',
        url: 'https://www.europeana.eu/en/themes/natural-history'
      }]"
  />
  ```
</docs>
