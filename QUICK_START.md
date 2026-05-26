# 快速启动指南

## 方式一：使用 Expo Go（最简单，推荐）

### 步骤：

1. **安装依赖**
   \`\`\`bash
   cd react-native-app
   npm install
   \`\`\`

2. **启动开发服务器**
   \`\`\`bash
   npm start
   \`\`\`

3. **在手机上安装 Expo Go**
   - iOS: App Store 搜索 "Expo Go"
   - Android: Play Store 搜索 "Expo Go"

4. **扫码运行**
   - 使用 Expo Go 扫描终端中显示的二维码
   - 应用将自动加载到手机上

### 测试账号
- 用户名: `admin`
- 密码: `admin123`

---

## 方式二：使用模拟器

### iOS 模拟器（需要 macOS）

1. 安装 Xcode (从 App Store)

2. 安装依赖
   \`\`\`bash
   cd react-native-app
   npm install
   \`\`\`

3. 运行
   \`\`\`bash
   npm run ios
   \`\`\`

### Android 模拟器

1. 安装 Android Studio

2. 创建 Android 虚拟设备 (AVD)
   - 打开 Android Studio
   - Tools → AVD Manager
   - Create Virtual Device
   - 选择设备型号（推荐 Pixel 5）
   - 下载系统镜像（推荐 Android 13）
   - 启动模拟器

3. 安装依赖并运行
   \`\`\`bash
   cd react-native-app
   npm install
   npm run android
   \`\`\`

---

## 故障排除

### 问题 1: "Command not found: expo"

解决方案：
\`\`\`bash
npm install -g expo-cli
\`\`\`

### 问题 2: Metro bundler 报错

解决方案：清除缓存
\`\`\`bash
npm start -- --clear
\`\`\`

### 问题 3: iOS 模拟器无法连接

解决方案：
\`\`\`bash
sudo xcode-select --switch /Applications/Xcode.app
\`\`\`

### 问题 4: 依赖安装失败

解决方案：
\`\`\`bash
rm -rf node_modules
rm package-lock.json
npm install
\`\`\`

---

## 目录结构说明

\`\`\`
react-native-app/
├── App.tsx                    # 主入口，包含导航和认证逻辑
├── src/screens/              # 所有页面组件
│   ├── LoginScreen.tsx       # 登录页
│   ├── EmployeeScreen.tsx    # 员工管理
│   ├── CategoryScreen.tsx    # 分类管理
│   └── DeviceScreen.tsx      # 设备管理
├── package.json              # 依赖配置
└── app.json                  # Expo 配置
\`\`\`

---

## 主要功能

✅ 用户登录（JWT Token）  
✅ 员工管理（增删改查）  
✅ 设备分类管理  
✅ 设备管理（关联分类）  
✅ 底部 Tab 导航  
✅ 表单验证  
✅ 删除确认  

---

## 下一步

1. 查看 `README.md` 了解完整文档
2. 阅读代码了解实现细节
3. 根据需求添加后端 API 集成
4. 自定义UI样式和主题

祝您开发愉快！🚀
