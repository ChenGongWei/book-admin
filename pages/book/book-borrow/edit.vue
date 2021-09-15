
<template>
  <view class="uni-container">
    <uni-forms ref="form" :value="formData" validateTrigger="bind">
      <uni-forms-item name="book_id" label="" required>
  <uni-easyinput placeholder="图书id，不可重复" v-model="formData.book_id" trim="both" />
</uni-forms-item>
<uni-forms-item name="book_name" label="">
  <uni-easyinput placeholder="图书名" v-model="formData.book_name" trim="both" />
</uni-forms-item>
<uni-forms-item name="lend_uid" label="" required>
  <uni-easyinput placeholder="借阅人账号" v-model="formData.lend_uid" trim="both" />
</uni-forms-item>
<uni-forms-item name="lend_user" label="">
  <uni-easyinput placeholder="借阅人姓名" v-model="formData.lend_user" trim="both" />
</uni-forms-item>
<uni-forms-item name="end_date" label="" required>
  <uni-datetime-picker return-type="timestamp" :value="formData.end_date" />
</uni-forms-item>
<uni-forms-item name="status" label="">
  <switch @change="binddata('status', $event.detail.value)" :checked="formData.status" />
</uni-forms-item>

      <view class="uni-button-group">
        <button type="primary" class="uni-button" style="width: 100px;" @click="submit">提交</button>
        <navigator open-type="navigateBack" style="margin-left: 15px;">
            <button class="uni-button" style="width: 100px;">返回</button>
        </navigator>
      </view>
    </uni-forms>
  </view>
</template>

<script>
  import { validator } from '../../../js_sdk/validator/book-borrow.js';

  const db = uniCloud.database();
  const dbCmd = db.command;
  const dbCollectionName = 'book-borrow';

  function getValidator(fields) {
    let reuslt = {}
    for (let key in validator) {
      if (fields.includes(key)) {
        reuslt[key] = validator[key]
      }
    }
    return reuslt
  }

  export default {
    data() {
      return {
        formData: {
  "book_id": "",
  "book_name": "",
  "lend_uid": "",
  "lend_user": "",
  "end_date": null,
  "status": null
},
        formOptions: {},
        rules: {
          ...getValidator(["book_id","book_name","lend_uid","lend_user","end_date","status"])
        }
      }
    },
    onLoad(e) {
      const id = e.id
      this.formDataId = id
      this.getDetail(id)
    },
    onReady() {
      this.$refs.form.setRules(this.rules)
    },
    methods: {
      /**
       * 触发表单提交
       */
      submit() {
        uni.showLoading({
          mask: true
        })
        this.$refs.form.submit().then((res) => {
          this.submitForm(res)
        }).catch((errors) => {
          uni.hideLoading()
        })
      },

      submitForm(value) {
        // 使用 clientDB 提交数据
        db.collection(dbCollectionName).doc(this.formDataId).update(value).then((res) => {
          uni.showToast({
            title: '修改成功'
          })
          this.getOpenerEventChannel().emit('refreshData')
          setTimeout(() => uni.navigateBack(), 500)
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        }).finally(() => {
          uni.hideLoading()
        })
      },

      /**
       * 获取表单数据
       * @param {Object} id
       */
      getDetail(id) {
        uni.showLoading({
          mask: true
        })
        db.collection(dbCollectionName).doc(id).field('book_id,book_name,lend_uid,lend_user,end_date,status').get().then((res) => {
          const data = res.result.data[0]
          if (data) {
            this.formData = data
          }
        }).catch((err) => {
          uni.showModal({
            content: err.message || '请求服务失败',
            showCancel: false
          })
        }).finally(() => {
          uni.hideLoading()
        })
      }
    }
  }
</script>

