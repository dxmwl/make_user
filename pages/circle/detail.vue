<template>
	<view class="circle-detail">
		<Header 
			:active-tab="'circle'"
			:is-logged-in="isLoggedIn"
			:user-info="userInfo"
			:show-user-menu="showUserMenu"
			@switchTab="switchTab"
			@goToSearchPage="goToSearchPage"
			@goToPublishArticle="goToPublishArticle"
			@toggleUserMenu="toggleUserMenu"
			@goToLogin="goToLogin"
			@goToRegister="goToRegister"
			@goToUserProfile="goToUserProfile"
			@logout="logout"
			@closeUserMenu="closeUserMenu"
		/>
		
		<!-- 主要内容区域 -->
		<view class="main-container">
			<view class="container">
				<!-- 交流圈详情 -->
				<view class="detail-content" v-if="circleDetail">
					<!-- 交流圈基本信息 -->
					<view class="circle-basic-info">
						<view class="circle-title">{{ circleDetail.title }}</view>
						<view class="circle-meta">
							<image class="avatar" :src="circleDetail.creator_avatar || '/static/logo.png'" mode="aspectFill"></image>
							<view class="creator-info">
								<text class="creator-name">{{ circleDetail.creator_nickname || '匿名用户' }}</text>
								<text class="create-time">{{ formatTime(circleDetail.create_time) }}</text>
							</view>
						</view>
						<view class="circle-description">
							<text>{{ circleDetail.description }}</text>
						</view>
						<view class="circle-tags">
							<text class="tag" v-for="(tag, idx) in circleDetail.tags" :key="idx">{{ tag }}</text>
						</view>
					</view>

					<!-- 二维码区域 -->
					<view class="qr-section">
						<view class="section-title">群二维码</view>
						<view class="qr-container">
							<image class="qr-code" :src="circleDetail.qr_code || '/static/default-qr.png'" mode="aspectFit"></image>
							<text class="qr-desc">扫描二维码加入交流群</text>
						</view>
					</view>

					<!-- 群主信息 -->
					<view class="owner-section">
						<view class="section-title">群主信息</view>
						<view class="owner-info">
							<image class="avatar" :src="circleDetail.owner_avatar || '/static/logo.png'" mode="aspectFill"></image>
							<view class="owner-details">
								<text class="owner-name">{{ circleDetail.owner_nickname || '群主' }}</text>
								<text class="owner-contact">联系方式: {{ circleDetail.owner_contact || '暂无' }}</text>
							</view>
						</view>
						<view class="owner-qr">
							<image class="qr-code" :src="circleDetail.owner_qr_code || '/static/default-qr.png'" mode="aspectFit"></image>
							<text class="qr-desc">群主二维码，可直接联系</text>
						</view>
					</view>

					<!-- 备注信息 -->
					<view class="remark-section">
						<view class="section-title">备注信息</view>
						<view class="remark-content">
							<text>{{ circleDetail.remark || '暂无备注信息' }}</text>
						</view>
					</view>

					<!-- 操作按钮 -->
					<view class="action-buttons">
						<button class="btn-primary" @click="joinGroup">立即加入</button>
						<button class="btn-secondary" @click="contactOwner">联系群主</button>
					</view>
				</view>

				<!-- 加载状态 -->
				<view class="loading-container" v-else>
					<uni-load-more status="loading"></uni-load-more>
				</view>
			</view>
		</view>
		
		<Footer />
	</view>
</template>

<script>
import translatePublishTime from '@/uni_modules/uni-cms-article/common/publish-time';
import Header from '@/pages/components/Header.vue';
import Footer from '@/pages/components/Footer.vue';

const db = uniCloud.database();
const circleDBName = 'circles';
const userDBName = 'uni-id-users';

export default {
	components: {
		Header,
		Footer
	},
	data() {
		return {
			id: '', // 交流圈ID
			circleDetail: null, // 交流圈详情
			isLoggedIn: false, // 是否已登录
			userInfo: {}, // 用户信息
			showUserMenu: false // 是否显示用户菜单
		}
	},
	onLoad(event) {
		// 获取交流圈id
		if (event.id) {
			this.id = event.id;
			// 加载交流圈详情
			this.loadCircleDetail();
		}
		
		// 检查用户登录状态
		this.checkLoginStatus();
		// 监听登录成功事件
		uni.$on('uni-id-pages-login-success', this.handleLoginSuccess);
		// 监听登出事件
		uni.$on('uni-id-pages-logout', this.handleLogout);
		
		// 如果有有效token，但全局store显示未登录，自动更新用户信息
		this.initLoginState();
	},
	onShow() {
		// 页面显示时再次检查登录状态，确保状态是最新的
		this.checkLoginStatus();
		// 更新用户信息显示
		this.updateUserInfoDisplay();
	},
	onUnload() {
		// 移除事件监听
		uni.$off('uni-id-pages-login-success', this.handleLoginSuccess);
		uni.$off('uni-id-pages-logout', this.handleLogout);
	},
	methods: {
		// 加载交流圈详情
		async loadCircleDetail() {
			try {
				const result = await uniCloud.callFunction({
					name: 'get-circle-detail',
					params: {
						id: this.id
					}
				});
				
				console.log('交流圈详情数据:', result);
				
				if(result && result.result && result.result.code === 0) {
					this.circleDetail = result.result.data;
				} else {
					console.error('获取交流圈详情失败:', result.result ? result.result.msg : '未知错误');
					uni.showToast({
						icon: 'none',
						title: '获取详情失败'
					});
				}
			} catch (error) {
				console.error('加载交流圈详情出错:', error);
				// 使用静态数据作为后备
				console.warn('使用静态数据作为后备');
				this.circleDetail = {
					title: '前端开发交流群',
					description: '专注前端技术交流，包含Vue、React、Angular等框架讨论，欢迎各位前端爱好者加入！',
					creator_nickname: '前端小王',
					creator_avatar: '/static/logo.png',
					create_time: new Date().getTime(),
					tags: ['前端', 'Vue', 'React'],
					qr_code: '/static/default-qr.png',
					owner_nickname: '群主大大',
					owner_avatar: '/static/logo.png',
					owner_contact: '微信：qunzhu123',
					owner_qr_code: '/static/default-qr.png',
					remark: '加入时请备注：来自码客社区'
				};
			}
		},
		// 格式化时间
		formatTime(timestamp) {
			return translatePublishTime(timestamp)
		},
		// 立即加入群
		joinGroup() {
			if (!this.circleDetail.qr_code) {
				uni.showToast({
					icon: 'none',
					title: '暂无群二维码'
				});
				return;
			}
			
			// 预览二维码
			uni.previewImage({
				urls: [this.circleDetail.qr_code],
				current: this.circleDetail.qr_code
			});
		},
		// 联系群主
		contactOwner() {
			if (!this.circleDetail.owner_qr_code) {
				uni.showToast({
					icon: 'none',
					title: '暂无群主二维码'
				});
				return;
			}
			
			// 预览群主二维码
			uni.previewImage({
				urls: [this.circleDetail.owner_qr_code],
				current: this.circleDetail.owner_qr_code
			});
		},
		// 检查登录状态
		checkLoginStatus() {
			// 检查是否存在有效的登录token
			const token = uni.getStorageSync('uni_id_token');
			const tokenExpired = uni.getStorageSync('uni_id_token_expired');
			
			if (token && tokenExpired && Date.now() < tokenExpired) {
				// 如果有有效token，设置为已登录状态
				this.isLoggedIn = true;
			} else {
				this.isLoggedIn = false;
			}
			// 更新用户信息显示
			this.updateUserInfoDisplay();
		},
		// 跳转到首页
		goToIndexPage() {
			uni.switchTab({
				url: '/pages/index/index'
			});
		},
		// 跳转到交流圈列表
		goToCircleList() {
			uni.navigateTo({
				url: '/pages/circle/list'
			});
		},
		// 跳转到搜索页
		goToSearchPage() {
			uni.navigateTo({
				url: '/uni_modules/uni-cms-article/pages/search/search'
			});
		},
		// 跳转到发布交流圈页面
		goToPublishCircle() {
			uni.navigateTo({
				url: '/pages/circle/add'
			});
		},
		// 处理登录成功事件
		handleLoginSuccess() {
			this.checkLoginStatus();
			this.updateUserInfoDisplay();
		},
		// 处理登出事件
		handleLogout() {
			this.checkLoginStatus();
			this.updateUserInfoDisplay();
		},
		// 初始化登录状态
		async initLoginState() {
			const token = uni.getStorageSync('uni_id_token');
			const tokenExpired = uni.getStorageSync('uni_id_token_expired');
			
			if (token && tokenExpired && Date.now() < tokenExpired) {
				// 检查全局store状态
				if (this.$uniIdPagesStore && this.$uniIdPagesStore.store && !this.$uniIdPagesStore.store.hasLogin) {
					// 有有效token但store显示未登录，需要更新用户信息
					try {
						await this.$uniIdPagesStore.mutations.updateUserInfo();
					} catch (error) {
						console.error('更新用户信息失败:', error);
					}
				}
			}
		},
		// 更新用户信息显示
		updateUserInfoDisplay() {
			if (this.isLoggedIn && this.$uniIdPagesStore && this.$uniIdPagesStore.store) {
				this.userInfo = this.$uniIdPagesStore.store.userInfo || {};
			} else {
				this.userInfo = {};
			}
		},
		// 切换用户菜单显示
		toggleUserMenu() {
			this.showUserMenu = !this.showUserMenu;
		},
		// 关闭用户菜单
		closeUserMenu() {
			this.showUserMenu = false;
		},
		// 退出登录
		async logout() {
			if (this.$uniIdPagesStore && this.$uniIdPagesStore.mutations) {
				// 手动清除登录状态，避免页面跳转
				const uniIdCo = uniCloud.importObject("uni-id-co");
				try {
					// 尝试调用服务端的logout
					if(uniCloud.getCurrentUserInfo().tokenExpired > Date.now()){
						await uniIdCo.logout();
					}
				} catch(e) {
					console.error(e);
				}
				
				// 清除本地存储的token
				uni.removeStorageSync('uni_id_token');
				uni.setStorageSync('uni_id_token_expired', 0);
				
				// 发送登出事件通知其他组件更新状态
				uni.$emit('uni-id-pages-logout');
				
				// 清除用户信息
				this.$uniIdPagesStore.mutations.setUserInfo({}, {cover: true});
				
			} else {
				// 如果没有$uniIdPagesStore，则手动清除
				uni.removeStorageSync('uni_id_token');
				uni.removeStorageSync('uni_id_token_expired');
			}
			
			// 更新本地状态
			this.isLoggedIn = false;
			this.userInfo = {};
			this.showUserMenu = false;
			// 不需要跳转页面，只需更新状态
		},
		// 跳转到登录页面
		goToLogin() {
			uni.navigateTo({
				url: '/uni_modules/uni-id-pages/pages/login/login-withpwd'
			});
		},
		// 跳转到注册页面
		goToRegister() {
			uni.navigateTo({
				url: '/uni_modules/uni-id-pages/pages/register/register'
			});
		},
		// 跳转到用户个人资料页
		goToUserProfile() {
			uni.navigateTo({
				url: '/uni_modules/uni-id-pages/pages/userinfo/userinfo'
			});
		},
		// 打开备案链接
		openBeianLink(type) {
			let url = '';
			if (type === 'miit') {
				url = 'https://beian.miit.gov.cn/';
			} else if (type === 'gongan') {
				url = 'https://www.beian.gov.cn/';
			}
			
			// 在新窗口打开链接
			if (url) {
				// 尝试使用浏览器打开链接
				if (typeof window !== 'undefined' && window.open) {
					window.open(url, '_blank');
				} else {
					// 兼容uni-app的API
					plus.runtime.openWeb(url);
				}
			}
		}
	}
}
</script>

<style>
page {
	background-color: #f5f7fa;
}

.circle-detail {
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

.nav-section {
	display: flex;
	align-items: center;
	flex: 1;
	gap: 40rpx;
}

.nav-item {
	font-size: 30rpx;
	color: #2c3e50;
	cursor: pointer;
	padding: 10rpx 20rpx;
	border-radius: 6rpx;
	transition: background-color 0.3s;
}

.nav-item.active {
	background: #3498db;
	color: white;
}

.nav-item:hover {
	background: #ecf0f1;
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

.main-container {
	flex: 1;
	padding: 20rpx;
	padding-top: 20rpx;
}

.container {
	width: 80%; /* 设置为80%宽度 */
	margin: 0 auto; /* 居中显示 */
}

/* 桌面端样式调整 */
@media screen and (min-width: 768px) {
	.container {
		width: 60%; /* PC端改为60%宽度，参考记忆配置 */
	}
}

.detail-content {
	background: #fff;
	border-radius: 12rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	padding: 30rpx;
	margin-bottom: 20rpx;
}

.circle-basic-info {
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid #ecf0f1;
}

.circle-title {
	font-size: 40rpx;
	font-weight: bold;
	color: #2c3e50;
	margin-bottom: 20rpx;
	line-height: 1.3;
}

.circle-meta {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.circle-meta .avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	margin-right: 20rpx;
}

.creator-info {
	flex: 1;
}

.creator-name {
	display: block;
	font-size: 32rpx;
	font-weight: bold;
	color: #2c3e50;
	margin-bottom: 5rpx;
}

.create-time {
	display: block;
	font-size: 26rpx;
	color: #95a5a6;
}

.circle-description {
	font-size: 28rpx;
	color: #7f8c8d;
	line-height: 1.6;
	margin-bottom: 20rpx;
}

.circle-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx;
}

.tag {
	background: #ecf0f1;
	color: #2c3e50;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
}

.qr-section {
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid #ecf0f1;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #2c3e50;
	margin-bottom: 20rpx;
}

.qr-container {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.qr-code {
	width: 300rpx;
	height: 300rpx;
	border: 2rpx solid #ecf0f1;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 15rpx;
}

.qr-desc {
	font-size: 26rpx;
	color: #95a5a6;
	text-align: center;
}

.owner-section {
	margin-bottom: 30rpx;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid #ecf0f1;
}

.owner-info {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.owner-info .avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	margin-right: 20rpx;
}

.owner-details {
	flex: 1;
}

.owner-name {
	display: block;
	font-size: 32rpx;
	font-weight: bold;
	color: #2c3e50;
	margin-bottom: 5rpx;
}

.owner-contact {
	display: block;
	font-size: 26rpx;
	color: #7f8c8d;
}

.owner-qr {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.owner-qr .qr-code {
	width: 250rpx;
	height: 250rpx;
	border: 2rpx solid #ecf0f1;
	border-radius: 12rpx;
	padding: 15rpx;
	margin-bottom: 15rpx;
}

.remark-section {
	margin-bottom: 30rpx;
}

.remark-content {
	font-size: 28rpx;
	color: #7f8c8d;
	line-height: 1.6;
	padding: 20rpx;
	background: #f8f9fa;
	border-radius: 8rpx;
}

.action-buttons {
	display: flex;
	gap: 20rpx;
	justify-content: center;
}

.btn-primary {
	flex: 1;
	background: #3498db;
	color: white;
	border: none;
	border-radius: 8rpx;
	padding: 20rpx;
	font-size: 30rpx;
	font-weight: bold;
}

.btn-primary:hover {
	background: #2980b9;
}

.btn-secondary {
	flex: 1;
	background: #ecf0f1;
	color: #2c3e50;
	border: none;
	border-radius: 8rpx;
	padding: 20rpx;
	font-size: 30rpx;
	font-weight: bold;
}

.btn-secondary:hover {
	background: #d5dbdb;
}

.loading-container {
	text-align: center;
	padding: 60rpx;
}

.footer {
	text-align: center;
	padding: 30rpx 0 10rpx 0;
	background: #2c3e50;
	color: #ecf0f1;
	font-size: 24rpx;
	margin-top: auto;
}

.footer-content {
	width: 80%;
	margin: 0 auto;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	gap: 15rpx;
	flex-wrap: wrap;
}

/* 桌面端样式调整 */
@media screen and (min-width: 768px) {
	.footer-content {
		width: 60%; /* PC端改为60%宽度，参考记忆配置 */
	}
}

.copyright {
	flex: 1;
	text-align: left;
}

.beian-info {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 20rpx;
	font-size: 22rpx;
	flex: 2;
	justify-content: center;
}

.beian-text {
	display: inline-block;
	line-height: 1.5;
	color: #bdc3c7;
	text-decoration: underline;
	cursor: pointer;
}

.beian-text:hover {
	color: #ecf0f1;
}

.company {
	flex: 1;
	text-align: right;
	display: block;
	line-height: 1.5;
	font-size: 20rpx;
	color: #95a5a6;
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
		order: 2;
		flex: none;
		width: 100%;
		justify-content: center;
	}
	
	.container {
		width: 90%; /* 移动端稍宽一些 */
	}
	
	.qr-code {
		width: 250rpx !important;
		height: 250rpx !important;
	}
	
	.owner-qr .qr-code {
		width: 200rpx !important;
		height: 200rpx !important;
	}
	
	.action-buttons {
		flex-direction: column;
	}
	
	.footer-content {
		width: 90%;
		flex-direction: column;
		gap: 10rpx;
	}
	
	.copyright {
		text-align: center;
	}
	
	.beian-info {
		flex-direction: column;
		gap: 8rpx;
	}
	
	.company {
		text-align: center;
	}
}
</style>