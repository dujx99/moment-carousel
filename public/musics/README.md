# 背景音乐配置说明

## 使用方法

将你的音乐文件（MP3 格式）放在这个文件夹下。

## 文件命名建议

建议使用以下命名方式：
- `music1.mp3`, `music2.mp3`, `music3.mp3` 等

## 配置文件位置

音乐列表配置文件位于：`src/config/musics.ts`

## 修改音乐列表

在 `src/config/musics.ts` 中修改音乐文件路径：

```typescript
export const musics = [
  '/musics/music1.mp3',
  '/musics/music2.mp3',
  '/musics/music3.mp3',
  // 添加更多音乐...
]
```

## 注意事项

1. 音乐文件必须是 MP3 格式
2. 文件路径以 `/musics/` 开头
3. 音乐会在页面加载后自动播放（如果浏览器允许）
4. 可以通过设置弹窗控制音乐播放/暂停和音量
