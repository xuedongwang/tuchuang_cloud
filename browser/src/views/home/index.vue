<template>
  <div class="home">
    <input
      type="file"
      :multiple="false"
      @change="handleFileChange"
      ref="fileInputRef"
    >
    <div class="progress-wrapper">
      <div
        class="progress-inner"
        :style="{
        width: `${percent * 100}%`
      }"
      ></div>
    </div>
    {{ (percent * 100).toFixed(2) }}%
    <br>
    <!-- <button @click="cancel">暂停</button>
    <button @click="resume">暂停</button> -->
  </div>
</template>
<script>
let OSS = require('ali-oss');
const FileType = require('file-type/browser');
const SparkMD5 = require('spark-md5');
export default {
  name: 'Home',
  data() {
    return {
      file: null,
      client: null,
      percent: 0,
    }
  },
  mounted() {},
  methods: {
    reset() {
      this.percent = 0;
      this.client = null;
      this.$refs.fileInputRef.value = null;
    },
    file2ArraBuffer(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file)
        reader.onload = res => {
          resolve(res.target.result);
        }
        reader.onerror = err => {
          reject(err);
        }
      })
    },
    initOSSClient (config) {
      const { initOSSClient, ...rest } = config;
      return new OSS({
        ...rest
      });
    },
    fetchConfig () {
      return $http.get('/sts');
    },
    cancel(client) {
      this.client && this.client.cancel();
    },
    resume() {
      this.uploadFile();
    },
    getFileExtByFilename(filename) {
      const filenameSplitArr = filename.split('.');
      return filenameSplitArr.length > 1 ? filenameSplitArr.slice(-1)[0] : '';
    },
    async uploadFile() {
      try {
        const { ext = this.getFileExtByFilename(this.file.name) } = await FileType.fromBuffer(await this.file2ArraBuffer(this.file)) || {};
        console.log(ext)
        const { data } = await this.fetchConfig();
        this.client = this.initOSSClient(data);
        let result = await this.client.multipartUpload(`${ext}/${$uuid()}.${ext}`, this.file, {
          progress: (percent, checkpoint) => {
            this.percent = percent;
          }
        });
        console.log(result);
        this.reset()
      } catch (err) {
        throw err;
      }
    },
    async handleFileChange (e) {
      this.file = e.target.files[0];
      this.uploadFile();
    }
  }
}
</script>
<style lang="scss" scoped>
.progress-wrapper {
  width: 500px;
  height: 50px;
  border: 1px solid slateblue;
  .progress-inner {
    width: 0;
    height: 100%;
    background: slateblue;
  }
}
</style>
