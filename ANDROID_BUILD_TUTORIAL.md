# React Native 安卓 云打包完整教程

> **无需 Mac电脑 | 无需谷歌开发者账号 | 完全免费**

---

## 目录

1. [方案说明](#1-方案说明)
2. [准备工作](#2-准备工作)
3. [项目创建](#3-项目创建)
4. [GitHub 仓库创建](#4-github-仓库创建)
5. [GitHub Actions 配置](#5-github-actions-配置)
6. [触发构建](#6-触发构建)
7. [下载和安装 APK](#7-下载和安装-apk)
8. [常见错误解决](#8-常见错误解决)
9. [完整配置文件](#9-完整配置文件)

---

## 1. 方案说明

### 1.1 我们要做什么

用 GitHub Actions 的 Linux 虚拟机编译 React Native 项目，生成可安装的 APK 文件。

### 1.2 为什么不用 EAS/其他方案

| 方案 | 费用 | 需要 Mac | 需要签名 | 难度 |
|------|------|---------|---------|------|
| EAS 云构建 | 免费有额度 | 否 | 要（复杂） | 中等 |
| 本方案 | 完全免费 | 否 | 不要 | 简单 |

### 1.3 本方案的局限

- APK 未签名，只能用于：
  - 测试设备
  - 开启"允许安装未知来源应用"
  - 安卓设备测试

---

## 2. 准备工作

### 2.1 需要的环境

- Node.js 18+
- npm 或 yarn
- Git
- GitHub 账号

### 2.2 工具下载

| 工具 | 用途 | 下载地址 |
|------|------|---------|
| Node.js | React Native 环境 | https://nodejs.org/ |
| Git | 代码版本管理 | https://git-scm.com/ |

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
   - **Description**: `React Native Android App`
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
        └── android-build.yml
```

### 5.2 完整 android-build.yml 配置

将以下内容完整复制到 `android-build.yml`：

```yaml
name: Build Android APK

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
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

      - name: Generate Android native project
        run: npx expo prebuild --platform android --clean

      - name: Setup JDK
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Build Android Debug APK
        run: |
          cd android
          ./gradlew assembleDebug

      - name: Build Android Release APK (unsigned)
        run: |
          cd android
          ./gradlew assembleRelease || true

      - name: Create output directory
        run: |
          mkdir -p build
          cp android/app/build/outputs/apk/debug/*.apk build/
          cp android/app/build/outputs/apk/release/*.apk build/ 2>/dev/null || true
          ls -la build/

      - name: Upload Debug APK
        uses: actions/upload-artifact@v4
        with:
          name: android-debug-apk
          path: build/app-debug.apk

      - name: Upload Release APK
        uses: actions/upload-artifact@v4
        if: success()
        with:
          name: android-release-apk
          path: build/app-release.apk

      - name: Upload to Releases
        run: |
          cd build
          for apk in *.apk; do
            [ -f "$apk" ] && gh release create android-build-v1 --repo YOUR_USERNAME/enterprise-office-app --title "Android Build v1" "$apk" || true
          done
```

**重要替换**：
- `YOUR_USERNAME` 替换为你的 GitHub 用户名

### 5.3 提交工作流

```bash
git add .github/workflows/android-build.yml
git commit -m "Add Android build workflow"
git push
```

---

## 6. 触发构建

### 6.1 手动触发

1. 打开仓库页面：https://github.com/YOUR_USERNAME/enterprise-office-app
2. 点击 **Actions** 标签
3. 在左侧找到 **Build Android APK**
4. 点击 **Run workflow** → 选择 `main` 分支 → 点击绿色按钮

### 6.2 等待构建

构建通常需要 **8-12 分钟**，取决于项目大小。

构建过程会显示：
- `Checkout` - 拉取代码
- `Setup Node` - 安装 Node 环境
- `Install dependencies` - 安装依赖
- `Generate Android native project` - 生成 Android 项目（expo prebuild）
- `Setup JDK` - 安装 Java 17
- `Build Android Debug APK` - 编译调试版
- `Build Android Release APK` - 编译发布版
- `Upload APKs` - 上传

### 6.3 构建成功标志

在 GitHub Actions 页面看到绿色的 ✅ **Build Android APK** 表示成功。

---

## 7. 下载和安装 APK

### 7.1 下载 APK

#### 方法 A：从 Artifacts 下载（推荐）

1. 构建完成后，点击构建名称
2. 点击 **Artifacts** 部分
3. 下载：
   - `android-debug-apk` - 调试版（推荐测试用）
   - `android-release-apk` - 发布版

#### 方法 B：从 Releases 下载

1. 打开仓库首页
2. 点击 **Releases**（右侧边栏）
3. 点击 **android-build-v1**
4. 下载 APK 文件

### 7.2 安装 APK

#### 步骤一：传输 APK 到手机

- 方法一：数据线连接电脑，直接复制 APK
- 方法二：微信/QQ文件传输
- 方法三：网盘同步

#### 步骤二：开启安装未知来源

```
安卓手机设置：
设置 → 安全 → 允许安装未知来源应用 → 开启
```

或者：

```
设置 → 应用 → 应用管理 → 找到文件管理器 → 允许安装未知来源
```

#### 步骤三：安装

1. 找到 APK 文件
2. 点击 → 安装
3. 等待完成

---

## 8. 常见错误解决

### 8.1 GitHub Actions 相关错误

#### 错误：HTTP 500 "Failed to run workflow dispatch"

**原因**：GitHub 服务器 API 临时故障

**解决**：
- 等几分钟后重试
- 检查 GitHub Status：https://www.githubstatus.com

#### 错误：Java 版本不兼容

```
Could not find a compatible version of Java
```

**原因**：Java 版本太高或太低

**解决**：确保 workflow 中使用 Java 17：

```yaml
- name: Setup JDK
  uses: actions/setup-java@v4
  with:
    java-version: '17'
    distribution: 'temurin'
```

#### 错误：Gradle 构建失败

```
Execution failed for task ':app:processReleaseResources'.
```

**原因**：资源文件问题或内存不足

**解决**：
- 清理构建缓存

```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

---

### 8.2 Expo prebuild 相关错误

#### 错误：expo prebuild 失败

```
Unable to find expo build configuration
```

**原因**：项目配置问题

**解决**：
1. 确保 `app.json` 配置正确
2. 删除 `android` 目录后重新 prebuild

```bash
rm -rf android
npx expo prebuild --platform android --clean
```

---

### 8.3 Android 构建相关错误

#### 错误：SDK 找不到

```
ANDROID_HOME not set
```

**原因**：Android SDK 未正确配置

**解决**：在 workflow 中添加 Android SDK 配置：

```yaml
- name: Setup Android SDK
  uses: android-actions/setup-android@v2
```

#### 错误：NDK 找不到

```
Could not find ndk.dir in local.properties
```

**原因**：NDK 未安装

**解决**：在 `gradle.properties` 中指定 NDK 版本：

```properties
android.ndkVersion=25.1.8937393
```

---

### 8.4 APK 打包相关错误

#### 错误：APK 太大

**原因**：未启用 ProGuard 压缩

**解决**：在 `android/app/build.gradle` 中启用：

```gradle
android {
    buildTypes {
        release {
            minifyEnabled true
            shrinkResources true
        }
    }
}
```

#### 错误：APK 无法安装

**原因**：签名或架构问题

**解决**：
1. 确保 CPU 架构兼容（arm64-v8a 或 armeabi-v7a）
2. 使用 debug APK 测试

---

## 9. 完整配置文件

### 9.1 完整 android-build.yml

```yaml
name: Build Android APK

on:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
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

      - name: Generate Android native project
        run: npx expo prebuild --platform android --clean

      - name: Setup JDK
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Build Android Debug APK
        run: |
          cd android
          ./gradlew assembleDebug

      - name: Build Android Release APK (unsigned)
        run: |
          cd android
          ./gradlew assembleRelease || true

      - name: Create output directory
        run: |
          mkdir -p build
          cp android/app/build/outputs/apk/debug/*.apk build/
          cp android/app/build/outputs/apk/release/*.apk build/ 2>/dev/null || true
          ls -la build/

      - name: Upload Debug APK
        uses: actions/upload-artifact@v4
        with:
          name: android-debug-apk
          path: build/app-debug.apk

      - name: Upload Release APK
        uses: actions/upload-artifact@v4
        if: success()
        with:
          name: android-release-apk
          path: build/app-release.apk

      - name: Upload to Releases
        run: |
          cd build
          for apk in *.apk; do
            [ -f "$apk" ] && gh release create android-build-v1 --repo 5411636/enterprise-office-app --title "Android Build v1" "$apk" || true
          done
```

### 9.2 app.json 配置（确保正确）

```json
{
  "expo": {
    "name": "企业办公",
    "slug": "enterprise-office-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "package": "com.enterprise.officeapp",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

---

## 10. 方案对比和进阶

### 10.1 如果你想签名 APK（用于正式发布）

#### 方法 A：使用 Android Studio 自签名

1. 打开 Android Studio
2. Build → Generate Signed Bundle/APK
3. 选择 APK → Next
4. 创建新密钥库或使用现有密钥库
5. 完成签名

#### 方法 B：使用命令行签名

```bash
# 创建签名密钥
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 签名 APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore my-app.apk my-key-alias

# 验证签名
jarsigner -verify -verbose -certs my-app.apk
```

### 10.2 如果你想上架应用市场

| 应用市场 | 需要账号 | 审核时间 | 难度 |
|---------|---------|---------|------|
| 应用宝 | 需注册 | 1-5天 | 中等 |
| 华为应用市场 | 需注册 | 1-3天 | 中等 |
| 小米应用商店 | 需注册 | 1-3天 | 中等 |
| Google Play | 需注册（$25） | 1-7天 | 简单 |

---

## 11. 快速检查清单

构建前确认：

- [ ] GitHub 仓库已创建
- [ ] android-build.yml 已提交并推送
- [ ] 所有文件已 git add 和 git commit
- [ ] GitHub Actions 权限设置为 Read
- [ ] 等待构建完成（无红色错误）

安装前确认：

- [ ] 下载了正确的 APK（debug 版推荐）
- [ ] 安卓设备已连接或 APK 已传输
- [ ] 已开启"允许安装未知来源应用"

---

## 12. 相关教程

- **iOS 打包**：[IOS_BUILD_TUTORIAL.md](./IOS_BUILD_TUTORIAL.md)
- **鸿蒙打包**：[HARMONY_BUILD_TUTORIAL.md](./HARMONY_BUILD_TUTORIAL.md)

---

## 13. 项目信息

- **GitHub 仓库**：https://github.com/5411636/enterprise-office-app
- **本地项目路径**：`C:\Users\86137\Desktop\langchain\code\rn\react-native-app`
- **教程作者**：Claude Code
- **最后更新**：2026-05-26

---

如有问题请提交 GitHub Issue 或联系维护者。