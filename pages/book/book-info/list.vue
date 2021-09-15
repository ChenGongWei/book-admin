<template>
	<view>
		<view class="uni-header">
			<view class="uni-group">
				<view class="uni-title">图书管理</view>
				<view class="uni-sub-title"></view>
			</view>
			<view class="uni-group">
				<input class="uni-search" type="text" v-model="query" @confirm="search" placeholder="请输入搜索内容" />
				<button class="uni-button" type="default" size="mini" @click="search">搜索</button>
				<button v-if="!userInfo.role.includes('student')" class="uni-button" type="primary" size="mini"
					@click="navigateTo('./add')">新增</button>
			</view>
		</view>
		<view class="uni-container">
			<unicloud-db ref="udb" collection="book-info"
				field="book_id,book_name,author,publisher,price,type,introduction,has_num,lend_num,lend_total"
				:where="where" page-data="replace" :orderby="orderby" :getcount="true" :page-size="options.pageSize"
				:page-current="options.pageCurrent" v-slot:default="{data,pagination,loading,error,options}"
				:options="options">
				<uni-table :loading="loading" :emptyText="error.message || '没有更多数据'" border stripe>
					<uni-tr>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'book_id')">图书id</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'book_name')">图书名</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'author')">作者</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'publisher')">出版社</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'price')">价格/元</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'type')">类型</uni-th>
						<uni-th align="center">简介</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'has_num')">馆藏数/本</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'lend_num')">借出/本</uni-th>
						<uni-th align="center" sortable @sort-change="sortChange($event, 'lend_num')">总借阅/次</uni-th>
						<uni-th align="center">操作</uni-th>
					</uni-tr>
					<uni-tr v-for="(item,index) in data" :key="index">
						<uni-td align="center"> {{item.book_id}} </uni-td>
						<uni-td align="center"> {{item.book_name}} </uni-td>
						<uni-td align="center"> {{item.author}} </uni-td>
						<uni-td align="center"> {{item.publisher}} </uni-td>
						<uni-td align="center"> {{item.price}} </uni-td>
						<uni-td align="center"> {{item.type}} </uni-td>
						<uni-td align="center"> {{item.introduction}} </uni-td>
						<uni-td align="center"> {{item.has_num}} </uni-td>
						<uni-td align="center"> {{item.lend_num}} </uni-td>
						<uni-td align="center"> {{item.lend_total}} </uni-td>
						<uni-td align="center">
							<view class="uni-group">
								<button v-if="!userInfo.role.includes('student')"
									@click="navigateTo('./edit?id='+item._id, false)" class="uni-button" size="mini"
									type="primary">修改</button>
								<button v-if="!userInfo.role.includes('student')" @click="confirmDelete(item._id)"
									class="uni-button" size="mini" type="warn">删除</button>
								<button v-if="userInfo.role.includes('student')" @click="borrowBook(item)"
									class="uni-button" :disabled="item.has_num - item.lend_num === 0" size="mini"
									type="primary">借阅</button>
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
		enumConverter,
		filterToWhere
	} from '../../../js_sdk/validator/book-info.js';

	const db = uniCloud.database()
	// 表查询配置
	const dbOrderBy = 'lend_total desc' // 排序字段
	const dbSearchFields = ['book_id', 'book_name', 'author'] // 模糊搜索字段，支持模糊搜索的字段列表
	// 分页配置
	const pageSize = 20
	const pageCurrent = 1

	const orderByMapping = {
		"ascending": "asc",
		"descending": "desc"
	}

	export default {
		data() {
			return {
				query: '',
				where: '',
				orderby: dbOrderBy,
				orderByFieldName: "",
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
				this.where = newWhere
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
			 * 借阅书籍
			 * @param {Object} book 书籍信息
			 */
			borrowBook(book) {
				const _id = book._id
				delete book._id
				uni.showModal({
					title: '温馨提示',
					content: '您确定要借阅《' + book.book_name + '》这本书吗？\n借阅成功后需在一个月内归还书籍并在本系统内点击归还~',
					showCancel: true,
					success: res => {
						if (res.confirm) {
							uni.showLoading({
								mask: true
							})
							// 使用 clientDB 提交数据
							db.collection('book-info').doc(_id).update({
								...book,
								lend_num: book.lend_num + 1,
								lend_total: book.lend_total + 1
							}).then((res) => {
								console.log(this.userInfo)
								db.collection('book-borrow').add({
									book_uni_id: _id,
									book_id: book.book_id,
									book_name: book.book_name,
									lend_uid: this.userInfo.username,
									lend_user: this.userInfo.nickname,
									end_date: new Date().getTime() + (30 * 24 * 3600 * 1000),
								}).then(() => {
									uni.showToast({
										title: '借阅成功'
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
				})

			}
		}
	}
</script>
<style>
</style>
