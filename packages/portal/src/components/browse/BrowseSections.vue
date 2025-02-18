<template>
  <div>
    <div
      v-for="(section, index) in sections"
      :key="index"
    >
      <ContentRichText
        v-if="contentType(section, 'ContentTypeRichText')"
        :text="section.text"
        :rich-text-is-card="richTextIsCard"
      />
      <ContentCardSection
        v-else-if="contentType(section, 'CardGroup')"
        :section="section"
      />
      <BrowseAutomatedCardGroup
        v-else-if="contentType(section, 'AutomatedCardGroup')"
        :section-type="section.genre"
        :more-button="section.moreButton"
      />
      <EmbedHTML
        v-else-if="contentType(section, 'Embed')"
        :html="section.embed"
      />
      <ImageComparisonSlider
        v-else-if="contentType(section, 'ImageComparison')"
        :left-image-src="imageCompareImage(section, 0) ? imageCompareImage(section, 0).url : null"
        :left-image-content-type="imageCompareImage(section, 0) ? imageCompareImage(section, 0).contentType : null"
        :left-image-attribution="attributionFields(section.hasPartCollection.items[0])"
        :left-image-width="imageCompareImage(section, 0) ? imageCompareImage(section, 0).width : null"
        :left-image-height="imageCompareImage(section, 0) ? imageCompareImage(section, 0).height : null"
        :right-image-src="imageCompareImage(section, 1) ? imageCompareImage(section, 1).url : null"
        :right-image-content-type="imageCompareImage(section, 1) ? imageCompareImage(section, 1).contentType : null"
        :right-image-attribution="attributionFields(section.hasPartCollection.items[1])"
        :right-image-width="imageCompareImage(section, 1) ? imageCompareImage(section, 1).width : null"
        :right-image-height="imageCompareImage(section, 1) ? imageCompareImage(section, 1).height : null"
      />
      <ImageWithAttributionContainer
        v-else-if="contentType(section, 'ImageWithAttribution')"
        :src="section.image ? section.image.url : null"
        :content-type="section.image ? section.image.contentType : null"
        :width="section.image ? section.image.width : null"
        :height="section.image ? section.image.height : null"
        :alt="section.image && section.image.description ? section.image.description : ''"
        :attribution="attributionFields(section)"
        :rights-statement="section.license"
      />
      <CallToAction
        v-else-if="contentType(section, 'Link')"
        :text="section.text"
        :url="section.url"
      />
      <CallToActionBanner
        v-else-if="contentType(section, 'PrimaryCallToAction') && section.image"
        :name="section.name"
        :text="section.text"
        :link="section.relatedLink"
        :illustration="section.image"
      />
      <ContentPrimaryCallToAction
        v-else-if="contentType(section, 'PrimaryCallToAction')"
        :text="section.text"
        :link="section.relatedLink"
      />
    </div>
  </div>
</template>

<script>
  export default {
    components: {
      BrowseAutomatedCardGroup: () => import('./BrowseAutomatedCardGroup'),
      CallToAction: () => import('../generic/CallToAction'),
      CallToActionBanner: () => import('../generic/CallToActionBanner'),
      ContentCardSection: () => import('../content/ContentCardSection'),
      ContentPrimaryCallToAction: () => import('../content/ContentPrimaryCallToAction'),
      ContentRichText: () => import('../content/ContentRichText'),
      EmbedHTML: () => import('../embed/EmbedHTML'),
      ImageComparisonSlider: () => import('../image/ImageComparisonSlider'),
      ImageWithAttributionContainer: () => import('../image/ImageWithAttributionContainer')
    },

    props: {
      richTextIsCard: {
        type: Boolean,
        default: true
      },

      sections: {
        type: Array,
        default: () => []
      }
    },

    methods: {
      contentType(section, typeName) {
        return section && (section['__typename'] === typeName);
      },
      attributionFields(fields) {
        return {
          name: fields?.name,
          creator: fields?.creator,
          provider: fields?.provider,
          rightsStatement: fields?.license,
          url: fields?.url
        };
      },
      imageCompareImage(section, index) {
        return section.hasPartCollection?.items?.[index]?.image;
      }
    }
  };
</script>

<style lang="scss" scoped>
  ::v-deep .attribution {
    &::after {
      padding-top: 0.2rem;
    }
  }
</style>
