'use strict';
let uniID = require('uni-id')
const uniCaptcha = require('uni-captcha')
const createConfig = require('uni-config-center')
const uniIdConfig = createConfig({
	pluginId: 'uni-id'
}).config()
const db = uniCloud.database()
const dbCmd = db.command
const usersDB = db.collection('uni-id-users')
exports.main = async (event, context) => {
	//UNI_WYQ:这里的uniID换成新的，保证多人访问不会冲突
	uniID = uniID.createInstance({
		context
	})
	console.log('event : ' + JSON.stringify(event))
	/*
	1.event为客户端 uniCloud.callFunction填写的data的值，这里介绍一下其中的属性
	  action：表示要执行的任务名称、比如：登陆login、退出登陆 logout等
	  params：业务数据内容
	  uniIdToken：系统自动传递的token，数据来源客户端的 uni.getStorageSync('uni_id_token')
	*/
	const {
		action,
		uniIdToken,
		inviteCode
	} = event;
	const deviceInfo = event.deviceInfo || {};
	let params = event.params || {};
	/*
	2.在某些操作之前我们要对用户对身份进行校验（也就是要检查用户的token）再将得到的uid写入params.uid
	  校验用到的方法是uniID.checkToken 详情：https://uniapp.dcloud.io/uniCloud/uni-id?id=checktoken

	  讨论，我们假设一个这样的场景，代码如下。
	  如：
		uniCloud.callFunction({
			name:"xxx",
			data:{
				"params":{
					uid:"通过某种方式获取来的别人的uid"
				}
			}
		})
	  用户就这样轻易地伪造了他人的uid传递给服务端，有一句话叫：前端从来的数据是不可信任的
	  所以这里我们需要将uniID.checkToken返回的uid写入到params.uid
	*/
	let noCheckAction = ['register', 'checkToken', 'login', 'logout', 'createCaptcha',
		'verifyCaptcha', 'refreshCaptcha', 'inviteLogin', 'loginByWeixin',
		 'resetPwdBySmsCode', 'registerAdmin'
	]
	if (!noCheckAction.includes(action)) {
		if (!uniIdToken) {
			return {
				code: 403,
				msg: '缺少token'
			}
		}
		let payload = await uniID.checkToken(uniIdToken)
		if (payload.code && payload.code > 0) {
			return payload
		}
		params.uid = payload.uid
	}

	//禁止前台用户传递角色
	if (action.slice(0, 7) == "loginBy") {
		if (params.role) {
			return {
				code: 403,
				msg: '禁止前台用户传递角色'
			}
		}
	}

	//3.注册成功后创建新用户的积分表方法
	async function registerSuccess(uid) {
		//用户接受邀请
		if (inviteCode) {
			await uniID.acceptInvite({
				inviteCode,
				uid
			});
		}
		//添加当前用户设备信息
		await db.collection('uni-id-device').add({
			...deviceInfo,
			user_id: uid
		})
		await db.collection('uni-id-scores').add({
			user_id: uid,
			score: 1,
			type: 1,
			balance: 1,
			comment: "",
			create_date: Date.now()
		})
	}
	//4.记录成功登录的日志方法
	const loginLog = async (res = {}) => {
		const now = Date.now()
		const uniIdLogCollection = db.collection('uni-id-log')
		let logData = {
			deviceId: params.deviceId || context.DEVICEID,
			ip: params.ip || context.CLIENTIP,
			type: res.type,
			ua: context.CLIENTUA,
			create_date: now
		};

		Object.assign(logData,
			res.code === 0 ? {
				user_id: res.uid,
				state: 1
			} : {
				state: 0
			})
		if (res.type == 'register') {
			await registerSuccess(res.uid)
		} else {
			if (Object.keys(deviceInfo).length) {
				console.log(979797, {
					deviceInfo,
					user_id: res
				});
				//更新当前用户设备信息
				await db.collection('uni-id-device').where({
					user_id: res.uid
				}).update(deviceInfo)
			}
		}
		return await uniIdLogCollection.add(logData)
	}

	let res = {}
	switch (action) { //根据action的值执行对应的操作
		/**
		 * 注册用户
		 * @param { username , password, nickname }  
		 * username 用户名
		 * password 密码
		 * nickname 昵称
		 */
		case 'register':
			var {
				username, password, nickname
			} = params
			if (/^1\d{10}$/.test(username)) {
				return {
					code: 401,
					msg: '用户名不能是手机号'
				}
			};
			if (/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/.test(username)) {
				return {
					code: 401,
					msg: '用户名不能是邮箱'
				}
			}
			res = await uniID.register({
				username,
				password,
				nickname
			});
			if (res.code === 0) {
				await registerSuccess(res.uid)
			}
			break;
		/**
		 * 登录
		 * @param { }  
		 */
		case 'login':
			//防止黑客恶意破解登录，连续登录失败一定次数后，需要用户提供验证码
			const getNeedCaptcha = async () => {
				//当用户最近“2小时内(recordDate)”登录失败达到2次(recordSize)时。要求用户提交验证码
				const now = Date.now(),
					recordDate = 120 * 60 * 1000,
					recordSize = 2;
				const uniIdLogCollection = db.collection('uni-id-log')
				let recentRecord = await uniIdLogCollection.where({
						deviceId: params.deviceId || context.DEVICEID,
						create_date: dbCmd.gt(now - recordDate),
						type: 'login'
					})
					.orderBy('create_date', 'desc')
					.limit(recordSize)
					.get();
				return recentRecord.data.filter(item => item.state === 0).length === recordSize;
			}

			let passed = false;
			let needCaptcha = await getNeedCaptcha();
			console.log('needCaptcha', needCaptcha);
			if (needCaptcha) {
				res = await uniCaptcha.verify({
					...params,
					scene: 'login'
				})
				if (res.code === 0) passed = true;
			}

			if (!needCaptcha || passed) {
				res = await uniID.login({
					...params,
					queryField: ['username', 'email', 'mobile']
				});
				res.type = 'login'
				await loginLog(res);
				needCaptcha = await getNeedCaptcha();
			}

			res.needCaptcha = needCaptcha;
			break;
		
		/**
		 * 校验token
		 */
		case 'checkToken':
			res = await uniID.checkToken(uniIdToken);
			break;
		/**
		 * 退出登录
		 */
		case 'logout':
			res = await uniID.logout(uniIdToken)
			break;
		
		/**
		 * 重置密码
		 */
		case 'updatePwd':
			res = await uniID.updatePwd(params)
			break;
		case 'createCaptcha':
			res = await uniCaptcha.create(params)
			break;
		case 'refreshCaptcha':
			res = await uniCaptcha.refresh(params)
			break;

			// =========================== admin api start =========================
		case 'registerAdmin': {
			var {
				username,
				password
			} = params
			let {
				total
			} = await db.collection('uni-id-users').where({
				role: 'admin'
			}).count()
			if (total) {
				return {
					code: 10001,
					message: '超级管理员已存在，请登录...'
				}
			}
			const appid = params.appid
			const appName = params.appName
			delete params.appid
			delete params.appName
			res = await uniID.register({
				username,
				password,
				role: ["admin"]
			})
			if (res.code === 0) {
				const app = await db.collection('opendb-app-list').where({
					appid
				}).count()
				if (!app.total) {
					await db.collection('opendb-app-list').add({
						appid,
						name: appName,
						description: "admin 管理后台",
						create_date: Date.now()
					})
				}

			}
		}
		break;
	case 'registerUser':
		const {
			userInfo
		} = await uniID.getUserInfo({
			uid: params.uid
		})
		if (userInfo.role.indexOf('admin') === -1) {
			res = {
				code: 403,
				message: '非法访问, 无权限注册超级管理员',
			}
		} else {
			res = await uniID.register({
				autoSetDcloudAppid: false,
				...params
			})
			if (res.code === 0) {
				delete res.token
				delete res.tokenExpired
				await uniID.setAuthorizedAppLogin({
					uid: res.uid,
					dcloudAppidList: ["__UNI__2450939"]
				})
			}
		}
		break;
	case 'updateUser': {
		const {
			userInfo
		} = await uniID.getUserInfo({
			uid: params.uid
		})
		if (userInfo.role.indexOf('admin') === -1) {
			res = {
				code: 403,
				message: '非法访问, 无权限注册超级管理员',
			}
		} else {

			// 过滤 password，注册用户成功后再提交
			const password = params.password
			delete params.password

			// 过滤 uid、id
			const id = params.id
			delete params.id
			delete params.uid


			res = await uniID.updateUser({
				uid: id,
				...params
			})
			if (res.code === 0) {
				if (password) {
					await uniID.resetPwd({
						uid: id,
						password
					})
				}
				await uniID.setAuthorizedAppLogin({
					uid: id,
					dcloudAppidList: ["__UNI__2450939"]
				})
			}
		}
		break;
	}
	case 'getCurrentUserInfo':
		res = await uniID.getUserInfo({
			uid: params.uid,
			...params
		})
		break;
		// =========================== admin api end =========================
	default:
		res = {
			code: 403,
			msg: '非法访问'
		}
		break;
	}
	//返回数据给客户端
	return res
}
