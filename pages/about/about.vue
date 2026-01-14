<template>
	<view class="about-page">
		<view class="header">
			<view class="header-content">
				<view class="logo-section">
					<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
					<text class="site-name">码客——程序员交流社区</text>
				</view>
			</view>
		</view>
		
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
export default {
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
	justify-content: flex-start;
	align-items: center;
	gap: 40rpx;
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
		width: 90%;
	}
	
	.logo-section {
		justify-content: center;
	}
	
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
</style>