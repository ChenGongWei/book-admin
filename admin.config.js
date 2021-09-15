export default {
	login: {
		url: '/pages/login/login' // 登录页面路径
	},
	index: {
		url: '/pages/index/index' // 登录后跳转的第一个页面
	},
	error: {
		url: '/pages/error/404' // 404 Not Found 错误页面路径
	},
	navBar: { // 顶部导航
		logo: '/static/zd.png', // 左侧 Logo
	},
	sideBar: { // 左侧菜单
		// 配置静态菜单列表（放置在用户被授权的菜单列表下边）
		staticMenu: [{
			menu_id: "demo",
			text: '静态功能演示',
			icon: 'uni-icons-list',
			url: "",
			children: [{
				menu_id: "icons",
				text: '图标',
				icon: 'uni-icons-star',
				value: '/pages/demo/icons/icons',
			}, {
				menu_id: "table",
				text: '表格',
				icon: 'uni-icons-map',
				value: '/pages/demo/table/table',
			}]
		}]
	}
}
