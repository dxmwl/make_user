<template>
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
</template>

<script>
export default {
	name: 'Footer',
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
		}
	}
}
</script>

<style scoped>
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