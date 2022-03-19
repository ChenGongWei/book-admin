<template>
	<scroll-view style="padding: 15px;box-sizing: border-box;">
		<view class="title">
			{{userInfo.nickname}}，欢迎您登录本系统~
		</view>

		<view class="index-top">
			<view class="top-item">
				<view class="item-title">馆藏数</view>
				<view class="item-content">
					<view class="item-content-num">
						<view>15</view>
						<view>种类</view>
					</view>
					<view class="item-content-num">
						<view>133</view>
						<view>总数量</view>
					</view>
				</view>
			</view>
			<view class="top-item">
				<view class="item-title">借阅数</view>
				<view class="item-content">
					<view class="item-content-num">
						<view>85</view>
						<view>借阅</view>

					</view>
					<view class="item-content-num">
						<view>21</view>
						<view>待还</view>

					</view>
				</view>
			</view>
			<view class="top-item">
				<view class="item-title">我的借阅</view>
				<view class="item-content">
					<view class="item-content-num">
						<view>2</view>
						<view>待还数</view>

					</view>
					<view class="item-content-num">
						<view>13</view>
						<view>总借阅数</view>

					</view>
				</view>
			</view>
		</view>

	<view class="center-content">
		<view class="center-title">借阅排行</view>
		<view class="chart-content">
			<view class="charts-box1">
			  <qiun-data-charts
			    type="column"
			    :chartData="bookData"
			    :errorReload="false"
			    background="none"
			  />
			</view>
			<view class="charts-box1">
		  <qiun-data-charts
		    type="word"
		    :chartData="wordData"
		    :errorReload="false"
		    background="none"
		  />
		</view>
		</view>
		
	</view>

		<view class="charts-box">
			<qiun-data-charts type="line" :chartData="chartData" background="none" />
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
	const db = uniCloud.database();
	const dbCmd = db.command;
	const dbCollectionName = 'book-borrow';

	export default {
		data() {
			return {
				chartData: {
					"categories": ['2021-04','2021-05','2021-06','2021-07','2021-08','2021-09','2021-10','2021-11','2021-12','2022-01','2022-02','2022-03'],
					"series": [{
							"name": "借阅量",
							"data": [12,25,17,35,22,21,9,16,34,12,21,8]
						}
					]
				},
				bookData: {
					"categories": [
					        "编译原理",
					        "C程序设计语言",
					        "机器学习",
					        "设计模式",
					        "离散数学及其应用",
					        "Java编程思想"
					    ],
						 "series": [
						        {
						            "name": "借阅量",
						            "data": [
						                35,
						                30,
						                25,
						                18,
						                11,
						                4
						            ]
						        },]
				},
				wordData: {
					series: [
						{
						            "name": "编译原理",
						            "textSize": 35
						        },
						        {
						            "name": "机器学习",
						            "textSize": 25
						        },
						        {
						            "name": "离散数学及其应用",
						            "textSize": 25
						        },
						        {
						            "name": "计算机程序的构造和解释",
						            "textSize": 20
						        },
						        {
						            "name": "算法导论",
						            "textSize": 20
						        },
						        {
						            "name": "C程序设计语言",
						            "textSize": 30
						        },
						        {
						            "name": "深入理解计算机系统",
						            "textSize": 10
						        },
						        {
						            "name": "设计模式",
						            "textSize": 25
						        },
						        {
						            "name": "Java编程思想",
						            "textSize": 20
						        },
						        {
						            "name": "编码的奥秘",
						            "textSize": 12
						        },
						        {
						            "name": "数据结构与算法分析",
						            "textSize": 10
						        },
						        {
						            "name": "深入理解计算机系统",
						            "textSize": 12
						        },
						        {
						            "name": "斗破苍穹",
						            "textSize": 10
						        },
						        {
						            "name": "斗罗大陆",
						            "textSize": 12
						        },
						       
					]
				}
			}
		},
		computed: {
			...mapState('user', ['userInfo']),
		
		},
		watch: {

		},
		methods: {
	
		},

		onLoad() {
			console.log(this.userInfo)
		},

	}
</script>

<style>
	/* #ifndef H5 */
	page {
		padding-top: 85px;
	}

	/* #endif */
</style>
<style scoped lang="scss">
	.title {
		font-size: 20px;
	}

.center-content {
	margin: 20px;
	.center-title {
		height: 60px;
		font-size: 25px;
		font-weight: bold;
		line-height: 60px;
		padding-left: 10px;
		border-bottom: 1px solid #eee;
	}
	.chart-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		
		.charts-box1 {
			width: 50%;
			height: 400px;
		}
	}
}

	.index-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20px;

		.top-item {
			width: 400px;
			height: 200px;
			border-radius: 10px;
			box-shadow: 0 0 10px 0 #ccc;

			.item-title {
				height: 60px;
				font-size: 25px;
				font-weight: bold;
				line-height: 60px;
				padding-left: 10px;
				border-bottom: 1px solid #eee;
			}

			.item-content {
				display: flex;
				font-size: 23px;


				.item-content-num {
					flex: 1;
					display: flex;
					flex-direction: column;
					align-items: center;
					padding-left: 10px;
					margin-top: 30px;

					view:nth-child(1) {
						color: #007AFF;
					}
				}
			}
		}
	}

	.charts-box {
		width: 100%;
		height: 500px;
	}
</style>
