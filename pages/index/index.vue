<template>
	<view class="blog-home">
		<!-- 顶部导航栏 -->
		<view class="header">
			<view class="header-content">
				<view class="logo-section">
					<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
					<text class="site-name">码客——程序员交流社区</text>
				</view>
				<view class="nav-section">
					<button class="search-button" @click="goToSearchPage">
						<text class="search-icon">🔍</text>
						<text class="search-text">搜索文章</text>
					</button>
					<text class="nav-item active">首页</text>
					<text class="nav-item" @click="goToAboutPage">关于</text>
				</view>
			</view>
		</view>
		
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
				<!-- 博客文章列表 -->
				<view class="blog-posts">
					<!-- 使用 uni-cms-article 提供的标准列表组件 -->
					<unicloud-db ref='udb' v-slot:default="{ data, pagination, hasMore, loading, error, options }" @error="onqueryerror"
						:collection="colList" :page-size="10" orderby="publish_date desc" @load="listLoad">
						<!-- #ifndef APP-NVUE -->
						<scroll-view
							scroll-y
							class="uni-list"
							refresher-enabled
							@refresherrefresh="refresh"
							@scrolltolower="loadMore"
						>
							<template v-for="item in data">
								<not-cover v-if="item.thumbnail && item.thumbnail.length === 0" :data="item" @click="goToArticleDetail(item._id)"></not-cover>
								<right-small-cover v-else-if="item.thumbnail && item.thumbnail.length === 1"
									:data="item" @click="goToArticleDetail(item._id)"></right-small-cover>
								<three-cover v-else-if="item.thumbnail && item.thumbnail.length >= 3"
									:data="item" @click="goToArticleDetail(item._id)"></three-cover>
							</template>
							<!-- 加载状态 -->
							<uni-load-state @networkResume="refresh"
								:state="{ data: data, pagination, hasMore, loading, error }"
								@clickLoadMore="loadMore">
							</uni-load-state>
						</scroll-view>
						<!-- #endif -->
						<!-- #ifdef APP-NVUE -->
						<list class="uni-list" :border="false">
							<refresh-box :loading="loading" @refresh="refresh"></refresh-box>
							<template v-for="item in data">
								<not-cover v-if="item.thumbnail && item.thumbnail.length === 0" :data="item" @click="goToArticleDetail(item._id)"></not-cover>
								<right-small-cover v-else-if="item.thumbnail && item.thumbnail.length === 1"
									:data="item" @click="goToArticleDetail(item._id)"></right-small-cover>
								<three-cover v-else-if="item.thumbnail && item.thumbnail.length >= 3"
									:data="item" @click="goToArticleDetail(item._id)"></three-cover>
							</template>
							<uni-load-state @networkResume="refresh"
								:state="{ data: data, pagination, hasMore, loading, error }"
								@clickLoadMore="loadMore">
							</uni-load-state>
						</list>
						<!-- #endif -->
					</unicloud-db>
				</view>
				
				<!-- 侧边栏 -->
				<view class="sidebar">
					<!-- 热门文章 -->
					<view class="widget">
						<h3 class="widget-title">热门文章</h3>
						<view class="popular-post" v-for="(popular, index) in popularPosts" :key="index">
							<text class="popular-title" @click="readMore(popular._id)">{{ popular.title }}</text>
							<text class="popular-date">{{ publishTime(popular.publish_date) }}</text>
						</view>
					</view>
					
					<!-- 分类 -->
					<view class="widget">
						<h3 class="widget-title">分类</h3>
						<view class="categories">
							<text class="category" v-for="(cat, index) in categoriesList.filter(c => c._id !== 'all')" :key="cat._id" @click="filterByCategory(cat._id)">
								{{ cat.name }} ({{ cat.count }})
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
			</view>
		</view>
		
		<!-- 页脚 -->
		<view class="footer">
			<view class="footer-content">
				<text class="copyright">© 2026 码客——程序员交流社区</text>
				<view class="beian-info">
					<text class="beian-text" @click="openBeianLink('miit')">豫ICP备2023000435号-1</text>
					<text class="beian-text" @click="openBeianLink('gongan')">豫公网安备41040202000218号</text>
					<text class="company">河南点线面网络科技有限公司</text>
				</view>
			</view>
			
			<!-- 友情链接 -->
			<view class="friend-links">
				<text class="friend-link-title">友情链接：</text>
				<a class="friend-link" href="https://www.dxmwl.com" @click="openFriendLink('https://www.dxmwl.com')" target="_blank">点线面网络</a>
				<a class="friend-link" href="https://official.youkeyun.dxmwl.com" @click="openFriendLink('https://official.youkeyun.dxmwl.com')" target="_blank">友客云</a>
			</view>
		</view>
	</view>
</template>

<script>
	import translatePublishTime from '@/uni_modules/uni-cms-article/common/publish-time';
	
	// 引入 uni-cms-article 组件
	import notCover from '@/uni_modules/uni-cms-article/components/list-template/not-cover.vue';
	import rightSmallCover from '@/uni_modules/uni-cms-article/components/list-template/right-small-cover.vue';
	import threeCover from '@/uni_modules/uni-cms-article/components/list-template/three-cover.vue';
	import refreshBox from '@/uni_modules/uni-cms-article/components/refresh-box/refreshBox.nvue';
	
	const db = uniCloud.database();
	const articleDBName = 'uni-cms-articles'
	const categoryDBName = 'uni-cms-categories'
	const userDBName = 'uni-id-users'
	
	export default {
		components: {
			notCover,
			rightSmallCover,
			threeCover,
			refreshBox
		},
		data() {
			return {
				where: '"article_status" == 1', // 查询条件
				activeCategory: 'all', // 当前选中的分类ID
				categoriesList: [], // 分类列表，从云函数获取
				popularPosts: [], // 热门文章列表，通过云函数动态加载
				articles: [], // 文章列表
				listData: [], // 用于存储 unicloud-db 加载的数据
				currentPage: 1,
				pageSize: 10,
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
				tags: [] // 标签云数据，通过云函数动态加载
			}
		},
		computed: {
			// 连表查询，返回两个集合的查询结果
			colList() {
				// 根据选中的分类构建查询条件
				let whereCondition = this.where;
				if (this.activeCategory !== 'all') {
					whereCondition += ` && category_id == '${this.activeCategory}'`;
				}
						
				return [
					db.collection(articleDBName).where(whereCondition).field('thumbnail,title,publish_date,user_id,category_id').getTemp(), // 文章集合
					db.collection(userDBName).field('_id,nickname').getTemp() // 用户集合
				]
			},
			

		},
		onLoad() {
			// 初始化热门文章
			this.loadPopularPosts();
			// 加载分类列表
			this.loadCategories();
			// 加载标签云
			this.loadRandomTags();
			// 加载文章列表
			this.loadArticles();
		},
		methods: {
			// 加载文章列表
			async loadArticles() {
				try {
					this.loading = true;
					const result = await uniCloud.callFunction({
						name: 'get-article-list',
						params: {
							category_id: this.activeCategory,
							page: this.currentPage,
							pageSize: this.pageSize
						}
					});
															
					console.log('文章列表数据:', result);
															
					if(result && result.result && result.result.code === 0) {
						const newArticles = result.result.data;
						if(this.currentPage === 1) {
							// 第一页，替换所有数据
							this.articles = newArticles;
						} else {
							// 加载更多，追加数据
							this.articles = this.articles.concat(newArticles);
						}
															
						// 检查是否还有更多数据
						this.hasMore = newArticles.length === this.pageSize;
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
					console.log('开始加载分类列表...');
					const result = await uniCloud.callFunction({
						name: 'get-category-list'
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
					const defaultCategories = [{ _id: 'frontend', name: '前端开发' }, { _id: 'backend', name: '后端开发' }, { _id: 'mobile', name: '移动端' }];
					this.categoriesList = [allCategory, ...defaultCategories];
				}
			},
			// 加载热门文章
			async loadPopularPosts() {
				try {
					const result = await uniCloud.callFunction({
						name: 'get-hot-articles'
					});
									
					console.log('热门文章数据:', result);
									
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
			// 切换分类（包括全部分类）
			changeCategoryWithAll(categoryId) {
				this.activeCategory = categoryId;
				this.currentPage = 1; // 重置到第一页
				this.articles = []; // 清空当前文章列表
				this.loadArticles(); // 重新加载文章
			},
			// 加载更多文章
			loadMoreArticles() {
				if (!this.loading && this.hasMore) {
					this.currentPage++;
					this.loadArticles();
				}
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
			filterByCategory(categoryId) {
				// 切换到对应的分类
				this.changeCategory(categoryId);
			},
			// 切换分类
			changeCategory(categoryId) {
				this.activeCategory = categoryId;
				this.currentPage = 1; // 重置到第一页
				// 重新加载文章列表
				this.loadArticles();
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
			// 处理 unicloud-db 数据加载
			async listLoad(data) {
				const listData = data.map(item => {
					if (typeof item.thumbnail === 'string') {
						item.thumbnail = [item.thumbnail]
					}
					return item
				})
				
				this.listData = this.loadType === 'loadMore' ? this.articles.concat(listData) : listData
				this.loadType = null
			},
			// 刷新数据
			refresh() {
				this.loadType = 'refresh'
				this.$refs.udb.loadData({
					clear: true
				}, () => {
					uni.stopPullDownRefresh()
				})
			},
			// 加载更多
			loadMore() {
				this.loadType = 'loadMore'
				this.$refs.udb.loadMore()
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
			// 跳转到文章详情页
			readMore(postId) {
				uni.navigateTo({
					url: `/uni_modules/uni-cms-article/pages/detail/detail?id=${postId}`
				});
			}
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
	
	.Category {
		font-size: 26rpx;
		color: #2c3e50;
		padding: 10rpx 0;
	}
	
	.Category:hover {
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
	</style>