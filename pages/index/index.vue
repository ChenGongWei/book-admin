<template>
	<scroll-view style="padding: 15px;box-sizing: border-box;">
		<view class="title">
			{{userInfo.username}}，欢迎您登录本系统~
		</view>
		<!-- #ifndef H5 -->
		<fix-window />
		<!-- #endif -->
	</scroll-view>
</template>

<script>
	import {
		mapMutations,
		mapState
	} from 'vuex'

	export default {
		data() {
			return {
			}
		},
		computed: {
			...mapState('user', ['userInfo']),
		},
		watch: {

		},
		onLoad() {},
		
	}
</script>

<style>
	/* #ifndef H5 */
	page {
		padding-top: 85px;
	}

	/* #endif */
</style>
<style scoped>
	.title {
		font-size: 20px;
	}
</style>
