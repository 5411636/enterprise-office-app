# React Native iOS 云打包完整教程

> **无需 Mac电脑 | 无需苹果开发者账号 | 完全免费**

---

## 目录

1. [方案说明](#1-方案说明)
2. [准备工作](#2-准备工作)
3. [项目创建](#3-项目创建)
4. [GitHub 仓库创建](#4-github-仓库创建)
5. [GitHub Actions 配置](#5-github-actions-配置)
6. [触发构建](#6-触发构建)
7. [下载和安装 IPA](#7-下载和安装-ipa)
8. [常见错误解决](#8-常见错误解决)
9. [完整配置文件](#9-完整配置文件)

---

## 1. 方案说明

### 1.1 我们要做什么

用 GitHub Actions 的 macOS 虚拟机编译 React Native 项目，生成可安装的 IPA 文件。

### 1.2 为什么不用 EAS/其他方案

| 方案 | 费用 | 需要 Mac | 需要苹果账号 | 难度 |
|------|------|---------|------------|------|
| EAS 云构建 | 免费有额度 | 否 | 要（$99） | 简单 |
| Codemagic | 免费有额度 | 否 | 要 | 中等 |
| 本方案 | 完全免费 | 否 | **不要** | 复杂 |

### 1.3 本方案的局限

- 生成的 IPA **没有签名**
- 正常 iPhone 无法直接安装
- 可用于：CI验证、开源演示、越狱设备、AltStore/TrollStore

---

## 2. 准备工作

### 2.1 需要的环境

- Node.js 18+
- npm 或 yarn
- Git
- GitHub 账号
- 爱思助手（Windows 安装 IPA 用）

### 2.2 工具下载

| 工具 | 用途 | 下载地址 |
|------|------|---------|
| Node.js | React Native 环境 | https://nodejs.org/ |
| Git | 代码版本管理 | https://git-scm.com/ |
| 爱思助手 | 安装 IPA 到 iPhone | https://www.i4.cn/ |

### 2.3 环境验证

打开终端，检查版本：

```bash
node --version    # 应显示 v18 或更高
npm --version     # 应显示 9 或更高
git --version     # 应显示 2.x 或更高
```

---

## 3. 项目创建

### 3.1 创建 React Native 项目（已有项目可跳过）

```bash
# 使用 Expo 创建项目（推荐）
npx create-expo-app@latest enterprise-office-app

# 进入项目目录
cd enterprise-office-app

# 安装额外依赖
npm install
```

### 3.2 本教程对应的项目

本教程对应的项目路径：
```
C:\Users\86137\Desktop\langchain\code\rn\react-native-app
```

如果你用自己的项目，把下面的 `enterprise-office-app` 替换成你的项目名。

---

## 4. GitHub 仓库创建

### 4.1 创建仓库

1. 打开 https://github.com 并登录
2. 点击右上角 **+** → **New repository**
3. 填写：
   - **Repository name**: `enterprise-office-app`
   - **Description**: `React Native iOS App`
   - 选择 **Private** 或 **Public**
4. 点击 **Create repository**

### 4.2 本地项目关联 GitHub

在项目目录打开终端，执行：

```bash
# 初始化 Git（如果还没初始化）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/enterprise-office-app.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 4.3 验证仓库

打开 https://github.com/YOUR_USERNAME/enterprise-office-app 应能看到代码。

---

## 5. GitHub Actions 配置

### 5.1 创建工作流目录和文件

在项目根目录创建：

```
enterprise-office-app/
└── .github/
    └── workflows/
        └── ios-build.yml
```

### 5.2 完整 ios-build.yml 配置

将以下内容完整复制到 `ios-build.yml`：

```yaml
name: Build iOS

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: macos-14
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate iOS native project
        run: npx expo prebuild --platform ios --clean

      - name: Install Pods
        run: |
          cd ios
          pod install

      - name: Disable code signing in project
        run: |
          cd ios
          /usr/libexec/PlistBuddy -c "Set :CODE_SIGNING_ALLOWED NO" app.xcodeproj/project.pbxproj || true
          /usr/libexec/PlistBuddy -c "Set :CODE_SIGNING_REQUIRED NO" app.xcodeproj/project.pbxproj || true
          /usr/libexec/PlistBuddy -c "Set :CODE_SIGN_STYLE Manual" app.xcodeproj/project.pbxproj || true
          /usr/libexec/PlistBuddy -c "Set :DEVELOPMENT_TEAM" app.xcodeproj/project.pbxproj || true
          /usr/libexec/PlistBuddy -c "Set :CODE_SIGN_IDENTITY ''" app.xcodeproj/project.pbxproj || true

      - name: Build iOS (no signing)
        run: |
          cd ios
          xcodebuild archive \
            -workspace app.xcworkspace \
            -scheme app \
            -configuration Release \
            -destination 'generic/platform=iOS' \
            -archivePath ./app.xcarchive \
            CODE_SIGNING_ALLOWED=NO \
            CODE_SIGNING_REQUIRED=NO \
            CODE_SIGN_STYLE=Manual \
            CODE_SIGN_IDENTITY="" \
            DEVELOPMENT_TEAM="" \
            -quiet

      - name: Create IPA
        run: |
          mkdir -p build/Payload
          cd ios
          APP_PATH=$(find app.xcarchive -name "*.app" -type d | head -1)
          echo "Found: $APP_PATH"
          cp -r "$APP_PATH" ../build/Payload/
          cd ../build
          zip -r output.ipa Payload
          ls -la output.ipa

      - name: Upload IPA
        uses: actions/upload-artifact@v4
        with:
          name: ios-ipa
          path: build/output.ipa

      - name: Upload to Releases
        run: |
          gh release create ios-build-v1 --repo YOUR_USERNAME/enterprise-office-app --title "iOS Build v1" build/output.ipa || true
```

**重要替换**：
- `YOUR_USERNAME` 替换为你的 GitHub 用户名

### 5.3 提交工作流

```bash
git add .github/workflows/ios-build.yml
git commit -m "Add iOS build workflow"
git push
```

---

## 6. 触发构建

### 6.1 手动触发

1. 打开仓库页面：https://github.com/YOUR_USERNAME/enterprise-office-app
2. 点击 **Actions** 标签
3. 在左侧找到 **Build iOS**
4. 点击 **Run workflow** → 选择 `main` 分支 → 点击绿色按钮

### 6.2 等待构建

构建通常需要 **10-15 分钟**，取决于项目大小。

构建过程会显示：
- `Checkout` - 拉取代码
- `Setup Node` - 安装 Node 环境
- `Install dependencies` - 安装依赖
- `Generate iOS native project` - 生成 Xcode 项目（expo prebuild）
- `Install Pods` - 安装 CocoaPods
- `Build iOS` - 编译
- `Create IPA` - 打包
- `Upload IPA` - 上传

### 6.3 构建成功标志

在 GitHub Actions 页面看到绿色的 ✅ **Build iOS** 表示成功。

---

## 7. 下载和安装 IPA

### 7.1 下载 IPA

#### 方法 A：从 Artifacts 下载（推荐）

1. 构建完成后，点击构建名称
2. 点击 **Artifacts** 部分
3. 点击 **ios-ipa** 下载
4. 解压得到 `output.ipa`

#### 方法 B：从 Releases 下载

1. 打开仓库首页
2. 点击 **Releases**（右侧边栏）
3. 点击 **v1** 或 **ios-build-v1**
4. 下载 `output.ipa`

### 7.2 安装 IPA（爱思助手）

1. 下载并安装爱思助手：https://www.i4.cn/
2. 连接 iPhone 到电脑
3. 打开爱思助手 → **我的设备**
4. 点击左侧 **应用游戏**
5. 点击 **导入** → 选择 `output.ipa`
6. 如果提示签名：
   - 选择 **企业签名**（不需要 Apple ID）
   - 或选择 **使用Apple ID签名** 并正确填写 App Specific Password

### 7.3 安装失败的处理

#### 错误：签名失败 "Your account information was entered incorrectly"

**原因**：Apple ID 密码或 App Specific Password 错误

**解决**：
1. 打开 https://appleid.apple.com
2. 登录 → **登录和安全** → **App Specific Passwords**
3. 点击 **生成 App Specific Password**
4. 复制生成的密码（格式类似 `ccx-ea7e0f1d62d307ae`）
5. 在爱思助手中：
   - Apple ID：填 `1130252319@qq.com`
   - 密码：填刚生成的 App Specific Password（不是登录密码）

#### 错误：描述文件申请失败

**原因**：同上的认证问题

**解决**：尝试使用**企业签名**（不需要填 Apple ID）

---

## 8. 常见错误解决

### 8.1 GitHub Actions 相关错误

#### 错误：HTTP 500 "Failed to run workflow dispatch"

**原因**：GitHub 服务器 API 临时故障

**解决**：
- 等几分钟后重试
- 或者用 Codemagic 作为替代方案

#### 错误：403 "Your account is suspended"

**原因**：GitHub 账号被封

**解决**：
- 访问 https://support.github.com 申诉
- 等待解封后再继续

#### 错误：Failed to download archive 'actions/download-artifact/...'

**原因**：GitHub Actions 缓存损坏

**解决**：在 workflow 中移除 `actions/download-artifact` 步骤（当前配置已移除）

#### 错误：Checkout 失败 "unable to access"

**原因**：Workflow permissions 不够

**解决**：在 workflow 顶部添加：

```yaml
permissions:
  contents: read
```

并在 checkout step 添加：

```yaml
- uses: actions/checkout@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
```

---

### 8.2 Expo prebuild 相关错误

#### 错误：expo 命令权限被拒绝

```
sh: /用户/构建者/克隆/node_modules/.bin/expo: 权限被拒
```

**原因**：node_modules/.bin/expo 没有执行权限

**解决**：在 workflow 中添加：

```yaml
- name: Fix expo permissions
  run: chmod +x node_modules/.bin/expo || true
```

---

### 8.3 CocoaPods 相关错误

#### 错误：Pod install 失败

**原因**：网络问题或 Podfile 配置问题

**解决**：确保网络稳定，多试几次

---

### 8.4 Xcode build 相关错误

#### 错误：Signing for "app" requires a development team

```
error: Signing for "app" requires a development team.
Select a development team in the Signing & Capabilities editor.
```

**原因**：签名未被禁用

**解决**：确保以下条件都满足：

1. plistbuddy 命令正确执行
2. xcodebuild 参数包含所有签名禁用参数：

```bash
CODE_SIGNING_ALLOWED=NO
CODE_SIGNING_REQUIRED=NO
CODE_SIGN_STYLE=Manual
CODE_SIGN_IDENTITY=""
DEVELOPMENT_TEAM=""
```

#### 错误：The iOS deployment target is set to 9.0

```
warning: The iOS deployment target 'IPHONEOS_DEPLOYMENT_TARGET' is
set to 9.0, but the range of supported deployment target versions is 12.0 to 17.5.99.
```

**原因**：Podfile 中设置的最低 iOS 版本过低

**解决**：在 `ios/Podfile` 中修改：

```ruby
platform :ios, '13.0'  # 改为 13.0 或更高
```

---

### 8.5 IPA 打包相关错误

#### 错误：No such file or directory (app.app)

```
cp: build/app.xcarchive/Products/Library/Application Support/app.app:
No such file or directory
```

**原因**：app.xcarchive 内部结构不同，app 不在预期位置

**解决**：使用 find 命令动态查找：

```bash
APP_PATH=$(find app.xcarchive -name "*.app" -type d | head -1)
cp -r "$APP_PATH" ../build/Payload/
```

#### 错误：IPA 文件损坏

**原因**：Payload/app 被打包成文件而非目录

**解决**：确保 cp 命令使用 `-r`（递归）参数，且源路径是目录

验证 IPA 结构：

```bash
unzip -l output.ipa | grep "Payload/app"
```

应该显示：
```
0  ... Payload/app.app/
```

而不是：
```
5717000  ... Payload/app
```

---

### 8.6 EAS 相关错误（如果你用过）

#### 错误：EAS CLI couldn't find any credentials

```
Failed to set up credentials.
EAS CLI couldn't find any credentials suitable for internal distribution.
Credentials are not set up. Run this command again in interactive mode.
```

**原因**：EAS 默认需要苹果签名证书

**解决**：本教程方案完全不使用 EAS，改用纯 xcodebuild

---

## 9. 完整配置文件

### 9.1 完整 ios-build.yml（当前使用版本）

```yaml
name: Build iOS

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: macos-14
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate iOS native project
        run: npx expo prebuild --platform ios --clean

      - name: Install Pods
        run: |
          cd ios
          pod install

      - name: Disable code signing in project
        run: |
          cd ios
          /usr/libexec/PlistBuddy -c "Set :CODE_SIGNING_ALLOWED NO" app.xcodeproj/project.pbxproj || true
          /usr/libexec/PlistBuddy -c "Set :CODE_SIGNING_REQUIRED NO" app.xcodeproj/project.pbxproj || true
          /usr/libexec/PlistBuddy -c "Set :CODE_SIGN_STYLE Manual" app.xcodeproj/project.pbxproj || true
          /usr/libexec/PlistBuddy -c "Set :DEVELOPMENT_TEAM" app.xcodeproj/project.pbxproj || true
          /usr/libexec/PlistBuddy -c "Set :CODE_SIGN_IDENTITY ''" app.xcodeproj/project.pbxproj || true

      - name: Build iOS (no signing)
        run: |
          cd ios
          xcodebuild archive \
            -workspace app.xcworkspace \
            -scheme app \
            -configuration Release \
            -destination 'generic/platform=iOS' \
            -archivePath ./app.xcarchive \
            CODE_SIGNING_ALLOWED=NO \
            CODE_SIGNING_REQUIRED=NO \
            CODE_SIGN_STYLE=Manual \
            CODE_SIGN_IDENTITY="" \
            DEVELOPMENT_TEAM="" \
            -quiet

      - name: Create IPA
        run: |
          mkdir -p build/Payload
          cd ios
          APP_PATH=$(find app.xcarchive -name "*.app" -type d | head -1)
          echo "Found: $APP_PATH"
          cp -r "$APP_PATH" ../build/Payload/
          cd ../build
          zip -r output.ipa Payload
          ls -la output.ipa

      - name: Upload IPA
        uses: actions/upload-artifact@v4
        with:
          name: ios-ipa
          path: build/output.ipa

      - name: Upload to Releases
        run: |
          gh release create ios-build-v1 --repo 5411636/enterprise-office-app --title "iOS Build v1" build/output.ipa || true
```

### 9.2 GitHub Secrets 配置（使用 EAS 时需要，本方案不需要）

如需使用 EAS 云构建（非本教程方案），需要配置：

| Secret 名称 | 值 | 获取地址 |
|------------|-----|---------|
| `EAS_TOKEN` | Expo 访问令牌 | https://expo.dev/accounts/*/access-tokens |
| `APPLE_ID` | Apple ID 邮箱 | - |
| `APPLE_APP_SPECIFIC_PASSWORD` | 应用专用密码 | https://appleid.apple.com |

配置方法：
1. GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 填入名称和值

---

## 10. 方案对比和进阶

### 10.1 如果你想正式发布 App

本方案生成的 IPA 不能上架 App Store，需要：

| 方案 | 花费 | 难度 |
|------|------|------|
| 苹果开发者账号 | $99/年 | 简单 |
| 企业签名 | $300-800/年 | 中等 |
| TestFlight | 需要开发者账号 | 简单 |

### 10.2 如果你有苹果开发者账号

使用 EAS Build（推荐）：

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录
eas login

# 构建（云端签名）
eas build --platform ios --profile preview
```

### 10.3 如果你有 Mac

本地构建更简单：

```bash
npx expo prebuild --platform ios
cd ios
xcodebuild -workspace app.xcworkspace -scheme app -configuration Release archive
xcodebuild -exportArchive -archivePath build/app.xcarchive -exportPath ./output -exportOptionsPlist ExportOptions.plist
```

---

## 11. 快速检查清单

构建前确认：

- [ ] GitHub 仓库已创建
- [ ] ios-build.yml 已提交并推送
- [ ] 所有文件已 git add 和 git commit
- [ ] GitHub Actions 权限设置为 Read and write
- [ ] 等待构建完成（无红色错误）

安装前确认：

- [ ] 下载了正确的 output.ipa
- [ ] iPhone 已连接电脑
- [ ] 爱思助手已安装

---

## 12. 项目信息

- **GitHub 仓库**：https://github.com/5411636/enterprise-office-app
- **本地项目路径**：`C:\Users\86137\Desktop\langchain\code\rn\react-native-app`
- **教程作者**：Claude Code
- **最后更新**：2026-05-26

---

如有问题请提交 GitHub Issue 或联系维护者。