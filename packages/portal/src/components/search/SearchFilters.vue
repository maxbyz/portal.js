<template>
  <b-col
    class="col-filters col-3"
    :class="{ open: showFiltersSheet, hide: hideFilterSheet }"
  >
    <div
      class="filters-backdrop"
      @click="toggleFilterSheet"
    />
    <b-container
      class="side-filters"
      data-qa="side filters"
    >
      <section role="search">
        <client-only>
          <slot />
          <b-row
            class="filters-header border-bottom border-top d-flex justify-content-between align-items-center"
          >
            <h2
              class="filters-title"
            >
              {{ filtersTitle }}
            </h2>
            <button
              v-if="hasResettableFilters"
              class="btn btn-outline-primary"
              data-qa="reset filters button"
              @click="resetFilters"
            >
              {{ $t('actions.resetFilters') }}
            </button>
          </b-row>
          <b-row class="mb-3 mt-4">
            <b-col
              data-qa="search filters"
            >
              <div class="position-relative">
                <b-alert
                  v-for="fulltextCollection in ['newspaper', 'ww1']"
                  :key="fulltextCollection"
                  :show="showFulltextHasMovedAlert(fulltextCollection)"
                  variant="info"
                  dismissible
                  @input="(show) => handleFulltextHasMovedAlertInput(show, fulltextCollection)"
                >
                  {{ $t(`facets.alert.fulltextHasMoved.${fulltextCollection}`) }}
                </b-alert>
                <SearchDateFilter
                  v-if="enableDateFilter"
                  :name="dateFilterField"
                  :start="dateFilter.start"
                  :end="dateFilter.end"
                  :specific="dateFilter.specific"
                  @dateFilter="dateFilterSelected"
                />
                <SearchFacetDropdown
                  v-for="facet in defaultFilterableFacets"
                  :key="facet.name"
                  :name="facet.name"
                  :type="facetDropdownType(facet.name)"
                  :selected="filters[facet.name]"
                  :static-fields="facet.staticFields"
                  :search="facet.search"
                  :group-by="sideFacetDropdownGroupBy(facet.name)"
                  :aria-label="facet.name"
                  :collection="collection"
                  :api-params="apiParams"
                  :api-options="apiOptions"
                  @changed="changeFacet"
                />
                <b-button
                  variant="link"
                  class="search-toggle"
                  data-qa="additional filters toggle"
                  :class="{ 'open': showAdditionalFilters }"
                  aria-controls="additional-filters"
                  :aria-expanded="showAdditionalFilters"
                  @click="showAdditionalFilters = !showAdditionalFilters"
                >
                  {{ $t('facets.button.showAdditional', { 'show': showAdditionalFilters ? $t('actions.hide') : $t('actions.show') }) }}
                </b-button>
                <transition
                  name="fade"
                >
                  <div
                    v-show="showAdditionalFilters"
                    id="additional-filters"
                  >
                    <SearchFacetDropdown
                      v-for="facet in additionalFilterableFacets"
                      :key="facet.name"
                      :name="facet.name"
                      :type="facetDropdownType(facet.name)"
                      :selected="filters[facet.name]"
                      :static-fields="facet.staticFields"
                      :search="facet.search"
                      :group-by="sideFacetDropdownGroupBy(facet.name)"
                      :aria-label="facet.name"
                      :collection="collection"
                      :api-params="apiParams"
                      :api-options="apiOptions"
                      @changed="changeFacet"
                    />
                    <SearchSwitchFilter
                      v-if="contentTierFacetSwitch"
                      :value="filters.contentTier"
                      name="contentTier"
                      :label="$t('facets.contentTier.options.0')"
                      checked-value="&quot;0&quot;"
                      :unchecked-value="null"
                      :default-value="null"
                      :collection="collection"
                      @changed="changeFacet"
                    />
                  </div>
                </transition>
              </div>
            </b-col>
          </b-row>
        </client-only>
      </section>
    </b-container>
  </b-col>
</template>

<script>
  import { BAlert } from 'bootstrap-vue';
  import ClientOnly from 'vue-client-only';
  import isEqual from 'lodash/isEqual';
  import { rangeToQueryParam, rangeFromQueryParam, filtersFromQf } from '@/plugins/europeana/search';
  import themes from '@/plugins/europeana/themes';
  import SearchFacetDropdown from './SearchFacetDropdown';

  export default {
    // TODO: rename the component now it also includes advanced search?
    name: 'SearchFilters',

    components: {
      BAlert,
      ClientOnly,
      SearchFacetDropdown,
      SearchDateFilter: () => import('./SearchDateFilter'),
      SearchSwitchFilter: () => import('./SearchSwitchFilter')
    },
    props: {
      route: {
        type: Object,
        default: () => {
          return { name: 'search' };
        }
      },

      collection: {
        type: String,
        default: null
      },

      apiParams: {
        type: Object,
        default: () => ({})
      },

      apiOptions: {
        type: Object,
        default: () => ({})
      },

      userParams: {
        type: Object,
        default: () => ({})
      }
    },
    data() {
      return {
        DEFAULT_FACET_NAMES: [
          'TYPE',
          'REUSABILITY',
          'contentTier'
        ],
        ADDITIONAL_FACET_NAMES: [
          'COUNTRY',
          'LANGUAGE',
          'PROVIDER',
          'DATA_PROVIDER',
          'COLOURPALETTE',
          'IMAGE_ASPECTRATIO',
          'IMAGE_SIZE',
          'MIME_TYPE',
          'RIGHTS'
        ],
        COLLECTION_FACET_NAME: 'collection',
        SEARCHABLE_FACETS: [
          'COUNTRY',
          'LANGUAGE',
          'PROVIDER',
          'DATA_PROVIDER',
          'COLOURPALETTE',
          'MIME_TYPE',
          'CREATOR',
          'proxy_dc_type.en',
          'proxy_dc_format.en',
          'proxy_dcterms_medium.en'
        ],
        hideFilterSheet: true,
        showAdditionalFilters: false
      };
    },
    computed: {
      collectionFacetEnabled() {
        return this.$store.state.search.collectionFacetEnabled;
      },
      showFiltersSheet() {
        return this.$store.state.search.showFiltersSheet;
      },
      // TODO: do not assume filters are fielded, e.g. `qf=whale`
      filters() {
        const filters = filtersFromQf(this.userParams?.qf);

        if (this.userParams?.reusability) {
          filters['REUSABILITY'] = this.userParams.reusability.split(',');
        }

        return filters;
      },
      resettableFilters() {
        const filters = this.filterableFacets
          .map(facet => facet.name)
          .filter(name => this.filters[name]);

        if (this.contentTierFacetSwitch && this.filters.contentTier) {
          filters.push('contentTier');
        }
        if (this.enableDateFilter && this.filters[this.dateFilterField]) {
          filters.push(this.dateFilterField);
        }

        return filters;
      },
      theme() {
        return themes.find((theme) => theme.qf === this.collection);
      },
      themeSpecificFacetNames() {
        return (this.theme?.facets || []).map((facet) => facet.field);
      },
      defaultFacetNames() {
        return this.themeSpecificFacetNames.concat(this.DEFAULT_FACET_NAMES);
      },
      additionalFacetNames() {
        return this.ADDITIONAL_FACET_NAMES;
      },
      facetNames() {
        return this.defaultFacetNames.concat(this.additionalFacetNames);
      },
      filterableFacets() {
        let facets = this.facetNames.map(facetName => ({
          name: facetName,
          search: this.SEARCHABLE_FACETS.includes(facetName)
        }));

        if (this.collectionFacetEnabled) {
          facets.unshift({
            name: this.COLLECTION_FACET_NAME,
            staticFields: themes.map(theme => theme.qf)
          });
        }

        // Remove contentTier (as a SearchFacetDropdown) when contentTierFacetSwitch is enabled
        if (this.contentTierFacetSwitch) {
          facets = facets.filter((facet) => facet.name !== 'contentTier');
        }

        return facets;
      },
      defaultFilterableFacets() {
        const defaultAndCollectionFacetNames = [this.COLLECTION_FACET_NAME].concat(this.defaultFacetNames);
        const defaultFacets = this.filterableFacets.filter(facet => defaultAndCollectionFacetNames.includes(facet.name));

        return defaultFacets;
      },
      additionalFilterableFacets() {
        const additionalFacets = this.filterableFacets.filter(facet => this.additionalFacetNames.includes(facet.name));

        return additionalFacets;
      },
      contentTierFacetSwitch() {
        return !this.collection && !this.$store.getters['entity/id'];
      },
      boost() {
        return this.userParams.boost;
      },
      qf() {
        return this.userParams.qf;
      },
      query() {
        return this.userParams.query;
      },
      reusability() {
        return this.userParams.reusability;
      },
      view() {
        return this.userParams.view;
      },
      page() {
        // This causes double jumps on pagination when using the > arrow, for some reason
        // return this.userParams.page;

        // This is a workaround
        return Number(this.$route.query.page || 1);
      },
      enableDateFilter() {
        return !!this.theme?.filters?.date;
      },
      dateFilterField() {
        return this.theme?.filters?.date?.field || null;
      },
      dateFilter() {
        const dateFilterValue = this.filters[this.dateFilterField];

        if (!dateFilterValue || dateFilterValue.length < 1) {
          return { start: null, end: null, specific: this.isCheckedSpecificDate };
        }

        const range = rangeFromQueryParam(dateFilterValue[0]);

        return range ? { ...range, specific: false } : { start: dateFilterValue[0], end: null, specific: true };
      },
      hasResettableFilters() {
        return this.resettableFilters.length > 0;
      },
      additionalFilterApplied() {
        return Object.keys(this.filters).some(filter => this.additionalFacetNames.includes(filter));
      },
      contentTierFacetSwitchApplied() {
        return this.contentTierFacetSwitch && this.filters.contentTier;
      },
      filtersTitle() {
        return this.$t('searchFilters', { count: this.resettableFilters.length ? `(${this.resettableFilters.length})` : '' });
      }
    },
    watch: {
      showFiltersSheet(newVal) {
        if (newVal) {
          this.hideFilterSheet = false;
        } else {
          setTimeout(() => this.hideFilterSheet = true, 300);
        }
      }
    },
    created() {
      this.$store.commit('search/setShowFiltersToggle', true);

      if (this.additionalFilterApplied || this.contentTierFacetSwitchApplied) {
        this.showAdditionalFilters = true;
      }
    },
    beforeDestroy() {
      this.$store.commit('search/setShowFiltersToggle', false);
    },
    methods: {
      showFulltextHasMovedAlert(collection) {
        return process.client &&
          (collection === this.collection) &&
          (localStorage.getItem(`fulltextHasMovedAlertDismissed.${this.collection}`) !== 'true');
      },
      handleFulltextHasMovedAlertInput(show, collection) {
        if (show === false) {
          localStorage.setItem(`fulltextHasMovedAlertDismissed.${collection}`, 'true');
        }
      },
      facetDropdownType(name) {
        return name === this.COLLECTION_FACET_NAME ? 'radio' : 'checkbox';
      },
      changeFacet(name, selected) {
        if (typeof this.filters[name] === 'undefined') {
          if ((Array.isArray(selected) && selected.length === 0) || !selected) {
            return;
          }
        }
        if (isEqual(this.filters[name], selected)) {
          return;
        }

        this.rerouteSearch(this.queryUpdatesForFacetChanges({ [name]: selected }));
      },
      queryUpdatesForFacetChanges(selected = {}) {
        const filters = Object.assign({}, this.filters);

        for (const name in selected) {
          filters[name] = selected[name];
        }

        // Remove collection-specific filters when collection is changed
        if (Object.prototype.hasOwnProperty.call(selected, this.COLLECTION_FACET_NAME) || !this.collection) {
          for (const name in filters) {
            if (name !== this.COLLECTION_FACET_NAME && !this.DEFAULT_FACET_NAMES.concat(this.ADDITIONAL_FACET_NAMES).includes(name)) {
              filters[name] = [];
            }
          }
        }

        // Reset contenTier filter when changed to or from a collection (i.e. contentTierFacetSwitch replaced with contentTier as a SearchFacetDropdown and vice versa)
        // But not when changing from one theme to another
        if (Object.prototype.hasOwnProperty.call(filters, 'contentTier') && selected[this.COLLECTION_FACET_NAME] &&
          ((!this.collection && selected[this.COLLECTION_FACET_NAME].length) || (this.collection && !selected[this.COLLECTION_FACET_NAME].length))) {
          filters['contentTier'] = [];
        }

        return this.queryUpdatesForFilters(filters);
      },
      queryUpdatesForFilters(filters) {
        const queryUpdates = {
          qf: [],
          page: 1
        };

        for (const name in filters) {
          if (name === 'REUSABILITY') {
            // `reusability` has its own API parameter and can not be queried in `qf`
            queryUpdates.reusability = (filters[name]?.length || 0) > 0 ? filters[name].join(',') : null;
          } else {
            // Everything else goes in `qf`
            queryUpdates.qf = queryUpdates.qf.concat(this.queryUpdatesForFilter(name, filters[name]));
          }
        }
        return queryUpdates;
      },
      queryUpdatesForFilter(name, values) {
        return [].concat(values)
          .filter((value) => (value !== undefined) && (value !== null))
          .map((value) => `${name}:${value}`);
      },
      rerouteSearch(queryUpdates) {
        const query = this.updateCurrentSearchQuery(queryUpdates);
        this.$router.push(this.localePath({ ...this.route, ...{ query } }));
        if (queryUpdates.qf) {
          queryUpdates.qf.forEach(filter =>
            this.$matomo?.trackEvent('Filters', 'Filter selected', filter)
          );
        }
        if (queryUpdates.reusability) {
          this.$matomo?.trackEvent('Filters', 'Reusability filter selected', queryUpdates.reusability);
        }
      },
      updateCurrentSearchQuery(updates = {}) {
        const current = {
          boost: this.boost,
          page: this.page,
          qa: this.$route.query.qa,
          qf: this.qf,
          query: this.query,
          reusability: this.reusability,
          view: this.view
        };

        const updated = { ...current, ...updates };

        for (const key in updated) {
          // If any updated values are `null`, remove them from the query
          if (updated[key] === null) {
            delete updated[key];
          }
        }

        return updated;
      },
      resetFilters() {
        this.rerouteSearch({
          page: 1,
          qf: null,
          reusability: null
        });
      },
      dateFilterSelected(facetName, dateRange) {
        let dateQuery = [];
        if (dateRange.specific) {
          if (dateRange.start) {
            dateQuery = [dateRange.start];
          }
        } else if (dateRange.start || dateRange.end) {
          dateQuery = [rangeToQueryParam(dateRange)];
        }
        this.isCheckedSpecificDate = dateRange.specific;
        this.changeFacet(facetName, dateQuery);
      },
      toggleFilterSheet() {
        this.$store.commit('search/setShowFiltersSheet', !this.$store.state.search.showFiltersSheet);
      },
      sideFacetDropdownGroupBy(facetName) {
        if (facetName === 'RIGHTS') {
          return [
            '/CNE/',
            '/InC-EDU/',
            '/InC-OW-EU/',
            '/InC/',
            '/licenses/by-nc-nd/',
            '/licenses/by-nc-sa/',
            '/licenses/by-nc/',
            '/licenses/by-nd/',
            '/licenses/by-sa/',
            '/licenses/by/',
            '/NoC-NC/',
            '/NoC-OKLR/',
            '/publicdomain/mark/',
            '/publicdomain/zero/',
            '/rights/out-of-copyright-non-commercial/',
            '/rights/rr-f/',
            '/rights/unknown/'
          ];
        } else {
          return null;
        }
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import '@europeana/style/scss/variables';
  @import '@europeana/style/scss/icons';
  @import '@europeana/style/scss/mixins';
  @import '@europeana/style/scss/transitions';

  .filters-header {
    padding: 0.5rem 1rem;

    @media (min-width: $bp-4k) {
      padding: 0.75rem 1.5rem;
    }
  }
  .filters-title {
    font-size: $font-size-small;
    font-weight: 600;
    line-height: 1;
    margin: 0.75rem 1rem 0.75rem 0;

    @media (min-width: $bp-4k) {
      font-size: $font-size-small-4k;
      margin: calc(1.5 * 0.75rem) 0;
    }
  }

  .search-toggle {
    margin-bottom: 1.25rem;
  }

  .col-filters {
    flex-grow: 0;
    padding: 0;
    margin-top: -1rem;

    @media (max-width: ($bp-large - 1px)) {
      display: flex;
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      padding-top: 1rem;
      transition: right 300ms ease-in-out;
      z-index: 1050;
      max-width: none;
      overflow: hidden;

      .side-filters {
        flex-shrink: 0;
        margin-right: -320px;
        overflow-y: auto;
        width: 320px;
        max-width: 75vw;
        animation: appear 300ms ease-in-out;
        transition: margin-right 300ms ease-in-out;

        @keyframes appear {
          from {
            margin-right: -320px;
          }

          to {
            margin-right: 0;
          }
        }
      }

      &.hide {
        display: none;
      }

      &.open {
        left: 0;

        .side-filters {
          margin-right: 0;
        }

        .filters-backdrop {
          content: '';
          width: 100%;
          height: 100%;
          background-color: rgb(0 0 0 / 70%);
        }
      }
    }

    @media (min-width: $bp-large) {
      max-width: 320px;
      min-width: 220px;
      min-height: 31rem;
      box-shadow: $boxshadow-small;

      @include white-cutout;

      .filters-backdrop {
        display: none;
      }
    }

    @media (min-width: $bp-4k) {
      max-width: 480px;
      margin-top: -1.5rem;

      .col {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }
    }

    .side-filters {
      background-color: $white;
      height: 100%;
    }

    .icon-clear {
      @media (min-width: $bp-large) {
        display: none;
      }
    }
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .alert {
    font-size: $font-size-extrasmall;
  }
</style>
