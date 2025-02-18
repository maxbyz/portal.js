<template>
  <section
    v-if="cards.length > 0"
    class="text-center"
    data-qa="latest editorial"
  >
    <h2>
      {{ $t('homePage.discoverEditorial') }}
    </h2>
    <b-card-group
      class="card-deck-3-cols justify-content-center"
      deck
    >
      <!-- TODO: use/add image alt description -->
      <ContentCard
        v-for="card in cards"
        :key="card.identifier"
        :title="card.name"
        :image-url="cardImage(card)"
        :image-optimisation-options="{ width: 960 }"
        :url="cardLink(card)"
      />
    </b-card-group>
    <b-button
      variant="outline-secondary"
      :to="'/stories'"
    >
      {{ $t('homePage.storiesCTA') }}
    </b-button>
  </section>
</template>

<script>
  import ContentCard from '../content/ContentCard';

  export default {
    components: {
      ContentCard
    },

    data() {
      return {
        cards: []
      };
    },

    async fetch() {
      const variables = {
        locale: this.$i18n.isoLocale(),
        preview: this.$route.query.mode === 'preview',
        limit: 2
      };

      const response = await this.$contentful.query('latestEditorialContent', variables);
      const entries = response.data.data;

      // Select three stories: at least one of each type, max two of each type;
      // sorted by date published, most recent first
      this.cards = entries.blogPostingCollection.items
        .concat(entries.exhibitionPageCollection.items)
        .sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished))
        .slice(0, 3);
    },

    methods: {
      cardLink(card) {
        let link;
        if (card['__typename'] === 'ExhibitionPage') {
          link = { name: 'exhibitions-exhibition', params: { exhibition: card.identifier } };
        } else if (card['__typename'] === 'BlogPosting') {
          link = { name: 'blog-all', params: { pathMatch: card.identifier } };
        }
        return link;
      },

      cardImage(card) {
        return card.primaryImageOfPage?.image?.url;
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import '@europeana/style/scss/variables';

  h2 {
    color: $mediumgrey;
    font-size: 2rem;

    @media (min-width: $bp-extralarge) {
      font-size: $font-size-xxl;
    }

    @media (min-width: $bp-4k) {
      font-size: $font-size-xxl-4k;
    }
  }

  .card-deck {
    flex-flow: row wrap;
    margin-top: 2.25rem;
    margin-bottom: 2.25rem;

    @media (min-width: $bp-4k) {
      margin-top: calc( 1.5 * 2.25rem);
      margin-bottom: calc( 1.5 * 2.25rem);
    }

    .content-card.card {
      &:last-child {
        margin-bottom: 0;
      }

      @media (min-width: $bp-medium) {
        margin-bottom: 0;
      }
    }
  }
</style>
