<template>
	<view class="user-center">
		<view class="header">
			<view class="header-content">
				<view class="logo-section">
					<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
					<text class="site-name">码客——程序员交流社区</text>
				</view>
				<view class="nav-section">
					<text class="nav-item" @click="goToIndex">首页</text>
					<text class="nav-item" @click="goToAboutPage">关于</text>
				</view>
			</view>
		</view>
		
		<view class="main-container">
			<view class="user-card">
				<view class="avatar-wrapper">
					<image class="avatar" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill"></image>
				</view>
				
				<view class="user-info">
					<text class="username" v-if="userInfo.nickname">{{ userInfo.nickname }}</text>
					<text class="username" v-else>未登录</text>
					
					<text class="email" v-if="userInfo.email">{{ userInfo.email }}</text>
					<text class="phone" v-if="userInfo.mobile">{{ userInfo.mobile }}</text>
				</view>
				
				<view class="login-actions" v-if="!isLoggedIn">
					<button class="login-btn" @click="goToLogin">登录</button>
					<button class="register-btn" @click="goToRegister">注册</button>
				</view>
				
				<view class="profile-actions" v-else>
					<button class="profile-btn" @click="goToUserProfile">个人资料</button>
					<button class="logout-btn" @click="logout">退出登录</button>
				</view>
			</view>
			
			<view class="quick-links">
				<view class="link-item" @click="goToMyArticles">
					<text class="link-icon">📝</text>
					<text class="link-text">我的文章</text>
				</view>
				<view class="link-item" @click="goToMyComments">
					<text class="link-icon">💬</text>
					<text class="link-text">我的评论</text>
				</view>
				<view class="link-item" @click="goToSettings">
					<text class="link-icon">⚙️</text>
					<text class="link-text">设置</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex'

export default {
	data() {
		return {
			userInfo: {}
		}
	},
	computed: {
		...mapState(['userInfo']),
		isLoggedIn() {
			return !!this.userInfo._id
		}
	},
	onLoad() {
		// 页面加载时获取用户信息
		this.getUserInfo()
	},
	methods: {
		// 获取用户信息
		getUserInfo() {
			const token = uni.getStorageSync('uni_id_token')
			if (token) {
				// 获取当前用户信息
				uniCloud.importObject('uni-id-co').getUserInfo().then(res => {
					if (res.errCode === 0) {
						this.userInfo = res.userInfo
						// 更新vuex状态
						this.$store.commit('setUserInfo', res.userInfo)
					}
				}).catch(err => {
					console.error('获取用户信息失败:', err)
				})
			}
		},
		
		// 跳转到登录页面
		goToLogin() {
			uni.navigateTo({
				url: '/uni_modules/uni-id-pages/pages/login/login-withpwd'
			})
		},
		
		// 跳转到注册页面
		goToRegister() {
			uni.navigateTo({
				url: '/uni_modules/uni-id-pages/pages/register/register'
			})
		},
		
		// 跳转到个人资料页面
		goToUserProfile() {
			uni.navigateTo({
				url: '/uni_modules/uni-id-pages/pages/userinfo/userinfo'
			})
		},
		
		// 退出登录
		logout() {
			uni.showModal({
				title: '确认退出',
				content: '确定要退出登录吗？',
				success: (res) => {
					if (res.confirm) {
						uniCloud.importObject('uni-id-co').logout().then(logoutRes => {
							if (logoutRes.errCode === 0) {
								// 清除本地存储的用户信息
								uni.removeStorageSync('uni_id_token')
								uni.removeStorageSync('uni_id_token_expired')
								
								// 更新vuex状态
								this.$store.commit('setUserInfo', {})
								
								// 重置用户信息
								this.userInfo = {}
								
								uni.showToast({
									title: '退出成功',
									icon: 'success'
								})
								
								// 跳转到登录页面
								setTimeout(() => {
									uni.redirectTo({
										url: '/uni_modules/uni-id-pages/pages/login/login-withpwd'
									})
								}, 1000)
							} else {
								uni.showToast({
									title: logoutRes.errMsg || '退出失败',
									icon: 'none'
								})
							}
						}).catch(err => {
							console.error('退出登录失败:', err)
							uni.showToast({
								title: '退出失败',
								icon: 'none'
							})
						})
					}
				}
			})
		},
		
		// 跳转到首页
		goToIndex() {
			uni.switchTab({
				url: '/pages/index/index'
			})
		},
		
		// 跳转到关于页面
		goToAboutPage() {
			uni.navigateTo({
				url: '/pages/about/about'
			})
		},
		
		// 跳转到我的文章页面
		goToMyArticles() {
			// 实现我的文章功能
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			})
		},
		
		// 跳转到我的评论页面
		goToMyComments() {
			// 实现我的评论功能
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			})
		},
		
		// 跳转到设置页面
		goToSettings() {
			// 实现设置功能
			uni.showToast({
				title: '功能开发中',
				icon: 'none'
			})
		}
	}
}
</script>

<style>
.user-center {
	min-height: 100vh;
	background-color: #f5f7fa;
	display: flex;
	flex-direction: column;
}

.header {
	background: #fff;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	position: sticky;
	top: 0;
	z-index: 1000;
	padding: 15rpx 0;
}

.header-content {
	width: 80%;
	max-width: none;
	margin: 0 auto;
	padding: 10rpx 40rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.logo-section {
	display: flex;
	align-items: center;
}

.logo {
	width: 80rpx;
	height: 80rpx;
	margin-right: 20rpx;
	border-radius: 50%;
}

.site-name {
	font-size: 32rpx;
	font-weight: bold;
	color: #2c3e50;
}

.nav-section {
	display: flex;
	gap: 30rpx;
}

.nav-item {
	font-size: 28rpx;
	color: #2c3e50;
	cursor: pointer;
	padding: 10rpx 15rpx;
	border-radius: 6rpx;
	transition: background-color 0.3s;
}

.nav-item:hover {
	background: #ecf0f1;
}

.main-container {
	flex: 1;
	padding: 20rpx;
	padding-top: 20rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.user-card {
	width: 100%;
	max-width: 600rpx;
	background: #fff;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	padding: 60rpx 40rpx;
	margin-top: 40rpx;
	text-align: center;
}

.avatar-wrapper {
	margin-bottom: 30rpx;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	border: 4rpx solid #ecf0f1;
	object-fit: cover;
}

.user-info {
	margin-bottom: 40rpx;
}

.username {
	display: block;
	font-size: 36rpx;
	font-weight: bold;
	color: #2c3e50;
	margin-bottom: 10rpx;
}

.email, .phone {
	display: block;
	font-size: 28rpx;
	color: #7f8c8d;
	margin-bottom: 5rpx;
}

.login-actions, .profile-actions {
	display: flex;
	gap: 20rpx;
	justify-content: center;
	margin-bottom: 30rpx;
}

.login-btn, .register-btn, .profile-btn, .logout-btn {
	padding: 20rpx 30rpx;
	border-radius: 50rpx;
	font-size: 28rpx;
	border: none;
	cursor: pointer;
	transition: all 0.3s;
}

.login-btn, .profile-btn {
	background: #3498db;
	color: white;
	flex: 1;
	max-width: 200rpx;
}

.login-btn:hover, .profile-btn:hover {
	background: #2980b9;
}

.register-btn, .logout-btn {
	background: #ecf0f1;
	color: #2c3e50;
	flex: 1;
	max-width: 200rpx;
}

.register-btn:hover, .logout-btn:hover {
	background: #d5dbdb;
}

.quick-links {
	width: 100%;
	max-width: 600rpx;
	background: #fff;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	padding: 40rpx;
	margin-top: 30rpx;
}

.link-item {
	display: flex;
	align-items: center;
	padding: 20rpx;
	border-radius: 12rpx;
	cursor: pointer;
	transition: background-color 0.3s;
}

.link-item:hover {
	background: #f8f9fa;
}

.link-icon {
	font-size: 36rpx;
	margin-right: 20rpx;
}

.link-text {
	font-size: 28rpx;
	color: #2c3e50;
	flex: 1;
	text-align: left;
}

/* 响应式设计 */
@media (max-width: 768px) {
	.header-content {
		width: 90%;
		padding: 10rpx 20rpx;
		flex-direction: column;
		gap: 15rpx;
	}
	
	.nav-section {
		order: 3;
		width: 100%;
		justify-content: center;
	}
	
	.main-container {
		padding: 20rpx 10rpx;
	}
	
	.user-card, .quick-links {
		width: 90%;
		padding: 40rpx 20rpx;
	}
	
	.login-actions, .profile-actions {
		flex-direction: column;
		gap: 15rpx;
	}
	
	.login-btn, .register-btn, .profile-btn, .logout-btn {
		max-width: 100%;
	}
}
</style>