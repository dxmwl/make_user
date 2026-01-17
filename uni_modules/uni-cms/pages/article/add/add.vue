<template>
	<view class="uni-container">
		<uni-forms ref="form" :label-width="90" :model="formData" validateTrigger="submit" err-show-type="toast">
			<view class="edit-box">
				<view class="title">
					<textarea class="uni-input" v-model="formData.title" auto-height
					          @input="() => autoSaveContent && autoSaveContent()" placeholder="文章标题"/>
				</view>
				<editor-component @textchange="onTextChange" @ready="onEditorReady"></editor-component>
				<view class="settings" id="settings-section">
					<uni-forms-item name="excerpt" label="文章摘要">
						<textarea class="excerpt" placeholder="文章摘要" auto-height v-model="formData.excerpt"
							@input="() => autoSaveContent && autoSaveContent()"></textarea>
					</uni-forms-item>
					<uni-forms-item name="thumbnail" label="封面" required>
						<view class="thumb-mode">
							<radio-group @change="thumbModeChange">
								<radio value="1" class="mode" :checked="thumbMode === 1">单图</radio>
								<radio value="3" class="mode" :checked="thumbMode === 3">三图</radio>
								<radio value="0" class="mode" :checked="thumbMode === 0">无封面图</radio>
							</radio-group>
						</view>
						<view class="thumbnail-list" v-if="thumbMode > 0">
							<view class="thumbnail" v-for="(thumbnail, index) in formData.thumbnail"
								:key="thumbnail.source">
								<template v-if="thumbnail.source">
									<view class="remove-thumbnail" @click="() => removeThumbnail(index)">
										<uni-icons type="closeempty" size="16" color="#fff"></uni-icons>
									</view>
									<image :src="thumbnail.src" mode="aspectFill" style="width: 150px; height: 150px;">
									</image>
								</template>
								<template v-else>
									<view @click="() => openInsertImageDrawer(index)" class="placeholder plus-icon">+
									</view>
								</template>
							</view>
						</view>
						<view v-if="thumbMode > 0" style="color: #999; font-size: 13px; margin-top: 10px;">
							<text>为了保证最佳效果展示；请上传16:9的封面图片</text>
						</view>
					</uni-forms-item>
					<uni-forms-item name="user_id" label="作者" required>
						<text>{{ currentUserNickname }}</text>
					</uni-forms-item>
					<uni-forms-item name="category_id" label="分类">
						<uni-data-picker v-model="formData.category_id" style="width: 200px;"
							collection="uni-cms-categories" field="name as text, _id as value"></uni-data-picker>
					</uni-forms-item>
					<uni-forms-item name="tags" label="标签">
						<view class="tag-input">
							<view class="tag-list">
								<view class="tag-item" v-for="(tag, index) in formData.tags" :key="index">
									<view class="tag-display">{{ tag }}</view>
									<view class="tag-remove-icon" @click="removeTag(index)">×</view>
								</view>
							</view>
							<view class="tag-add" v-if="formData.tags.length < 5">
								<input v-model="inputTag" placeholder="请输入标签 (最多5个)" @confirm="addTag"
									@keyup.enter="addTag" class="tag-input-field" />
								<button class="add-btn" @click="addTagButton">添加</button>
							</view>
						</view>
					</uni-forms-item>
					<!--					<uni-forms-item name="is_sticky" label="是否置顶">-->
					<!--						<switch @change="binddata('is_sticky', $event.detail.value)" style="transform:scale(0.75)" :checked="formData.is_sticky"></switch>-->
					<!--					</uni-forms-item>-->
					<!--					<uni-forms-item name="is_essence" label="阅读加精">-->
					<!--						<switch @change="binddata('is_essence', $event.detail.value)" style="transform:scale(0.75)" :checked="formData.is_essence"></switch>-->
					<!--					</uni-forms-item>-->
					<!--					<uni-forms-item name="comment_status" label="开放评论">-->
					<!--						<uni-data-checkbox v-model="formData.comment_status"
					<!--															 :localdata="formOptions.comment_status_localdata"></uni-data-checkbox>-->
					<!--					</uni-forms-item>-->
				</view>
				<view class="uni-button-group m" style="padding-bottom: 50px; display: flex; justify-content: center; gap: 10px;">
					<button class="uni-button" style="width: 100px;" @click="submit(0)">存为草稿</button>
					<button type="primary" class="uni-button" style="width: 100px;" @click="submit(1)">发布</button>
				</view>
			</view>
		</uni-forms>
		<view class="footer">
			<view class="wrap">
				<view class="left">
					<text class="auto-save" v-if="autoSave">
						{{ autoSave.status === 1 ? '自动保存中...' : '已自动保存' }}
					</text>
					<text class="word-count" v-if="wordCount !== null">共 {{ wordCount }} 字</text>
				</view>
				<view class="right">
					<view class="uni-button-group" style="display: flex; gap: 10px;">
						<button class="uni-button" style="width: 100px;"
							@click="submit(0)">存为草稿</button>
						<button type="primary" class="uni-button" style="width: 100px;" @click="submit(1)">发布</button>
					</view>
				</view>
			</view>
		</view>

		<uni-drawer class="insert-image-drawer" v-if="drawerWidth" ref="insertImageDrawer" mode="right"
			:width="drawerWidth">
			<uni-media-library mode="picker" :selected-count="1" :media-tabs="['image']"
				@onInsert="onInsertCover"></uni-media-library>
		</uni-drawer>

		<!-- 悬浮按钮 -->
		<view class="floating-buttons">
			<view class="floating-btn" @click="scrollToTop">
				<uni-icons type="arrowup" size="20" color="#fff"></uni-icons>
				<text>顶部</text>
			</view>
			<view class="floating-btn" @click="scrollToSettings">
				<uni-icons type="gear" size="20" color="#fff"></uni-icons>
				<text>设置</text>
			</view>
		</view>
	</view>
</template>

<script>
	// 引入编辑器组件
	import EditorComponent from "@/uni_modules/uni-cms/components/editor/editor.vue";
	// 引入表单验证规则
	import {
		validator
	} from '@/uni_modules/uni-cms/common/validator/uni-cms-articles.js';
	// 自动保存mixin
	import autoSaveMixin from '@/uni_modules/uni-cms/common/auto-save-mixin.js';
	import {
		parseImageUrl,
		parseEditorImage
	} from "@/uni_modules/uni-cms/common/parse-image-url";

	// 引入数据库和相关命令
	const db = uniCloud.database();
	const dbCmd = db.command;
	// 定义数据库集合名称
	const dbCollectionName = 'uni-cms-articles'

	// 获取表单验证规则
	function getValidator(fields) {
		let result = {}
		for (let key in validator) {
			if (fields.includes(key)) {
				result[key] = validator[key]
			}
		}
		return result
	}

	export default {
		components: {
			EditorComponent,
			'uni-easyinput': () => import('@/uni_modules/uni-easyinput/components/uni-easyinput/uni-easyinput.vue'),
			'uni-icons': () => import('@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue'),
		},
		mixins: [autoSaveMixin],
		// 在页面创建时获取用户信息
		created() {
			this.checkUserRole();
		},
		data() {
			// 初始化formData
			let formData = {
				"user_id": uniCloud.getCurrentUserInfo().uid,
				"category_id": "",
				"title": "",
				"content": {},
				"excerpt": "",
				"article_status": 0,
				"is_sticky": null,
				"is_essence": null,
				"comment_status": null,
				"thumbnail": [{}],
				"tags": []
			}
			return {
				formData, // 表单数据
				formOptions: {
					"comment_status_localdata": [{
							"value": 0,
							"text": "关闭"
						},
						{
							"value": 1,
							"text": "开放"
						}
					]
				},
				rules: {
					...getValidator(Object.keys(formData)) // 表单验证规则
				},
				formats: {}, // 编辑器格式
				wordCount: null, // 字数统计
				drawerWidth: 0, // 插入图片抽屉宽度
				autoGetCover: true, // 是否自动获取封面
				thumbMode: 1, // 封面图展示方式
				currentUserNickname: '', // 当前用户昵称
				inputTag: '', // 输入的标签
				inputStyles: {
					borderColor: '#e5e5e5',
					backgroundColor: '#f5f5f5',
					height: '35px',
					borderRadius: '5px'
				} // 输入框样式

			}
		},
		onReady() {
			this.$refs.form.setRules(this.rules) // 设置表单验证规则
		},
		mounted() {
			const sysinfo = uni.getSystemInfoSync()
			this.drawerWidth = sysinfo.windowWidth * .8
		},
		methods: {
			// 封面图展示方式改变
			thumbModeChange(e) {
				const coverCount = Number(e.detail.value)
				this.formData.thumbnail = Array.from(new Array(coverCount)).map((item, index) => {
					if (this.formData.thumbnail[index]) {
						return this.formData.thumbnail[index]
					} else {
						return {}
					}
				})
				this.thumbMode = coverCount
			},
			// 监听富文本编辑器内容变化
			onTextChange(e) {
				// 更新字数统计
				this.wordCount = e.detail
				// 自动获取编辑器正文内的图片作为封面图
				this.autoGetEditorImage()
				// 自动保存
				this.autoSaveContent && this.autoSaveContent()
			},
			autoGetEditorImage() {
				// 如果不自动获取封面图或者封面图展示方式为不展示，则不执行
				if (!this.autoGetCover || this.thumbMode === 0) return
				// 获取编辑器中的图片
				if (this.timer) {
					clearTimeout(this.timer)
				}
				this.timer = setTimeout(() => {
					this.editorCtx.getContents({
						success: (res) => {
							const {
								delta
							} = res
							const imageList = []
							delta.ops.forEach(item => {
								if (item.insert && item.insert.image) {
									if (!item.attributes || !item.attributes.class || item
										.attributes.class.indexOf('uploading') === -1) {
										const parseEditorImages = parseEditorImage(item)
										imageList.push(parseEditorImages[0])
									}
								}
							})

							if (imageList.length <= 0) return
							const newThumbnail = [...this.formData.thumbnail]

							for (let i = 0; i < newThumbnail.length; i++) {
								const thumbnail = newThumbnail[i]
								if (thumbnail !== imageList[i].source) {
									newThumbnail[i] = imageList[i] || {}
								}
							}
							this.formData.thumbnail = newThumbnail
						},
						fail: (e) => {
							console.error(e)
						}
					})
				}, 1000)

			},
			// 富文本编辑器初始化完成后触发
			onEditorReady(editorCtx) {
				if (!editorCtx) return

				// 保存editorCtx
				this.editorCtx = editorCtx

			},
			/**
			 * 验证表单并提交
			 */
			submit(status) {
				if (!this.formData.title) {
					// 如果标题为空，提示用户
					uni.hideLoading()
					return uni.showToast({
						icon: 'none',
						title: '文章标题必填',
					})
				}

				if (this.formData.thumbnail) {
					for (const thumbnail of this.formData.thumbnail) {
						if (!thumbnail.source) {
							// 如果封面图为空，提示用户
							uni.hideLoading()
							return uni.showToast({
								icon: 'none',
								title: '封面图必填',
							})
						}
					}
				}

				this.$refs.form.validate().then((res) => {
					this.editorCtx.getContents({
						success: (e) => {
							// 如果摘要为空，则从内容中提取前120个字符作为摘要
							let excerpt = this.formData.excerpt;
							if (!excerpt || excerpt.trim().length === 0) {
								// 将编辑器内容转换为纯文本
								let textContent = '';
								if (e.delta && e.delta.ops) {
									e.delta.ops.forEach(op => {
										if (op.insert) {
											if (typeof op.insert === 'string') {
												textContent += op.insert;
											} else if (op.insert.text) {
												textContent += op.insert.text;
											}
										}
									});
								}
								// 截取前120个字符作为摘要
								excerpt = textContent.substring(0, 120);
							}
							// 提交表单
							this.submitForm({
								...res,
								thumbnail: this.formData.thumbnail.map(thumb => thumb.source),
								article_status: status,
								title: this.formData.title.trim(),
								excerpt: excerpt,
								content: e.delta,
								publish_date: Date.now()
							})
						}
					})
				}).catch((e) => {
					console.error(e)
				})
			},

			/**
			 * 提交表单
			 */
			submitForm(value) {
				uni.showLoading({
					mask: true
				})
				// 使用 clientDB 提交数据
				return db.collection(dbCollectionName).add(value).then((res) => {
					uni.showToast({
						icon: 'none',
						title: value.article_status === 0 ? '保存成功' : '发布成功'
					})
					try {
						// 触发父页面事件，刷新数据
						this.getOpenerEventChannel().emit('refreshData')
					} catch (e) {}

					// 清除自动保存内容
					this.clearAutoSaveStorage && this.clearAutoSaveStorage()

					setTimeout(() => {
						if (value.article_status === 0) {
							// 跳转到编辑页面
							uni.redirectTo({
								url: '/uni_modules/uni-cms/pages/article/edit/edit?id=' + res
									.result.id
							})
						} else {
							// 返回上一页
							uni.navigateBack()
						}
					}, 500)
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				}).finally(() => {
					uni.hideLoading()
				})
			},

			// 返回上一页或跳转到文章列表页
			navigateBack() {
				const pages = getCurrentPages()

				if (pages.length > 1) {
					// 返回上一页
					uni.navigateBack(-1)
				} else {
					// 跳转到文章列表页
					uni.redirectTo({
						url: '/uni_modules/uni-cms/pages/article/list/list'
					})
				}
			},

			openInsertImageDrawer(index) {
				this.$refs.insertImageDrawer.open()
				this.coverIndex = index
			},
			async onInsertCover(selectMediaItems) {
				const coverIndex = this.coverIndex !== null ? this.coverIndex : 0
				const image = selectMediaItems[0]
				const newThumbnail = [...this.formData.thumbnail]
				const parseImages = await parseImageUrl(image.src)

				newThumbnail[coverIndex] = parseImages[0]

				this.$refs.insertImageDrawer.close()
				this.formData.thumbnail = newThumbnail
			},
			removeThumbnail(index) {
				const newThumbnail = [...this.formData.thumbnail]
				newThumbnail[index] = {}

				this.formData.thumbnail = newThumbnail
				this.autoGetCover = false
			},
			// 添加标签
			addTag() {
				if (this.formData.tags.length >= 5) {
					uni.showToast({
						title: '最多只能添加5个标签',
						icon: 'none'
					});
					return;
				}
				if (this.inputTag.trim()) {
					// 避免重复添加标签
					if (!this.formData.tags.includes(this.inputTag.trim())) {
						this.formData.tags.push(this.inputTag.trim());
					} else {
						uni.showToast({
							title: '标签已存在',
							icon: 'none'
						});
					}
					this.inputTag = '';
				}
			},
			// 按钮添加标签
			addTagButton() {
				this.addTag();
			},
			// 删除标签
			removeTag(index) {
				this.formData.tags.splice(index, 1);
			},
			// 键盘高度变化事件
			onKeyboardHeightChange() {
				// 由于不同平台的兼容性问题，使用 confirm 事件为主，此方法作为补充
			},
			// 设置当前用户为作者
			checkUserRole() {
				const userInfo = uniCloud.getCurrentUserInfo();
				this.currentUserNickname = userInfo.nickname;
				this.formData.user_id = userInfo.uid;
			},
			// 滚动到顶部
			scrollToTop() {
				uni.pageScrollTo({
					scrollTop: 0,
					duration: 300
				});
			},
			// 滚动到设置区域
			scrollToSettings() {
				this.$nextTick(() => {
					setTimeout(() => {
						uni.createSelectorQuery().select('#settings-section').boundingClientRect((rect) => {
							if (rect) {
								uni.pageScrollTo({
									scrollTop: rect.top,
									duration: 300
								});
							}
						}).exec();
					}, 100);
				});
			}
		}
	}
</script>

<style lang="scss">
	@import '@/uni_modules/uni-cms/common/style/article-detail.scss';

	.tag-input {
		display: flex;
		flex-wrap: wrap;
		align-items: center;

		.tag-list {
			display: flex;
			flex-wrap: wrap;
			gap: 5px;
			margin-right: 10px;

			.tag-item {
				display: flex;
				align-items: center;
				background: #f0f0f0;
				border-radius: 15px;
				padding: 3px 10px;
				font-size: 14px;
				position: relative;

				.tag-display {
					margin-right: 5px;
				}

				.tag-remove-icon {
					cursor: pointer;
					width: 16px;
					height: 16px;
					display: flex;
					align-items: center;
					justify-content: center;
					position: absolute;
					top: -8px;
					right: -8px;
					color: red;
					font-size: 14px;
					font-weight: bold;
					background: white;
					border-radius: 50%;
					line-height: 1;
				}
			}
		}

		.tag-add {
			display: flex;
			align-items: center;
			gap: 5px;

			.add-btn {
				height: 35px;
				line-height: 35px;
				min-width: 60px;
				font-size: 14px;
				padding: 0 10px;
				background-color: #2979ff;
				color: white;
				border: none;
				border-radius: 5px;
				margin-left: 5px;
			}

			.tag-input-field {
				flex: 1;
				height: 35px;
				border: 1px solid #e5e5e5;
				border-radius: 5px;
				padding: 0 10px;
				font-size: 14px;
				background-color: #f5f5f5;
				outline: none;
			}
		}
	}


	.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px dashed #d9d9d9;
		border-radius: 8px;
		transition: border-color 0.3s;
	}

	.plus-icon {
		font-size: 60px;
		color: #e8e8e8;
		width: 150px;
		height: 150px;
		cursor: pointer;
	}

	.plus-icon:hover {
		color: #ccc;
	}



	/* 采用与make_admin一致的样式布局 */
	.uni-container {
		padding: 20px;
		background-color: #f5f5f5;
		min-height: 100vh;
	}



	.edit-box {
		background: #fff;
		border-radius: 8px;
		padding: 20px;
		margin-bottom: 20px;
	}

	.settings {
		margin-top: 20px;
		padding-top: 20px;
		border-top: 1px solid #eee;
	}

	.uni-button-group.m {
		padding: 20px 0;
		text-align: center;
	}

	.uni-button {
		margin: 0 10px;
		min-width: 120px;
	}


/* 覆盖编辑器工具栏样式，使其紧贴顶部 */
::v-deep .editor-toolbar.pc {
	top: 0 !important;
}

::v-deep .editor-toolbar.m {
	top: 0 !important;
	bottom: auto !important;
}

/* 悬浮按钮样式 */
.floating-buttons {
	position: fixed;
	right: 20px;
	bottom: 100px;
	z-index: 999;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.floating-btn {
	width: 50px;
	height: 50px;
	background-color: #2979ff;
	border-radius: 50%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
	color: white;
	font-size: 12px;
	text-align: center;
}

.floating-btn:hover {
	background-color: #2164d9;
}

</style>