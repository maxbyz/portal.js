<template>
  <div>
    <b-button
      v-b-tooltip.bottom
      class="like-button text-uppercase d-inline-flex align-items-center"
      :class="{ 'button-icon-only': !buttonText }"
      :pressed="liked"
      :variant="buttonVariant"
      data-qa="like button"
      :aria-label="$t('actions.like')"
      :title="$t('set.actions.saveItemToLikes')"
      @click="toggleLiked"
    >
      <span class="icon-heart" />
      {{ likeButtonText }}
    </b-button>
    <!-- TODO: remove when 100-item like limit removed -->
    <b-modal
      :id="likeLimitModalId"
      :title="$t('set.notifications.likeLimit.title')"
      hide-footer
    >
      <p>{{ $t('set.notifications.likeLimit.body') }}</p>
    </b-modal>
  </div>
</template>

<script>
  import keycloak from '@/mixins/keycloak';

  export default {
    name: 'ItemLikeButton',

    mixins: [
      keycloak
    ],

    props: {
      /**
       * Identifier of the item
       */
      identifier: {
        type: String,
        required: true
      },
      /**
       * Button variant to use for styling the buttons
       */
      buttonVariant: {
        type: String,
        default: 'outline-light'
      },
      /**
       * If `true`, button text will be rendered
       */
      buttonText: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        likeLimitModalId: `like-limit-modal-${this.identifier}`
      };
    },

    computed: {
      liked() {
        return this.$store.getters['set/isLiked'](this.identifier);
      },
      likesId() {
        return this.$store.state.set.likesId;
      },
      likeButtonText() {
        if (this.buttonText) {
          return this.liked ? this.$t('statuses.liked') : this.$t('actions.like');
        }
        return '';
      }
    },

    methods: {
      async toggleLiked() {
        if (this.$auth.loggedIn) {
          try {
            await (this.liked ? this.unlike() : this.like());
          } catch (e) {
            // TODO: handle 404 which may indicate likes set has been deleted;
            //       create a new one and retry
            this.$error(e, { scope: 'gallery' });
          }
        } else {
          this.keycloakLogin();
        }
      },
      async like() {
        if (this.likesId === null) {
          await this.$store.dispatch('set/createLikes');
        }

        try {
          await this.$store.dispatch('set/like', this.identifier);
          this.$matomo?.trackEvent('Item_like', 'Click like item button', this.identifier);
        } catch (e) {
          // TODO: remove when 100 item like limit is removed
          if (e.message === '100 likes') {
            this.$bvModal.show(this.likeLimitModalId);
          } else {
            throw e;
          }
        }
      },
      async unlike() {
        await this.$store.dispatch('set/unlike', this.identifier);
      }
    }
  };
</script>
