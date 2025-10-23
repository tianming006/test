# 单词学习网页项目

本项目包含一个用于背单词、练习测试和查看学习进度的单页网页应用。所有文件均位于仓库根目录，结构如下：

- `index.html`：网页入口文件，包含页面结构。
- `styles.css`：页面样式。
- `app.js`：页面交互逻辑。

## 如何打开网页

1. **直接在浏览器中打开**  
   在文件管理器或终端中找到仓库根目录（即当前文件夹）。双击 `index.html` 或者在终端执行相应命令：
   - macOS：`open index.html`
   - Windows：`start index.html`
   - Linux（使用默认浏览器）：`xdg-open index.html`

2. **通过本地开发服务器预览（推荐）**  
   在项目根目录运行：
   ```bash
   python3 -m http.server 8000
   ```
   然后在浏览器中访问 `http://localhost:8000/` 即可。网页会自动加载 `styles.css` 和 `app.js` 提供的样式与功能。

## 常见问题

- 如果浏览器没有显示样式或功能，请确认 `index.html`、`styles.css`、`app.js` 三个文件在同一目录下。
- 若使用本地服务器，确保命令在项目根目录执行，并留意终端是否提示端口被占用。

祝学习顺利！
