<script>
	import { store, mutations } from '@/uni_modules/uni-id-pages/common/store.js'
	
	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 检查token是否有效，如果有效则更新全局状态
			this.checkToken()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			async checkToken() {
				const token = uni.getStorageSync('uni_id_token');
				const tokenExpired = uni.getStorageSync('uni_id_token_expired');
				
				if (token && tokenExpired && Date.now() < tokenExpired) {
					// Token 未过期，更新用户信息
					try {
						// 检查全局store是否已经登录
						if (!store.hasLogin) {
							// 如果store中没有登录状态，则更新用户信息
							await mutations.updateUserInfo();
						}
					} catch (e) {
						console.error('更新用户信息失败:', e);
						// Token 可能无效，清除存储
						uni.removeStorageSync('uni_id_token');
						uni.removeStorageSync('uni_id_token_expired');
					}
				}
			}
		}
	}
</script>

<style>
	/*每个页面公共css */
</style>