<template>
  <div class="container">
    <h1>Import data from file</h1>
    <input type="file" name="file" @change="changeFile" />
    <p v-if="importedData">
      <textarea v-model="importedData" disabled></textarea>
      <button @click="importData()">Import!</button>
    </p>
    <p>
      <nuxt-link to="/">Return to app</nuxt-link>
    </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      importedData: ''
    }
  },
  mounted() {},
  methods: {
    changeFile(event) {
      if (!event.target.files[0]) {
        return
      }

      console.log('FILE', event, event.target.files[0])

      const reader = new FileReader()
      reader.onload = (event) => {
        console.log('result', event.target.result)
        this.importedData = event.target.result
      }
      reader.onerror = (error) => console.log(error)
      reader.readAsText(event.target.files[0])
    },
    importData() {
      localStorage.periods = this.importedData
    }
  }
}
</script>

<style lang="less"></style>
