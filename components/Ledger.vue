<template>
  <div class="ledger">
    <div
      class="ledger-input ledger-input--facade box"
      v-html="linebreaktobr(period.ledger)"
    ></div>
    <textarea
      v-model="period.ledger"
      class="ledger-input ledger-input--textarea box"
    ></textarea>
  </div>
</template>

<script>
export default {
  props: ['period'],
  methods: {
    linebreaktobr(text) {
      return text.replace(/\n/g, '<br>') + '&nbsp;'
    }
  }
}
</script>

<style lang="less">
.ledger {
  font-family: monospace;
  width: 100%;
  position: relative;
  padding-bottom: 300px;

  &-input {
    width: 100%;
    font-size: inherit;
    font-family: inherit;
    word-spacing: inherit;

    &--facade {
      height: auto;
    }
    &--textarea {
      border: 0;
      height: 100%;
      position: absolute;
      top: 0;
      padding-left: 7px !important; // Works better in safari ios
      background-color: transparent;
      color: transparent;
      caret-color: #000;
    }
  }
}
</style>
