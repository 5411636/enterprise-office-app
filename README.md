# 企业办公管理系统 - React Native

基于人工专高复赛考题开发的企业级移动办公应用。

## 功能特性

### ✅ 已实现功能

1. **用户认证**
   - 登录功能（默认账号：admin / admin123）
   - JWT Token 本地存储（使用 AsyncStorage）
   - 退出登录

2. **员工管理模块**
   - 查看员工列表
   - 添加员工（姓名、年龄、邮箱）
   - 编辑员工信息
   - 删除员工
   - 数据校验：
     - 姓名：1-20字符
     - 年龄：18-60岁
     - 邮箱：格式验证

3. **设备分类管理**
   - 查看分类列表
   - 添加分类
   - 编辑分类
   - 删除分类（有设备时禁止删除）
   - 显示分类下设备数量
   - 查看分类设备（提示功能）

4. **设备管理**
   - 查看设备列表
   - 按分类筛选设备
   - 添加设备（名称、型号、所属分类）
   - 编辑设备信息
   - 删除设备
   - 分类关联显示

5. **UI/UX 特性**
   - 底部Tab导航
   - Material Design风格
   - 卡片式列表布局
   - 浮动操作按钮（FAB）
   - 模态框表单
   - 数据验证提示
   - 删除二次确认

## 技术栈

- **框架**: React Native (Expo)
- **导航**: React Navigation (Bottom Tabs)
- **状态管理**: React Hooks (useState)
- **本地存储**: AsyncStorage
- **图标**: Expo Vector Icons (Ionicons)
- **UI组件**: 
  - LinearGradient (登录页背景)
  - Picker (下拉选择器)
  - Modal (对话框)
  - FlatList (列表渲染)

## 安装步骤

### 前置要求

- Node.js 18+ 
- npm 或 yarn
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (macOS)
- Android: Android Studio

### 1. 安装依赖

\`\`\`bash
cd react-native-app
npm install
# 或
yarn install
\`\`\`

### 2. 启动开发服务器

\`\`\`bash
npm start
# 或
expo start
\`\`\`

### 3. 在设备上运行

**方式一：使用 Expo Go App（推荐初学者）**

1. 在手机上安装 Expo Go
   - iOS: App Store 搜索 "Expo Go"
   - Android: Google Play 搜索 "Expo Go"

2. 扫描终端显示的二维码

**方式二：使用模拟器**

iOS 模拟器：
\`\`\`bash
npm run ios
\`\`\`

Android 模拟器：
\`\`\`bash
npm run android
\`\`\`

## 项目结构

\`\`\`
react-native-app/
├── App.tsx                      # 主应用入口
├── src/
│   └── screens/
│       ├── LoginScreen.tsx      # 登录页面
│       ├── EmployeeScreen.tsx   # 员工管理
│       ├── CategoryScreen.tsx   # 设备分类管理
│       └── DeviceScreen.tsx     # 设备管理
├── package.json                 # 依赖配置
├── tsconfig.json               # TypeScript配置
├── app.json                    # Expo配置
└── babel.config.js             # Babel配置
\`\`\`

## 测试账号

- **用户名**: admin
- **密码**: admin123

## 数据说明

当前版本使用前端本地状态管理（useState），数据存储在内存中，应用重启后数据会重置。

如需持久化存储，可以：
1. 使用 AsyncStorage 存储 JSON 数据
2. 集成后端 API（参考文档中的 Python Flask/Sanic 方案）
3. 使用 SQLite 本地数据库

## 后续开发计划

### 待实现功能（基于考题要求）

1. **后端集成**
   - 连接 Python Flask/Sanic 后端
   - 实现真实的 JWT 认证
   - API 请求封装和拦截器

2. **高级功能**
   - 下拉刷新列表
   - 分页加载
   - 搜索功能
   - 数据统计图表

3. **性能优化**
   - 图片懒加载
   - 列表虚拟化优化
   - API 请求缓存

4. **错误处理**
   - 全局异常捕获
   - 网络错误提示
   - 离线模式

## 构建生产版本

### iOS (需要 macOS + Xcode)

\`\`\`bash
expo build:ios
\`\`\`

### Android

\`\`\`bash
expo build:android
\`\`\`

或使用 EAS Build:

\`\`\`bash
npm install -g eas-cli
eas build --platform android
eas build --platform ios
\`\`\`

## 常见问题

### Q: 找不到模块错误
A: 运行 \`expo install\` 或 \`npm install\` 重新安装依赖

### Q: Metro bundler 缓存问题
A: 运行 \`expo start -c\` 清除缓存

### Q: iOS 模拟器启动失败
A: 确保已安装 Xcode，并运行 \`sudo xcode-select --switch /Applications/Xcode.app\`

### Q: Android 模拟器连接问题
A: 确保 Android Studio 的模拟器正在运行

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue。
