<template>
  <b-img-lazy
    v-if="lazy"
    :src="optimisedSrc"
    blank-color="#fff"
    :blank-width="optimisedWidth"
    :blank-height="optimisedHeight"
    :alt="alt"
    :srcset="imageSrcset"
    :sizes="imageSizes"
  />
  <b-img
    v-else
    :src="optimisedSrc"
    :width="optimisedWidth"
    :height="optimisedHeight"
    :alt="alt"
    :srcset="imageSrcset"
    :sizes="imageSizes"
  />
</template>

<script>
  export default {
    name: 'ImageOptimised',

    props: {
      src: {
        type: String,
        required: true
      },
      width: {
        type: Number,
        required: true
      },
      height: {
        type: Number,
        required: true
      },
      alt: {
        type: String,
        default: ''
      },
      contentType: {
        // TODO: required?
        type: String,
        default: null
      },
      quality: {
        type: Number,
        default: 80
      },
      maxWidth: {
        type: Number,
        default: null
      },
      lazy: {
        type: Boolean,
        default: true
      },
      imageSrcset: {
        type: String,
        default: null
      },
      imageSizes: {
        type: String,
        default: null
      }
    },

    computed: {
      aspectRatio() {
        return this.width / this.height;
      },

      optimisedWidth() {
        return (this.maxWidth === null || this.width <= this.maxWidth) ? this.width : this.maxWidth;
      },

      optimisedHeight() {
        return Math.round(this.optimisedWidth / this.aspectRatio);
      },

      optimisedSrc() {
        if (typeof this.contentType !== 'string' || !this.$contentful.assets.isValidUrl(this.src)) {
          return this.src;
        }
        return this.$contentful.assets.optimisedSrc(
          { url: this.src, contentType: this.contentType },
          { w: this.maxWidth, q: this.quality }
        );
      }
    }
  };
</script>
