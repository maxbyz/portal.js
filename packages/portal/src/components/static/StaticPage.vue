<template>
  <div
    data-qa="static page"
    class="text-page white-page "
  >
    <AuthoredHead
      :title="name"
      :description="description"
    />
    <b-container
      class="footer-margin"
    >
      <b-row class="justify-content-center">
        <b-col
          cols="12"
          class="col-lg-8"
        >
          <article>
            <ShareButton class="mb-4" />
            <ShareSocialModal />
            <BrowseSections
              :sections="hasPartCollection.items"
              :rich-text-is-card="false"
              class="authored-section"
              data-qa="browse sections"
            />
          </article>
        </b-col>
      </b-row>
      <b-row
        v-if="relatedLinks"
        class="justify-content-center"
      >
        <b-col
          cols="12"
          class="mt-3 col-lg-8"
        >
          <LinkList
            :title="relatedLinks.name"
            :items="relatedLinks.links.items"
          />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
  import ShareSocialModal from '../share/ShareSocialModal.vue';
  import ShareButton from '../share/ShareButton.vue';
  import BrowseSections from '../browse/BrowseSections';

  export default {
    components: {
      AuthoredHead: () => import('../authored/AuthoredHead'),
      ShareSocialModal,
      ShareButton,
      BrowseSections,
      LinkList: () => import('../generic/LinkList')
    },
    props: {
      name: {
        type: String,
        default: null
      },
      description: {
        type: String,
        default: null
      },
      hasPartCollection: {
        type: Object,
        default: null
      },
      relatedLinks: {
        type: Object,
        default: null
      }
    }
  };
</script>
