<template>
	<view class="terms-page">
		<TopNavBar />
		
		<view class="main-content">
			<view class="container">
				<view class="terms-section">
					<h2 class="section-title">用户服务协议</h2>
					<div class="terms-content">
						<p>欢迎来到码客——程序员交流社区！</p>
						<p>请您在使用我们的服务前仔细阅读并理解本用户服务协议（以下简称"本协议"）的全部内容。如果您不同意本协议的任何条款，请勿使用我们的服务。一旦您使用我们的服务，即表示您同意遵守本协议的所有条款和条件。</p>
						
						<h3>一、协议范围</h3>
						<p>本协议是你与河南点线面网络科技有限公司（以下简称"本公司"）之间关于使用码客——程序员交流社区（以下简称"本平台"）各项服务的法律协议。</p>
						
						<h3>二、账户注册</h3>
						<ol>
							<li>用户注册是指用户登录或使用本平台服务时，需要填写必要信息以创建账户的过程。</li>
							<li>用户必须提供真实、准确、完整的个人信息，并及时更新以保持信息的有效性。</li>
							<li>用户应妥善保管自己的账户和密码，对以其账户进行的所有活动承担责任。</li>
							<li>用户不得冒充他人，不得侵犯他人的合法权益。</li>
						</ol>
						
						<h3>三、服务内容</h3>
						<ol>
							<li>本平台提供技术交流、文章分享、问题解答等服务。</li>
							<li>本平台有权根据发展需要，适时调整服务内容或形式。</li>
							<li>本平台保留随时暂停或终止部分或全部服务的权利。</li>
						</ol>
						
						<h3>四、用户行为规范</h3>
						<ol>
							<li>用户不得利用本平台从事违法违规活动。</li>
							<li>用户不得发布或传播违法不良信息。</li>
							<li>用户不得恶意攻击、辱骂他人。</li>
							<li>用户不得发布广告、垃圾信息。</li>
							<li>用户应当尊重他人，维护良好的网络环境。</li>
						</ol>
						
						<h3>五、知识产权保护</h3>
						<ol>
							<li>本平台所有内容（包括但不限于文字、图片、视频、音频等）均受版权法等相关法律保护。</li>
							<li>未经本平台许可，任何单位和个人不得擅自复制、传播、展示、镜像、上载、下载等。</li>
							<li>用户上传的内容，视为授权本平台在合法范围内使用。</li>
						</ol>
						
						<h3>六、免责声明</h3>
						<ol>
							<li>本平台尽力确保服务的安全、稳定，但不保证服务不会中断或完全无误。</li>
							<li>用户自行承担使用本平台的风险。</li>
							<li>本平台对因不可抗力因素造成的损失不承担责任。</li>
						</ol>
						
						<h3>七、隐私保护</h3>
						<ol>
							<li>本平台非常重视用户个人信息的保护，详细内容请参见《隐私政策》。</li>
							<li>本平台仅在法律法规允许范围内收集、使用用户信息。</li>
						</ol>
						
						<h3>八、协议变更</h3>
						<ol>
							<li>本平台有权根据运营需要对本协议进行修订。</li>
							<li>修订后的协议将在本平台公布，公布后生效。</li>
							<li>如您继续使用本平台服务，即表示您接受修订后的协议。</li>
						</ol>
						
						<h3>九、争议解决</h3>
						<ol>
							<li>因本协议引起的争议，双方应友好协商解决。</li>
							<li>协商不成的，任何一方均可向本平台所在地人民法院提起诉讼。</li>
						</ol>
						
						<h3>十、其他</h3>
						<ol>
							<li>本协议未尽事宜，按照国家有关法律法规执行。</li>
							<li>本协议条款如与国家法律法规相冲突，以国家法律法规为准。</li>
						</ol>
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
	methods: {}
}
</script>

<style>
.terms-page {
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

.terms-section {
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

.terms-content h3 {
	font-size: 32rpx;
	color: #2c3e50;
	margin: 30rpx 0 15rpx 0;
}

.terms-content p {
	font-size: 28rpx;
	color: #34495e;
	line-height: 1.8;
	margin-bottom: 20rpx;
	text-align: justify;
}

.terms-content ol {
	font-size: 28rpx;
	color: #34495e;
	line-height: 1.8;
	margin: 20rpx 0;
	padding-left: 40rpx;
}

.terms-content li {
	margin-bottom: 10rpx;
}

/* 原来的footer样式已由Footer组件处理 */

/* 响应式设计 */
@media (max-width: 768px) {
	/* 原来的header样式已由TopNavBar组件处理 */
	
	.container {
		width: 90%;
		flex-direction: column;
	}
	
	.terms-section {
		width: 100%;
		padding: 30rpx 20rpx;
	}
	
	.section-title {
		font-size: 36rpx;
	}
	
	.terms-content h3 {
		font-size: 30rpx;
	}
	
	.terms-content p, .terms-content ol {
		font-size: 26rpx;
	}
	
	/* 原来的footer响应式样式已由Footer组件处理 */
}
</style>