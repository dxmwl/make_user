<template>
	<view class="blog-home">
		<!-- 主要内容区域 -->
		<view class="main-container">
			<view class="container">
				<!-- 博客文章列表 -->
				<view class="blog-posts">
					<!-- 使用uni-cms-article的列表组件结构 -->
					<unicloud-db ref='udb' v-slot:default="{ data, pagination, hasMore, loading, error }" 
						:collection="colList" :page-size="10" orderby="publish_date desc">
						<uni-list>
							<template v-for="item in data" :key="item._id">
								<!-- 无封面文章 -->
								<uni-list-item 
									v-if="!item.thumbnail || item.thumbnail.length === 0" 
									:to="'/uni_modules/uni-cms-article/pages/detail/detail?id=' + item._id"
									class="list-item not-cover"
									direction="column"
								>
									<template v-slot:body>
										<view class="main">
											<view>
												<text class="title">{{ item.title }}</text>
											</view>
											<view class="info">
												<text class="author">{{ item.user_id && item.user_id[0] ? item.user_id[0].nickname : '' }}</text>
												<text class="publish_date">{{ publishTime(item.publish_date) }}</text>
											</view>
										</view>
									</template>
								</uni-list-item>
								
								<!-- 右侧小封面文章 -->
								<uni-list-item 
									v-else-if="item.thumbnail && item.thumbnail.length === 1"
									:to="'/uni_modules/uni-cms-article/pages/detail/detail?id=' + item._id"
									class="list-item right-small-cover"
								>
									<template v-slot:body>
										<view class="main">
											<view class="left">
												<text class="title">{{ item.title }}</text>
												<view class="info">
													<text class="author">{{ item.user_id && item.user_id[0] ? item.user_id[0].nickname : '' }}</text>
													<text class="publish_date">{{ publishTime(item.publish_date) }}</text>
												</view>
											</view>
											<image class="thumbnail" :src="item.thumbnail[0]" mode="aspectFill"></image>
										</view>
									</template>
								</uni-list-item>
								
								<!-- 三封面文章 -->
								<uni-list-item 
									v-else-if="item.thumbnail && item.thumbnail.length >= 3"
									:to="'/uni_modules/uni-cms-article/pages/detail/detail?id=' + item._id"
									class="list-item three-cover"
									direction="column"
								>
									<template v-slot:body>
										<view class="main">
											<text class="title">{{ item.title }}</text>
											<view class="thumbnails">
												<image class="img" v-for="(img, index) in item.thumbnail.slice(0, 3)" :key="index" :src="img" mode="aspectFill"></image>
											</view>
											<view class="info">
												<text class="author">{{ item.user_id && item.user_id[0] ? item.user_id[0].nickname : '' }}</text>
												<text class="publish_date">{{ publishTime(item.publish_date) }}</text>
											</view>
										</view>
									</template>
								</uni-list-item>
							</template>
						</uni-list>
						<uni-load-more :status="hasMore ? 'more' : 'noMore'"></uni-load-more>
					</unicloud-db>
				</view>
				
				<!-- 侧边栏 -->
				<view class="sidebar">
					<!-- 关于我 -->
					<view class="widget">
						<h3 class="widget-title">关于我</h3>
						<view class="about-me">
							<image class="avatar" src="/static/logo.png" mode="aspectFill"></image>
							<text class="bio">欢迎来到码客社区，这里是程序员交流学习的平台。</text>
						</view>
					</view>
					
					<!-- 热门文章 -->
					<view class="widget">
						<h3 class="widget-title">热门文章</h3>
						<view class="popular-post" v-for="(popular, index) in popularPosts" :key="index">
							<text class="popular-title" @click="readMore(popular.id)">{{ popular.title }}</text>
							<text class="popular-date">{{ popular.date }}</text>
						</view>
					</view>
					
					<!-- 分类 -->
					<view class="widget">
						<h3 class="widget-title">分类</h3>
						<view class="categories">
							<text class="category" v-for="(cat, index) in categories" :key="index" @click="filterByCategory(cat.name)">
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
			<text>© 2026 码客——程序员交流社区</text>
		</view>
	</view>
</template>

<script>
	import translatePublishTime from '@/uni_modules/uni-cms-article/common/publish-time';
	
	const db = uniCloud.database();
	const articleDBName = 'uni-cms-articles'
	const userDBName = 'uni-id-users'
	
	export default {
		data() {
			return {
				where: '"article_status" == 1', // 查询条件
				popularPosts: [{
					id: 1,
					title: 'Vue 3与React：前端框架对比分析',
					date: '2026-01-10'
				}, {
					id: 2,
					title: 'Node.js性能优化实战指南',
					date: '2026-01-08'
				}, {
					id: 4,
					title: '微前端架构设计与实践',
					date: '2026-01-03'
				}, {
					id: 3,
					title: 'TypeScript高级特性详解',
					date: '2026-01-05'
				}],
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
				tags: ['JavaScript', 'Vue', 'React', 'Node.js', 'CSS', 'HTML', 'TypeScript', 'Angular', 'Flutter', 'Docker']
			}
		},
		computed: {
			// 连表查询，返回两个集合的查询结果
			colList() {
				return [
					db.collection(articleDBName).where(this.where).field('thumbnail,title,publish_date,user_id').getTemp(), // 文章集合
					db.collection(userDBName).field('_id,nickname').getTemp() // 用户集合
				]
			}
		},
		onLoad() {
			// 页面加载时的逻辑
		},
		methods: {
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
			filterByCategory(category) {
				console.log(`筛选分类: ${category}`);
				// 实现分类筛选逻辑
			},
			filterByTag(tag) {
				console.log(`筛选标签: ${tag}`);
				// 实现标签筛选逻辑
			}
		}
	}
</script>

<style>
	.blog-home {
		min-height: 100vh;
		background-color: #f5f7fa;
	}
	
	.main-container {
		flex: 1;
		padding: 20rpx;
		padding-top: 20rpx;
	}
	
	.container {
		width: 90%; /* 改为百分比宽度 */
		margin: 0 auto;
		display: flex;
		gap: 30rpx;
	}
	
	.blog-posts {
		flex: 3; /* 保持3:1的比例 */
		min-width: 0; /* 防止flex item溢出 */
	}
	
	.sidebar {
		flex: 1; /* 保持3:1的比例 */
		min-width: 250rpx; /* 设置最小宽度保证可用性 */
		flex-shrink: 0;
	}
	
	/* 文章列表样式 */
	.list-item {
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		flex: 1;
	}
	
	.list-item .main {
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		flex: 1;
	}
	
	.list-item .main .title {
		font-size: 30rpx;
		color: #333333;
	}
	
	.list-item .main .info {
		display: flex;
		flex-direction: row;
		margin-top: 20rpx;
	}
	
	.list-item .main .author,
	.list-item .main .publish_date {
		font-size: 24rpx;
		color: #bbbbbb;
	}
	
	.list-item .main .publish_date {
		margin-left: 14rpx;
	}
	
	.list-item.right-small-cover .main {
		flex-direction: row;
		align-items: center;
	}
	
	.list-item.right-small-cover .main .left {
		flex: 1;
	}
	
	.list-item.right-small-cover .main .title {
		font-size: 30rpx;
		color: #333333;
	}
	
	.list-item.right-small-cover .main .info {
		margin-top: 10rpx;
	}
	
	.thumbnail {
		width: 240rpx;
		height: 160rpx;
		margin-left: 20rpx;
		border-radius: 8rpx;
		object-fit: cover;
	}
	
	.thumbnails {
		margin: 20rpx 0;
		display: flex;
		align-items: center;
		flex-direction: row;
	}
	
	.thumbnails .img {
		flex: 1;
		/* #ifndef APP-NVUE */
		width: auto;
		/* #endif */
		height: 200rpx;
		border-radius: 8rpx;
		margin: 0 10rpx;
		object-fit: cover;
	}
	
	.thumbnails .img:first-child {
		margin-left: 0;
	}
	
	.thumbnails .img:last-child {
		margin-right: 0;
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
		padding: 30rpx;
		background: #2c3e50;
		color: #ecf0f1;
		font-size: 24rpx;
	}
	
	/* 响应式设计 */
	@media (max-width: 768px) {
		.container {
			width: 95%;
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
	}
</style>