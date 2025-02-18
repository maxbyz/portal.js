<template>
  <b-link
    v-if="useRouterLink"
    :to="path"
    :class="linkClass"
  >
    <slot />
  </b-link>
  <b-link
    v-else
    :href="path"
    :target="isExternalLink ? '_blank' : '_self'"
    :class="[{ 'is-external-link' : isExternalLink && !hideExternalIcon }, linkClass]"
  >
    <slot /><!-- This comment removes white space which gets underlined
 --><span
      v-if="isExternalLink && !hideExternalIcon"
      class="icon-external-link"
    /><!-- This comment removes white space which gets underlined
 --><span
      v-if="isExternalLink"
      class="sr-only"
    >
      ({{ $t('newWindow') }})
    </span>
  </b-link>
</template>

<script>
// TODO: refactor to use $link.to and $link.href

  export default {
    props: {
      destination: {
        type: [String, Object],
        default: ''
      },

      linkClass: {
        type: String,
        default: ''
      },

      hideExternalIcon: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        internalDomain: this.$config?.app?.internalLinkDomain
      };
    },

    computed: {
      useRouterLink() {
        return !!this.path?.startsWith('/');
      },

      path() {
        if (typeof this.destination === 'object') {
          return this.localePath(this.destination);
        }

        if (this.itemIdentifier) {
          return this.localePath({
            name: 'item-all',
            params: { pathMatch: this.itemIdentifier.slice(1) }
          });
        }

        if (typeof this.destination === 'string' && this.destination.startsWith('/')) {
          const [pathSlug, urlParams] = this.destination.split('?');
          return this.localePath({
            name: 'slug',
            params: {
              pathMatch: pathSlug.slice(1)
            },
            query: Object.fromEntries(new URLSearchParams(urlParams))
          });
        }

        return this.destination;
      },

      itemIdentifier() {
        const itemUriPattern = /^http:\/\/data\.europeana\.eu\/item(\/.*)$/;
        if (itemUriPattern.test(this.destination)) {
          return this.destination.match(itemUriPattern)[1];
        }
        return null;
      },

      isExternalLink() {
        const path = this.destination;

        if (this.itemIdentifier || typeof path !== 'string') {
          return false;
        }

        if (!this.internalDomain && typeof path === 'string') {
          return path.startsWith('http://') || path.startsWith('https://');
        }

        const hostnamePattern = /\/\/([^/:]+)/;
        if (!hostnamePattern.test(path)) {
          return false;
        }

        const hostname = path.match(hostnamePattern)[1];
        return !hostname.endsWith(this.internalDomain);
      }
    }
  };
</script>

<style lang="scss" scoped>
.btn .icon-external-link {
  margin-left: 0.5rem;
}
</style>
