<!-- 创建超级管理员 -->
<template>
	<view class="uni-content">
		<match-media :min-width="690">
			<view class="login-logo">
				<image :src="logo"></image>
			</view>
			<!-- 顶部文字 -->
			<text class="title title-box">创建超级管理员</text>
		</match-media>
		<uni-forms ref="form" :value="formData" :rules="rules" validate-trigger="submit" err-show-type="toast">
			<uni-forms-item name="username" required>
				<uni-easyinput :inputBorder="false" :focus="focusUsername" @blur="focusUsername = false"
					class="input-box" placeholder="请输入用户名" v-model="formData.username" trim="both" />
			</uni-forms-item>
			<uni-forms-item name="nickname">
				<uni-easyinput :inputBorder="false" :focus="focusNickname" @blur="focusNickname = false" class="input-box" placeholder="请输入用户昵称" v-model="formData.nickname"
					trim="both" />
			</uni-forms-item>
			<uni-forms-item name="password" v-model="formData.password" required>
				<uni-easyinput :inputBorder="false" :focus="focusPassword" @blur="focusPassword = false"
					class="input-box" maxlength="20" :placeholder="'请输入' + (config.passwordStrength == 'weak'?'6':'8') + '-16位密码'" type="password"
					v-model="formData.password" trim="both" />
			</uni-forms-item>
			<uni-forms-item name="password2" v-model="formData.password2" required>
				<uni-easyinput :inputBorder="false" :focus="focusPassword2" @blur="focusPassword2 =false"
					class="input-box" placeholder="再次输入密码" maxlength="20" type="password" v-model="formData.password2"
					trim="both" />
			</uni-forms-item>
			<uni-id-pages-agreements scope="register" ref="agreements" ></uni-id-pages-agreements>
			<button class="uni-btn" type="primary" @click="submit">注册</button>
			<button @click="navigateBack" class="register-back">返回</button>
			<match-media :min-width="690">
				<view class="link-box">
					<text class="link" @click="toLogin">已有账号？点此登录</text>
				</view>
			</match-media>
		</uni-forms>
	</view>
</template>

<script>
	import rules from './validator.js';
	import mixin from '@/uni_modules/uni-id-pages/common/login-page.mixin.js';
	import config from '@/uni_modules/uni-id-pages/config.js'
	import UniIdPagesAgreements from '@/uni_modules/uni-id-pages/components/uni-id-pages-agreements/uni-id-pages-agreements.vue';
		import UniEasyinput from '@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue';
		import UniForms from '@/uni_modules/uni-forms/components/uni-forms/uni-forms.vue';
		import UniFormsItem from '@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue';
		import UniCaptcha from '@/uni_modules/uni-captcha/components/uni-captcha/uni-captcha.vue';
		import UniTransition from '@/uni_modules/uni-transition/components/uni-transition/uni-transition.vue';
	const uniIdCo = uniCloud.importObject("uni-id-co", {customUI: true})
	export default {
		mixins: [mixin],
		components: {
			UniIdPagesAgreements,
			UniEasyinput,
			UniForms,
			UniFormsItem,
			UniCaptcha,
			UniTransition
		},
		data() {
			return {
				formData: {
					username: "",
					nickname: "",
					password: "",
					password2: "",
					captcha: ""
				},
				rules,
				focusUsername:false,
				focusNickname:false,
				focusPassword:false,
				focusPassword2:false,
				logo: "/static/logo.png"
			}
		},
		onReady() {
			this.$refs.form.setRules(this.rules)
		},
		onShow() {
			// #ifdef H5
			document.onkeydown = event => {
				let e = event || window.event;
				if (e && e.keyCode == 13) { //回车键的键值为13
					this.submit()
				}
			};
			// #endif
		},
		methods: {
			/**
			 * 触发表单提交
			 */
			submit() {
				this.$refs.form.validate().then((res) => {
					/* if(this.formData.captcha.length != 4){
						this.$refs.captcha.focusCaptchaInput = true
						return uni.showToast({
							title: '请输入验证码',
							icon: 'none',
							duration: 3000
						});
					} */
					if (this.needAgreements && !this.agree) {
						return this.$refs.agreements.popup(()=>{
							this.submitForm(res)
						})
					}
					this.submitForm(res)
				}).catch((errors) => {
					let key = errors[0].key
					key = key.replace(key[0], key[0].toUpperCase())
					// console.log(key);
					this['focus'+key] = true
				})
			},
			submitForm(params) {
				uniIdCo.registerAdmin(this.formData).then(e => {
					// 如果注册返回了新token，先保存token
					if (e.newToken && e.newToken.token) {
						uni.setStorageSync('uni_id_token', e.newToken.token);
						uni.setStorageSync('uni_id_token_expired', e.newToken.tokenExpired);
					}
					// 注册成功后，自动登录用户，不需要跳转到登录页面
					this.loginSuccess(e);
				})
				.catch(e => {
					//更好的体验：登录错误，直接刷新验证码
					// this.$refs.captcha.getImageCaptcha()
					uni.showModal({
						title: '提示',
						content: e.errMsg || `创建失败: ${e.errCode}`,
						showCancel: false
					})
				})
			},
			navigateBack() {
				uni.navigateBack()
			},
			toLogin() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/login/login-withpwd'
				})
			},
			registerByEmail() {
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/register/register-by-email'
				})
			}
		}
	}
</script>

<style lang="scss">
	@import "@/uni_modules/uni-id-pages/common/login-page.scss";

	@media screen and (max-width: 690px) {
		.uni-content{
			margin-top: 15px;
			height: 100%;
			background-color: #fff;
		}
	}
	@media screen and (min-width: 690px) {
		.uni-content{
			padding: 30px 40px 60px;
			max-height: 520px;
		}

		.link-box {
			/* #ifndef APP-NVUE */
			display: flex;
			/* #endif */
			flex-direction: row;
			justify-content: space-between;
			margin-top: 10px;
		}

		.link {
			font-size: 12px;
		}
	}

	.uni-content ::v-deep .uni-forms-item__label {
		position: absolute;
		left: -15px;
	}

	button {
		margin-top: 15px;
	}
</style>
