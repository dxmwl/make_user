<template>
	<view class="circle-list">
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
		
		<!-- 分类导航 -->
		<view class="category-nav">
			<scroll-view scroll-x="true" class="category-scroll">
				<view class="category-item" 
					v-for="(category, index) in categoriesList" 
					:key="category._id"
					:class="{ active: activeCategory === category._id }"
					@click="changeCategory(category._id)">
					<text>{{ category.name }}</text>
				</view>
			</scroll-view>
		</view>

		<!-- 主要内容区域 -->
		<view class="main-container">
			<view class="container">
				<!-- 交流圈列表 -->
				<view class="circle-grid">
					<view class="circle-card" v-for="(circle, index) in circleList" :key="circle._id" @click="goToCircleDetail(circle._id)">
						<view class="circle-header">
							<image class="avatar" :src="circle.creator_avatar || '/static/logo.png'" mode="aspectFill"></image>
							<view class="creator-info">
								<text class="creator-name">{{ circle.creator_nickname || '匿名用户' }}</text>
								<text class="create-time">{{ formatTime(circle.create_time) }}</text>
							</view>
						</view>
						<view class="circle-content">
							<view class="circle-title">{{ circle.title }}</view>
							<view class="circle-description">{{ circle.description }}</view>
						</view>
						<view class="circle-footer">
							<view class="circle-tags">
								<text class="tag" v-for="(tag, idx) in circle.tags" :key="idx">{{ tag }}</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 加载状态 -->
				<view class="loading-container" v-if="loading">
					<uni-load-more status="loading"></uni-load-more>
				</view>
				<view class="no-more" v-else-if="!hasMore">
					<text>没有更多交流圈了</text>
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
const categoryDBName = 'circle-categories';

export default {
	components: {
		Header,
		Footer
	},
	data() {
		return {
			where: '', // 查询条件
			activeCategory: 'all', // 当前选中的分类ID
			categoriesList: [], // 分类列表
			circleList: [], // 交流圈列表
			currentPage: 1,
			pageSize: 10,
			hasMore: true,
			loading: false,
			isLoggedIn: false, // 是否已登录
			userInfo: {}, // 用户信息
			showUserMenu: false // 是否显示用户菜单
		}
	},
	onLoad() {
		// 检查用户登录状态
		this.checkLoginStatus();
		// 监听登录成功事件
		uni.$on('uni-id-pages-login-success', this.handleLoginSuccess);
		// 监听登出事件
		uni.$on('uni-id-pages-logout', this.handleLogout);
		// 加载分类列表
		this.loadCategories();
		// 加载交流圈列表
		this.loadCircles();
		
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
	onReachBottom() {
		// 上拉触底，加载更多
		this.loadMore();
	},
	methods: {
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
		// 加载交流圈列表
		async loadCircles() {
			try {
				this.loading = true;
				const result = await uniCloud.callFunction({
					name: 'get-circle-list',
					params: {
						category_id: this.activeCategory,
						page: this.currentPage,
						pageSize: this.pageSize
					}
				});
				
				console.log('交流圈列表数据:', result);
				
				if(result && result.result && result.result.code === 0) {
					const newCircles = result.result.data;
					if(this.currentPage === 1) {
						// 第一页，替换所有数据
						this.circleList = newCircles;
					} else {
						// 加载更多，追加数据
						this.circleList = this.circleList.concat(newCircles);
					}
					
					// 检查是否还有更多数据
					this.hasMore = newCircles.length === this.pageSize;
				} else {
					console.error('获取交流圈列表失败:', result.result ? result.result.msg : '未知错误');
				}
			} catch (error) {
				console.error('加载交流圈列表出错:', error);
				// 如果云函数调用失败，使用静态数据作为后备
				console.warn('使用静态数据作为后备');
				if(this.currentPage === 1) {
					this.circleList = [{
						_id: '1',
						title: '前端开发交流群',
						description: '专注前端技术交流，包含Vue、React、Angular等框架讨论',
						creator_nickname: '前端小王',
						creator_avatar: '/static/logo.png',
						create_time: new Date().getTime(),
						tags: ['前端', 'Vue', 'React']
					}, {
						_id: '2',
						title: 'Java后端技术群',
						description: 'Java后端开发技术交流，Spring Boot、微服务架构等',
						creator_nickname: 'Java老司机',
						creator_avatar: '/static/logo.png',
						create_time: new Date().getTime(),
						tags: ['Java', 'Spring', '微服务']
					}];
				}
			} finally {
				this.loading = false;
			}
		},
		// 加载分类列表
		async loadCategories() {
			try {
				console.log('开始加载分类列表...');
				const result = await uniCloud.callFunction({
					name: 'get-circle-category-list'
				});
				console.log('分类数据:', result);
				
				// 从云函数获取分类数据
				let fetchedCategories = [];
										
				if(result && result.result && result.result.code === 0 && result.result.data && result.result.data.length > 0) {
					console.log('数据库分类数据:', result.result.data);
					// 使用从云函数获取的分类数据
					fetchedCategories = result.result.data;
				} else {
					console.log('未找到分类数据');
				}
										
				// 添加"全部"分类到列表开头
				const allCategory = { _id: 'all', name: '全部' };
				this.categoriesList = [allCategory, ...fetchedCategories];
				console.log('最终分类列表:', this.categoriesList);
			} catch (e) {
				console.error('加载分类列表失败', e);
				// 如果加载失败，提供"全部"分类和一些默认分类作为后备
				const allCategory = { _id: 'all', name: '全部' };
				const defaultCategories = [
					{ _id: 'frontend', name: '前端开发' }, 
					{ _id: 'backend', name: '后端开发' }, 
					{ _id: 'mobile', name: '移动端' },
					{ _id: 'ai', name: '人工智能' },
					{ _id: 'devops', name: '运维' }
				];
				this.categoriesList = [allCategory, ...defaultCategories];
			}
		},
		// 切换分类
		changeCategory(categoryId) {
			this.activeCategory = categoryId;
			this.currentPage = 1; // 重置到第一页
			this.circleList = []; // 清空当前列表
			this.loadCircles(); // 重新加载
		},
		// 加载更多
		loadMore() {
			if (!this.loading && this.hasMore) {
				this.currentPage++;
				this.loadCircles();
			}
		},
		// 格式化时间
		formatTime(timestamp) {
			return translatePublishTime(timestamp)
		},
		// 跳转到详情页
		goToCircleDetail(id) {
			uni.navigateTo({
				url: `/pages/circle/detail?id=${id}`
			});
		},
		// 跳转到首页
		goToIndexPage() {
			uni.switchTab({
				url: '/pages/index/index'
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

.circle-list {
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

.category-nav {
	background: #fff;
	border-bottom: 1rpx solid #eee;
	padding: 20rpx 0;
	display: flex;
	justify-content: center;
}

.category-scroll {
	width: 80%; /* 设置为容器宽度的80%，使其居中 */
	white-space: nowrap;
	display: flex;
	justify-content: center;
}

/* 桌面端样式调整 */
@media screen and (min-width: 768px) {
	.category-scroll {
		width: 60%; /* PC端改为60%宽度，参考记忆配置 */
	}
}

.category-item {
	display: inline-block;
	padding: 15rpx 30rpx;
	margin: 0 10rpx;
	border-radius: 30rpx;
	background: #f8f9fa;
	color: #2c3e50;
	font-size: 28rpx;
	transition: all 0.3s;
	cursor: pointer;
}

.category-item.active {
	background: #3498db;
	color: white;
}

.category-item:last-child {
	margin-right: 10rpx;
}

.main-container {
	flex: 1;
	padding: 20rpx;
	padding-top: 20rpx;
}

.container {
	width: 80%; /* 设置为80%宽度 */
	margin: 0 auto; /* 居中显示 */
	display: flex;
	gap: 30rpx;
}

/* 桌面端样式调整 */
@media screen and (min-width: 768px) {
	.container {
		width: 60%; /* PC端改为60%宽度，参考记忆配置 */
	}
}

.circle-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300rpx, 1fr));
	gap: 20rpx;
	width: 100%;
}

.circle-card {
	background: #fff;
	border-radius: 12rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	padding: 20rpx;
	margin-bottom: 20rpx;
	cursor: pointer;
	transition: all 0.3s ease;
}

.circle-card:hover {
	transform: translateY(-5rpx);
	box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.circle-header {
	display: flex;
	align-items: center;
	margin-bottom: 15rpx;
}

.circle-header .avatar {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	margin-right: 15rpx;
}

.creator-info {
	flex: 1;
}

.creator-name {
	display: block;
	font-size: 28rpx;
	font-weight: bold;
	color: #2c3e50;
}

.create-time {
	display: block;
	font-size: 22rpx;
	color: #95a5a6;
}

.circle-content {
	margin-bottom: 15rpx;
}

.circle-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #2c3e50;
	margin-bottom: 10rpx;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

.circle-description {
	font-size: 26rpx;
	color: #7f8c8d;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 3;
	overflow: hidden;
	line-height: 1.5;
}

.circle-footer {
	border-top: 1rpx solid #ecf0f1;
	padding-top: 10rpx;
}

.circle-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx;
}

.tag {
	background: #ecf0f1;
	color: #2c3e50;
	padding: 5rpx 12rpx;
	border-radius: 20rpx;
	font-size: 22rpx;
}

.loading-container {
	text-align: center;
	padding: 30rpx;
}

.no-more {
	text-align: center;
	padding: 30rpx;
	color: #95a5a6;
	font-size: 26rpx;
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
	
	.category-scroll {
		width: 90%; /* 移动端更宽一些 */
		padding: 0;
	}
	
	.category-item {
		padding: 12rpx 20rpx;
		font-size: 26rpx;
		margin: 0 5rpx;
	}
	
	.container {
		width: 90%; /* 移动端稍宽一些 */
	}
	
	.circle-grid {
		grid-template-columns: 1fr; /* 移动端单列显示 */
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