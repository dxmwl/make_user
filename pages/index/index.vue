<template>
	<view class="blog-home">
		<TopNavBar />
		
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
				<!-- 首页内容 -->
				<div class="home-main-sidebar-container">
					<!-- 侧边栏 -->
					<view class="sidebar">
						<!-- 热门文章 -->
						<view class="widget">
							<h3 class="widget-title">热门文章</h3>
							<view class="popular-post" v-for="(popular, index) in popularPosts" :key="index">
							<text class="popular-title" @click="goToArticleDetail(popular._id)">{{ popular.title }}</text>
							<text class="popular-date">{{ publishTime(popular.publish_date) }}</text>
							</view>
						</view>
						
						<!-- 分类 -->
						<view class="widget">
							<h3 class="widget-title">分类</h3>
							<view class="categories">
								<text class="category" v-for="(cat, index) in categoriesList" :key="cat._id" :class="{ active: activeCategory === cat._id }" @click="filterByCategory(cat._id)">
									{{ cat.name }} ({{ cat.count || 0 }})
								</text>
							</view>
						</view>
						
						<!-- 标签云 -->
						<view class="widget">
							<h3 class="widget-title">标签云</h3>
						<view class="tags-cloud">
							<text class="tag-item" v-for="(tag, index) in tags" :key="index" @click="filterByTag(tag)">
								{{ tag }}
							</text>
						</view>
						</view>
					</view>
					<!-- 博客文章列表 -->
					<view class="blog-posts">
						<!-- 使用 uni-cms-article 提供的标准列表组件 -->
						<!-- #ifndef APP-NVUE -->
						<scroll-view
							scroll-y
							class="uni-list"
							refresher-enabled
							@refresherrefresh="refresh"
							@scrolltolower="loadMore"
						>
							<template v-for="item in articles">
								<not-cover v-if="item.thumbnail && item.thumbnail.length === 0" :data="item" ></not-cover>
								<right-small-cover v-else-if="item.thumbnail && item.thumbnail.length === 1"
									:data="item" ></right-small-cover>
								<three-cover v-else-if="item.thumbnail && item.thumbnail.length >= 3"
									:data="item" ></three-cover>
							</template>
							<!-- 加载状态 -->
							<uni-load-state @networkResume="refresh"
								:state="{ data: articles, hasMore, loading, error: null }"
								@clickLoadMore="loadMore">
							</uni-load-state>
						</scroll-view>
						<!-- #endif -->
						<!-- #ifdef APP-NVUE -->
						<list class="uni-list" :border="false">
							<refresh-box :loading="loading" @refresh="refresh"></refresh-box>
							<template v-for="item in articles">
								<not-cover v-if="item.thumbnail && item.thumbnail.length === 0" :data="item" ></not-cover>
								<right-small-cover v-else-if="item.thumbnail && item.thumbnail.length === 1"
									:data="item" ></right-small-cover>
								<three-cover v-else-if="item.thumbnail && item.thumbnail.length >= 3"
									:data="item" ></three-cover>
							</template>
							<uni-load-state @networkResume="refresh"
								:state="{ data: articles, hasMore, loading, error: null }"
								@clickLoadMore="loadMore">
							</uni-load-state>
						</list>
						<!-- #endif -->
						
						<!-- 分页组件 -->
						<view class="pagination">
							<uni-pagination 
								:current="currentPage" 
								:total="total" 
								:pageSize="pageSize"
								@change="handlePageChange"
							></uni-pagination>
						</view>
					</view>
					
				</div>
			</view>
		</view>
		
		<Footer />
	</view>
</template>

<script>
	import translatePublishTime from '@/uni_modules/uni-cms-article/common/publish-time';
	
	// 引入 uni-cms-article 组件
	import notCover from '@/uni_modules/uni-cms-article/components/list-template/not-cover.vue';
	import rightSmallCover from '@/uni_modules/uni-cms-article/components/list-template/right-small-cover.vue';
	import threeCover from '@/uni_modules/uni-cms-article/components/list-template/three-cover.vue';
	import refreshBox from '@/uni_modules/uni-cms-article/components/refresh-box/refreshBox.nvue';
	import TopNavBar from '@/components/TopNavBar.vue';
	import Footer from '@/pages/components/Footer.vue';
	// 引入分页组件
	import uniPagination from '@/uni_modules/uni-pagination/components/uni-pagination/uni-pagination.vue';
	

	export default {
		components: {
			notCover,
			rightSmallCover,
			threeCover,
			refreshBox,
			TopNavBar,
			Footer,
			uniPagination
		},
		data() {
			return {
				where: '"article_status" == 1', // 查询条件
				activeCategory: 'all', // 当前选中的分类ID
				categoriesList: [{ _id: 'all', name: '全部', count: 0 }], // 分类列表，初始化时只包含全部分类，从云函数获取后更新
				totalCount: 0, // 总文章数
				popularPosts: [], // 热门文章列表，通过云函数动态加载
				articles: [], // 文章列表
				listData: [], // 用于存储 unicloud-db 加载的数据
				currentPage: 1,
				pageSize: 10,
				total: 0, // 总记录数
				hasMore: true,
				loading: false,
				loadType: null,
				categories: [{
					name: '前端开发',
					count: 12
				}, {
					name: '后端开发',
					count: 8
				}, {
					name: '移动开发',
					count: 5
				}, {
					name: '数据库',
					count: 6
				}, {
					name: 'DevOps',
					count: 4
				}],
				tags: [], // 标签云数据，通过云函数动态加载
				isLoggedIn: false, // 是否已登录
				userInfo: {}, // 用户信息
				// 顶部导航栏由独立组件处理，此处不需要相关状态
				// 以下变量不再需要，保留以防其他地方使用
				// showUserMenu: false, // 是否显示用户菜单
				// activeTab: 'home', // 当前激活的标签页
				// activeCircleCategory: 'all', // 当前选中的交流圈分类
				// circleCategoriesList: [], // 交流圈分类列表
				// circleList: [] // 交流圈列表
			}
		},

		computed: {

		},
		onLoad() {
			// 检查用户登录状态
			this.checkLoginStatus();
			// 监听登录成功事件
			uni.$on('uni-id-pages-login-success', this.handleLoginSuccess);
			// 监听登出事件
			uni.$on('uni-id-pages-logout', this.handleLogout);
			// 初始化热门文章
			this.loadPopularPosts();
			// 加载分类列表
			this.loadCategories();
			// 加载标签云
			this.loadRandomTags();
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
			// 加载文章列表
			async loadArticles(currentPage = null) {
				try {
					this.loading = true;
					// 如果传入了页码，使用传入的页码，否则使用当前页码
					const page = currentPage !== null ? currentPage : this.currentPage;
								
					// 打印参数信息以便调试
					console.debug('调用get-article-list云函数，参数:', {
						category_id: this.activeCategory,
						page: page,
						pageSize: this.pageSize
					});
					const result = await uniCloud.callFunction({
						name: 'get-article-list',
						data: {
							category_id: this.activeCategory,
							page: page,
							pageSize: this.pageSize
						}
					});
																			
					console.debug('文章列表数据:', result);
																			
					if(result && result.result && result.result.code === 0) {
						const newArticles = result.result.data;
									
						// 如果指定了页码，更新当前页码
						if (currentPage !== null) {
							this.currentPage = currentPage;
						}
									
						if(page === 1) {
							// 第一页，替换所有数据
							this.articles = newArticles;
						} else {
							// 加载更多，追加数据
							this.articles = this.articles.concat(newArticles);
						}
									
						// 检查是否还有更多数据
						this.hasMore = newArticles.length === this.pageSize;
									
						// 更新总记录数（如果云函数返回了总数）
						if (result.result.pagination) {
							this.total = result.result.pagination.total || 0;
						}
									
						// 如果是第一页，更新当前分类的计数
						if(page === 1) {
							// 更新当前分类的计数（如果这不是'全部'分类）
							if(this.activeCategory !== 'all') {
								// 假设返回的数据中有总数信息
								const categoryCount = result.result.totalCount || newArticles.length;
								this.updateCategoryCountOnLoad(this.activeCategory, categoryCount);
							}
									
							// 如果是'全部'分类，获取总数
							if(this.activeCategory === 'all' && result.result.totalCount !== undefined) {
								this.totalCount = result.result.totalCount;
							}
						}
								
						// 如果是第一页且总数尚未设置，尝试估算总数
						if(page === 1 && this.totalCount === 0) {
							// 尝试通过云函数返回的额外信息获取总数，如果有的话
							if(result.result.totalCount !== undefined) {
								this.totalCount = result.result.totalCount;
							} else {
								// 如果没有提供总数，则在后续获取更多信息时更新
								// 我们将在分类加载时专门获取总数
							}
						}
					} else {
						console.error('获取文章列表失败:', result.result ? result.result.msg : '未知错误');
					}
				} catch (error) {
					console.error('加载文章列表出错:', error);
					// 如果云函数调用失败，使用静态数据作为后备
					console.warn('使用静态数据作为后备');
					if(this.currentPage === 1) {
						this.articles = [{
							_id: '1',
							title: 'Vue 3 新特性解析',
							publish_date: new Date().getTime(),
							thumbnail: ['/static/logo.png'],
							user_id: 'user1',
							user_info: { nickname: '开发者' }
						}, {
							_id: '2',
							title: 'React Hooks 最佳实践',
							publish_date: new Date().getTime(),
							thumbnail: [],
							user_id: 'user2',
							user_info: { nickname: '前端专家' }
						}];
					}
				} finally {
					this.loading = false;
				}
			},
			// 加载分类列表
			async loadCategories() {
				try {
					console.debug('开始加载分类列表...');
					const result = await uniCloud.callFunction({
						name: 'get-category-list'
					});
					console.debug('分类数据:', result);
								
					// 从云函数获取分类数据
					let fetchedCategories = [];
																	
					if(result && result.result && result.result.code === 0 && result.result.data && result.result.data.length > 0) {
						console.debug('数据库分类数据:', result.result.data);
						// 使用从云函数获取的分类数据
						fetchedCategories = result.result.data;
					} else {
						console.debug('未找到分类数据');
					}
																	
					// 计算所有分类的总数作为全部分类的计数（使用云函数返回的count值）
					const allCategoriesCount = fetchedCategories.reduce((sum, category) => sum + (category.count || 0), 0);
					// 更新'全部'分类的计数
					const allCategoryIndex = this.categoriesList.findIndex(cat => cat._id === 'all');
					if (allCategoryIndex !== -1) {
						this.categoriesList[allCategoryIndex].count = allCategoriesCount;
					} else {
						// 如果没有找到'全部'分类，则添加它
						this.categoriesList.unshift({ _id: 'all', name: '全部', count: allCategoriesCount });
					}
					// 添加获取到的其他分类
					fetchedCategories.forEach(fetchedCat => {
						const existingIndex = this.categoriesList.findIndex(cat => cat._id === fetchedCat._id);
						if (existingIndex === -1) {
							// 如果分类不存在，则添加
							this.categoriesList.push(fetchedCat);
						} else {
							// 如果分类已存在，则更新其信息
							this.categoriesList[existingIndex] = fetchedCat;
						}
					});
					console.debug('最终分类列表:', this.categoriesList);
								
					// 如果分类列表为空或只有全部分类，至少确保有"全部"分类
					if (this.categoriesList.length <= 1) {
						// 计算其他分类的总数作为全部分类的计数
						const otherCategoriesCount = Array.isArray(fetchedCategories) ? fetchedCategories.reduce((sum, category) => sum + (category.count || 0), 0) : 0;
						// 更新'全部'分类的计数，而不是替换整个数组
						const allCategoryIndex = this.categoriesList.findIndex(cat => cat._id === 'all');
						if (allCategoryIndex !== -1) {
							this.categoriesList[allCategoryIndex].count = otherCategoriesCount;
						}
					}
				} catch (e) {
					console.error('加载分类列表失败', e);
					// 如果加载失败，只确保'全部'分类存在，不替换整个数组
					const allCategoryIndex = this.categoriesList.findIndex(cat => cat._id === 'all');
					if (allCategoryIndex === -1) {
						// 如果没有'全部'分类，则添加它
						this.categoriesList.push({ _id: 'all', name: '全部', count: 0 });
					}
				}
								
				// 在分类加载完成后，只在初始化阶段（即当前仍为默认分类）且没有文章数据时，加载全部分类的文章
				const categoryExists = this.categoriesList.some(cat => cat._id === this.activeCategory);
				if ((this.articles.length === 0 || !categoryExists) && this.activeCategory === 'all') {
					this.loadArticles();
				}
				
				// 确保'全部'分类的计数正确（如果在fetchedCategories处理过程中有任何问题）
				const allCategoriesCount = this.categoriesList
					.filter(cat => cat._id !== 'all')
					.reduce((sum, category) => sum + (category.count || 0), 0);
				const allCategory = this.categoriesList.find(cat => cat._id === 'all');
				if(allCategory) {
					allCategory.count = allCategoriesCount;
				}
				
				// 打印日志查看最终计算的全部数量
				console.debug('分类列表:', this.categoriesList);
				console.debug('全部分类计数:', allCategory ? allCategory.count : '未找到全部分类');
				console.debug('根据各分类计数计算的总数:', allCategoriesCount);
			},
						
			// 获取分类名称
			getCategoryName(categoryId) {
				const category = this.categoriesList.find(cat => cat._id === categoryId);
				return category ? category.name : '未知分类';
			},
			
			// 获取全部分类的计数
			getAllCategoryCount() {
				const allCategory = this.categoriesList.find(cat => cat._id === 'all');
				return allCategory ? allCategory.count || 0 : this.totalCount || 0;
			},
					
			// 过滤分类
			filterByCategory(categoryId) {
				// 切换到对应的分类
				this.changeCategory(categoryId);
			},
			// 加载热门文章
			async loadPopularPosts() {
				try {
					const result = await uniCloud.callFunction({
						name: 'get-hot-articles'
					});
									
					console.debug('热门文章数据:', result);
									
					if(result && result.result && result.result.code === 0) {
						this.popularPosts = result.result.data;
					} else {
						console.error('获取热门文章失败:', result.result ? result.result.msg : '未知错误');
					}
				} catch (error) {
					console.error('加载热门文章出错:', error);
					// 如果云函数调用失败，使用静态数据作为后备
					console.warn('使用静态数据作为后备');
					this.popularPosts = [{
						_id: '1',
						title: 'Vue 3 新特性解析',
						publish_date: new Date().getTime(),
						view_count: 1250
					}, {
						_id: '2',
						title: 'React Hooks 最佳实践',
						publish_date: new Date().getTime(),
						view_count: 980
					}];
				}
			},
			// 切换分类
			changeCategory(categoryId) {
				this.activeCategory = categoryId;
				this.currentPage = 1; // 重置到第一页
				this.articles = []; // 清空当前文章列表
				this.loadArticles(); // 重新加载文章
			},
			
			// 更新分类计数
			updateCategoryCountOnLoad(categoryId, articleCount) {
				this.updateCategoryCount(categoryId, articleCount);
			},

			// 刷新数据
			async refresh() {
				try {
					this.currentPage = 1;
					await this.loadArticles();
					uni.stopPullDownRefresh();
				} catch (error) {
					console.error('刷新数据失败:', error);
					uni.stopPullDownRefresh();
				}
			},
			// 加载更多
			async loadMore() {
				if (!this.loading && this.hasMore) {
					this.currentPage++;
					await this.loadArticles(this.currentPage);
				}
			},
			// 查询出错
				onqueryerror(e) {
				console.error(e);
			},

			// 跳转到文章详情
			goToArticleDetail(id) {
				uni.navigateTo({
					url: `/uni_modules/uni-cms-article/pages/detail/detail?id=${id}`
				});
			},
			
			// 格式化时间戳
			publishTime(timestamp) {
				return translatePublishTime(timestamp)
			},
			readMore(postId) {
				// 跳转到文章详情页
				uni.navigateTo({
					url: `/uni_modules/uni-cms-article/pages/detail/detail?id=${postId}`
				});
			},
								
			
			// 更新单个分类的计数
			updateCategoryCount(categoryId, count) {
				const category = this.categoriesList.find(cat => cat._id === categoryId);
				if(category && categoryId !== 'all') {
					category.count = count;
					
					// 更新"全部"分类的计数（所有其他分类的总和）
					const allCategory = this.categoriesList.find(cat => cat._id === 'all');
					if(allCategory) {
						const otherCategoriesCount = this.categoriesList
							.filter(cat => cat._id !== 'all')
							.reduce((sum, category) => sum + (category.count || 0), 0);
						allCategory.count = otherCategoriesCount;
					}
				}
			},
			
			// 处理分页变化
			handlePageChange(e) {
				const newPage = e.current;
				if (newPage !== this.currentPage) {
					this.currentPage = newPage;
					// 重新加载文章列表，清空当前列表
					this.articles = [];
					this.loadArticles(newPage);
				}
			},
			
			filterByTag(tag) {
				console.log(`筛选标签: ${tag}`);
				// 实现标签筛选逻辑
			},
			// 加载随机标签
			async loadRandomTags() {
				try {
					const result = await uniCloud.callFunction({
						name: 'get-random-tags'
					});
					
					console.log('随机标签数据:', result);
					
					if(result && result.result && result.result.code === 0) {
						this.tags = result.result.data;
					} else {
						console.error('获取随机标签失败:', result.result ? result.result.msg : '未知错误');
					}
				} catch (error) {
					console.error('加载随机标签出错:', error);
					// 如果云函数调用失败，使用静态数据作为后备
					console.warn('使用静态数据作为后备');
					this.tags = ['JavaScript', 'Vue', 'React', 'Node.js', 'CSS', 'HTML', 'TypeScript', 'Angular', 'Flutter', 'Docker'];
				}
			},
			goToSearchPage() {
				uni.navigateTo({
					url: '/uni_modules/uni-cms-article/pages/search/search'
				});
			},
			goToAboutPage() {
				uni.navigateTo({
					url: '/pages/about/about'
				});
			},
			onSearchInput(e) {
				// 搜索框输入时的处理，可以用于实时搜索或搜索建议
				console.log('搜索输入:', e.value);
			},
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
			},
			openFriendLink(url) {
				// 在新窗口打开友链
				if (typeof window !== 'undefined' && window.open) {
					window.open(url, '_blank');
				} else {
					// 兼容uni-app的API
					plus.runtime.openWeb(url);
				}
			},
			// 跳转到首页
			goToIndexPage() {
				uni.switchTab({
					url: '/pages/index/index'
				});
			},
			// 跳转到发布文章页面
			goToPublishArticle() {
				// 检查用户是否具有发布文章的权限
				// 可以根据用户的角色来判断，例如只有管理员或特定角色才能发布文章
				uni.navigateTo({
					url: '/uni_modules/uni-cms/pages/article/add/add'
				});
			},
			// 跳转到用户个人资料页
			goToUserProfile() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/userinfo/userinfo'
				});
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

		}
	}
</script>

<style>
	.blog-home {
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
	
	.search-section {
		display: flex;
		flex: 3;
		justify-content: center;
		padding: 0;
	}
	
	.search-link {
		display: inline-block;
		padding: 0 20rpx;
		height: 60rpx;
		line-height: 60rpx;
		border: 2rpx solid #3498db;
		border-radius: 30rpx;
		background: linear-gradient(135deg, #3498db, #2980b9);
		color: white;
		font-size: 28rpx;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.search-link:hover {
		background: linear-gradient(135deg, #2980b9, #3498db);
		transform: translateY(-1rpx);
		box-shadow: 0 4rpx 8rpx rgba(52, 152, 219, 0.3);
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
	
	.blog-posts {
		flex: 3; /* 保持3:1的比例 */
		min-width: 0; /* 防止flex item溢出 */
		width: 100%;
	}
	
	.sidebar {
		flex: 1; /* 保持3:1的比例 */
		min-width: 250rpx; /* 设置最小宽度保证可用性 */
		flex-shrink: 0;
	}
	
	/* 文章列表样式 - 这些样式将不再影响，因为使用了 uni-cms-article 的标准组件 */
	/* 为 uni-cms-article 组件添加样式 */
	.uni-list {
		width: 100%;
		padding: 0;
		margin: 0;
	}

	/* 确保列表项不居中 */
	.uni-list-item {
		text-align: left !important;
		justify-content: flex-start !important;
		width: 100%;
	}

	.uni-list-item__container {
		text-align: left !important;
		justify-content: flex-start !important;
		width: 100%;
	}


	
	.widget {
		background: #fff;
		border-radius: 12rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		padding: 30rpx;
		margin-bottom: 30rpx;
	}
	
	.widget-title {
		font-size: 32rpx;
		font-weight: bold;
		color: #2c3e50;
		margin: 0 0 20rpx 0;
		padding-bottom: 15rpx;
		border-bottom: 2rpx solid #ecf0f1;
	}
	
	.about-me {
		text-align: center;
	}
	
	.avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		margin-bottom: 15rpx;
	}
	
	.bio {
		font-size: 26rpx;
		color: #7f8c8d;
		line-height: 1.5;
	}
	
	.popular-post {
		margin-bottom: 15rpx;
		padding-bottom: 15rpx;
		border-bottom: 1rpx solid #ecf0f1;
	}
	
	.popular-post:last-child {
		border-bottom: none;
	}
	
	.popular-title {
		display: block;
		font-size: 26rpx;
		color: #2c3e50;
		margin-bottom: 5rpx;
	}
	
	.popular-title:hover {
		color: #3498db;
		text-decoration: underline;
	}
	
	.popular-date {
		font-size: 22rpx;
		color: #95a5a6;
	}
	
	.categories {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
	}
	
	.category {
		font-size: 26rpx;
		color: #2c3e50;
		padding: 10rpx 0;
	}
	
	.category:hover {
		color: #3498db;
	}
	
	.tags-cloud {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}
	
	.tag-item {
		background: #ecf0f1;
		color: #2c3e50;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		font-size: 22rpx;
	}
	
	.tag-item:hover {
		background: #3498db;
		color: #fff;
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
	
	/* 搜索按钮样式 */
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
	}
	
	.friend-links {
		width: 80%;
		margin: 10rpx auto 0;
		padding: 15rpx 0;
		border-top: 1rpx solid #34495e;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 20rpx;
		font-size: 24rpx;
	}
	
	.friend-link-title {
		color: #bdc3c7;
		font-weight: normal;
		margin-right: 15rpx;
	}
	
	.friend-link {
		color: #3498db;
		text-decoration: underline;
		cursor: pointer;
		transition: color 0.3s;
	}
	
	.friend-link:hover {
		color: #5dade2;
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
				
		.search-section {
			order: 3;
			flex: none;
			width: 100%;
			max-width: 600rpx;
			margin-left: 0;
		}
				
		.search-input {
			max-width: none;
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
			flex-direction: column;
		}
				
		.sidebar {
			width: 100%;
			min-width: auto;
		}
				
		.thumbnail {
			width: 120rpx;
			height: 80rpx;
		}
				
		.thumbnails .img {
			height: 120rpx;
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
				
		.friend-links {
			width: 90%;
			flex-direction: column;
			align-items: center;
			gap: 10rpx;
		}
				
		.friend-link-title {
			margin-right: 0;
			margin-bottom: 10rpx;
		}
				
		.friend-link {
			margin: 0 10rpx;
		}
	}
		/* 修复文章列表宽度 */
		uni-list {
			width: 100%;
		}
		
		uni-list-item {
			width: 100%;
		}
		
		.list-item {
			width: 100%;
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
		
		/* 首页主内容和侧边栏容器 */
		.home-main-sidebar-container {
			display: flex;
			gap: 30rpx;
		}
		
		/* 交流圈内容样式 */
		.circle-content {
			width: 100%;
			margin: 20rpx auto;
			background: #fff;
			border-radius: 12rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
			padding: 20rpx 0;
		}
		
		.circle-list {
			width: 100%;
			padding: 0 20rpx;
		}
		
		.circle-item {
			padding: 20rpx;
			border: 1rpx solid #eee;
			border-radius: 12rpx;
			margin-bottom: 20rpx;
			background: #fafafa;
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
		
		.user-info {
			flex: 1;
		}
		
		.nickname {
			font-size: 28rpx;
			font-weight: bold;
			color: #2c3e50;
		}
		
		.time {
			font-size: 24rpx;
			color: #95a5a6;
			margin-left: 20rpx;
		}
		
		.circle-body {
			margin-bottom: 15rpx;
		}
		
		.title {
			font-size: 32rpx;
			font-weight: bold;
			color: #2c3e50;
			display: block;
			margin-bottom: 10rpx;
		}
		
		.description {
			font-size: 28rpx;
			color: #7f8c8d;
			line-height: 1.5;
		}
		
		.circle-footer {
			margin-top: 15rpx;
			padding-top: 15rpx;
			border-top: 1rpx solid #eee;
		}
		
		.group-info {
			display: flex;
			flex-direction: column;
			gap: 8rpx;
		}
		
		.qq-group, .wx-group {
			font-size: 26rpx;
			color: #3498db;
		}
		
		/* 关于页面样式 */
		.about-content {
			width: 100%;
			margin: 20rpx auto;
			padding: 30rpx;
			background: #fff;
			border-radius: 12rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		}
		
		.about-card {
			text-align: center;
		}
		
		.about-card .logo {
			width: 120rpx;
			height: 120rpx;
			margin: 0 auto 20rpx;
			border-radius: 20rpx;
		}
		
		.app-name {
			font-size: 36rpx;
			font-weight: bold;
			color: #2c3e50;
			display: block;
			margin-bottom: 10rpx;
		}
		
		.version {
			font-size: 28rpx;
			color: #95a5a6;
			display: block;
			margin-bottom: 30rpx;
		}
		
		.about-section {
			margin-bottom: 30rpx;
			text-align: left;
		}
		
		.section-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #2c3e50;
			display: block;
			margin-bottom: 15rpx;
			border-left: 6rpx solid #3498db;
			padding-left: 15rpx;
		}
		
		.section-content {
			font-size: 28rpx;
			color: #7f8c8d;
			line-height: 1.6;
			display: block;
			margin-bottom: 10rpx;
		}
		
		/* 分类按钮样式 */
		.category {
			margin-right: 20rpx;
			padding: 8rpx 16rpx;
			background-color: #f0f0f0;
			border-radius: 8rpx;
			font-size: 24rpx;
			color: #666;
			cursor: pointer;
			margin-bottom: 10rpx;
		}
					
		/* 分页组件样式 */
		.pagination {
			display: flex;
			justify-content: center;
			margin: 20rpx 0;
			padding: 20rpx 0;
			background-color: #fff;
			border-top: 1rpx solid #eee;
		}
		
		.category.active {
			background-color: #007AFF;
			color: white;
		}
		
		/* 顶部分类导航样式 */
		.category-nav {
			width: 100%;
			background-color: #fff;
			padding: 20rpx 0;
			border-bottom: 1rpx solid #eee;
		}
		
		.category-scroll {
			display: flex;
			white-space: nowrap;
			padding: 0 20rpx;
		}
		
		.category-item {
			display: inline-block;
			margin-right: 30rpx;
			padding: 10rpx 20rpx;
			background-color: #f8f8f8;
			border-radius: 30rpx;
			font-size: 28rpx;
			color: #666;
			cursor: pointer;
		}
		
		.category-item.active {
			background-color: #007AFF;
			color: white;
		}
	</style>