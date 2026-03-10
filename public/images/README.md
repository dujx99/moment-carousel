# 图片存放说明

## 📁 存放位置
请将所有图片文件存放在此文件夹：`public/images/`

## 🖼️ 支持的图片格式
- `.jpg` / `.jpeg`
- `.png`
- `.webp`
- `.gif`

## ⚙️ 配置说明
图片配置文件位于：`src/config/photos.ts`

配置方法（简化版）：
```typescript
export const photos = [
  '/images/你的图片1.jpg',
  '/images/你的图片2.jpg',
  '/images/你的图片3.jpg',
  // 继续添加更多图片...
]
```

## 🔄 使用步骤
1. 将图片文件复制到此文件夹
2. 在 `src/config/photos.ts` 中添加图片配置
3. 重新启动应用即可看到效果

## 📝 注意事项
图片文件名必须与配置中的 `src` 路径完全匹配