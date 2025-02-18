<template>
  <div
    class="hero responsive-backround-image"
    :style="imageCSSVars"
  >
    <div
      class="hero-content"
    >
      <header>
        <i18n
          path="homePage.title"
          tag="h1"
          class="text-center"
        >
          <template #digital>
            <span class="digital-highlight">
              {{ $t('homePage.titleDigital') }}
            </span>
          </template>
        </i18n>
        <p
          class="sub-headline text-center"
        >
          {{ $t('homePage.subHeadline') }}
        </p>
      </header>
      <SearchForm />
    </div>
    <AttributionToggle
      :attribution="backgroundImage"
    />
    <EULogo class="bottom-right" />
  </div>
</template>

<script>
  import SearchForm from '@/components/search/SearchForm';
  import AttributionToggle from '@/components/generic/AttributionToggle';
  import EULogo from '@/components/image/ImageEULogo';

  export default {
    name: 'HomeHero',

    components: {
      SearchForm,
      AttributionToggle,
      EULogo
    },

    props: {
      backgroundImage: {
        type: Object,
        default: null
      }
    },

    computed: {
      imageCSSVars() {
        return this.backgroundImage?.image &&
          this.$contentful.assets.responsiveBackgroundImageCSSVars(
            this.backgroundImage.image,
            {
              small: { w: 576, h: 896, fit: 'fill' },
              medium: { w: 768, h: 1080, fit: 'fill' },
              large: { w: 992, h: 1080, fit: 'fill' },
              xl: { w: 1200, h: 1080, fit: 'fill' },
              xxl: { w: 1440, h: 1080, fit: 'fill' },
              xxxl: { w: 1920, h: 1080, fit: 'fill' },
              wqhd: { w: 2560, h: 1440, fit: 'fill' },
              '4k': { w: 3840, h: 2160, fit: 'fill' }
            }
          );
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import '@europeana/style/scss/variables';
  @import '@europeana/style/scss/responsive-background-image';

  .hero {
    margin-top: -70px;
    margin-bottom: 4.5rem;
    background-color: $mediumgrey-light;
    padding: 25vh 1.5rem 1.5rem;
    min-height: 100vh;
    background-size: cover;
    background-repeat: no-repeat;
    position: relative;
    padding-bottom: 128px; // save space for absolute positioned EULogo of height 64px, doubled for spacing around the logo

    @media (min-width: $bp-4k) {
      margin-top: calc(1.5 * -70px);
      padding-bottom: calc(1.5 * 128px);
    }

    &::before {
      content: '';
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;
      background-image: linear-gradient(0deg, #0b60aa, #0b60aa);
      mix-blend-mode: multiply;
      position: absolute;
    }

    &::after {
      border-bottom: 209px solid $white;
      border-left: 95px solid transparent;
      content: '';
      display: block;
      height: 0;
      position: absolute;
      right: 0;
      top: calc(100% - 209px);
      width: 0;
      z-index: 1;

      @media (min-width: $bp-xxxl) {
        border-bottom-width: calc(209 / 16 * 1vw); // divide by 16 (1rem = 16px) and use vw to create responsive value
        border-left-width: calc(95 / 16 * 1vw); // divide by 16 (1rem = 16px) and use vw to create responsive value
        top: calc(100% - (209 / 16 * 1vw) + 1px); // Adding one pixel so as to prevent a black line due to rounding
      }
    }

    h1,
    .sub-headline {
      color: $white;
    }

    h1 {
      font-size: $font-size-xl;
      font-weight: 700;
      margin-bottom: 0.25rem;

      @media (min-width: $bp-medium) {
        font-size: 2.875rem;
      }

      @media (min-width: $bp-4k) {
        font-size: calc(1.5 * 2.875rem);
      }

      .digital-highlight {
        text-shadow: 3.5px 3.5px 0 $blue;

        @media (min-width: $bp-4k) {
          text-shadow: calc(1.5 * 3.5px) calc(1.5 * 3.5px) 0 $blue;
        }
      }

    }

    .sub-headline {
      font-size: 1rem;
      margin-bottom: 4em;

      @media (min-width: $bp-medium) {
        font-size: 1.625rem;
      }

      @media (min-width: $bp-4k) {
        font-size: calc(1.5 * 1.625rem);
      }
    }

    @media (min-width: $bp-medium) {
      h1,
      .sub-headline,
      .open:not(.top-search) {
        width: 25em;
        min-width: 644px;
        margin-left: auto;
        margin-right: auto;

        @media (min-width: $bp-4k) {
          min-width: calc(1.5 * 644px);
        }
      }

      h1 {
        width: auto;
        max-width: 744px;
      }
    }

    @media (min-width: $bp-large) {
      h1 {
        max-width: 80%;
      }
    }
  }

  .hero-content {
    margin: 0 auto;
    position: relative; // Prevents blending with the background
  }

  ::v-deep .icon-info {
    left: 1.5rem;
    right: auto;
    z-index: 3;
  }

  ::v-deep cite {
    left: 0.5rem;
    right: auto !important;
    z-index: 3;
  }
</style>

<docs lang="md">
  ```jsx
    <HomeHero
      :background-image="{
        creator: 'Europeana Foundation',
        license: 'https://creativecommons.org/publicdomain/zero/1.0',
        name: 'Background homepage',
        provider: null,
        url: null,
        image: {
          contentType: 'image/jpeg',
          description: null,
          height: 2694,
          url: 'https://images.ctfassets.net/i01duvb6kq77/1trzaYGwJsR79hW38lMpJO/465bdac6bb52df2f574c50dacdc74ef8/slantedimagecover_v1.jpg',
          width: 4320
        }
      }"
    />
  ```
</docs>
