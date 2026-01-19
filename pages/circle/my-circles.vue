<template>
	<view class="container">
		<TopNavBar />
		
		<!-- 页面标题 -->
		<view class="page-title">
			我的交流圈
		</view>
		
		<!-- 发布交流圈按钮 -->
		<view class="publish-section">
			<button class="publish-btn" @click="goToPublishCircle">
				<uni-icons type="plus" size="16" color="#fff" style="margin-right: 8px;"></uni-icons>
				发布交流圈
			</button>
		</view>
		
		<!-- 我的交流圈列表 -->
		<view class="circles-list">
			<view v-for="(item, index) in myCircles" :key="item._id" class="circle-item">
				<view class="circle-header">
					<image :src="item.avatar || '/static/logo.png'" class="avatar" mode="aspectFill"></image>
					<view class="user-info">
						<text class="nickname">{{ item.nickName || '匿名用户' }}</text>
						<text class="publish-time">{{ item.createTime | formatTime }}</text>
					</view>
				</view>
				
				<view class="circle-content">
					<text class="content-text">{{ item.content }}</text>
										
					<!-- 图片列表 -->
					<view v-if="item.images && item.images.length > 0" class="image-list">
						<image 
							v-for="(img, imgIndex) in item.images" 
							:key="imgIndex" 
							:src="img" 
							class="circle-image" 
							mode="aspectFill"
							@click="previewImage(img, item.images)">
						</image>
					</view>
				</view>
				
				<!-- 群类型 -->
				<view class="circle-footer">
					<view class="group-type">
						<uni-icons type="chat" size="14" color="#999"></uni-icons>
						<text class="group-text">{{ item.group_type === 'weixin' ? '微信群' : (item.group_type === 'qq' ? 'QQ群' : (item.group_type === 'xiaohongshu' ? '小红书' : '')) }}</text>
					</view>
					
					<!-- 分类标签 -->
					<view class="category-tag">
						<text class="category-text">{{ getCategoryName(item.categoryId || item.category_id) }}</text>
					</view>
				</view>
				
				<!-- 操作按钮 -->
				<view class="circle-actions">
					<button class="action-btn edit-btn" @click="editCircle(item)">编辑</button>
					<button class="action-btn delete-btn" @click="deleteCircle(item._id, index)">删除</button>
				</view>
			</view>
			
			<!-- 加载更多 -->
			<uni-load-more :status="loadStatus" :content-text="{contentdown: '点击加载更多', contentrefresh: '加载中', contentnomore: '没有更多了'}" @clickLoadMore="loadMore" />
		</view>
		
		<!-- 空状态 -->
		<view v-if="myCircles.length === 0" class="empty-state">
			<text class="empty-text">暂无交流圈内容</text>
		</view>
	</view>
</template>

<script>
	import TopNavBar from '@/components/TopNavBar.vue';
	
	export default {
		components: {
			TopNavBar
		},
		data() {
			return {
				myCircles: [],
				currentPage: 1,
				pageSize: 10,
				total: 0,
				loadStatus: 'more',
				categories: [] // 分类数据
			};
		},
		onLoad() {
			this.loadMyCircles();
			this.loadCategories();
		},
		methods: {
			// 跳转到发布交流圈页面
			goToPublishCircle() {
				uni.navigateTo({
					url: '/pages/circle/add'
				});
			},
			
			// 加载我的交流圈列表
			async loadMyCircles() {
				this.loadStatus = 'loading';
				
				try {
					const currentUserInfo = uniCloud.getCurrentUserInfo();
					const uid = currentUserInfo.uid;
										
					const result = await uniCloud.callFunction({
						name: 'get-my-circles',
						data: {
							uid: uid,
							page: this.currentPage,
							pageSize: this.pageSize
						}
					});
					
					if (result.result.code === 0) {
						const newData = result.result.data.list || [];
						if (this.currentPage === 1) {
							this.myCircles = newData;
						} else {
							this.myCircles = [...this.myCircles, ...newData];
						}
						this.total = result.result.data.total || 0;
						
						// 更新加载状态
						if (this.myCircles.length >= this.total) {
							this.loadStatus = 'noMore';
						} else {
							this.loadStatus = 'more';
						}
					} else {
						uni.showToast({
							title: result.result.msg || '加载失败',
							icon: 'none'
						});
						this.loadStatus = 'more';
					}
				} catch (error) {
					console.error('加载我的交流圈失败:', error);
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					});
					this.loadStatus = 'more';
				}
			},
			
			// 加载分类数据
			async loadCategories() {
				try {
					const result = await uniCloud.callFunction({
						name: 'get-circle-category-list',
						data: {}
					});
					
					if (result.result.code === 0) {
						this.categories = result.result.data || [];
					}
				} catch (error) {
					console.error('加载分类失败:', error);
				}
			},
			
			// 获取分类名称
			getCategoryName(categoryId) {
				const category = this.categories.find(cat => cat.value === categoryId);
				return category ? category.text : '未分类';
			},
			
			// 预览图片
			previewImage(current, urls) {
				uni.previewImage({
					current: current,
					urls: urls
				});
			},
			
			// 编辑交流圈
			editCircle(circle) {
				uni.navigateTo({
					url: `/pages/circle/edit?id=${circle._id}`
				});
			},
			
			// 删除交流圈
			deleteCircle(id, index) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这条交流圈吗？',
					success: async (res) => {
						if (res.confirm) {
							try {
								const result = await uniCloud.callFunction({
									name: 'delete-circle',
									data: {
										id: id
									}
								});
								
								if (result.result.code === 0) {
									uni.showToast({
										title: '删除成功',
										icon: 'success'
									});
									
									// 从本地列表中移除
									this.myCircles.splice(index, 1);
									this.total = Math.max(0, this.total - 1);
								} else {
									uni.showToast({
										title: result.result.msg || '删除失败',
										icon: 'none'
									});
								}
							} catch (error) {
								console.error('删除交流圈失败:', error);
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								});
							}
						}
					}
				});
			},
			
			// 加载更多
			loadMore() {
				if (this.loadStatus !== 'more') return;
				
				this.currentPage++;
				this.loadMyCircles();
			}
		},
		filters: {
			formatTime(time) {
				if (!time) return '';
				
				const date = new Date(time);
				const now = new Date();
				const diff = now.getTime() - date.getTime();
				const dayDiff = Math.floor(diff / (24 * 3600 * 1000));
				
				if (dayDiff === 0) {
					return '今天 ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
				} else if (dayDiff === 1) {
					return '昨天 ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
				} else {
					return (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
				}
			}
		}
	}
</script>

<style lang="scss">
	.container {
		padding: 0;
		background-color: #f5f5f5;
		min-height: 100vh;
	}
	
	.page-title {
		width: 100%;
		padding: 30rpx;
		font-size: 36rpx;
		font-weight: bold;
		text-align: center;
		background-color: #fff;
		border-bottom: 1rpx solid #eee;
		box-sizing: border-box;
	}
	
	.publish-section {
		padding: 20rpx 30rpx;
		background-color: #fff;
		margin-bottom: 20rpx;
		
		.publish-btn {
			width: 100%;
			background: linear-gradient(135deg, #667eea, #764ba2);
			color: #fff;
			border: none;
			border-radius: 10rpx;
			padding: 20rpx;
			font-size: 32rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			
			&::after {
				border: none;
			}
		}
	}
	
	.circles-list {
		padding: 0 30rpx;
	}
	
	.circle-item {
		background-color: #fff;
		border-radius: 15rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
		position: relative;
	}
	
	.circle-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		margin-right: 20rpx;
	}
	
	.user-info {
		flex: 1;
	}
	
	.nickname {
		display: block;
		font-size: 30rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 8rpx;
	}
	
	.publish-time {
		font-size: 24rpx;
		color: #999;
	}
	
	.circle-content {
		margin-bottom: 20rpx;
	}
	
	.content-text {
		font-size: 32rpx;
		color: #333;
		line-height: 1.6;
		word-break: break-all;
	}
	
	.image-list {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
		margin-top: 20rpx;
	}
	
	.circle-image {
		width: 200rpx;
		height: 200rpx;
		border-radius: 10rpx;
	}
	
	.circle-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
		padding-bottom: 20rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}
	
	.group-type {
		display: flex;
		align-items: center;
		
		.group-text {
			font-size: 24rpx;
			color: #999;
			margin-left: 8rpx;
		}
	}
	
	.category-tag {
		background-color: #f0f0f0;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		
		.category-text {
			font-size: 24rpx;
			color: #666;
		}
	}
	
	.circle-actions {
		display: flex;
		gap: 20rpx;
		justify-content: flex-end;
	}
	
	.action-btn {
		padding: 12rpx 24rpx;
		font-size: 24rpx;
		border-radius: 30rpx;
		border: none;
		
		&::after {
			border: none;
		}
	}
	
	.edit-btn {
		background-color: #4a90e2;
		color: #fff;
	}
	
	.delete-btn {
		background-color: #ff6b6b;
		color: #fff;
	}
	
	.empty-state {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 100rpx 0;
	}
	
	.empty-text {
		font-size: 28rpx;
		color: #999;
	}
</style>