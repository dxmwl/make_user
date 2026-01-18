<template>
	<view class="about-page">
		<TopNavBar />
		
		<view class="main-content">
			<view class="container">
				<view class="about-section">
					<h2 class="section-title">关于我们</h2>
					<div class="about-content">
						<h3>项目介绍</h3>
						<p>码客——程序员交流社区是一个专注于程序员技术交流与学习的平台。我们致力于为开发者提供高质量的技术文章、经验分享和交流机会。</p>
						
						<h3>公司介绍</h3>
						<p>河南点线面网络科技有限公司是一家专业的互联网技术服务公司，专注于Web开发、移动应用开发和云计算解决方案。</p>
						
						<h3>联系我们</h3>
						<p>如果您有任何问题或建议，欢迎通过以下方式联系我们：</p>
						<ul class="contact-list">
							<li class="contact-item">
								<span class="contact-label">微信：</span>
								<span class="contact-value">dxmcpjl</span>
							</li>
						</ul>
					</div>
				</view>
			</view>
		</view>
		
		<Footer />
	</view>
</template>

<script>
import TopNavBar from '@/components/TopNavBar.vue';
import Footer from '@/pages/components/Footer.vue';

export default {
	components: {
		TopNavBar,
		Footer
	},
	data() {
		return {};
	},
	methods: {
		openBeianLink(type) {
			let url = '';
			if (type === 'miit') {
				url = 'https://beian.miit.gov.cn/';
			} else if (type === 'gongan') {
				url = 'https://www.beian.gov.cn/';
			}
			
			// 在新窗口打开链接
			if (url) {
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
		}
	}
}
</script>

<style>
.about-page {
	min-height: 100vh;
	background-color: #f5f7fa;
	display: flex;
	flex-direction: column;
}

/* 原来的header样式已由TopNavBar组件处理 */

.main-content {
	flex: 1;
	padding: 20rpx;
	padding-top: 20rpx;
}

.container {
	width: 80%;
	margin: 0 auto;
	display: flex;
	gap: 30rpx;
}

.about-section {
	flex: 1;
	background: #fff;
	border-radius: 12rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	padding: 40rpx;
	margin: 20rpx 0;
}

.section-title {
	font-size: 40rpx;
	font-weight: bold;
	color: #2c3e50;
	margin: 0 0 30rpx 0;
	text-align: center;
	padding-bottom: 20rpx;
	border-bottom: 2rpx solid #ecf0f1;
}

.about-content h3 {
	font-size: 32rpx;
	color: #2c3e50;
	margin: 30rpx 0 15rpx 0;
}

.about-content p {
	font-size: 28rpx;
	color: #34495e;
	line-height: 1.8;
	margin-bottom: 20rpx;
	text-align: justify;
}

.contact-list {
	list-style: none;
	padding: 0;
	margin: 20rpx 0;
}

.contact-item {
	font-size: 28rpx;
	color: #34495e;
	margin: 15rpx 0;
	padding: 15rpx;
	background: #f8f9fa;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
}

.contact-label {
	font-weight: bold;
	color: #2c3e50;
	margin-right: 10rpx;
}

.contact-value {
	color: #3498db;
}

/* 原来的footer样式已由Footer组件处理 */

/* 响应式设计 */
@media (max-width: 768px) {
	/* 原来的header样式已由TopNavBar组件处理 */
	
	.container {
		width: 90%;
		flex-direction: column;
	}
	
	.about-section {
		width: 100%;
		padding: 30rpx 20rpx;
	}
	
	.section-title {
		font-size: 36rpx;
	}
	
	.about-content h3 {
		font-size: 30rpx;
	}
	
	.about-content p {
		font-size: 26rpx;
	}
	
	.contact-item {
		font-size: 26rpx;
		flex-direction: column;
		align-items: flex-start;
	}
	
	.contact-label {
		margin-bottom: 5rpx;
	}
	
	/* 原来的footer响应式样式已由Footer组件处理 */
}
</style>