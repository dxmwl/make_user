<template>
  <view class="editor-container">
    <view class="editor" :style="{height: editorHeight <= 0 ? 'auto': `${editorHeight}px`}">
      <!-- #ifdef H5 -->
      <web-editor
          id="editor"
          @ready="onEditorReady"
          @statuschange="onStatusChange"
          @textchange="(e) => $emit('textchange', e)"
          showImgSize
          showImgToolbar
          showImgResize
          :upload-handler="uploadHandlerForH5"
          @focus="onEditorFocus"
          @blur="onEditorBlur"
      ></web-editor>
      <!-- #endif -->

      <!-- #ifndef H5 -->
      <editor
          id="editor"
          class="ql-container"
          placeholder=""
          @ready="onEditorReady"
          @statuschange="onStatusChange"
          showImgSize
          showImgToolbar
          showImgResize
          @focus="onEditorFocus"
          @blur="onEditorBlur"
      ></editor>
      <!-- #endif -->
    </view>
    <view class="editor-toolbar pc">
      <view class="editor-toolbar-box">
        <tool-undo @change="({type, value}) => format(type, value)" :disabled="!showFooterToolBar"></tool-undo>
        <tool-redo @change="({type, value}) => format(type, value)" :disabled="!showFooterToolBar"></tool-redo>
        <tool-format-clear @change="({type, value}) => format(type, value)"
                           :disabled="!showFooterToolBar"></tool-format-clear>
        <view class="editor-toolbar-divider"></view>
        <tool-header @change="({type, value}) => format(type, value)" :active="formats.header"
                     :disabled="!showFooterToolBar"></tool-header>
        <tool-font-size @change="({type, value}) => format(type, value)" :active="formats.fontSize"
                     :disabled="!showFooterToolBar"></tool-font-size>
        <tool-bold @change="({type, value}) => format(type, value)" :active="formats.bold"
                   :disabled="!showFooterToolBar"></tool-bold>
        <tool-italic @change="({type, value}) => format(type, value)" :active="formats.italic"
                     :disabled="!showFooterToolBar"></tool-italic>
        <tool-strike @change="({type, value}) => format(type, value)" :active="formats.strike"
                     :disabled="!showFooterToolBar"></tool-strike>
        <tool-underline @change="({type, value}) => format(type, value)" :active="formats.underline"
                        :disabled="!showFooterToolBar"></tool-underline>
        <tool-link @change="({type, value}) => format(type, value)" :active="formats.link"
                   :disabled="!showFooterToolBar"></tool-link>
        <tool-align @change="({type, value}) => format(type, value)" :active="formats.align"
                    :disabled="!showFooterToolBar"></tool-align>
        <tool-hr @change="({type, value}) => format(type, value)" :disabled="!showFooterToolBar"></tool-hr>
        <tool-list @change="({type, value}) => format(type, value)" :active="formats.list"
                   :disabled="!showFooterToolBar"></tool-list>
        <tool-line-indent @change="({type, value}) => format(type, value)" :active="formats.textIndent"
                          :disabled="!showFooterToolBar"></tool-line-indent>
        <tool-space-both @change="({type, value}) => format(type, value)"
                         :active="formats.marginLeft && formats.marginRight"
                         :disabled="!showFooterToolBar"></tool-space-both>
        <tool-line-height @change="({type, value}) => format(type, value)"
                          :active="formats.lineHeight" :disabled="!showFooterToolBar"></tool-line-height>
        <tool-letter-space @change="({type, value}) => format(type, value)"
                           :active="formats.letterSpacing" :disabled="!showFooterToolBar"></tool-letter-space>
        <view class="editor-toolbar-divider"></view>
        <tool-background @change="({type, value}) => format(type, value)"
                         :active="formats.background" :disabled="!showFooterToolBar"></tool-background>
        <tool-color @change="({type, value}) => format(type, value)" :active="formats.color"
                    :disabled="!showFooterToolBar"></tool-color>
        <view class="editor-toolbar-divider"></view>
        <tool-image @change="({type, value}) => format(type, value)" :disabled="!showFooterToolBar"></tool-image>
        <tool-video @change="({type, value}) => format(type, value)" :disabled="!showFooterToolBar"></tool-video>
        <tool-unlock-content @change="({type, value}) => format(type, value)"
                             :disabled="!showFooterToolBar"></tool-unlock-content>
        <!-- <tool-ai @change="({type, value}) => format(type, value)" :active="showImChat"
                 :disabled="!showFooterToolBar"></tool-ai> AI?-->
      </view>
    </view>
    <view class="editor-toolbar m" :hidden="!showFooterToolBar"
          :style="{transform: `translateY(-${keyboardHeight}px)`}" @touchend.stop="">
      <view class="editor-toolbar-tools">
        <view class="tool" @click="showInsertBlockView">
          <uni-icons type="plus" size="60rpx"/>
        </view>
        <view class="editor-toolbar-divider"></view>
        <view :class="{tool: true, active: showToolPopup === 'm-tool-header'}"
              @click="showToolPopupView('m-tool-header')" id="m-tool-header">
          <uni-icons custom-prefix="editor-icon" type="icon-text-group" size="54rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: showToolPopup === 'm-tool-text'}" @click="showToolPopupView('m-tool-text')"
              id="m-tool-text">
          <uni-icons custom-prefix="editor-icon" type="icon-attr-group" size="60rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: showToolPopup === 'm-tool-align'}" @click="showToolPopupView('m-tool-align')"
              id="m-tool-align">
          <uni-icons custom-prefix="editor-icon" type="icon-align-left" size="60rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: formats.link}" @click="showLinkPopup(formats.link)">
          <uni-icons custom-prefix="editor-icon" type="icon-link" size="60rpx"></uni-icons>
        </view>
        <view class="tool" @click="() => $refs.insertImageDrawer.open()">
          <uni-icons custom-prefix="editor-icon" type="icon-image" size="60rpx"></uni-icons>
        </view>
        <!-- <view :class="{tool: true}" @click="format('ai')">
          <uni-icons custom-prefix="editor-icon" type="icon-ai" size="60rpx" color="#b454ff"></uni-icons>
        </view> AI?-->
        <view class="editor-toolbar-divider"></view>
        <view class="tool hide-keyboard" @click="hideKeyboard()">
          <uni-icons custom-prefix="editor-icon" type="icon-jianpan" size="70rpx"></uni-icons>
        </view>
      </view>
      <view
          class="editor-toolbar-popup"
          id="m-tool-header-popup"
          :class="{show: showToolPopup === 'm-tool-header'}"
          :style="{left: `${toolPopupRect.left}px`, right: `${toolPopupRect.right}px`}"
      >
        <view :class="{tool: true, active: formats.header === 1}" @click="format('header', 1)">
          <uni-icons custom-prefix="editor-icon" type="icon-header1" size="60rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: formats.header === 2}" @click="format('header', 2)">
          <uni-icons custom-prefix="editor-icon" type="icon-header2" size="60rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: formats.header === 3}" @click="format('header', 3)">
          <uni-icons custom-prefix="editor-icon" type="icon-header3" size="60rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: formats.header === 4}" @click="format('header', 4)">
          <uni-icons custom-prefix="editor-icon" type="icon-header4" size="60rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: formats.header === 5}" @click="format('header', 5)">
          <uni-icons custom-prefix="editor-icon" type="icon-header5" size="60rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: formats.header === 6}" @click="format('header', 6)">
          <uni-icons custom-prefix="editor-icon" type="icon-header6" size="60rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: formats.list === 'ordered'}" @click="format('list', 'ordered')">
          <uni-icons custom-prefix="editor-icon" type="icon-ul" size="60rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: formats.list === 'bullet'}" @click="format('list', 'bullet')">
          <uni-icons custom-prefix="editor-icon" type="icon-ol" size="60rpx"></uni-icons>
        </view>
      </view>
      <view
          class="editor-toolbar-popup"
          id="m-tool-text-popup"
          :class="{show: showToolPopup === 'm-tool-text'}"
          :style="{left: `${toolPopupRect.left}px`, right: `${toolPopupRect.right}px`}"
      >
        <view :class="{tool: true, active: formats.bold}" @click="format('bold')">
          <uni-icons custom-prefix="editor-icon" type="icon-bold" size="60rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: formats.italic}" @click="format('italic')">
          <uni-icons custom-prefix="editor-icon" type="icon-italic" size="60rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: formats.underline}" @click="format('underline')">
          <uni-icons custom-prefix="editor-icon" type="icon-underline" size="60rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: formats.strike}" @click="format('strike')">
          <uni-icons custom-prefix="editor-icon" type="icon-strike" size="60rpx"></uni-icons>
        </view>
      </view>
      <view
          class="editor-toolbar-popup"
          id="m-tool-align-popup"
          :class="{show: showToolPopup === 'm-tool-align'}"
          :style="{left: `${toolPopupRect.left}px`, right: `${toolPopupRect.right}px`}"
      >
        <view :class="{tool: true, active: formats.indent}" @click="format('indent', formats.indent ? '-1' : '+1')">
          <uni-icons custom-prefix="editor-icon" type="icon-line-indent" size="48rpx"></uni-icons>
        </view>
        <view class="editor-toolbar-popup-divider"></view>
        <view :class="{tool: true, active: formats.align === 'left'}" @click="format('align', 'left')">
          <uni-icons custom-prefix="editor-icon" type="icon-align-left" size="60rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: formats.align === 'center'}" @click="format('align', 'center')">
          <uni-icons custom-prefix="editor-icon" type="icon-align-center" size="60rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: formats.align === 'right'}" @click="format('align', 'right')">
          <uni-icons custom-prefix="editor-icon" type="icon-align-right" size="60rpx"></uni-icons>
        </view>
        <view :class="{tool: true, active: formats.align === 'justify'}" @click="format('align', 'justify')">
          <uni-icons custom-prefix="editor-icon" type="icon-align-justify" size="60rpx"></uni-icons>
        </view>
      </view>
    </view>
    <uni-transition :mode-class="['slide-bottom', 'fade']" :show="showInsertBlockToolSetting" class="tool-setting">
      <view>
        <view class="tool-setting-header">
          <view class="close" @click="closeToolSetting">
            <uni-icons type="closeempty" size="40rpx" class="icon"/>
          </view>
          <text></text>
        </view>
        <view class="body insert-block">
          <view class="item" @click="() => $refs.insertImageDrawer.open()">
            <view class="icon">
              <uni-icons custom-prefix="editor-icon" type="icon-image" size="70rpx"></uni-icons>
            </view>
            <text class="text"></text>
          </view>
          <view class="item" @click="format('hr')">
            <view class="icon">
              <uni-icons custom-prefix="editor-icon" type="icon-hr" size="70rpx"></uni-icons>
            </view>
            <text class="text">AI</text>
          </view>
          <view class="item" @click="format('unlockContent')">
            <view class="icon">
              <uni-icons custom-prefix="editor-icon" type="icon-unlock" size="70rpx"></uni-icons>
            </view>
            <text class="text"></text>
          </view>
        </view>
      </view>
    </uni-transition>
    <uni-transition :show="showToolSettingMask">
      <view class="tool-setting-mask"></view>
    </uni-transition>

    <uni-popup ref="popup" type="center">
      <view class="popup-body" @touchend.stop="">
        <!-- #ifndef H5 -->
        <view class="tip">
          <text>Markdown</text>
        </view>
        <!-- #endif -->
        <uni-forms label-width="90px">
          <uni-forms-item label="" name="link">
            <uni-easyinput v-model="currentLink.title"/>
          </uni-forms-item>
          <uni-forms-item label="" name="link">
            <uni-easyinput v-model="currentLink.url"/>
          </uni-forms-item>
        </uni-forms>
        <view class="popup-body-btn-group">
          <button class="btn" size="mini" @click="$refs.popup.close()"></button>
          <button class="btn" size="mini" type="primary" @click="linkChange"></button>
        </view>
      </view>
    </uni-popup>

    <!-- AI?    <view class="uni-im-chat-components" :hidden="!showImChat">
      <view class="close-bar">
        <view class="head">
          <text class="title">uni-ai-chat</text>
          <text class="desc">promptAI</text>
        </view>
        <view class="close" @click="showImChat=false">
          <uni-icons type="closeempty" size="40rpx" class="icon"></uni-icons>
        </view>
      </view>
      <uni-im-chat ref="uniImChat"></uni-im-chat>
    </view>
    -->

    <uni-drawer
        class="insert-image-drawer"
        v-if="drawerWidth"
        ref="insertImageDrawer"
        mode="right"
        :width="drawerWidth"
    >
      <uni-media-library
          mode="picker"
          :selected-count="1"
          :media-tabs="['image']"
          @onInsert="onInsertImage"
      ></uni-media-library>
    </uni-drawer>
  </view>
</template>

<script>
// #ifdef H5
import ToolColor from "./tools/color.vue";
// #endif
import ToolBold from "./tools/bold.vue";
import ToolItalic from "./tools/italic.vue";
import ToolStrike from "./tools/strike.vue";
import ToolList from "./tools/list.vue";
import ToolHr from "./tools/hr.vue";
import ToolUndo from "./tools/undo.vue";
import ToolRedo from "./tools/redo.vue";
import ToolHeader from "./tools/header.vue";
import ToolAlign from "./tools/align.vue";
import ToolLink from "./tools/link.vue";
import ToolUnderline from "./tools/underline.vue";
import ToolLineIndent from "./tools/line-indent.vue";
import ToolSpaceBoth from "./tools/space-both.vue";
import ToolLineHeight from "./tools/line-height.vue";
import ToolLetterSpace from "./tools/letter-space.vue";
import ToolBackground from "./tools/background.vue";
import ToolImage from "./tools/image.vue";
import ToolFormatClear from "./tools/format-clear.vue";
import ToolUnlockContent from "./tools/unlock-content.vue";
import ToolVideo from "./tools/video.vue";
import ToolFontSize from './tools/font-size.vue';
// import uniImChat from '../ai/chat.vue'; // AI
// import ToolAi from "./tools/ai.vue"; // AI

// 从同级uni_modules导入组件
import UniDrawer from '@/uni_modules/uni-drawer/components/uni-drawer/uni-drawer.vue';
import UniMediaLibrary from '@/uni_modules/uni-media-library/components/uni-media-library/uni-media-library.vue';
import UniIcons from '@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue';
import UniFormsItem from '@/uni_modules/uni-forms/components/uni-forms-item/uni-forms-item.vue';

// #ifdef H5
import WebEditor from "./web/editor.vue";
// #endif

export default {
  name: "editor",
  emits: ['change', 'textchange'],
  components: {
    ToolBackground,
    ToolLetterSpace,
    ToolLineHeight,
    ToolLineIndent,
    ToolUnderline,
    ToolAlign,
    ToolUndo,
    ToolItalic,
    ToolBold,
    ToolStrike,
    ToolList,
    ToolHr,
    ToolRedo,
    ToolHeader,
    ToolLink,
    ToolSpaceBoth,
    ToolImage,
    ToolColor,
    ToolFormatClear,
    ToolUnlockContent,
    ToolVideo,
    ToolFontSize,
    UniDrawer,
    UniMediaLibrary,
    UniIcons,
    UniFormsItem,
    // #ifdef H5
    WebEditor,
    // #endif
    // uniImChat: () => import('../ai/chat.vue'), // AI
    // ToolAi: () => import('./tools/ai.vue'), // AI
  },
  data() {
    return {
      formats: {}, // 
      keyboardHeight: 0, // 
      showFooterToolBar: false, // 
      showToolSettingMask: false, // 
      showInsertBlockToolSetting: false, // 
      showToolPopup: '', // 
      toolPopupRect: {}, // 
      // showImChat: false, //  AI  - AI
      currentLink: { // 
        title: '', // 
        url: '' // URL
      },
      drawerWidth: 0, // 
    }
  },
  computed: {
    // 
    editorHeight() {
      // 
      const toolbarHeight = 150
      let toolHeight = 0

      // 
      if (this.showToolPopup !== '') {
        toolHeight = 50
      }
      // 
      return this.keyboardHeight > 0 ? (this.systemInfo.windowHeight - this.keyboardHeight - toolbarHeight - toolHeight) : 0
    }
  },
  watch: {
    // 
    showFooterToolBar(newValue) {
      if (!newValue) {
        this.showToolPopup = ''
        this.toolPopupRect = {}
      }
    }
  },
  mounted() {
    // systemInfo
    this.systemInfo = uni.getSystemInfoSync()
    // 80%
    this.drawerWidth = this.systemInfo.windowWidth * .8
  },
  methods: {
    // 
    onEditorReady(editorCtx) {
      // #ifdef H5
      // // H5editorCtxeditorCtx
      if (editorCtx) {
        this.editorCtx = editorCtx
        this.$emit('ready', editorCtx)
      }
      // // H5window.visualViewportresizeresizeHandler
      window.visualViewport.addEventListener('resize', resizeHandler.bind(this));

      function resizeHandler() {
        // visualViewport
        const innerHeight = window.innerHeight
        const visualViewportHeight = window.visualViewport.height

        // 0
        this.onKeyboardHeightChange({
          height: parseInt(innerHeight - visualViewportHeight),
          duration: 0
        })
      }

     // #endif

      // #ifndef H5
      // 在非 H5 平台上，调用 `this.createSelectorQuery()` 方法获取编辑器的 `editorCtx` 对象，并将其保存到组件的 `editorCtx` 属性中。
      this.createSelectorQuery().select('#editor').context((res) => {
        this.editorCtx = res.context
        // 将 `editorCtx` 对象作为参数传递给父组件。
        this.$emit('ready', res.context)
      }).exec()
      // 监听键盘高度变化事件
      if (uni.onKeyboardHeightChange) {
        uni.onKeyboardHeightChange(this.onKeyboardHeightChange.bind(this))
      } else {
        // 兼容性处理，某些平台可能不支持此API
        console.warn('当前平台不支持 onKeyboardHeightChange API');
      }
      // #endif
    },
    // 
    // 监听键盘高度变化事件
    onKeyboardHeightChange(res) {
      // 如果键盘高度小于20或等于当前键盘高度，则直接返回
      if (res.height < 20 || res.height === this.keyboardHeight) return
      // 根据键盘高度设置持续时间
      const duration = res.height > 0 ? res.duration * 1000 : 0
      // 调用 setTimeout 函数，将 uni.pageScrollTo 方法的调用放入异步任务队列中，以确保在页面滚动到顶部后再更新编辑器的位置
      setTimeout(() => {
        uni.pageScrollTo({
          scrollTop: 0,
          success: () => {
            // 在页面滚动到顶部后，调用 this.updatePosition() 方法，传入 res.height 作为参数，更新编辑器的位置
            this.updatePosition(res.height)
            // 调用 this.editorCtx.scrollIntoView() 方法，将编辑器滚动到可视区域内
            setTimeout(() => this.editorCtx.scrollIntoView(), 0)
          }
        })
      }, duration)
    },
    // 
    // 更新键盘高度
    updatePosition(keyboardHeight) {
      this.keyboardHeight = keyboardHeight
    },
    // 
    // 显示工具栏弹出层
    showToolPopupView(id) {
      uni.createSelectorQuery().in(this).select('#' + id).boundingClientRect(btnData => {
        uni.createSelectorQuery().in(this).select('#' + id + '-popup').boundingClientRect(popupData => {
          const center = popupData.width / 2

          // 根据位置信息计算出工具栏弹出层的位置，始终将弹出层显示在最中间，将位置信息保存到组件的 toolPopupRect 属性中
          if (btnData.left > center) {
            this.toolPopupRect.left = (btnData.left - center) + btnData.width / 2
          } else {
            this.toolPopupRect.left = 10
          }
          if (popupData.width > this.systemInfo.windowWidth) {
            this.toolPopupRect.right = 10
          }

          // 根据传递的id参数，设置组件的 showToolPopup 属性的值，如果 showToolPopup 属性的值等于传递的id参数，则将其设置为空字符串（隐藏工具栏弹出层），否则将其设置为传递的id参数（显示工具栏弹出层）。
          this.showToolPopup = this.showToolPopup !== id ? id : ''
          // 如果 showToolPopup 属性的值为空字符串，则将组件的 toolPopupRect 属性设置为空对象，清空工具栏弹出层位置信息。
          if (this.showToolPopup === '') {
            this.toolPopupRect = {}
          }
        }).exec();
      }).exec();
    },
    // 
    // 显示插入块元素工具栏
    showInsertBlockView() {
      this.editorCtx.blur()
      uni.hideKeyboard()
      this.showToolSettingMask = true
      this.showInsertBlockToolSetting = true
      this.showToolPopup = false
      this.toolPopupRect = {}

    },
    // 
    // 关闭插入块元素工具栏
    closeToolSetting() {
      this.showToolSettingMask = false
      this.showInsertBlockToolSetting = false
    },
    // 
    // 编辑器状态改变时触发
    onStatusChange(e) {
      this.formats = e.detail
    },
    // 
    onEditorFocus() {
      // 显示工具栏
      this.showFooterToolBar = true
    },
    // 编辑器失去焦点时触发
    onEditorBlur() {
      // 将键盘高度设置为 0
      this.updatePosition(0)
      // 隐藏工具栏
      this.showFooterToolBar = false
    },
    // 
    // 手动隐藏键盘
    hideKeyboard() {
      this.editorCtx.blur()
    },
    // 
    format(name, value) {
      // 如果 name 不存在或 editorCtx 未初始化，则不设置编辑器格式
      if (!name || !this.editorCtx) return

      // 根据传递的 name 和 value 参数，设置编辑器的格式。
      switch (name) {
        case 'hr':
          this.editorCtx.insertDivider()
          break
        case 'undo':
          // 
          this.editorCtx.undo()
          break
        case 'redo':
          // 
          this.editorCtx.redo()
          break
        case 'link':
          // 插入链接，由于小程序端不支持插入链接，所以在小程序端通过 insertText 方法插入 markdown 格式的链接。在 H5 端，通过 format 方法插入链接。
          // #ifdef H5
          this.editorCtx.format('link', value)
          // #endif

          // #ifndef H5
          this.editorCtx.insertText({
            text: `[${value.text}](${value.link})`
          })
          // #endif
          break
        case 'space-both':
          // 设置两端缩进左右间距
          this.editorCtx.format('marginLeft', value)
          this.editorCtx.format('marginRight', value)
          break
        case 'format-clear':
          // 清除格式
          this.editorCtx.removeFormat()
          break
        case 'image':
          // 插入图片
          this.editorCtx.insertImage(value)
          break
        case 'unlockContent':
          // 插入付费解锁内容块
          const isExist = document.querySelector('.ql-unlock-content')

          // 如果已经存在付费解锁内容块，则弹出提示框，否则插入付费解锁内容块。
          if (isExist) {
            uni.showModal({
              content: '付费解锁不允许重新插入',
              showCancel: false
            })
            return
          }
          this.editorCtx.insertUnlockContent(value)
          break
        case 'ai':
          // 打开AI智能助手
          this.showImChat = !this.showImChat
          break
        case 'mediaVideo':
          // 仅H5支持
          // #ifdef H5
          this.editorCtx.insertMediaVideo(value)
          // #endif
          break

        default:
          this.editorCtx.format(name, value)
          break
      }
      setTimeout(() => this.editorCtx.scrollIntoView(), 100)
    },
    // 
    // 获取编辑器所选内容的格式
    getFormat(range) {
      this.formats = range ? this.editorCtx.getFormat(range) : {}
      return this.formats
    },
    // 
    // 复制图片进入编辑器上传
    uploadHandlerForH5({blob, ext, size}, el) {
      // 返回一个 Promise 对象，以便在上传成功后，将图片的 URL 插入到编辑器中。
      return new Promise((resolve, reject) => {
        this.uploadEditorImage({
          filePath: blob,
          fileExt: ext,
          size
        }).then(fileID => {
          resolve(fileID)
        }).catch(error => {
          // 防止万一，只要检测失败就删除图片
          Quill && Quill.find(el).deleteAt(0)
          uni.showModal({
            content: error.message,
            showCancel: false
          })
          reject()
        }).finally(() => {
          uni.hideLoading()
        })
      })
    },
    // 旧的onInsertImage方法，保留以备不时之需
    onInsertImage (selectMediaItems) {
      if (selectMediaItems && selectMediaItems.length > 0) {
        const image = selectMediaItems[0]
        
        this.$refs.insertImageDrawer.close()
        
        // format
        this.format('image', {
          src: image.src,
          data: {
            source: image.src
          }
        })
        setTimeout(() => this.editorCtx.scrollIntoView(), 0)
      }
    },
    uploadEditorImage ({filePath, fileExt, size}) {
      uni.showLoading({
        title: '?..'
      })

      return new Promise((resolve, reject) => {
        new Promise((res, rej) => {
          uniCloud.uploadFile({
            filePath,
            cloudPath: `cms/media/images/${Date.now()}_${Math.round(Math.random() * 10000)}.${fileExt || 'jpg'}`,
            fileType: 'image',
            success: _res => {
              res(_res)
            },
            fail: error => {
              rej(error)
            },
            complete: () => {
              uni.hideLoading()
            }
          })
        }).then(res => {
          uni.showLoading({
            title: '...'
          })

          const uniCmsCo = uniCloud.importObject('uni-cms-co', {
            customUI: true
          })

          return uniCmsCo.checkImageSec(res.fileID).then(() => {
            return res.fileID
          })
        }).then(fileID => {
          const isCloudFile = fileID.startsWith('cloud://')

          if (!isCloudFile) return fileID

          return uniCloud.getTempFileURL({
            fileList: [fileID]
          }).then(res => {
            if (res.fileList && res.fileList.length) {
              return res.fileList[0].tempFileURL
            }

            return fileID
          })
        }).then(fileID => {
          uni.showLoading({
            title: '?..'
          })

          const uniMediaLibrary = uniCloud.importObject('uni-media-library-co', {
            customUI: true
          })

          return new Promise((_resolve) => {
            const image = new Image()
            image.onload = () => {
              _resolve({
                fileID,
                width: image.width,
                height: image.height
              })
            }

            image.src = fileID
          }).then(({fileID, width, height}) => {
            return uniMediaLibrary.report({
              src: fileID,
              cover: fileID,
              type: 'image',
              originalName: filePath.split('/').pop(),
              fileType: fileExt || 'jpg',
              size,
              resolution: {
                width,
                height
              },
              uploadUser: uniCloud.getCurrentUserInfo().uid
            })
          }).then(() => {
            return fileID
          }).catch(e => {
            console.log(e, 'e')
          });
        }).then((fileID) => {
          resolve(fileID)
        }).catch(error => {
          reject(error)
        }).finally(() => {
          uni.hideLoading()
        });
      });
    },
    showLinkPopup(link) {
      this.currentLink.url = link;
      this.hideKeyboard();
      this.$refs.popup.open();
    },
    linkChange() {
      if (!this.currentLink.url) return;
      this.format('link', {
        text: this.currentLink.title || this.currentLink.url,
        link: this.currentLink.url
      });
      this.$refs.popup.close();
    }
  }
}
</script>

<style scoped lang="scss">

/* #ifdef H5 */
@import '@/uni_modules/uni-cms/common/style/editor-icon.css';
/* #endif */

/* #ifdef H5 */
@import "quill.scss";
/* #endif */

@media screen and (max-width: 768px) {
  @import "app.scss";
}

@media screen and (min-width: 768px) {
  @import "h5.scss";
}


.popup-body {
  background: #fff;
  padding: 30px;
  border-radius: 4px;
  max-width: 80%;
  margin: 0 auto;

  .tip {
    font-size: 14px;
    text-align: center;
    color: #666;
    margin-bottom: 10px;
  }

  .popup-body-btn-group {
    text-align: center;

    .btn {
      margin: 0 5px;
    }
  }
}

// ::v-deep .ql-container {
  .ql-editor {
    &.ql-blank:before {
      font-style: normal;
      line-height: 1.75;
      font-size: 17px;
    }

    @mixin font {
      font-size: 17px;
      line-height: 1.75;
    }

    @mixin mb {
      margin-bottom: 20px;
    }

    .ql-syntax {
      @include mb;
    }

    p {
      @include font;
      @include mb;
    }

    h1, h2, h3, h4, h5, h6 {
      @include mb;
    }

    ol, ul {
      @include font;
      @include mb;

      li {
        margin-bottom: 10px !important;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .divider {
      @include mb;
    }

    code {
      word-break: break-word;
      border-radius: 2px;
      overflow-x: auto;
      background-color: #fff5f5;
      color: #ff502c;
      padding: 0.065em 0.4em;
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    }

    pre {
      background-color: #f8f8f8;
      border-radius: 4px;
      padding: 12px;
      overflow-x: auto;
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
      margin: 10px 0;
    }

    .ql-syntax {
      background-color: #f8f8f8;
      border-radius: 4px;
      padding: 12px;
      overflow-x: auto;
      font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
      margin: 10px 0;
      border: 1px solid #eaeaea;
    }
  }


.uni-im-chat-components {
  width: 450px;
  position: fixed;
  right: 50px;
  bottom: 70px;
  z-index: 999;
  border: #fefefe solid 2px;
  box-shadow: 0 0 10px rgba(0, 0, 0, .1);
  border-radius: 8px;
  overflow: hidden;

  .close-bar {
    height: 50px;
    background: #fff;
    display: flex;
    align-items: center;
    padding: 0 10px;
    justify-content: flex-end;
    position: relative;

    .head {
      display: flex;
      position: absolute;
      left: 0;
      right: 0;
      text-align: center;
      flex-direction: column;
      gap: 5px;

      .title {
        font-size: 14px;
        font-weight: bold;
        color: #333;
        padding-bottom: 0;
        border: none;
      }

      .desc {
        font-size: 12px;
        color: #999;
      }
    }

    .close {
      width: 30px;
      height: 30px;
      background: #f1f1f1;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      z-index: 2;
      cursor: pointer;

      .icon {
        display: block;
      }
    }
  }

  ::v-deep {
    //* {
    //  max-width: 100%;
    //}

    .page {
      height: 720px;
    }

    .container {
      width: 100%;
      height: 100%;
      margin: 0;
      box-shadow: none;
      flex: 1;
      border-radius: 0;
    }

    .menu {
      padding: 0;
    }
    .msg-item {
      .content {
        max-width: 88%;
      }
    }

    .trash {
      width: auto;
    }

    .foot-box {
      gap: 10px;
      padding: 10px;
      .send {
        width: 50px;
      }
      .textarea-box {
        flex: 1;
        width: auto;
        .textarea {
          width: 100%;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .uni-im-chat-components {
    width: 100%;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0 auto;
    border: none;

    &:before {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, .5);
      z-index: -1;
    }
    //
    //  .foot-box {
    //    width: 100%;
    //  }
    //  .foot-box-content {
    //    width: 100%;
    //    display: flex;
    //    align-items: center;
    //    gap: 10px;
    //  }
    //}
  }
}
</style>
