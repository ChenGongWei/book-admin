<template>
	<view class="uni-container">
		<uni-forms ref="form" :value="formData" validateTrigger="bind">
			<uni-forms-item name="book_id" label="图书id" required>
				<uni-easyinput placeholder="请输入图书id，不可重复(例如: TP-20153)" v-model="formData.book_id" trim="both" />
			</uni-forms-item>
			<uni-forms-item name="book_name" label="图书名" required>
				<uni-easyinput placeholder="请输入图书名" v-model="formData.book_name" trim="both" />
			</uni-forms-item>
			<uni-forms-item name="author" label="作者">
				<uni-easyinput placeholder="请输入作者" v-model="formData.author" trim="both" />
			</uni-forms-item>
			<uni-forms-item name="publisher" label="出版社">
				<uni-easyinput placeholder="请输入出版社" v-model="formData.publisher" trim="both" />
			</uni-forms-item>
			<uni-forms-item name="price" label="价格">
				<uni-easyinput placeholder="请输入价格" type="number" v-model="formData.price" />
			</uni-forms-item>
			<uni-forms-item name="type" label="类型">
				<uni-easyinput placeholder="请输入类型" v-model="formData.type" trim="both" />
			</uni-forms-item>
			<uni-forms-item name="introduction" label="简介">
				<uni-easyinput placeholder="请输入简介" v-model="formData.introduction" trim="both" />
			</uni-forms-item>
			<uni-forms-item name="has_num" label="馆藏数" required>
				<uni-easyinput placeholder="请输入馆藏数" type="number" v-model="formData.has_num" />
			</uni-forms-item>
<!-- 			<uni-forms-item name="lend_num" label="借出数">
				<uni-easyinput placeholder="请输入借出数" type="number" v-model="formData.lend_num" />
			</uni-forms-item>
			<uni-forms-item name="lend_total" label="总借阅数">
				<uni-easyinput placeholder="请输入总借阅数" type="number" v-model="formData.lend_total" />
			</uni-forms-item> -->

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
	import {
		validator
	} from '../../../js_sdk/validator/book-info.js';

	const db = uniCloud.database();
	const dbCmd = db.command;
	const dbCollectionName = 'book-info';

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
					"author": "",
					"publisher": "",
					"price": null,
					"type": "",
					"introduction": "",
					"has_num": null,
					"lend_num": null,
					"lend_total": null
				},
				formOptions: {},
				rules: {
					...getValidator(["book_id", "book_name", "author", "publisher", "price", "type", "introduction",
						"has_num", "lend_num", "lend_total"
					])
				}
			}
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
				db.collection(dbCollectionName).add(value).then((res) => {
					uni.showToast({
						title: '新增成功'
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
			}
		}
	}
</script>
