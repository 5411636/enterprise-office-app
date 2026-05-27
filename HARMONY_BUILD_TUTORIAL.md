# React Native 鸿蒙 云打包完整教程

> **无需 Mac电脑 | 无需华为开发者账号 | 完全免费**
> **鸿蒙系统可直接安装 APK**

---

## 目录

1. [方案说明](#1-方案说明)
2. [准备工作](#2-准备工作)
3. [项目创建](#3-项目创建)
4. [GitHub 仓库创建](#4-github-仓库创建)
5. [GitHub Actions 配置](#5-github-actions-配置)
6. [触发构建](#6-触发构建)
7. [下载和安装 APK](#7-下载和安装-apk)
8. [常见问题](#8-常见问题)
9. [完整配置文件](#9-完整配置文件)

---

## 1. 方案说明

### 1.1 我们要做什么

用 GitHub Actions 的 Linux 虚拟机编译 React Native 项目，生成可安装的 APK 文件，直接在鸿蒙设备上安装。

### 1.2 鸿蒙系统的特殊性

鸿蒙系统（HarmonyOS）兼容 Android 应用：
- 鸿蒙 2.0+ 支持 APK 直接安装
- 鸿蒙 3.0+ 完全支持 APK
- 鸿蒙 4.0+ 完全支持 APK
- **无需华为开发者账号**
- **无需谷歌服务**

### 1.3 本方案的局限

- APK 未签名，只能用于：
  - 测试设备
  - 开启"允许安装未知来源应用"
  - 鸿蒙设备测试

---

## 2. 准备工作

### 2.1 需要的环境

- Node.js 18+
- npm 或 yarn
- Git
- GitHub 账号
- 鸿蒙设备（手机/平板）

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

如果你用自己的项目，把 `enterprise-office-app` 替换成你的项目名。

---

## 4. GitHub 仓库创建

### 4.1 创建仓库

1. 打开 https://github.com 并登录
2. 点击右上角 **+** → **New repository**
3. 填写：
   - **Repository name**: `enterprise-office-app`
   - **Description**: `React Native HarmonyOS App`
   - 选择 **Private** 或 **Public**
4. 点击 **Create repository**

### 4.2 本地项目关联 GitHub

在项目目录打开终端，执行：

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/enterprise-office-app.git
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
        └── harmony-build.yml
```

### 5.2 完整 harmony-build.yml 配置

将以下内容完整复制到 `harmony-build.yml`：

```yaml
name: Build HarmonyOS APK

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

      - name: Build HarmonyOS APK
        run: |
          cd android
          ./gradlew assembleDebug

      - name: Create output directory
        run: |
          mkdir -p build
          cp android/app/build/outputs/apk/debug/*.apk build/
          ls -la build/

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: harmony-apk
          path: build/app-debug.apk

      - name: Upload to Releases
        run: |
          gh release create harmony-build-v1 --repo YOUR_USERNAME/enterprise-office-app --title "HarmonyOS Build v1" build/app-debug.apk || true
```

**重要替换**：
- `YOUR_USERNAME` 替换为你的 GitHub 用户名

### 5.3 提交工作流

```bash
git add .github/workflows/harmony-build.yml
git commit -m "Add HarmonyOS build workflow"
git push
```

---

## 6. 触发构建

### 6.1 手动触发

1. 打开仓库页面：https://github.com/YOUR_USERNAME/enterprise-office-app
2. 点击 **Actions** 标签
3. 在左侧找到 **Build HarmonyOS APK**
4. 点击 **Run workflow** → 选择 `main` 分支 → 点击绿色按钮

### 6.2 等待构建

构建通常需要 **8-12 分钟**，取决于项目大小。

### 6.3 构建成功标志

在 GitHub Actions 页面看到绿色的 ✅ **Build HarmonyOS APK** 表示成功。

---

## 7. 下载和安装 APK

### 7.1 下载 APK

#### 方法 A：从 Artifacts 下载（推荐）

1. 构建完成后，点击构建名称
2. 点击 **Artifacts** 部分
3. 点击 **harmony-apk** 下载
4. 解压得到 `app-debug.apk`

#### 方法 B：从 Releases 下载

1. 打开仓库首页
2. 点击 **Releases**（右侧边栏）
3. 点击 **harmony-build-v1**
4. 下载 APK 文件

### 7.2 安装 APK 到鸿蒙设备

#### 步骤一：传输 APK 到手机

- 方法一：数据线连接电脑，直接复制 APK
- 方法二：微信/QQ文件传输
- 方法三：华为云空间
- 方法四：蓝牙传输

#### 步骤二：开启安装未知来源

鸿蒙手机设置路径：

```
方式一：
设置 → 安全 → 允许安装未知来源应用 → 开启

方式二：
设置 → 应用 → 应用管理 → 找到文件管理器 → 允许安装未知来源

方式三（鸿蒙3.0+）：
设置 → 应用 → 应用助手 → 允许安装未知来源
```

#### 步骤三：安装

1. 找到 APK 文件（通常在文件管理器的下载目录）
2. 点击 APK 文件
3. 如果提示"此应用可能来源不明"，确认安装
4. 等待安装完成

### 7.3 验证安装

安装完成后：
1. 在桌面找到应用图标
2. 点击打开测试
3. 如果提示权限请求，点击允许

---

## 8. 常见问题

### 8.1 安装后无法打开

**原因**：应用缺少必要权限

**解决**：
1. 进入 **设置** → **应用** → 找到对应应用
2. 点击 **权限**
3. 手动开启所需权限（存储、相机、位置等）

### 8.2 安装时提示"解析包失败"

**原因**：APK 文件损坏或下载不完整

**解决**：
1. 删除当前 APK
2. 重新从 GitHub 下载
3. 确保传输过程中文件完整

### 8.3 鸿蒙设备不识别 APK

**原因**：APK 的 CPU 架构不兼容

**解决**：
1. 确保下载的是 debug 版 APK（支持多种架构）
2. 检查手机 CPU 架构（通常 arm64-v8a）

### 8.4 提示"应用签名验证失败"

**原因**：APK 未签名（正常现象）

**解决**：
- 这是正常现象，debug APK 本来就没签名
- 不影响正常使用
- 如果需要正式签名，使用发布版 APK

### 8.5 鸿蒙 2.0 部分设备安装失败

**原因**：早期鸿蒙设备兼容性问题

**解决**：
1. 尝试使用armeabi-v7a架构的 APK
2. 或者升级鸿蒙系统到 3.0 以上

---

## 9. 完整配置文件

### 9.1 完整 harmony-build.yml

```yaml
name: Build HarmonyOS APK

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

      - name: Build HarmonyOS APK
        run: |
          cd android
          ./gradlew assembleDebug

      - name: Create output directory
        run: |
          mkdir -p build
          cp android/app/build/outputs/apk/debug/*.apk build/
          ls -la build/

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: harmony-apk
          path: build/app-debug.apk

      - name: Upload to Releases
        run: |
          gh release create harmony-build-v1 --repo 5411636/enterprise-office-app --title "HarmonyOS Build v1" build/app-debug.apk || true
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

## 10. 鸿蒙设备型号参考

### 支持 APK 安装的鸿蒙手机（部分）

| 系列 | 型号 | 鸿蒙版本 |
|------|------|---------|
| Mate | Mate 30 | 鸿蒙 2.0 |
| Mate | Mate 40 | 鸿蒙 3.0 |
| Mate | Mate 50 | 鸿蒙 3.0 |
| P | P40 | 鸿蒙 2.0 |
| P | P50 | 鸿蒙 3.0 |
| Nova | Nova 9 | 鸿蒙 2.0 |
| Nova | Nova 10 | 鸿蒙 3.0 |
| Pocket | Pocket 50 | 鸿蒙 3.0 |

### 支持 APK 安装的鸿蒙平板（部分）

| 系列 | 型号 | 鸿蒙版本 |
|------|------|---------|
| MatePad | MatePad Pro 12.6 | 鸿蒙 2.0 |
| MatePad | MatePad Pro 11 | 鸿蒙 3.0 |
| MatePad | MatePad Air | 鸿蒙 3.0 |

---

## 11. 相关教程

- **iOS 打包**：[IOS_BUILD_TUTORIAL.md](./IOS_BUILD_TUTORIAL.md)
- **安卓打包**：[ANDROID_BUILD_TUTORIAL.md](./ANDROID_BUILD_TUTORIAL.md)

---

## 12. 项目信息

- **GitHub 仓库**：https://github.com/5411636/enterprise-office-app
- **本地项目路径**：`C:\Users\86137\Desktop\langchain\code\rn\react-native-app`
- **教程作者**：Claude Code
- **最后更新**：2026-05-26

---

如有问题请提交 GitHub Issue 或联系维护者。