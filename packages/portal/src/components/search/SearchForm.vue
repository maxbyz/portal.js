<template>
  <div
    v-show="showForm"
    ref="searchdropdown"
    class="open"
    :class="{
      'top-search': inTopNav,
      'suggestions-open': showSearchOptions
    }"
    @keydown="handleKeyDown"
  >
    <b-button
      v-if="inTopNav"
      data-qa="back button"
      class="button-icon-only icon-back back-button"
      variant="light-flat"
      :aria-label="$t('header.backToMenu')"
      @click.prevent="handleHide"
    />
    <b-form
      ref="form"
      role="search"
      :class="{'search-form': !inTopNav}"
      :aria-label="$t('header.searchForm')"
      data-qa="search form"
      inline
      autocomplete="off"
      @submit.prevent="submitForm"
    >
      <b-input-group
        role="combobox"
        :aria-owns="showSearchOptions ? 'search-form-options' : null"
        :aria-expanded="showSearchOptions"
        class="auto-suggest pr-3"
      >
        <b-form-input
          ref="searchinput"
          v-model="query"
          :placeholder="$t('searchPlaceholder')"
          name="query"
          data-qa="search box"
          role="searchbox"
          aria-autocomplete="list"
          :aria-controls="showSearchOptions ? 'search-form-options' : null"
          :aria-label="$t('search.title')"
          @input="getSearchSuggestions(query);"
          @focus="showSearchOptions = true; updateSuggestions();"
        />
      </b-input-group>
    </b-form>
    <b-button
      v-show="query"
      data-qa="clear button"
      class="button-icon-only icon-clear clear-button"
      variant="light-flat"
      :aria-label="$t('header.clearQuery')"
      @click="clearQuery"
    />
    <SearchFilterToggleButton
      v-if="inTopNav"
    />
    <div
      v-if="showSearchOptions"
      id="search-suggest-dropdown"
      class="auto-suggest-dropdown"
      data-qa="search form dropdown"
    >
      <SearchQueryOptions
        ref="searchoptions"
        :options="searchQueryOptions"
        @select="showSearchOptions = false;"
      />
      <SearchThemeBadges
        v-if="showSearchThemeBadges"
        ref="quicksearch"
      />
    </div>
  </div>
</template>

<script>
  import SearchQueryOptions from './SearchQueryOptions';
  import match from 'autosuggest-highlight/match';
  import parse from 'autosuggest-highlight/parse';

  export default {
    name: 'SearchForm',

    components: {
      SearchQueryOptions,
      SearchFilterToggleButton: () => import('./SearchFilterToggleButton'),
      SearchThemeBadges: () => import('@/components/search/SearchThemeBadges')
    },

    props: {
      show: {
        type: Boolean,
        default: true
      },

      inTopNav: {
        type: Boolean,
        default: false
      },

      hidableForm: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        query: null,
        gettingSuggestions: false,
        suggestions: {},
        activeSuggestionsQueryTerm: null,
        showSearchOptions: false,
        showForm: this.show
      };
    },

    computed: {
      view() {
        return this.$store.getters['search/activeView'];
      },

      onSearchableCollectionPage() {
        // Auto suggest on search form will be disabled on entity pages.
        return !!this.$store.state.entity?.id && !!this.collectionLabel;
      },

      suggestionSearchOptions() {
        return Object.values(this.suggestions).map(suggestion => (
          {
            link: this.suggestionLinkGen(suggestion),
            qa: `${suggestion} search suggestion`,
            texts: this.highlightSuggestion(suggestion)
          }
        ));
      },

      globalSearchOption() {
        const globalSearchOption = {
          link: this.linkGen(this.query),
          qa: 'search entire collection button',
          i18n: {
            slots: this.query ? [
              { name: 'query', value: { highlight: true, text: this.query } }
            ] : []
          }
        };

        if (this.onSearchableCollectionPage) {
          globalSearchOption.i18n.path = this.query ? 'header.entireCollection' : 'header.searchForEverythingInEntireCollection';
        } else {
          globalSearchOption.i18n.path = this.query ? 'header.searchFor' : 'header.searchForEverything';
        }

        return globalSearchOption;
      },

      collectionSearchOption() {
        return {
          link: this.searchInCollectionLinkGen(this.query),
          qa: 'search in collection button',
          i18n: {
            path: this.query ? 'header.inCollection' : 'header.searchForEverythingInCollection',
            slots: [
              { name: 'query', value: { highlight: true, text: this.query } },
              { name: 'collection', value: { text: this.collectionLabel } }
            ]
          }
        };
      },

      searchQueryOptions() {
        if (this.onSearchableCollectionPage) {
          return [this.collectionSearchOption, this.globalSearchOption];
        } else {
          return [this.globalSearchOption].concat(this.suggestionSearchOptions);
        }
      },

      onSearchablePage() {
        return this.$store.state.search.active;
      },

      collectionLabel() {
        return this.$store.state.search.collectionLabel;
      },

      routePath() {
        return this.onSearchablePage ? this.$route.path : this.localePath({ name: 'search' });
      },

      showSearchThemeBadges() {
        return this.inTopNav && !this.onSearchableCollectionPage && !this.query;
      }
    },

    watch: {
      '$route.query.query'() {
        this.blurInput();
        this.showSearchOptions = false;
        this.initQuery();
      },
      '$route.path'() {
        this.showSearchOptions = false;
      },
      showSearchOptions(newVal) {
        if (newVal === true) {
          window.addEventListener('click', this.handleClickOrTabOutside);
        } else {
          window.removeEventListener('click', this.handleClickOrTabOutside);
        }
      },
      show(newVal) {
        this.showForm = newVal;
      }
    },

    mounted() {
      this.initQuery();
      this.inTopNav && this.$nextTick(() => {
        this.$refs.searchinput.$el.focus();
      });
    },

    methods: {
      // Highlight the user's query in a suggestion
      // FIXME: only re-highlight when new suggestions come in, not immediately
      //        after the query changes?
      highlightSuggestion(value) {
        const matchQuery = this.query ? this.query.replace(/(^")|("$)/g, '') : undefined;
        // Find all the suggestion labels that match the query
        const matches = match(value, matchQuery);
        return parse(value, matches);
      },

      initQuery() {
        this.query = this.$route.query.query;
      },

      async submitForm() {
        // Matomo event: suggestions are present, but none is selected
        if (Object.keys(this.suggestions).length > 0) {
          this.$matomo?.trackEvent('Autosuggest_option_not_selected', 'Autosuggest option is not selected', this.query);
        }

        const baseQuery = this.onSearchablePage ? this.$route.query : {};
        // `query` must fall back to blank string to ensure inclusion in URL,
        // which is required for analytics site search tracking
        const newRouteQuery = { ...baseQuery, ...{ page: 1, view: this.view, query: this.query || '' } };
        const newRoute = { path: this.routePath, query: newRouteQuery };

        this.showSearchOptions = false;

        this.blurInput();
        await this.$router.push(newRoute);
      },

      updateSuggestions() {
        // Re-retrieve suggestions after the query was programmatically changed.
        if (this.query !== this.activeSuggestionsQueryTerm) {
          this.getSearchSuggestions(this.query);
        }
      },

      getSearchSuggestions(query) {
        if (!query || query === '') {
          this.suggestions = {};
          this.activeSuggestionsQueryTerm = null;
          return;
        }

        if (this.onSearchableCollectionPage || !this.inTopNav) {
          return;
        }

        // Don't go getting more suggestions if we are already waiting for some or they already exist.
        if (this.gettingSuggestions || query === this.activeSuggestionsQueryTerm) {
          return;
        }

        const locale = this.$i18n.locale;
        this.gettingSuggestions = true;

        this.$apis.entity.suggest(query, {
          language: locale,
          type: 'agent,concept,place,timespan'
        })
          .then(suggestions => {
            this.activeSuggestionsQueryTerm = query;
            this.suggestions = suggestions.reduce((memo, suggestion) => {
              const candidates = [(suggestion.prefLabel || {})[locale]]
                .concat((suggestion.altLabel || {})[locale]);
              memo[suggestion.id] = candidates.find(candidate => match(candidate, query).length > 0) || candidates[0];
              return memo;
            }, {});
          })
          .catch(() => {
            this.activeSuggestionsQueryTerm = null;
            this.suggestions = {};
          })
          .then(() => {
            this.gettingSuggestions = false;
            // If the query has changed in the meantime, go get new suggestions now
            if (query !== this.query) {
              this.getSearchSuggestions(this.query);
            }
          });
      },

      suggestionLinkGen(suggestion) {
        const formattedSuggestion = suggestion ? `"${suggestion.replace(/(^")|("$)/g, '')}"` : undefined;
        return this.linkGen(formattedSuggestion);
      },

      linkGen(queryTerm, path) {
        const query = {
          boost: this.$route?.query?.boost,
          qa: this.$route?.query?.qa,
          qf: this.$route?.query?.qf,
          query: queryTerm || '',
          reusability: this.$route?.query?.reusability,
          view: this.view
        };
        return {
          path: path || this.localePath({
            name: 'search'
          }),
          query
        };
      },

      searchInCollectionLinkGen(query) {
        return this.linkGen(query, this.$route.path);
      },

      clearQuery() {
        this.query = '';
        this.suggestions = {};

        this.$nextTick(() => {
          this.getElement(this.$refs.searchinput).focus();
        });
      },

      handleClickOrTabOutside(event) {
        const targetOutsideSearchDropdown = event.target?.id !== 'show-search-button' && this.$refs.searchdropdown && !this.$refs.searchdropdown.contains(event.target);
        if ((event.type === 'click' || event.key === 'Tab') && targetOutsideSearchDropdown) {
          this.showSearchOptions = false;
        }
      },

      handleKeyDown(event) {
        this.handleClickOrTabOutside(event);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault();
          this.navigateWithArrowKeys(event);
        }
        if (event.key === 'Escape') {
          this.handleHide();
        }
      },

      handleHide() {
        this.blurInput();
        this.showSearchOptions = false;
        if (this.hidableForm) {
          this.showForm = false;
        }
        this.$emit('hide');
      },

      navigateWithArrowKeys(event) {
        const searchQueryOptionsComponentOptions = this.$refs.searchoptions?.$refs.options || [];
        const quickSearchComponentOptions = this.$refs.quicksearch?.$children[0].$refs.options || [];
        const searchDropdownOptions = searchQueryOptionsComponentOptions.concat(quickSearchComponentOptions);
        const activeOption = searchDropdownOptions.map(option => option.$el || option).indexOf(event.target);

        if (searchDropdownOptions.length) {
          if (activeOption === -1) {
            this.getElement(searchDropdownOptions[0]).focus();
          }
          if (event.key === 'ArrowDown' && activeOption < searchDropdownOptions.length - 1) {
            this.getElement(searchDropdownOptions[activeOption + 1]).focus();
          }
          if (event.key === 'ArrowUp' && activeOption > 0) {
            this.getElement(searchDropdownOptions[activeOption - 1]).focus();
          }
        }
      },

      getElement(element) {
        return element.$el || element;
      },

      blurInput() {
        if (this.$refs.searchinput.$el) {
          this.$refs.searchinput.$el.blur();
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import '@europeana/style/scss/variables';
  @import '@europeana/style/scss/icons';

  .top-search {
    &.open {
      width: 100%;

      .form-inline {
        align-items: flex-start;
        width: auto;

        .input-group {
          width: 100%;
          flex-wrap: nowrap;
          height: 3.4rem;
          box-shadow: 2px 2px 4px 0 rgba(0 0 0 / 8%);

          @media (min-width: $bp-4k) {
            height: calc(1.5 * 3.4rem);
          }

          .input-group-prepend {
            display: none;
          }
        }

        .form-control {
          background-color: $white;
          padding: 0.375rem 4.5rem 0.375rem 3.5rem;
          height: 3.4rem;
          box-shadow: none;
          border-radius: 0;
          color: $mediumgrey;
          width: 100%;

          @media (min-width: $bp-large) {
            padding-right: 1rem;
          }

          @media (min-width: $bp-4k) {
            padding: calc(1.5 * 0.375rem) calc(1.5 * 4.5rem) calc(1.5 * 0.375rem) calc(1.5 * 3.5rem);
            height: calc(1.5 * 3.4rem);
          }
        }
      }

      .search-query {
        box-shadow: $boxshadow-light;
        width: 100%;
        height: 3.5rem;
        font-size: 1rem;
        color: $mediumgrey;
        display: flex;
        align-items: center;
        position: relative;
        background: $white;

        .search {
          position: absolute;
          width: 100%;
          left: 0;
          top: 0;
          z-index: 99;
          height: 3.5rem;
          padding: 0.375rem 1rem 0.375rem 3.5rem;
          justify-content: flex-start;

          &:focus {
            color: $greyblack;
            background-color: $offwhite;

            ~ span {
              z-index: 99;
            }
          }

          &::before {
            left: 1rem;
            top: 1rem;
            position: absolute;
            width: 24px;
            height: 24px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }
    }

    .back-button {
      position: absolute;
      left: 1rem;
      top: 1rem;
      z-index: 99;

      @media (min-width: $bp-4k) {
        left: 1.5rem;
        top: 1.5rem;
      }
    }

    .clear-button {
      position: absolute;
      right: 3.5rem;
      top: 1rem;
      z-index: 99;

      @media (min-width: $bp-large) {
        right: 1rem;
      }

      @media (min-width: $bp-4k) {
        right: 1.5rem;
        top: 1.5rem;
      }
    }

    .icon-filter {
      position: absolute;
      right: 1rem;
      top: 0;
      z-index: 99;
    }

    .auto-suggest-dropdown {
      display: block;
      box-shadow: $boxshadow-light;
      position: absolute;
      top: 3.45rem;
      width: 100%;
      z-index: 20;
      border-radius: 0;
      background-color: $white;
      transition: $standard-transition;

      @media (min-width: $bp-4k) {
        top: calc(1.5 * 3.45rem);
      }
    }
  }

  .open:not(.top-search) {
    width: 100%;
    position: relative;

    .auto-suggest-dropdown {
      width: 100%;
      border-radius: 0 0 0.5em 0.5em;
      background-color: $white;
      overflow: hidden;
      animation: appear 750ms ease-in-out;
      position: absolute;
      z-index: 20;
      box-shadow: $boxshadow-light, $boxshadow-light-left;

      @media (min-width: $bp-4k) {
        font-size: 1.5rem;
      }
    }

    @keyframes appear {
      from {
        max-height: 0;
      }

      to {
        max-height: 100vh;
      }
    }

    &.suggestions-open {
      box-shadow: $boxshadow-light;

      .form-inline {
        border-radius: 0.5em 0.5em 0 0;
      }
    }

    .clear-button {
      position: absolute;
      font-size: 1.5rem;
      right: 0.75em;
      top: 0.75em;
      z-index: 99;
      width: 1em;
      height: 1em;
      display: flex;
      justify-content: center;
      align-items: center;

      @media (min-width: $bp-4k) {
        font-size: calc(1.5 * 1.5rem);
      }
    }

    ::v-deep .list-group-item {
      padding: 1em 1.25em 1em 3.4em;
      font-size: 1rem;

      @media (min-width: $bp-4k) {
        font-size: 1.5rem;
      }

      &::before {
        font-size: 1.1em;
        left: 1em;
        top: 1em;
        width: 1.5em;
        height: 1.5em;
      }

      &.list-item-quick-search {
        padding: 0 1.25em 1.3125em;
      }
    }
  }

</style>

<docs lang="md">
  ```jsx
    <div style="background-color: #ededed; margin: -16px; padding: 16px;">
      <SearchForm />
    </div>
  ```
</docs>
