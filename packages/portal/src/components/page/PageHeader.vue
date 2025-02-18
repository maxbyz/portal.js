<template>
  <header
    id="header"
    v-visible-on-scroll
    class="m-0 header-navbar container-fluid d-flex justify-content-between show xxl-page"
    role="banner"
    :aria-label="$t('header.europeanaHome')"
    data-qa="header"
  >
    <div
      v-if="showSearchBar"
      class="d-flex justify-content-center w-100"
      data-qa="search form wrapper"
    >
      <SearchForm
        :in-top-nav="true"
        :show="showSearchBar"
        :hidable-form="true"
        @hide="toggleSearchBar"
      />
    </div>
    <template
      v-else
    >
      <b-button
        v-b-toggle.sidebar
        variant="light-flat"
        class="navbar-toggle collapsed button-icon-only flex-column align-self-center ml-3"
        :aria-label="$t('header.showSidebar')"
        data-qa="hamburger button"
      >
        <span class="icon icon-menu" />
      </b-button>
      <SmartLink
        :destination="{ name: 'index' }"
        class="logo d-inline-flex"
      >
        <img
          :src="logoSrc"
          :alt="$t('homeLinkAlt')"
          data-qa="logo"
        >
      </SmartLink>
      <b-navbar
        class="align-items-center flex-row d-flex p-0 mr-3"
        role="navigation"
      >
        <PageNavigation
          class="d-none d-lg-flex"
          data-qa="top navigation"
        />
        <b-button
          id="show-search-button"
          data-qa="show search button"
          class="button-icon-only icon-search ml-lg-3"
          variant="light-flat"
          :aria-label="$t('search.title')"
          @click="toggleSearchBar"
        />
        <SearchFilterToggleButton />
      </b-navbar>
      <b-sidebar
        id="sidebar"
        bg-variant="white"
        no-header
        backdrop
        backdrop-variant="black"
        :aria-label="$t('header.sideNavigation')"
      >
        <b-navbar
          class="sidebar-nav align-items-start flex-column pt-1 px-2 pb-4"
          role="navigation"
          data-qa="sidebar navigation"
        >
          <div class="w-100 d-flex align-items-center pl-2 pt-2 pb-3">
            <b-button
              v-b-toggle.sidebar
              data-qa="close menu button"
              class="button-icon-only icon-clear"
              variant="light-flat"
              :aria-label="$t('header.closeSidebar')"
            />
            <SmartLink
              :destination="{ name: 'index' }"
              class="logo pl-4 pr-2"
            >
              <img
                :src="logoSrc"
                :alt="$t('homeLinkAlt')"
                width="153"
                height="32"
                class="mw-100"
                data-qa="logo"
              >
            </SmartLink>
          </div>
          <PageNavigation
            sidebar-nav
          />
          <div />
        </b-navbar>
      </b-sidebar>
    </template>
  </header>
</template>

<script>
  import SmartLink from '../generic/SmartLink';
  import SearchForm from '../search/SearchForm';
  import PageNavigation from './PageNavigation';
  import SearchFilterToggleButton from '../search/SearchFilterToggleButton';

  export default {
    name: 'PageHeader',

    components: {
      SmartLink,
      SearchForm,
      PageNavigation,
      SearchFilterToggleButton
    },

    data() {
      return {
        logoSrc: require('@europeana/style/img/logo.svg'),
        windowWidth: 0
      };
    },

    computed: {
      showSearchBar() {
        return this.$store.state.search.showSearchBar;
      }
    },

    methods: {
      toggleSearchBar() {
        this.$store.commit('search/setShowSearchBar', !this.$store.state.search.showSearchBar);
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import '@europeana/style/scss/variables';
  @import '@europeana/style/scss/icons';

  ::v-deep .b-sidebar-backdrop.bg-black {
    background-color: rgb(0 0 0);
    opacity: 0.7;
  }

  ::v-deep #sidebar {
    width: 16rem;
    max-height: 100vh;
    transition: $standard-transition; // fixes header appear/disappear

    @media (min-width: $bp-4k) {
      width: calc(1.5 * 16rem);
    }
  }

  .container-fluid {
    background: $white;
    height: 3.5rem;
    position: fixed;
    right: 0;
    top: 0;
    left: 0;
    z-index: 1030;
    padding: 0;
    box-shadow: $boxshadow-small;

    @media (min-width: $bp-large) {
      transition: $standard-transition;
    }

    @media (min-width: $bp-4k) {
      height: calc(1.5 * 3.5rem);
    }

    &:not(.show) {
      ::v-deep #sidebar,
      ::v-deep .b-sidebar-backdrop {
        transform: translateY(3.5rem);
        transition: $standard-transition;

        @media (min-width: $bp-4k) {
          transform: translateY(calc(1.5 * 3.5rem));
        }
      }
    }

    &:not(.show) ::v-deep .search-query,
    &:not(.show) ::v-deep .auto-suggest-dropdown {
      display: none;
    }
  }

  .header-navbar {
    min-width: 11.0625rem;
    flex: 0 0 auto;

    .logo {
      min-width: 9.5625rem;
      transition: 0.3s ease-in-out;

      @media (min-width: $bp-medium) {
        margin: 0 auto 0 0;
        padding-left: 1.5em;
      }

      @media (min-width: $bp-extralarge) {
        min-width: 18.75em;
      }

      img {
        margin: auto 0;
        width: auto;
        height: 32px;

        @media (min-width: $bp-4k) {
          height: calc(1.5 * 32px);
        }
      }
    }
  }

  .navbar-toggle {
    font-size: $font-size-extrasmall;
    padding: 0;

    @at-root .xxl-page & {
      @media (min-width: $bp-4k) {
        font-size: $font-size-extrasmall-4k;
      }
    }

    span {
      transition: $standard-transition;
    }

    &:hover {
      span::before {
        color: $innovationblue;
        transition: $standard-transition;
      }
    }
  }

  .navbar {
    @media (min-width: $bp-large) {
      position: relative;
      display: flex;
      height: auto;
      left: initial;
      top: initial;
      width: auto;
      padding: 0;

      .navbar-nav {
        padding-top: 0;
        flex-direction: row;
        width: 100%;
      }
    }

    &.sidebar-nav {
      .logo {
        min-width: auto;
      }

      .navbar-nav {
        flex-direction: column;
        width: 100%;
      }
    }
  }

  .filters-toggle {
    @media (min-width: $bp-medium) {
      display: none;
    }
  }

</style>

<docs lang="md">
  ```jsx
  <PageHeader style="position: relative;"/>
  ```
</docs>
