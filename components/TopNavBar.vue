<template>
	<view class="top-navbar">
		<view class="header-content">
			<view class="logo-section" @click="goHome">
				<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
				<text class="site-name">码客——程序员交流社区</text>
			</view>
			<nav class="nav-section">
				<ul class="nav-menu">
					<li class="nav-item" :class="{active: currentPath.includes('index')}" @click="navigateTo('/pages/index/index')">
						<text>首页</text>
					</li>
					<li class="nav-item" :class="{active: currentPath.includes('circle')}" @click="navigateTo('/pages/circle/list')">
						<text>交流圈</text>
					</li>
					<li class="nav-item" :class="{active: currentPath.includes('about')}" @click="navigateTo('/pages/about/about')">
						<text>关于</text>
					</li>
				</ul>
				<div class="nav-actions">
					<button class="search-button" @click="goToSearchPage">
						<text class="search-icon">🔍</text>
						<text class="search-text">搜索</text>
					</button>
					<view class="user-section">
						<!-- 发布文章按钮，仅在用户登录时显示 -->
						<view v-if="isLoggedIn" class="publish-btn" @click="goToPublishArticle">
							<uni-icons type="compose" size="20" color="#fff"></uni-icons>
							<text class="publish-text">发布</text>
						</view>
						<view v-if="isLoggedIn" class="user-profile" @click="toggleUserMenu">
							<image v-if="userInfo.avatar_file" class="avatar" :src="userInfo.avatar_file.url" mode="aspectFill"></image>
							<image v-else class="avatar" src="/static/logo.png" mode="aspectFill"></image>
							<text class="username">{{ userInfo.nickname || userInfo.username || userInfo.mobile || userInfo.email }}</text>
							<uni-icons class="arrowdown" type="arrowdown" color="#666" size="13"></uni-icons>
						</view>
						<!-- 用户菜单，只在用户登录且菜单打开时显示 -->
						<view v-if="showUserMenu && isLoggedIn" class="user-menu" @click.stop="closeUserMenu">
							<view class="menu-item" @click="goToUserProfile">
								<text>个人主页</text>
							</view>
							<view class="menu-item" @click="handleLogout">
								<text>退出登录</text>
							</view>
						</view>
						<view v-else class="login-register-buttons">
							<text class="nav-item login-btn" @click="goToLogin">登录</text>
							<text class="nav-item register-btn" @click="goToRegister">注册</text>
						</view>
					</view>
				</div>
			</nav>
		</view>
	</view>
</template>

<script>
import uniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue';

export default {
	name: 'TopNavBar',
	components: {
		uniIcons
	},
	data() {
		return {
			isLoggedIn: false,
			userInfo: {},
			currentPath: '',
			showUserMenu: false
		}
	},
	mounted() {
		this.checkLoginStatus();
		this.getCurrentPath();
		// 监听登录状态变化
		uni.$on('uni-id-pages-login-success', this.handleLoginSuccess);
		uni.$on('uni-id-pages-logout', this.handleLogoutEvent);
	},
	beforeDestroy() {
		// 移除事件监听
		uni.$off('uni-id-pages-login-success', this.handleLoginSuccess);
		uni.$off('uni-id-pages-logout', this.handleLogoutEvent);
	},
	methods: {
		// 检查登录状态
		checkLoginStatus() {
			const token = uni.getStorageSync('uni_id_token');
			const tokenExpired = uni.getStorageSync('uni_id_token_expired');
			
			if (token && tokenExpired && Date.now() < tokenExpired) {
				this.isLoggedIn = true;
				this.updateUserInfo();
			} else {
				this.isLoggedIn = false;
			}
		},
		
		// 更新用户信息
		updateUserInfo() {
			if (this.$uniIdPagesStore && this.$uniIdPagesStore.store) {
				this.userInfo = this.$uniIdPagesStore.store.userInfo || {};
			}
		},
		
		// 获取当前页面路径
		getCurrentPath() {
			const pages = getCurrentPages();
			if (pages && pages.length > 0) {
				this.currentPath = '/' + pages[pages.length - 1].route;
			} else {
				this.currentPath = '/pages/index/index';
			}
		},
		
		// 导航到指定页面
		navigateTo(path) {
			if (this.currentPath === path) return; // 如果已在当前页面则不重复导航
			
			uni.navigateTo({
				url: path,
				fail: (err) => {
					// 如果跳转失败，尝试使用redirectTo
					uni.redirectTo({
						url: path
					});
				}
			});
		},
		
		// 返回首页
		goHome() {
			uni.switchTab({
				url: '/pages/index/index'
			});
		},
		
		// 前往用户资料页
		goToUserProfile() {
			uni.navigateTo({
				url: '/uni_modules/uni-id-pages/pages/userinfo/userinfo'
			});
		},
		
		// 前往登录页
		goToLogin() {
			uni.navigateTo({
				url: '/uni_modules/uni-id-pages/pages/login/login-withpwd'
			});
		},
		
		// 前往注册页
		goToRegister() {
			uni.navigateTo({
				url: '/uni_modules/uni-id-pages/pages/register/register'
			});
		},
		
		// 处理登录成功事件
		handleLoginSuccess() {
			this.isLoggedIn = true;
			this.updateUserInfo();
		},
		
		// 处理登出事件
		handleLogoutEvent() {
			this.isLoggedIn = false;
			this.userInfo = {};
		},
		
		// 处理登出
		async handleLogout() {
			if (this.$uniIdPagesStore && this.$uniIdPagesStore.mutations) {
				this.$uniIdPagesStore.mutations.logout();
			} else {
				// 手动清除本地存储
				uni.removeStorageSync('uni_id_token');
				uni.removeStorageSync('uni_id_token_expired');
			}
			
			this.isLoggedIn = false;
			this.userInfo = {};
			this.showUserMenu = false;
			
			// 发送登出事件
			uni.$emit('uni-id-pages-logout');
		},
		
		// 切换用户菜单
		toggleUserMenu() {
			this.showUserMenu = !this.showUserMenu;
		},
		
		// 关闭用户菜单
		closeUserMenu() {
			this.showUserMenu = false;
		},
		
		// 前往搜索页面
		goToSearchPage() {
			uni.navigateTo({
				url: '/uni_modules/uni-cms-article/pages/search/search'
			});
		},
		
		// 前往发布文章页面
		goToPublishArticle() {
			uni.navigateTo({
				url: '/uni_modules/uni-cms/pages/article/add/add'
			});
		},
		
		// 前往用户个人资料页
		goToUserProfile() {
			uni.navigateTo({
				url: '/uni_modules/uni-id-pages/pages/userinfo/userinfo'
			});
		}
	},
	watch: {
		// 监听页面路径变化
		'$route'(to) {
			this.currentPath = to.path;
		}
	}
}
</script>

<style scoped>
.top-navbar {
	background: #fff;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	position: sticky;
	top: 0;
	z-index: 1000;
	padding: 15rpx 0; /* 添加上下padding使导航栏更舒适 */
}

.header-content {
	width: 80%; /* 改为80%宽度 */
	max-width: none; /* 移除最大宽度限制 */
	margin: 0 auto;
	padding: 10rpx 40rpx;
	display: flex;
	justify-content: flex-start; /* 改为左对齐，增加空间感 */
	align-items: center;
	gap: 40rpx; /* 在各元素间添加间距 */
}

/* 桌面端样式调整 */
@media screen and (min-width: 768px) {
	.header-content {
		width: 60%; /* PC端改为60%宽度，参考记忆配置 */
		padding: 15rpx 50rpx;
	}
}

.logo-section {
	display: flex;
	align-items: center;
	flex: 1;
}

.logo {
	width: 100rpx;
	height: 100rpx;
	margin-right: 20rpx;
	border-radius: 50%;
}

.site-name {
	font-size: 40rpx;
	font-weight: bold;
	color: #2c3e50;
}

/* 导航栏样式 */
.nav-section {
	display: flex;
	justify-content: space-between;
	align-items: center;
	flex: 1;
}

.nav-menu {
	display: flex;
	list-style: none;
	margin: 0;
	padding: 0;
	gap: 40rpx;
}

.nav-menu li {
	display: flex;
	align-items: center;
	padding: 10rpx 20rpx;
	border-radius: 6rpx;
	cursor: pointer;
	transition: background-color 0.3s;
}

.nav-menu li.active {
	background: #3498db;
	color: white;
}

.nav-menu li:hover:not(.active) {
	background: #ecf0f1;
}

.nav-actions {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.search-button {
	background: #f8f9fa;
	border: 2rpx solid #dee2e6;
	border-radius: 30rpx;
	padding: 12rpx 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.3s ease;
	margin-right: 20rpx; /* 给导航项之间留些间距 */
}

.search-button:hover {
	background: #e9ecef;
	border-color: #adb5bd;
	transform: translateY(-2rpx);
}

.search-icon {
	margin-right: 10rpx;
	font-size: 24rpx;
}

.search-text {
	font-size: 26rpx;
	color: #495057;
}

.user-section {
	margin-left: auto; /* 将用户部分推到最右边 */
	position: relative; /* 为下拉菜单定位 */
	display: flex;
	align-items: center;
}

.publish-btn {
	display: flex;
	align-items: center;
	padding: 8rpx 16rpx;
	border-radius: 30rpx;
	background: #3498db;
	color: white;
	font-size: 26rpx;
	cursor: pointer;
	margin-right: 10rpx;
}

.publish-btn:hover {
	background: #2980b9;
}

.publish-text {
	margin-left: 5rpx;
}

.user-profile {
	display: flex;
	align-items: center;
	padding: 8rpx 16rpx;
	border-radius: 30rpx;
	/* 去掉背景色 */
	color: #2c3e50;
	font-size: 26rpx;
	cursor: pointer;
	transition: background-color 0.3s;
}

.user-profile:hover {
	background: #ecf0f1;
}

.avatar {
	width: 40rpx;
	height: 40rpx;
	border-radius: 50%;
	margin-right: 10rpx;
}

.username {
	max-width: 120rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	margin-right: 5rpx;
}

.arrowdown {
	margin-top: 4px;
	margin-left: 3px;
}

.user-menu {
	position: absolute;
	right: 0;
	top: calc(100% + 5rpx);
	width: 150rpx;
	background-color: #fff;
	border: 1rpx solid #ebeef5;
	border-radius: 4rpx;
	box-shadow: 0 6px 12px 0 rgba(0, 0, 0, .5);
	z-index: 1000;
}

.menu-item {
	padding: 15rpx;
	font-size: 28rpx;
	color: #555;
	cursor: pointer;
	transition: background-color 0.2s;
}

.menu-item:hover {
	background-color: #f5f5f5;
}

.login-register-buttons {
	display: flex;
	gap: 10rpx;
}

.login-btn {
	background: #ecf0f1;
	color: #2c3e50;
	border-radius: 30rpx;
	font-size: 26rpx;
}

.login-btn:hover {
	background: #d5dbdb;
}

.register-btn {
	background: #3498db;
	color: white;
	border-radius: 30rpx;
	font-size: 26rpx;
}

.register-btn:hover {
	background: #2980b9;
}

/* 响应式设计 */
@media (max-width: 768px) {
	.header-content {
		flex-direction: column;
		gap: 20rpx;
		padding: 20rpx;
		width: 90%; /* 移动端稍宽一些 */
	}
	
	.logo-section {
		justify-content: center;
	}
	
	.nav-section {
		flex-direction: column;
		align-items: flex-start;
		gap: 15rpx;
	}
	
	.nav-menu {
		flex-direction: column;
		gap: 10rpx;
		width: 100%;
	}
	
	.nav-menu li {
		justify-content: center;
		padding: 15rpx;
	}
	
	.nav-actions {
		width: 100%;
		justify-content: center;
		gap: 10rpx;
	}
	
	.search-button {
		width: 100%;
		justify-content: center;
	}
}
</style>