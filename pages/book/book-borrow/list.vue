<template>
	<view>
		<view class="uni-header">
			<view class="uni-group">
				<view class="uni-title">借阅管理</view>
				<view class="uni-sub-title"></view>
			</view>
			<view class="uni-group">
				<input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="请输入搜索内容" />
				<button class="uni-button" type="default" size="mini" @click="search">搜索</button>
				<!-- <button class="uni-button" type="default" size="mini" @click="navigateTo('./add')">新增</button>
				<button class="uni-button" type="default" size="mini" :disabled="!selectedIndexs.length"
					@click="delTable">批量删除</button> -->
			</view>
		</view>
		<view class="uni-container">
			<unicloud-db ref="udb" collection="book-borrow"
				field="book_uni_id,book_id,book_name,lend_uid,lend_user,create_date,end_date,status" :where="where+searchWhere"
				page-data="replace" :orderby="orderby" :getcount="true" :page-size="options.pageSize"
				:page-current="options.pageCurrent" v-slot:default="{data,pagination,loading,error,options}"
				:options="options">
				<uni-table :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe>
					<uni-tr>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'book_id')">图书id</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'book_name')">图书名</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'lend_uid')">借阅人账号</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'lend_user')">借阅人姓名</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'create_date')">借阅时间</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'end_date')">归还时间</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'status')">状态</uni-th>
						<uni-th width="204" align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="(item,index) in data" :key="index">
						<uni-td align="center"> {{item.book_id}} </uni-td>
						<uni-td align="center"> {{item.book_name}} </uni-td>
						<uni-td align="center"> {{item.lend_uid}} </uni-td>
						<uni-td align="center"> {{item.lend_user}} </uni-td>
						<uni-td align="center">
							<uni-dateformat :date="item.create_date" :threshold="[0, 0]" />
						</uni-td>
						<uni-td align="center">
							<uni-dateformat :date="item.end_date" :threshold="[0, 0]" />
						</uni-td>
						<uni-td align="center"> {{item.status == true ? '已归还' : '未归还'}} </uni-td>
						<uni-td align="center">
							<view class="uni-group">
								<!-- <button @click="navigateTo('./edit?id='+item._id, false)" class="uni-button" size="mini"
									type="primary">修改</button>
								<button @click="confirmDelete(item._id)" class="uni-button" size="mini"
									type="warn">删除</button> -->

								<button v-if="!item.status" @click="returnBook(item._id, item.book_uni_id, item.book_name)"
									class="uni-button" size="mini" type="primary">归还</button>
								<button v-if="!item.status" @click="renewBook(item._id, item.book_name)" class="uni-button"
									size="mini">续借</button>
							</view>
						</uni-td>
					</uni-tr>
				</uni-table>
				<view class="uni-pagination-box">
					<uni-pagination show-icon :page-size="pagination.size" v-model="pagination.current"
						:total="pagination.count" @change="onPageChanged" />
				</view>
			</unicloud-db>
		</view>
	</view>
</template>

<script>
	import {
		mapMutations,
		mapState
	} from 'vuex'
	import {
		enumConverter
	} from '../../../js_sdk/validator/book-borrow.js';

	const db = uniCloud.database()
	// 表查询配置
	const dbOrderBy = 'create_date desc' // 排序字段
	const dbSearchFields = ['book_id', 'book_name', 'lead_uid', 'lend_user'] // 模糊搜索字段，支持模糊搜索的字段列表
	// 分页配置
	const pageSize = 20
	const pageCurrent = 1
	
	const orderByMapping = {
		"ascending": "asc",
		"descending": "desc"
	}

	export default {
		data() {
			console.log(123)
			let username = uni.getStorageSync('lastUsername')
			let role = JSON.parse(uni.getStorageSync('role') || '[]') || []
			let where = role[0] === 'student' ? ` lend_uid == '${username}'` : ''
			return {
				query: '',
				where: where,
				searchWhere: '',
				orderby: dbOrderBy,
				selectedIndexs: [],
				options: {
					pageSize,
					pageCurrent,
					...enumConverter
				},
				imageStyles: {
					width: 64,
					height: 64
				}
			}
		},
		computed: {
			...mapState('user', ['userInfo'])
		},
		methods: {
			getWhere() {
				const query = this.query.trim()
				if (!query) {
					return ''
				}
				const queryRe = new RegExp(query, 'i')
				return dbSearchFields.map(name => queryRe + '.test(' + name + ')').join(' || ')
			},
			search() {
				const newWhere = this.getWhere()
				const isSameWhere = newWhere === this.where
				this.searchWhere = (!this.where ? '' : ' && ') + newWhere
				if (isSameWhere) { // 相同条件时，手动强制刷新
					this.loadData()
				}
			},
			loadData(clear = true) {
				this.$refs.udb.loadData({
					clear
				})
			},
			onPageChanged(e) {
				this.$refs.udb.loadData({
					current: e.current
				})
			},
			navigateTo(url, clear) {
				// clear 表示刷新列表时是否清除页码，true 表示刷新并回到列表第 1 页，默认为 true
				uni.navigateTo({
					url,
					events: {
						refreshData: () => {
							this.loadData(clear)
						}
					}
				})
			},
			
			confirmDelete(id) {
				this.$refs.udb.remove(id)
			},
			sortChange(e, name) {
				this.orderByFieldName = name;
				if (e.order) {
					this.orderby = name + ' ' + orderByMapping[e.order]
				} else {
					this.orderby = ''
				}
				this.$refs.table.clearSelection()
				this.$nextTick(() => {
					this.$refs.udb.loadData()
				})
			},
			/**
			 * 归还书籍
			 * @param {Object} borrow_id  借阅记录id
			 * @param {Object} book_id  书籍id
			 * @param {Object} book_name  书籍名
			 */
			returnBook(borrow_id, book_id, book_name) {
				uni.showModal({
					title: '温馨提示',
					content: '您确定要归还《' + book_name + '》这本书吗？',
					showCancel: true,
					success: res => {
						if (res.confirm) {
							uni.showLoading({
								mask: true
							})
							// 使用 clientDB 提交数据
							db.collection('book-borrow').doc(borrow_id).update({
								end_date: new Date().getTime(),
								status: true
							}).then(() => {
								db.collection('book-info').doc(book_id).get().then(res => {
									let num = res.result.data[0].lend_num
									db.collection('book-info').doc(book_id).update({
										lend_num: num - 1
									}).then(res => {
										uni.showToast({
											title: '归还成功'
										})
										setTimeout(() => this.loadData(), 500)
									}).catch(err => {
										uni.showModal({
											content: err.message || '请求服务失败',
											showCancel: false
										})
									}).finally(() => {
										uni.hideLoading()
									})
								})
							}).catch(err => {
								uni.showModal({
									content: err.message || '请求服务失败',
									showCancel: false
								})
							}).finally(() => {
								uni.hideLoading()
							})
						}
					}
				})
			},
			/**
			 * 续借
			 * @param {Object} borrow_id 借阅记录id
			 * @param {Object} book_name 书籍名
			 */
			renewBook(borrow_id, book_name) {
				uni.showModal({
					title: '温馨提示',
					content: '您确定要续借《' + book_name + '》这本书吗？',
					showCancel: true,
					success: res => {
						if (res.confirm) {
							uni.showLoading({
								mask: true
							})
							// 使用 clientDB 提交数据
							db.collection('book-borrow').doc(borrow_id).update({
								end_date: new Date().getTime() + (30 * 24 * 3600 * 1000)
							}).then(() => {
								uni.showToast({
									title: '续借成功'
								})
								setTimeout(() => this.loadData(), 500)

							}).catch(err => {
								uni.showModal({
									content: err.message || '请求服务失败',
									showCancel: false
								})
							}).finally(() => {
								uni.hideLoading()
							})
						}
					}
				})
			}
		}
	}
</script>
<style>
</style>
