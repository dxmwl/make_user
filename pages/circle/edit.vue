<template>
	<view class="circle-edit">
		<TopNavBar />
		
		<!-- 主要内容区域 -->
		<view class="main-container">
			<view class="container">
				<view class="form-container">
					<view class="form-title">编辑交流圈</view>
					
					<form @submit="submitForm">
						<!-- 群名称 -->
						<view class="form-item">
							<text class="label">群名称 *</text>
							<input class="input" v-model="formData.title" placeholder="请输入交流群名称" maxlength="50" />
						</view>
						
						<!-- 群分类 -->
						<view class="form-item">
							<text class="label">群分类 *</text>
							<picker @change="onCategoryChange" :value="categoryIndex" :range="categoriesList" range-key="text">
								<view class="picker">{{ formData.category_id ? selectedCategoryName : '请选择分类' }}</view>
							</picker>
						</view>
						
						<!-- 群类型 -->
						<view class="form-item">
							<text class="label">群类型 *</text>
							<uni-data-checkbox v-model="formData.group_type" :localdata="groupTypes" value="value" text="text" :multiple="false" />
						</view>
						
						<!-- 群描述 -->
						<view class="form-item">
							<text class="label">群描述 *</text>
							<textarea class="textarea" v-model="formData.description" placeholder="请输入群描述，介绍群的特色和内容" maxlength="500" :auto-height="true" />
						</view>
						
						<!-- 群二维码 -->
						<view class="form-item">
							<text class="label">群二维码 *</text>
							<view class="upload-section">
								<view v-if="!formData.qr_code" class="upload-btn" @click="chooseQrCode">
									<uni-icons type="camera" size="30" color="#999"></uni-icons>
									<text>点击上传群二维码</text>
								</view>
								<view v-else class="uploaded-qr">
									<image :src="formData.qr_code" mode="aspectFit" @click="previewQrCode"></image>
									<button class="delete-btn" @click="removeQrCode">删除</button>
								</view>
							</view>
						</view>
						
						<!-- 群主信息 -->
						<view class="form-item">
							<text class="label">群主昵称</text>
							<input class="input" v-model="formData.owner_nickname" placeholder="请输入群主昵称（可选）" />
						</view>
						
						<view class="form-item">
							<text class="label">群主联系方式</text>
							<input class="input" v-model="formData.owner_contact" placeholder="请输入群主联系方式（如微信号）" />
						</view>
						
						<!-- 群主二维码 -->
						<view class="form-item">
							<text class="label">群主二维码</text>
							<view class="upload-section">
								<view v-if="!formData.owner_qr_code" class="upload-btn" @click="chooseOwnerQrCode">
									<uni-icons type="camera" size="30" color="#999"></uni-icons>
									<text>点击上传群主二维码（可选）</text>
								</view>
								<view v-else class="uploaded-qr">
									<image :src="formData.owner_qr_code" mode="aspectFit" @click="previewOwnerQrCode"></image>
									<button class="delete-btn" @click="removeOwnerQrCode">删除</button>
								</view>
							</view>
						</view>
						

						
						<!-- 提交按钮 -->
						<view class="submit-section">
							<button class="cancel-btn" @click="goBack">返回</button>
							<button class="submit-btn" form-type="submit" :disabled="submitting">{{ submitting ? '提交中...' : '保存' }}</button>
						</view>
					</form>
				</view>
			</view>
		</view>
		
		<Footer />
	</view>
</template>

<script>
import TopNavBar from '@/components/TopNavBar.vue';
import Footer from '@/pages/components/Footer.vue';

const db = uniCloud.database();
const circleDBName = 'circles';
const userDBName = 'uni-id-users';
const categoryDBName = 'circle-categories';

export default {
	components: {
		TopNavBar,
		Footer
	},
	data() {
		return {
			id: '', // 交流圈ID
			formData: {
				title: '',
				category_id: '',
				description: '',
				qr_code: '',
				owner_nickname: '',
				owner_contact: '',
				owner_qr_code: '',
				group_type: '',
				creator_id: '', // 添加创建者ID
				creator_nickname: '', // 添加创建者昵称
				creator_avatar: '' // 添加创建者头像
			},
			categoriesList: [], // 分类列表
			categoryIndex: 0,
			groupTypeList: [], // 群类型列表（保留用于兼容性）
			groupTypeIndex: 0,
			groupTypes: [
				{ value: 'qq', text: 'QQ群' },
				{ value: 'weixin', text: '微信群' }
			], // 群类型选项
			submitting: false,
			userInfo: {}, // 用户信息
			showUserMenu: false // 是否显示用户菜单
		}
	},
	computed: {
		selectedCategoryName() {
			const category = this.categoriesList.find(cat => cat.value === this.formData.category_id);
			return category ? category.text : '请选择分类';
		},
		selectedGroupTypeName() {
			if (this.formData.group_type === 'qq') {
				return 'QQ群';
			} else if (this.formData.group_type === 'weixin') {
				return '微信群';
			}
			return '请选择群类型';
		}
	},
	onLoad(event) {
		// 获取交流圈id
		if (event.id) {
			this.id = event.id;
			// 加载交流圈详情用于编辑
			this.loadCircleDetail();
		}
		
		// 检查用户登录状态
		this.checkLoginStatus();
		if (!this.isLoggedIn) {
			uni.navigateTo({
				url: '/uni_modules/uni-id-pages/pages/login/login-withpwd'
			});
			return;
		}
		
		// 监听登录成功事件
		uni.$on('uni-id-pages-login-success', this.handleLoginSuccess);
		// 监听登出事件
		uni.$on('uni-id-pages-logout', this.handleLogout);
					
		// 加载分类列表
		this.loadCategories();
		// 初始化群类型列表
		this.initGroupTypes();
					
		// 更新用户信息显示
		this.updateUserInfoDisplay();
				
		// 设置当前用户信息到表单
		this.setCurrentUserInfo();
		
		// 添加调试信息
		console.log('onLoad 执行完成，groupTypeList:', this.groupTypeList);
		console.log('onLoad 执行完成，formData.group_type:', this.formData.group_type);
		
		// 强制重新初始化群类型列表
		setTimeout(() => {
			this.initGroupTypes();
			console.log('强制重新初始化后 groupTypeList:', this.groupTypeList);
		}, 500);
	},
	
	// 选择群类型
	onGroupTypeChange(e) {
		console.log('群类型选择:', e.detail.value);
		const value = e.detail.value;
		this.formData.group_type = value;
		// 更新groupTypeIndex
		const index = value === 'qq' ? 0 : 1;
		this.groupTypeIndex = index;
	},
	
	onUnload() {
		// 移除事件监听
		uni.$off('uni-id-pages-login-success', this.handleLoginSuccess);
		uni.$off('uni-id-pages-logout', this.handleLogout);
	},
	
	methods: {
		// 初始化群类型列表
		initGroupTypes() {
			console.log('初始化群类型列表...');
			this.groupTypeList = [
				{ _id: 'qq', name: 'QQ群' },
				{ _id: 'weixin', name: '微信群' }
			];
			console.log('群类型列表:', this.groupTypeList);
		},
		
		// 设置当前用户信息
		setCurrentUserInfo() {
			const userInfo = uniCloud.getCurrentUserInfo();
			this.formData.creator_id = userInfo.uid || userInfo._id || userInfo.userId || '';
			this.formData.creator_nickname = userInfo.nickname || userInfo.username || userInfo.nickName || '匿名用户';
			this.formData.creator_avatar = userInfo.avatar || userInfo.headImgUrl || '';
		},
		// 检查登录状态
		checkLoginStatus() {
			// 检查是否存在有效的登录token
			const token = uni.getStorageSync('uni_id_token');
			const tokenExpired = uni.getStorageSync('uni_id_token_expired');
			
			if (token && tokenExpired && Date.now() < tokenExpired) {
				// 如果有有效token，设置为已登录状态
				this.isLoggedIn = true;
				return true;
			} else {
				this.isLoggedIn = false;
				uni.showToast({
					icon: 'none',
					title: '请先登录'
				});
				return false;
			}
		},
		// 加载交流圈详情
		async loadCircleDetail() {
			try {
				const result = await uniCloud.callFunction({
					name: 'get-circle-detail',
					data: {
						id: this.id
					}
				});
				
				console.log('交流圈详情数据:', result);
				
				if(result && result.result && result.result.code === 0) {
					const data = result.result.data;
					// 保存当前用户信息
					const creator_id = this.formData.creator_id;
					const creator_nickname = this.formData.creator_nickname;
					const creator_avatar = this.formData.creator_avatar;
											
					// 将详情数据填充到表单
					this.formData = {
						title: data.group_name,
						category_id: data.category_id,
						description: data.group_description,
						qr_code: data.qr_code,
						owner_nickname: data.owner_nickname,
						owner_contact: data.owner_contact,
						owner_qr_code: data.owner_qr_code,
						tags: data.tags || [],
						remark: data.remark,
						group_type: data.group_type,
						// 保留用户信息
						creator_id: creator_id,
						creator_nickname: creator_nickname,
						creator_avatar: creator_avatar
					};
					
					// 设置分类索引
					const categoryIndex = this.categoriesList.findIndex(cat => cat.value === this.formData.category_id);
					if (categoryIndex !== -1) {
						this.categoryIndex = categoryIndex;
					}
					
					// 设置群类型索引
					const groupTypeIndex = this.groupTypeList.findIndex(type => type._id === this.formData.group_type);
					if (groupTypeIndex !== -1) {
						this.groupTypeIndex = groupTypeIndex;
					}
				} else {
					console.error('获取交流圈详情失败:', result.result ? result.result.msg : '未知错误');
					uni.showToast({
						icon: 'none',
						title: '获取详情失败'
					});
				}
			} catch (error) {
				console.error('加载交流圈详情出错:', error);
				uni.showToast({
					icon: 'none',
					title: '加载失败，请重试'
				});
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
				
				this.categoriesList = fetchedCategories;
				console.log('最终分类列表:', this.categoriesList);
				
				// 设置分类索引
				const categoryIndex = this.categoriesList.findIndex(cat => cat.value === this.formData.category_id);
				if (categoryIndex !== -1) {
					this.categoryIndex = categoryIndex;
				}
				
				// 设置群类型索引
				const groupTypeIndex = this.groupTypeList.findIndex(type => type._id === this.formData.group_type);
				if (groupTypeIndex !== -1) {
					this.groupTypeIndex = groupTypeIndex;
				}
			} catch (e) {
				console.error('加载分类列表失败', e);
				// 如果加载失败，提供一些默认分类作为后备
				this.categoriesList = [
					{ value: 'frontend', text: '前端开发' }, 
					{ value: 'backend', text: '后端开发' }, 
					{ value: 'mobile', text: '移动端' },
					{ value: 'ai', text: '人工智能' },
					{ value: 'devops', text: '运维' },
					{ value: 'other', text: '其他' }
				];
			}
		},
		// 选择分类
		onCategoryChange(e) {
			const index = e.detail.value;
			this.categoryIndex = index;
			this.formData.category_id = this.categoriesList[index].value;
		},
		// 选择群二维码
		async chooseQrCode() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: async (res) => {
					try {
						uni.showLoading({
							title: '上传中...'
						});
						
						// 上传图片到uniCloud
						const uploadResult = await uniCloud.uploadFile({
							filePath: res.tempFilePaths[0],
							cloudPath: `circle-qrcodes/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`
						});
						
						this.formData.qr_code = uploadResult.fileID;
						uni.hideLoading();
						uni.showToast({
							title: '上传成功',
							icon: 'success'
						});
					} catch (error) {
						uni.hideLoading();
						console.error('上传失败', error);
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					console.error('选择图片失败', err);
					uni.showToast({
						title: '选择图片失败',
						icon: 'none'
					});
				}
			});
		},
		// 预览群二维码
		previewQrCode() {
			uni.previewImage({
				urls: [this.formData.qr_code]
			});
		},
		// 删除群二维码
		removeQrCode() {
			this.formData.qr_code = '';
		},
		// 选择群主二维码
		async chooseOwnerQrCode() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: async (res) => {
					try {
						uni.showLoading({
							title: '上传中...'
						});
						
						// 上传图片到uniCloud
						const uploadResult = await uniCloud.uploadFile({
							filePath: res.tempFilePaths[0],
							cloudPath: `circle-owner-qrcodes/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.png`
						});
						
						this.formData.owner_qr_code = uploadResult.fileID;
						uni.hideLoading();
						uni.showToast({
							title: '上传成功',
							icon: 'success'
						});
					} catch (error) {
						uni.hideLoading();
						console.error('上传失败', error);
						uni.showToast({
							title: '上传失败',
							icon: 'none'
						});
					}
				},
				fail: (err) => {
					console.error('选择图片失败', err);
					uni.showToast({
						title: '选择图片失败',
						icon: 'none'
					});
				}
			});
		},
		// 预览群主二维码
		previewOwnerQrCode() {
			uni.previewImage({
				urls: [this.formData.owner_qr_code]
			});
		},
		// 删除群主二维码
		removeOwnerQrCode() {
			this.formData.owner_qr_code = '';
		},
		// 添加标签
		addTag() {
			if (this.tagInput.trim()) {
				if (!this.formData.tags.includes(this.tagInput.trim())) {
					this.formData.tags.push(this.tagInput.trim());
				}
				this.tagInput = '';
			}
		},
		// 删除标签
		removeTag(index) {
			this.formData.tags.splice(index, 1);
		},
		// 提交表单
		async submitForm() {
			// 验证表单
			if (!this.formData.title.trim()) {
				uni.showToast({
					icon: 'none',
					title: '请输入群名称'
				});
				return;
			}
			
			if (!this.formData.category_id) {
				uni.showToast({
					icon: 'none',
					title: '请选择群分类'
				});
				return;
			}
			
			if (!this.formData.description.trim()) {
				uni.showToast({
					icon: 'none',
					title: '请输入群描述'
				});
				return;
			}
			
			if (!this.formData.qr_code) {
				uni.showToast({
					icon: 'none',
					title: '请上传群二维码'
				});
				return;
			}
			
			if (!this.formData.group_type) {
				uni.showToast({
					icon: 'none',
					title: '请选择群类型'
				});
				return;
			}
			
			// 群主昵称不是必填项，如果提供了就使用它，否则留空
			if (!this.formData.owner_nickname || !this.formData.owner_nickname.trim()) {
				this.formData.owner_nickname = '';
			}
			
			// 检查登录状态
			if (!this.checkLoginStatus()) {
				return;
			}
			
			this.submitting = true;
			
			try {
				// 准备数据
				// 使用在data中已经获取的用户信息
				const submitData = {
					id: this.id,
					group_name: this.formData.title,
					group_type: this.formData.group_type, // 使用表单中的群类型值
					group_description: this.formData.description,
					qr_code: this.formData.qr_code,
					owner_nickname: this.formData.owner_nickname,
					owner_contact: this.formData.owner_contact,
					owner_qr_code: this.formData.owner_qr_code,
					category_id: this.formData.category_id,
					creator_id: this.formData.creator_id // 只传递创建者ID
				};
				
				// 调用云函数提交数据
				const result = await uniCloud.callFunction({
					name: 'update-circle',
					data: submitData
				});
				
				console.log('提交结果:', result);
				
				if (result && result.result && result.result.code === 0) {
					uni.showToast({
						title: '修改成功',
						icon: 'success'
					});
					
					// 延迟跳转，让用户看到成功提示
					setTimeout(() => {
						uni.redirectTo({
							url: `/pages/circle/detail?id=${this.id}`
						});
					}, 1500);
				} else {
					throw new Error(result.result ? result.result.msg : '提交失败');
				}
			} catch (error) {
				console.error('提交失败:', error);
				uni.showToast({
					icon: 'none',
					title: error.message || '提交失败，请重试'
				});
			} finally {
				this.submitting = false;
			}
		},
		// 跳转到首页
		goToIndexPage() {
			uni.switchTab({
				url: '/pages/index/index'
			});
		},
		// 返回上一页
		goBack() {
			uni.navigateBack();
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
			if (!this.isLoggedIn) {
				// 如果登出后未登录，跳转到登录页
				uni.redirectTo({
					url: '/uni_modules/uni-id-pages/pages/login/login-withpwd'
				});
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
			
			// 跳转到登录页
			uni.redirectTo({
				url: '/uni_modules/uni-id-pages/pages/login/login-withpwd'
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

.circle-edit {
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

.main-container {
	flex: 1;
	padding: 20rpx;
	padding-top: 20rpx;
}

.container {
	width: 80%; /* 设置为80%宽度 */
	margin: 0 auto; /* 居中显示 */
}

/* 桌面端样式调整 */
@media screen and (min-width: 768px) {
	.container {
		width: 60%; /* PC端改为60%宽度，参考记忆配置 */
	}
}

.form-container {
	background: #fff;
	border-radius: 12rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	padding: 30rpx;
	margin-bottom: 20rpx;
}

.form-title {
	font-size: 36rpx;
	font-weight: bold;
	color: #2c3e50;
	text-align: center;
	margin-bottom: 30rpx;
}

.form-item {
	margin-bottom: 25rpx;
}

.label {
	display: block;
	font-size: 28rpx;
	font-weight: bold;
	color: #2c3e50;
	margin-bottom: 10rpx;
}

.input {
	height: auto;
	width: 100%;
	padding: 15rpx;
	border: 1rpx solid #ddd;
	border-radius: 8rpx;
	font-size: 28rpx;
	box-sizing: border-box;
}

.picker {
	width: 100%;
	padding: 15rpx;
	border: 1rpx solid #ddd;
	border-radius: 8rpx;
	font-size: 28rpx;
	background: #fff;
}

.textarea {
	width: 100%;
	padding: 15rpx;
	border: 1rpx solid #ddd;
	border-radius: 8rpx;
	font-size: 28rpx;
	min-height: 200rpx;
	box-sizing: border-box;
}

.upload-section {
	border: 1rpx dashed #ddd;
	border-radius: 8rpx;
	padding: 30rpx;
	text-align: center;
}

.upload-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #999;
	cursor: pointer;
}

.upload-btn:hover {
	background: #f8f9fa;
}

.uploaded-qr {
	position: relative;
}

.uploaded-qr image {
	width: 200rpx;
	height: 200rpx;
	max-width: 100%;
	border-radius: 8rpx;
	object-fit: contain;
}

.delete-btn {
	margin-top: 10rpx;
	background: #e74c3c;
	color: white;
	border: none;
	border-radius: 6rpx;
	padding: 8rpx 16rpx;
	font-size: 24rpx;
}

.tag-input-container {
	border: 1rpx solid #ddd;
	border-radius: 8rpx;
	padding: 10rpx;
}

.tag-input {
	width: 100%;
	padding: 10rpx;
	font-size: 26rpx;
	border: none;
	outline: none;
}

.tag-list {
	display: flex;
	flex-wrap: wrap;
	gap: 10rpx;
	margin-top: 10rpx;
}

.tag-item {
	display: flex;
	align-items: center;
	background: #3498db;
	color: white;
	padding: 5rpx 15rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
}

.remove-tag {
	margin-left: 8rpx;
	cursor: pointer;
	font-weight: bold;
}

.submit-section {
	display: flex;
	gap: 20rpx;
	justify-content: center;
	margin-top: 30rpx;
}

.cancel-btn {
	flex: 1;
	background: #ecf0f1;
	color: #2c3e50;
	border: none;
	border-radius: 8rpx;
	padding: 20rpx;
	font-size: 30rpx;
	font-weight: bold;
}

.cancel-btn:hover {
	background: #d5dbdb;
}

.submit-btn {
	flex: 1;
	background: #3498db;
	color: white;
	border: none;
	border-radius: 8rpx;
	padding: 20rpx;
	font-size: 30rpx;
	font-weight: bold;
}

.submit-btn:hover {
	background: #2980b9;
}

.submit-btn:disabled {
	background: #bdc3c7;
	cursor: not-allowed;
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
	
	.container {
		width: 90%; /* 移动端稍宽一些 */
	}
}

.radio-group {
  flex: 1;
}

.radio-options {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.radio-item {
  display: flex;
  align-items: center;
  margin-right: 30rpx;
}

.radio-item:last-child {
  margin-right: 0;
}
</style>