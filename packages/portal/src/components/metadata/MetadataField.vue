<template>
  <div
    v-if="hasValuesForLocale"
    :data-field-name="name"
    data-qa="metadata field"
    class="metadata-row d-lg-flex"
  >
    <h3
      v-if="labelled"
      :id="labelId"
      data-qa="label"
      class="m-0"
    >
      {{ $t(`fieldLabels.${context}.${name}`) }}
    </h3>
    <ul
      class="m-0 p-0 text-left text-lg-right list-unstyled"
      :aria-labelledby="labelled && labelId"
    >
      <MetadataOriginLabel :translation-source="fieldData.translationSource" />
      <template
        v-for="(value, index) of displayValues.values"
      >
        <template
          v-if="value.about"
        >
          <li
            v-for="(nestedValue, nestedIndex) of value.values"
            :key="index + '_' + nestedIndex"
            :lang="value.code"
            :data-qa="fieldData.url ? 'entity link' : 'entity value'"
          >
            <SmartLink
              v-if="fieldData.url"
              :destination="fieldData.url"
            >
              {{ nestedValue }}
            </SmartLink>
            <ItemEntityField
              v-else
              :text="nestedValue"
              :about="value.about"
            />
          </li>
        </template>
        <li
          v-else
          :key="index"
          :lang="langMappedValues.code"
          data-qa="literal value"
        >
          <SmartLink
            v-if="fieldData.url"
            :destination="fieldData.url"
          >
            {{ value }}
          </SmartLink>
          <template
            v-else
          >
            {{ value }}
          </template>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
  import { langMapValueForLocale } from  '@/plugins/europeana/utils';
  import ItemEntityField from '../item/ItemEntityField';
  import MetadataOriginLabel from './MetadataOriginLabel';
  import SmartLink from '../generic/SmartLink';
  import itemPrefLanguage from '@/mixins/europeana/item/itemPrefLanguage';

  export default {
    name: 'MetadataField',

    components: {
      ItemEntityField,
      MetadataOriginLabel,
      SmartLink
    },

    mixins: [itemPrefLanguage],

    props: {
      name: {
        type: String,
        default: ''
      },
      metadataLanguage: {
        type: String,
        default: null
      },
      fieldData: {
        type: [String, Object, Array],
        default: null
      },
      context: {
        type: String,
        default: 'default'
      },
      labelId: {
        type: String,
        default: null
      },
      labelled: {
        type: Boolean,
        default: true
      },
      limit: {
        type: Number,
        default: -1
      },
      omitAllUris: {
        type: Boolean,
        default: false
      },
      omitUrisIfOtherValues: {
        type: Boolean,
        default: false
      }
    },

    computed: {
      displayValues() {
        const display = Object.assign({}, this.langMappedValues);

        if (this.limitDisplayValues && (display.values.length > this.limit)) {
          display.values = display.values.slice(0, this.limit).concat(this.$t('formatting.ellipsis'));
        }
        return display;
      },

      limitDisplayValues() {
        return (this.limit > -1);
      },

      prefLanguage() {
        return this.getPrefLanguage(this.name, this.fieldData);
      },

      langMappedValues() {
        if (this.fieldData === null) {
          return null;
        } else if (typeof (this.fieldData) === 'string') {
          return { values: [this.fieldData], code: '' };
        } else if (Array.isArray(this.fieldData)) {
          return { values: this.fieldData, code: '' };
        } else if (Object.prototype.hasOwnProperty.call(this.fieldData, 'url')) {
          return langMapValueForLocale(this.fieldData.value, this.prefLanguage);
        }
        return langMapValueForLocale(this.fieldData, this.prefLanguage, {
          omitUrisIfOtherValues: this.omitUrisIfOtherValues, omitAllUris: this.omitAllUris
        });
      },

      hasValuesForLocale() {
        return (this.langMappedValues?.values?.length || 0) >= 1;
      }
    }
  };
</script>

<style lang="scss" scoped>
  @import '@europeana/style/scss/variables';
  @import '@europeana/style/scss/icons';

  .metadata-row {
    border-bottom: 1px solid #e7e7e9;
    font-size: $font-size-small;
    padding: 1rem 0;

    &:first-child {
      padding-top: 0;
    }

    h3 {
      font-size: inherit;
      line-height: 1.5;
    }

    ul {
      font-weight: 600;

      li {
        display: inline;

        &:not(:last-child)::after {
          content: ';';
          padding: 0 0.2rem;
        }

        ::v-deep .icon-external-link {
          vertical-align: initial;
          font-size: 0.75rem;
        }
      }
    }

    @media (min-width: $bp-large) {
      h3,
      ul {
        flex: 1;
      }
    }
  }
</style>
