# STATUS

## 2026-10-27

- Перенесён логотип в `assets/icons/forma-logo.svg`.
- Собран каркас: Electron + Vite + React + TypeScript, Tailwind, shadcn/ui (Button), lucide-react.
- Токены в `src/styles/tokens.css`, окно с vibrancy/размытием на macOS.
- Раскладка: sidebar + main, режимы Design / IT.
- Проверено локально: `npm run build` ок, `npm run dev` поднимает Vite на :5173 и Electron.
- Этап 3: блок ввода промпта (`PromptInput`) внизу main, DropdownMenu моделей, Enter/Shift+Enter.
- PromptInput: размеры через токены и классы `.prompt-*` в CSS (dev JIT не отдавал кастомные Tailwind-утилиты).
- Этап 4: sidebar (Home/Code/Design, folders, профиль), экран Home с центрированным PromptInput.
- Правки макета: prompt 560px / 13px, чипы 24×11, send white/dark, отступ чата под папкой.
- Подгонка под макет: sidebar border/анимация, denser UI, cross-fade экранов, blur-меню, window frame.
