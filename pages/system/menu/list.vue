<template>
	<view>
		<view class="uni-header">
			<view class="uni-group">
				<view class="uni-title">菜单管理</view>
				<view class="uni-sub-title"></view>
			</view>
		</view>
		<view>
			<view class="uni-header" style="border-bottom: 0;margin-bottom: -15px;">
				<view class="uni-group">
					<button @click="navigateTo('./add')" size="mini" plain="true" type="primary">新增一级菜单</button>
				</view>
				<view class="uni-group">

				</view>
			</view>
			<view class="uni-container">
				<unicloud-db ref="udb" @load="onqueryload" collection="opendb-admin-menus" :options="options"
					:where="where" page-data="replace" :orderby="orderby" :getcount="true" :page-size="options.pageSize"
					:page-current="options.pageCurrent" v-slot:default="{data,pagination,loading,error}">
					<uni-table :loading="loading" :emptyText="errMsg || '没有更多数据'" border stripe>
						<uni-tr>
							<uni-th align="center">排序</uni-th>
							<uni-th width="200" align="center">名称</uni-th>
							<uni-th align="center">标识</uni-th>
							<uni-th align="center">URL</uni-th>
							<uni-th width="100" align="center">是否启用</uni-th>
							<uni-th width="160" align="center">操作</uni-th>
						</uni-tr>
						<uni-tr v-for="(item,index) in data" :key="index">
							<uni-td align="center">{{item.sort}}</uni-td>
							<uni-td>{{item.name}}</uni-td>
							<uni-td>{{item.menu_id}}</uni-td>
							<uni-td>{{item.url}}</uni-td>
							<uni-td align="center" :class="{'menu-disable':!item.enable}">{{item.enable?'已启用':'未启用'}}
							</uni-td>
							<uni-td align="center">
								<view class="uni-group">
									<button v-if="!item.url" @click="navigateTo('./add?parent_id='+item.menu_id, false)"
										class="uni-button" size="mini" type="primary">子菜单</button>
									<button @click="navigateTo('./edit?id='+item._id, false)" class="uni-button"
										size="mini" type="primary">修改</button>
									<button
										v-if="item.menu_id !== 'system_menu' && item.menu_id !== 'system_management'"
										@click="confirmDelete(item)" class="uni-button" size="mini"
										type="warn">删除</button>
								</view>
							</uni-td>
						</uni-tr>
					</uni-table>
				</unicloud-db>
			</view>
		</view>
		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
	</view>
</template>

<script>
	import { buildMenus } from '../../../components/uni-data-menu/util.js'
	const db = uniCloud.database()
	// 表查询配置
	const dbOrderBy = 'create_date asc'
	// 分页配置
	const pageSize = 20
	const pageCurrent = 1

	import {
		mapActions
	} from 'vuex'

	// 获取父的个数
	function getParents(menus, id, depth = 0) {
		menus.forEach(menu => {
			if (menu.menu_id === id && menu.parent_id) {
				depth = depth + 1 + getParents(menus, menu.parent_id, depth)
			}
		})
		return depth
	}

	// 获取子的 _id
	function getChildren(menus, id, childrenIds = []) {
		if (menus.find(menu => menu.parent_id === id)) {
			menus.forEach(item => {
				if (item.parent_id === id) {
					childrenIds.push(item._id)
					getChildren(menus, item.menu_id, childrenIds)
				}
			})
		}
		return childrenIds
	}

	export default {
		data() {
			return {
				query: '',
				where: '',
				orderby: dbOrderBy,
				options: {
					pageSize,
					pageCurrent
				},
				selectedIndexs: [], //批量选中的项
				loading: true,
				menus: [],
				errMsg: '',
			}
		},
		methods: {
			...mapActions({
				init: 'app/init'
			}),
			getSortMenu(menuList) {
				// 标记叶子节点
				menuList.map(item => {
					if (!menuList.some(subMenuItem => subMenuItem.parent_id === item.menu_id)) {
						item.isLeafNode = true
					}
				})
				return buildMenus(menuList)
			},
			onqueryload(data) {
				for (var i = 0; i < data.length; i++) {
					let item = data[i]
					const depth = getParents(data, item.menu_id)
					item.name = (depth ? '　'.repeat(depth) + '|-' : '') + item.name
				}
				const menuTree = this.getSortMenu(data)
				const sortMenus = []
				this.patTree(menuTree, sortMenus)
				data.length = 0;
				data.push(...sortMenus)
				this.menus = data //仅导出当前页
			},
			patTree(tree, sortMenus) {
				tree.forEach(item => {
					sortMenus.push(item)
					if (item.children.length) {
						this.patTree(item.children, sortMenus)
					}
				})
				return sortMenus
			},
			loadData(clear = true) {
				this.$refs.udb.loadData({
					clear
				})
			},
			navigateTo(url, clear) { // clear 表示刷新列表时是否清除当前页码，true 表示刷新并回到列表第 1 页，默认为 true
				uni.navigateTo({
					url,
					events: {
						refreshData: () => {
							this.loadData(clear)
						}
					}
				})
			},
			confirmDelete(menu) {
				let ids = menu._id
				let content = '是否删除该菜单？'
				// 如有子菜单
				const children = getChildren(this.menus, menu.menu_id)
				if (children.length) content = '是否删除该菜单及其子菜单？'
				ids = [ids, ...children]
				uni.showModal({
					title: '提示',
					content,
					success: (res) => {
						if (!res.confirm) {
							return
						}
						this.$refs.udb.remove(ids, {
							needConfirm: false
						})
					}
				})
			}
			
		}
	}
</script>
<style>
	/* #ifndef H5 */
	page {
		padding-top: 85px;
	}

	/* #endif */
	.menu-disable {
		color: red;
	}

	.menu-badge {
		position: absolute;
		top: 0;
		right: 5px;
	}
</style>
