<template>
  <div
    data-qa="exhibition credits page"
    class="text-page white-page"
  >
    <!-- TODO: use the AuthoredHead component here, so it matches the exhibition chapters -->
    <b-container
      class="footer-margin"
    >
      <b-row class="justify-content-center">
        <b-col
          cols="12"
          class="col-lg-8 pt-large mb-4"
        >
          <div
            class="context-label"
          >
            {{ $tc('exhibitions.exhibitions', 1) }}
          </div>
          <h2
            v-if="exhibitionTitle"
            class="subtitle"
          >
            {{ exhibitionTitle }}
          </h2>
          <h1>{{ $t('exhibitions.credits') }}</h1>
        </b-col>
      </b-row>
      <b-row class="justify-content-center">
        <b-col
          cols="12"
          class="col-lg-8 mb-3"
        >
          <article>
            <ShareButton class="mb-4" />
            <ShareSocialModal />
            <!-- eslint-disable vue/no-v-html -->
            <div
              data-qa="credits text"
              v-html="htmlCredits"
            />
            <!-- eslint-enable vue/no-v-html -->
          </article>
        </b-col>
      </b-row>
      <client-only>
        <b-row
          v-if="hasPartCollection"
          class="justify-content-center"
        >
          <b-col
            cols="12"
            class="mt-3 col-lg-8"
          >
            <LinkList
              :items="chapterPagesToLinkListItems(hasPartCollection.items, identifier)"
              :title="$t('exhibitions.chapters')"
            />
          </b-col>
        </b-row>
        <b-row
          v-if="relatedLink"
          class="related-container justify-content-center"
        >
          <b-col
            cols="12"
            class="col-lg-8"
          >
            <EntityBadges
              :entity-uris="relatedLink"
            />
          </b-col>
        </b-row>
        <b-row
          v-if="genre"
          class="related-container justify-content-center"
        >
          <b-col
            cols="12"
            class="col-lg-8"
          >
            <ThemeBadges
              :themes-identifiers="genre"
            />
          </b-col>
        </b-row>
      </client-only>
    </b-container>
  </div>
</template>

<script>
  import { marked } from 'marked';
  import ShareSocialModal from '../../../components/share/ShareSocialModal.vue';
  import ShareButton from '../../../components/share/ShareButton.vue';
  import exhibitionChapters from '../../../mixins/exhibitionChapters';
  import pageMetaMixin from '@/mixins/pageMeta';

  export default {
    name: 'ExhibitionCreditsPage',
    components: {
      ShareButton,
      ShareSocialModal,
      LinkList: () => import('../../../components/generic/LinkList'),
      EntityBadges: () => import('@/components/entity/EntityBadges'),
      ThemeBadges: () => import('@/components/theme/ThemeBadges')
    },
    mixins: [
      exhibitionChapters,
      pageMetaMixin
    ],
    beforeRouteLeave(to, from, next) {
      this.$store.commit('breadcrumb/clearBreadcrumb');
      next();
    },

    asyncData({ params, query, error, app, store }) {
      const variables = {
        identifier: params.exhibition,
        locale: app.i18n.isoLocale(),
        preview: query.mode === 'preview'
      };

      return app.$contentful.query('exhibitionCreditsPage', variables)
        .then(response => response.data.data)
        .then(data => {
          if (data.exhibitionPageCollection.items.length === 0) {
            error({ statusCode: 404, message: app.i18n.t('messages.notFound') });
            return null;
          }

          const exhibition = data.exhibitionPageCollection.items[0];

          store.commit('breadcrumb/setBreadcrumbs', [
            {
              text: app.i18n.tc('exhibitions.exhibitions', 2),
              to: app.localePath({ name: 'exhibitions' })
            },
            {
              text: exhibition.name,
              to: app.localePath({
                name: 'exhibitions-exhibition',
                params: {
                  exhibition: exhibition.identifier
                }
              })
            },
            {
              text: app.i18n.t('exhibitions.credits'),
              active: true
            }
          ]);
          return exhibition;
        })
        .catch((e) => {
          error({ statusCode: 500, message: e.toString() });
        });
    },

    data() {
      return {
        name: null,
        identifier: null,
        credits: '',
        relatedLink: null,
        hasPartCollection: null,
        genre: null
      };
    },

    computed: {
      pageMeta() {
        return {
          title: `${this.name} - ${this.$t('exhibitions.credits')}`,
          ogType: 'article'
        };
      },
      htmlCredits() {
        if (this.credits === undefined) {
          return false;
        }
        return marked.parse(this.credits);
      },
      exhibitionTitle() {
        return this.name;
      }
    }
  };
</script>

<style lang="scss" scoped>
  ::v-deep img {
    display: block;
    margin: 1rem 0;
  }
</style>
