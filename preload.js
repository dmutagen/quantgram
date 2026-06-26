const { ipcRenderer } = require('electron');

// ==========================================
// 1. WEB WORKER RPC CALLS INTERCEPTOR (DISABLED)
// ==========================================
// Native window.Worker is retained unintercepted for stability.

// ==========================================
// 2. CONFIGURATION DEFAULTS INITIALIZATION
// ==========================================
const configDefaults = {
  'quantgram-adblock': 'true',
  'quantgram-notif-enabled': 'true',
  'quantgram-notif-mode': 'all',
  'quantgram-notif-include': '',
  'quantgram-notif-exclude': '',
  'quantgram-notif-online': 'true',
  'quantgram-notif-typing': 'true',
  'quantgram-notif-pm': 'false',
  'quantgram-notif-group': 'false',
  'quantgram-notif-channel': 'false',
  'quantgram-notif-duration': '5',
  
  // 9 core features options
  'quantgram-compact-mode': 'false',
  'quantgram-focus-blur': 'false',
  'quantgram-custom-sound': 'true',
  'quantgram-notif-sound-type': 'chime',
  'quantgram-notif-volume': '80',
  'quantgram-app-icon': 'dark',
  'quantgram-translator-enabled': 'true',
  'quantgram-quickreplies-enabled': 'true',
  'quantgram-scratchpad-enabled': 'true',
  'quantgram-scratchpad-text': '',
  
  // AI assistant configurations
  'quantgram-ai-enabled': 'false',
  'quantgram-ai-provider': 'ollama',
  'quantgram-ai-endpoint': 'http://localhost:11434',
  'quantgram-ai-model': 'llama3',
  'quantgram-ai-key': '',
  'quantgram-ai-prompt': 'Вы — ИИ-ассистент Quantgram. Напишите краткую сводку (summary) последних сообщений диалога на русском языке. Сделайте упор на важные факты, вопросы и задачи.',
  'quantgram-ai-reply-prompt': 'Сгенерируйте один или два подходящих варианта краткого и вежливого ответа на последнее сообщение собеседника на основе контекста диалога на русском языке.',
  
  // Design & Typography
  'quantgram-custom-css-code': '',
  'quantgram-font': 'default',
  'quantgram-custom-font-name': 'Segoe UI'
};

Object.entries(configDefaults).forEach(([key, val]) => {
  if (localStorage.getItem(key) === null) {
    localStorage.setItem(key, val);
  }
});

// Setup default quick replies
if (localStorage.getItem('quantgram-quick-replies-list') === null) {
  const defaultReplies = [
    { text: "Привет!", key: "1" },
    { text: "Как дела?", key: "2" },
    { text: "Сейчас занят, отвечу позже.", key: "3" },
    { text: "Отличная идея!", key: "4" },
    { text: "Спасибо!", key: "5" }
  ];
  localStorage.setItem('quantgram-quick-replies-list', JSON.stringify(defaultReplies));
}

// ==========================================
// 3. MULTILINGUAL LOCALIZATION (i18n)
// ==========================================
const i18n = {
  ru: {
    menuItem: 'Настройки Quantgram',
    menuItemDesign: 'Настройки дизайна',
    menuItemHistory: 'История уведомлений',
    modalTitle: 'Панель управления Quantgram',
    tabPrivacy: 'Приватность',
    tabNotifications: 'Уведомления',
    tabInterface: 'Интерфейс',
    tabTools: 'Инструменты',
    
    // Privacy settings
    
    // Notifications settings
    notifTitle: 'Всплывающие уведомления',
    notifDesc: 'Показывать всплывающие toasts в углу экрана при событиях.',
    notifModeTitle: 'Режим фильтрации алертов',
    notifModeAll: 'Для всех (кроме списка исключений)',
    notifModeCustom: 'Только для избранных (список включения)',
    includeListLabel: 'Включить контакты (имена через запятую):',
    excludeListLabel: 'Исключить контакты (имена через запятую):',
    toastDurationLabel: 'Длительность показа уведомлений:',
    catTitle: 'Категории оповещений',
    catOnline: 'Вход контактов в онлайн',
    catTyping: 'Печатание контактов',
    catPm: 'Новые сообщения в ЛС',
    catGroup: 'Группы (без режима «не беспокоить»)',
    catChannel: 'Посты в каналах',
    customSoundTitle: 'Звуковые алерты',
    customSoundDesc: 'Проигрывать фирменный кибер-звук chime при уведомлениях.',
    
    // Interface settings
    blockAdsTitle: 'Блокировка спонсорских постов',
    blockAdsDesc: 'Автоматически удаляет рекламные посты в каналах.',
    focusBlurTitle: 'Защита фокуса (Blur on Blur)',
    focusBlurDesc: 'Размывает чаты и списки контактов при потере фокуса окна.',
    compactModeTitle: 'Компактный режим (Sidebar)',
    compactModeDesc: 'Делает окно узким, убирает сайдбары и закрепляет поверх других окон.',
    
    // Tools settings
    translatorTitle: 'Встроенный переводчик',
    translatorDesc: 'Кнопка перевода на лету при наведении курсора на сообщение.',
    quickRepliesTitle: 'Шаблоны быстрых ответов',
    quickRepliesDesc: 'Отображает настраиваемые кнопки-фразы над полем ввода.',
    quickRepliesEditLabel: 'Быстрые ответы (через запятую):',
    scratchpadTitle: 'Встроенный Блокнот',
    scratchpadDesc: 'Выдвижная боковая панель для хранения заметок и черновиков.',
    scratchpadPlaceholder: 'Напишите здесь свои заметки...',
    
    devLogsTitle: 'Диагностика',
    devLogsDesc: 'Включить консоль отладки и инструменты разработчика Chromium.',
    devConsoleBtn: 'Консоль разработчика',
    versionInfo: 'Клиент Quantgram v1.0.0 (Системный Electron)'
  },
  en: {
    menuItem: 'Quantgram Settings',
    menuItemDesign: 'Design Settings',
    menuItemHistory: 'Notification History',
    modalTitle: 'Quantgram Control Panel',
    tabPrivacy: 'Privacy',
    tabNotifications: 'Notifications',
    tabInterface: 'Interface',
    tabTools: 'Tools',
    
    // Privacy settings
    
    // Notifications settings
    notifTitle: 'Popup Toast Notifications',
    notifDesc: 'Display glassmorphic corner toasts on activities and messages.',
    notifModeTitle: 'Notification Filter Mode',
    notifModeAll: 'For all (except excluded list)',
    notifModeCustom: 'Only for selected (include list)',
    includeListLabel: 'Include list (comma-separated names):',
    excludeListLabel: 'Exclude list (comma-separated names):',
    toastDurationLabel: 'Notification toast duration:',
    catTitle: 'Notification Categories',
    catOnline: 'Contacts Online Status',
    catTyping: 'Contacts Typing Status',
    catPm: 'New Messages in PM',
    catGroup: 'Group Chats (unmuted only)',
    catChannel: 'New Posts in Channels',
    customSoundTitle: 'Notification Alerts Audio',
    customSoundDesc: 'Play signature custom chime sound synthesized via Web Audio.',
    
    // Interface settings
    blockAdsTitle: 'Block Sponsored Ads',
    blockAdsDesc: 'Hide advertisement messages in Telegram channels.',
    focusBlurTitle: 'Focus Protection (Blur on Blur)',
    focusBlurDesc: 'Blur messages and chat list whenever the app window loses focus.',
    compactModeTitle: 'Compact Mode (Sidebar Window)',
    compactModeDesc: 'Narrow layout size, collapse sidebar, and lock window on top.',
    
    // Tools settings
    translatorTitle: 'Inline Translator',
    translatorDesc: 'Adds a translate icon overlay when hovering message bubbles.',
    quickRepliesTitle: 'Quick Replies (Templates)',
    quickRepliesDesc: 'A bar of buttons above input field to quickly insert predefined text.',
    quickRepliesEditLabel: 'Edit Templates (comma-separated):',
    scratchpadTitle: 'Built-in Scratchpad',
    scratchpadDesc: 'A sliding notepad panel on the right side of the screen.',
    scratchpadPlaceholder: 'Type notes here...',
    
    devLogsTitle: 'Diagnostics',
    devLogsDesc: 'Expose Electron Developer tools console.',
    devConsoleBtn: 'Developer Console',
    versionInfo: 'Quantgram Client v1.0.0 (System Electron)'
  }
};

// ==========================================
// 4. LANGUAGE DETECTION
// ==========================================
function getLanguage() {
  const langs = navigator.languages || [navigator.language];
  for (let lang of langs) {
    const l = lang.toLowerCase().split('-')[0];
    if (['ru', 'uk', 'be', 'kk'].includes(l)) {
      return 'ru';
    }
  }
  const menuItemsText = Array.from(document.querySelectorAll('.MenuItem span, .left-menu-item span')).map(el => el.textContent);
  if (menuItemsText.some(text => ['Настройки', 'Контакти', 'Каналами', 'Обране', 'Мой профиль'].includes(text))) {
    return 'ru';
  }
  return 'en';
}

// ==========================================
// 5. STYLING INJECTION (Material 3 Expressive Android 17 style, NOT purple)
// ==========================================
const styleElement = document.createElement('style');
styleElement.textContent = `
  :root {
    --quantgram-accent: #a8c7fa; /* Soft Material 3 Blue */
    --quantgram-accent-glow: rgba(168, 199, 250, 0.15);
  }

  /* Custom Menu Item */
  .quantgram-menu-item {
    display: flex;
    align-items: center;
    padding: 12px 18px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 16px;
    transition: background-color 0.2s, color 0.2s;
    color: var(--color-text, #fff);
  }
  .quantgram-menu-item:hover {
    background-color: rgba(168, 199, 250, 0.08);
    color: var(--quantgram-accent, #a8c7fa);
  }
  .quantgram-menu-item-icon {
    margin-right: 16px;
    color: var(--quantgram-accent, #a8c7fa);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
  }
  
  /* Custom Settings Modal Backdrop */
  .quantgram-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(14, 13, 18, 0.65);
    backdrop-filter: blur(16px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-family: 'Roboto', system-ui, -apple-system, sans-serif;
  }
  
  /* Settings Modal Container (Material 3 Dark Theme Surface) */
  .quantgram-modal {
    background: #1c1b1f;
    color: #e6e1e5;
    width: 820px;
    max-width: 95vw;
    height: 600px;
    max-height: 85vh;
    border-radius: 28px;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
    animation: quantgram-fade-in 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
    overflow: hidden;
  }
  
  @keyframes quantgram-fade-in {
    from { opacity: 0; transform: scale(0.96) translateY(10px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  
  .quantgram-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 16px 24px;
    background: rgba(0, 0, 0, 0.15);
  }
  .quantgram-modal-header h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    color: var(--quantgram-accent, #a8c7fa);
  }
  .quantgram-modal-close {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #9ca3af;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s, transform 0.2s;
  }
  .quantgram-modal-close:hover {
    color: #fff;
    transform: rotate(90deg);
  }
  
  /* Sidebar and Scroll Layout */
  .quantgram-modal-sidebar {
    width: 200px;
    background: rgba(0, 0, 0, 0.15);
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    padding: 16px 8px;
    gap: 4px;
    overflow-y: auto;
    flex-shrink: 0;
  }
  
  .quantgram-sidebar-nav-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    background: transparent;
    border: none;
    color: #e6e1e5;
    padding: 10px 14px;
    border-radius: 12px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 13.5px;
    font-weight: 500;
  }
  .quantgram-sidebar-nav-btn:hover {
    background: rgba(255, 255, 255, 0.04);
    color: #fff;
  }
  .quantgram-sidebar-nav-btn.active {
    background: rgba(168, 199, 250, 0.15);
    color: var(--quantgram-accent, #a8c7fa);
  }
  .quantgram-sidebar-nav-btn svg {
    width: 18px;
    height: 18px;
    stroke: currentColor;
    stroke-width: 2.2;
    fill: none;
    flex-shrink: 0;
  }
  
  .quantgram-modal-main {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    padding: 16px 24px;
  }
  
  /* Settings Search Container */
  .quantgram-search-container {
    position: relative;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
  }
  .quantgram-search-container svg {
    position: absolute;
    left: 12px;
    width: 16px;
    height: 16px;
    color: #9ca3af;
    pointer-events: none;
  }
  .quantgram-search-input {
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 10px 12px 10px 38px;
    color: #fff;
    font-size: 13px;
    transition: all 0.2s;
    outline: none;
  }
  .quantgram-search-input:focus {
    border-color: var(--quantgram-accent, #a8c7fa);
    box-shadow: 0 0 0 2px rgba(168, 199, 250, 0.2);
    background: rgba(0, 0, 0, 0.3);
  }
  
  /* Scrollable Settings Scroll Area */
  .quantgram-settings-scroll-area {
    flex: 1;
    overflow-y: auto;
    padding-right: 6px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .quantgram-settings-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    scroll-margin-top: 10px;
  }
  
  .quantgram-section-title {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--quantgram-accent, #a8c7fa);
    border-left: 3px solid var(--quantgram-accent, #a8c7fa);
    padding-left: 8px;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  /* Material 3 Card Options */
  .quantgram-option-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    transition: background 0.2s, border-color 0.2s;
  }
  .quantgram-option-row:hover {
    background: rgba(255, 255, 255, 0.04);
    border-color: rgba(255, 255, 255, 0.1);
  }
  .quantgram-option-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-right: 12px;
  }
  .quantgram-option-title {
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .quantgram-option-desc {
    font-size: 11.5px;
    color: #9ca3af;
    line-height: 1.4;
  }
  
  /* Material 3 Pill Switches */
  .quantgram-switch {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 26px;
    flex-shrink: 0;
  }
  .quantgram-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .quantgram-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.08);
    transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 30px;
    border: 1.5px solid rgba(255, 255, 255, 0.15);
  }
  .quantgram-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 2.5px;
    background-color: #9ca3af;
    transition: .3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 50%;
  }
  input:checked + .quantgram-slider {
    background-color: rgba(168, 199, 250, 0.25);
    border-color: var(--quantgram-accent, #a8c7fa);
  }
  input:checked + .quantgram-slider:before {
    transform: translateX(20px);
    background-color: var(--quantgram-accent, #a8c7fa);
  }
  
  /* Material 3 Rounded Action Buttons */
  .quantgram-btn {
    background: var(--quantgram-accent, #a8c7fa);
    color: #1c1b1f;
    border: none;
    border-radius: 20px;
    padding: 8px 18px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  .quantgram-btn:hover {
    background: #c2e7ff;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }
  .quantgram-btn:active {
    transform: scale(0.98);
  }
  
  /* Custom Focus Blur Protection Styling */
  body.quantgram-blur-active .Message,
  body.quantgram-blur-active .message-bubble,
  body.quantgram-blur-active .ListItem-button,
  body.quantgram-blur-active .chat-item,
  body.quantgram-blur-active .title,
  body.quantgram-blur-active .name,
  body.quantgram-blur-active [class*="message"],
  body.quantgram-blur-active [class*="title"],
  body.quantgram-blur-active [class*="name"] {
    filter: blur(8px) !important;
    transition: filter 0.25s ease-out;
  }
  
  /* Inline Translator Button Overlays */
  .quantgram-translate-btn {
    position: absolute;
    right: 4px;
    top: 4px;
    opacity: 0;
    cursor: pointer;
    color: #9ca3af;
    background: rgba(28, 27, 31, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    z-index: 10;
  }
  .quantgram-translate-btn:hover {
    color: #1c1b1f;
    background: var(--quantgram-accent, #a8c7fa);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  }
  .message-content:hover .quantgram-translate-btn,
  .message-bubble:hover .quantgram-translate-btn,
  [class*="message-content"]:hover .quantgram-translate-btn {
    opacity: 1 !important;
  }
  body.quantgram-translator-disabled .quantgram-translate-btn {
    display: none !important;
  }
  


  /* Custom Scrollbar for settings areas */
  .quantgram-settings-scroll-area::-webkit-scrollbar,
  .quantgram-modal-sidebar::-webkit-scrollbar,
  .quantgram-history-list::-webkit-scrollbar,
  #quantgram-templates-editor-list::-webkit-scrollbar {
    width: 6px;
  }
  .quantgram-settings-scroll-area::-webkit-scrollbar-track,
  .quantgram-modal-sidebar::-webkit-scrollbar-track,
  .quantgram-history-list::-webkit-scrollbar-track,
  #quantgram-templates-editor-list::-webkit-scrollbar-track {
    background: transparent;
  }
  .quantgram-settings-scroll-area::-webkit-scrollbar-thumb,
  .quantgram-modal-sidebar::-webkit-scrollbar-thumb,
  .quantgram-history-list::-webkit-scrollbar-thumb,
  #quantgram-templates-editor-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 4px;
  }
  .quantgram-settings-scroll-area::-webkit-scrollbar-thumb:hover,
  .quantgram-modal-sidebar::-webkit-scrollbar-thumb:hover,
  .quantgram-history-list::-webkit-scrollbar-thumb:hover,
  #quantgram-templates-editor-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  /* Sub-header inside panels */
  .quantgram-sub-header {
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
    padding-bottom: 10px;
    margin-bottom: 12px;
  }
  .quantgram-back-btn {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 6px 12px;
    color: #fff;
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
  }
  .quantgram-back-btn:hover {
    background: rgba(168, 199, 250, 0.08);
    border-color: rgba(168, 199, 250, 0.2);
    color: var(--quantgram-accent, #a8c7fa);
  }
  .quantgram-back-btn svg {
    stroke: currentColor;
  }
  .quantgram-sub-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--quantgram-accent, #a8c7fa);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* Segmented Controls (No dropdown popups) */
  .quantgram-segmented {
    display: flex;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 2px;
    gap: 2px;
    width: fit-content;
  }
  .quantgram-segment-btn {
    background: transparent;
    border: none;
    color: #9ca3af;
    padding: 6px 12px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .quantgram-segment-btn.active {
    background: rgba(168, 199, 250, 0.15);
    color: var(--quantgram-accent, #a8c7fa);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05);
  }
  .quantgram-segment-btn:hover:not(.active) {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
  }
  .quantgram-segment-btn svg {
    stroke: currentColor;
    fill: none;
  }

  /* Notification History styles */
  .quantgram-history-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
  }
  .quantgram-history-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 14px;
    border: 1px solid rgba(255, 255, 255, 0.03);
    transition: background-color 0.2s;
  }
  .quantgram-history-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.02);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .quantgram-history-icon svg {
    stroke: currentColor;
  }
  .quantgram-history-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-grow: 1;
    overflow: hidden;
  }
  .quantgram-history-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .quantgram-history-title {
    font-size: 12.5px;
    font-weight: 700;
    color: #fff;
  }
  .quantgram-history-time {
    font-size: 10px;
    color: #9ca3af;
  }
  .quantgram-history-body {
    font-size: 11.5px;
    color: #d1d5db;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  /* Form control overrides for select and inputs */
  .quantgram-input, .quantgram-textarea {
    background: rgba(0, 0, 0, 0.45) !important;
    color: #fff !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 12px !important;
    padding: 10px 14px !important;
    font-size: 12px !important;
    outline: none !important;
    width: 100% !important;
    box-sizing: border-box !important;
    transition: border-color 0.2s, box-shadow 0.2s;
    font-family: inherit;
  }
  .quantgram-input:focus, .quantgram-textarea:focus {
    border-color: var(--quantgram-accent, #a8c7fa) !important;
    box-shadow: 0 0 8px rgba(168, 199, 250, 0.15) !important;
  }
  .quantgram-select {
    display: none !important; /* Replaced by segmented buttons */
  }

  /* AI Summary dialog animations & styles */
  @keyframes quantgram-fade-in {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes quantgram-rotate {
    100% { transform: rotate(360deg); }
  }
  .quantgram-spinner {
    animation: quantgram-rotate 1s linear infinite;
  }
`;

// ==========================================
// 6. SYNTHESIZED NOTIFICATION AUDIO (WEB AUDIO)
// ==========================================
let cachedCustomSoundData = null;

function playCustomSound(volumeVal) {
  try {
    const fs = require('fs');
    const path = require('path');
    if (!cachedCustomSoundData) {
      const soundPath = path.join(__dirname, 'assets/notification.wav');
      if (fs.existsSync(soundPath)) {
        const data = fs.readFileSync(soundPath);
        cachedCustomSoundData = `data:audio/wav;base64,${data.toString('base64')}`;
      }
    }
    if (cachedCustomSoundData) {
      const audio = new Audio(cachedCustomSoundData);
      audio.volume = volumeVal;
      audio.play().catch(e => console.error("Quantgram: play custom audio failed", e));
    }
  } catch (err) {
    console.error("Quantgram: failed to play custom sound", err);
  }
}

function playNotificationSound() {
  try {
    const isCustom = localStorage.getItem('quantgram-notif-sound-type') === 'custom';
    const volumeVal = parseInt(localStorage.getItem('quantgram-notif-volume') || '80', 10) / 100.0;
    
    if (isCustom) {
      playCustomSound(volumeVal);
    } else {
      // Synthesized chime
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      osc1.type = 'sine';
      osc2.type = 'sine';
      
      osc1.frequency.setValueAtTime(659.25, now);
      osc2.frequency.setValueAtTime(880.00, now + 0.08);
      
      gainNode.gain.setValueAtTime(0.12 * volumeVal, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);
    }
  } catch (err) {
    console.error("Quantgram: Audio chime play/synthesis failed", err);
  }
}

// ==========================================
// 7. TOAST POPUP NOTIFICATION SYSTEM
// ==========================================
let toastContainer = null;

function saveToNotifHistory(title, body, type) {
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('quantgram-notif-history') || '[]');
  } catch (e) {}
  if (!Array.isArray(history)) history = [];
  
  const timestamp = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  history.unshift({ title, body, type, time: timestamp });
  
  if (history.length > 50) {
    history = history.slice(0, 50);
  }
  localStorage.setItem('quantgram-notif-history', JSON.stringify(history));
}

function showToast(title, body, type = 'message') {
  const pos = localStorage.getItem('quantgram-notif-position') || 'top-right';
  const styleVal = localStorage.getItem('quantgram-notif-style') || 'glass';
  
  if (toastContainer) {
    let posCss = '';
    if (pos === 'top-right') posCss = 'top: 50px; right: 20px;';
    else if (pos === 'bottom-right') posCss = 'bottom: 20px; right: 20px; flex-direction: column-reverse;';
    else if (pos === 'top-left') posCss = 'top: 50px; left: 20px;';
    else if (pos === 'bottom-left') posCss = 'bottom: 20px; left: 20px; flex-direction: column-reverse;';
    
    toastContainer.style.cssText = `
      position: fixed;
      ${posCss}
      z-index: 10005;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      font-family: 'Outfit', system-ui, sans-serif;
    `;
  }
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'quantgram-toast-container';
    let posCss = '';
    if (pos === 'top-right') posCss = 'top: 50px; right: 20px;';
    else if (pos === 'bottom-right') posCss = 'bottom: 20px; right: 20px; flex-direction: column-reverse;';
    else if (pos === 'top-left') posCss = 'top: 50px; left: 20px;';
    else if (pos === 'bottom-left') posCss = 'bottom: 20px; left: 20px; flex-direction: column-reverse;';
    
    toastContainer.style.cssText = `
      position: fixed;
      ${posCss}
      z-index: 10005;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      font-family: 'Outfit', system-ui, sans-serif;
    `;
    document.body.appendChild(toastContainer);
  }
  
  // Log this alert event into history
  saveToNotifHistory(title, body, type);
  
  const toast = document.createElement('div');
  toast.className = 'quantgram-toast';
  
  let bgBorderCss = '';
  if (styleVal === 'glass') {
    bgBorderCss = `
      background: rgba(28, 27, 31, 0.75);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.10);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    `;
  } else if (styleVal === 'dark') {
    bgBorderCss = `
      background: #1c1b1f;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
    `;
  } else if (styleVal === 'glow') {
    bgBorderCss = `
      background: #1c1b1f;
      border: 1.5px solid var(--quantgram-accent, #a8c7fa);
      box-shadow: 0 0 12px rgba(168, 199, 250, 0.25);
    `;
  } else if (styleVal === 'minimal') {
    bgBorderCss = `
      background: #1c1b1f;
      border-left: 4px solid var(--quantgram-accent, #a8c7fa);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      border-right: 1px solid rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);
    `;
  }
  
  const isTop = pos.startsWith('top');
  const enterY = isTop ? '-20px' : '20px';
  
  toast.style.cssText = `
    ${bgBorderCss}
    color: #fff;
    border-radius: 14px;
    padding: 12px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 290px;
    pointer-events: auto;
    cursor: pointer;
    opacity: 0;
    transform: translateY(${enterY});
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  `;
  
  let iconSvg = '';
  if (type === 'online') {
    iconSvg = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    `;
  } else {
    iconSvg = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--quantgram-accent, #a8c7fa)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
  }
  
  let avatarUrl = null;
  let initials = '';
  
  try {
    const chatItems = Array.from(document.querySelectorAll('.ListItem-button, .chat-item, .chat-list-item, [class*="ListItem"]'));
    const targetItem = chatItems.find(el => {
      const titleEl = el.querySelector('.title, .chat-title, .name, [class*="title"], [class*="name"]');
      return titleEl && titleEl.textContent.trim().toLowerCase() === title.toLowerCase();
    });
    if (targetItem) {
      const img = targetItem.querySelector('img');
      if (img && img.src) {
        avatarUrl = img.src;
      }
    }
  } catch (e) {}
  
  if (!avatarUrl && title) {
    const words = title.trim().split(/\s+/);
    initials = words.map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
  
  const avatarHtml = avatarUrl 
    ? `<img src="${avatarUrl}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1.5px solid rgba(255, 255, 255, 0.08);" />`
    : `<div style="display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; background:rgba(168, 199, 250, 0.08); color:var(--quantgram-accent, #a8c7fa); font-weight:700; font-size:12px; border:1.5px solid rgba(168, 199, 250, 0.15); flex-shrink:0;">${initials || iconSvg}</div>`;
  
  toast.innerHTML = `
    ${avatarHtml}
    <div style="display:flex; flex-direction:column; gap:2px; overflow:hidden; flex-grow:1; margin-right:4px;">
      <span style="font-size:12.5px; font-weight:700; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${title}</span>
      <span style="font-size:11px; color:#9ca3af; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${body}</span>
    </div>
    <button class="quantgram-toast-close" style="background:none; border:none; color:#6b7280; cursor:pointer; padding:4px; margin-left:auto; display:flex; align-items:center; justify-content:center; border-radius:50%; transition:all 0.2s;" title="Close">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;
  
  if (localStorage.getItem('quantgram-custom-sound') === 'true') {
    playNotificationSound();
  }
  
  toast.addEventListener('click', () => {
    try {
      const chatItems = Array.from(document.querySelectorAll('.ListItem-button, .chat-item, .chat-list-item, [class*="ListItem"]'));
      const targetItem = chatItems.find(el => {
        const titleEl = el.querySelector('.title, .chat-title, .name, [class*="title"], [class*="name"]');
        return titleEl && titleEl.textContent.trim().toLowerCase() === title.toLowerCase();
      });
      if (targetItem) {
        targetItem.click();
      }
    } catch (e) {}
  });
  
  const closeBtn = toast.querySelector('.quantgram-toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      toast.style.opacity = '0';
      toast.style.transform = `translateY(${isTop ? '-10px' : '10px'}) scale(0.95)`;
      setTimeout(() => {
        toast.remove();
      }, 250);
    });
    
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.color = '#fff';
      closeBtn.style.background = 'rgba(255,255,255,0.08)';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.color = '#6b7280';
      closeBtn.style.background = 'none';
    });
  }
  
  toastContainer.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  
  const customDuration = parseInt(localStorage.getItem('quantgram-notif-duration') || '5', 10) * 1000;
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transform = `translateY(${isTop ? '-20px' : '20px'}) scale(0.95)`;
      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 300);
    }
  }, customDuration);
}

function getChatType(item) {
  const href = item.getAttribute('href');
  if (!href) return 'unknown';
  
  const match = href.match(/#(-)?\d+/);
  if (match) {
    const isNegative = match[1] === '-';
    if (!isNegative) {
      return 'pm';
    } else {
      const hasSender = item.querySelector('.sender-name, [class*="sender-name"]') !== null;
      if (hasSender) {
        return 'group';
      }
      return 'channel';
    }
  }
  return 'unknown';
}

// ==========================================
// 8. BACKGROUND NOTIFICATION SCRAPERS & SCANNERS
// ==========================================
let onlineUsers = new Set();
let typingUsers = new Set();
let unreadCounts = {};
let isFirstRun = true;

function getUnreadCount(item) {
  const shownElements = item.querySelectorAll('.shown, [class*="shown"], .open, [class*="open"]');
  for (let el of shownElements) {
    const span = el.querySelector('span');
    if (span) {
      const text = span.textContent.trim();
      if (/^\d+$/.test(text)) {
        return parseInt(text) || 0;
      }
    }
  }
  return 0;
}

function checkNotifications() {
  const isNotificationEnabled = localStorage.getItem('quantgram-notif-enabled') !== 'false';
  if (!isNotificationEnabled) return;
  
  const notifMode = localStorage.getItem('quantgram-notif-mode') || 'all';
  const excludeText = localStorage.getItem('quantgram-notif-exclude') || '';
  const includeText = localStorage.getItem('quantgram-notif-include') || '';
  
  const notifOnlineEnabled = localStorage.getItem('quantgram-notif-online') === 'true';
  const notifTypingEnabled = localStorage.getItem('quantgram-notif-typing') === 'true';
  const notifPmEnabled = localStorage.getItem('quantgram-notif-pm') === 'true';
  const notifGroupEnabled = localStorage.getItem('quantgram-notif-group') === 'true';
  const notifChannelEnabled = localStorage.getItem('quantgram-notif-channel') === 'true';
  
  const excludeList = excludeText.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
  const includeList = includeText.split(',').map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
  
  const items = document.querySelectorAll('.ListItem-button, .chat-item, .chat-list-item, [class*="chat-item"], [class*="ListItem"]');
  
  items.forEach(item => {
    const titleEl = item.querySelector('.title, .chat-title, .name, [class*="title"], [class*="name"]');
    if (!titleEl) return;
    const name = titleEl.textContent.trim();
    const nameLower = name.toLowerCase();
    
    let isTarget = false;
    if (notifMode === 'all') {
      isTarget = true;
      if (excludeList.some(ex => nameLower.includes(ex))) {
        isTarget = false;
      }
    } else if (notifMode === 'custom') {
      isTarget = false;
      if (includeList.some(inc => nameLower.includes(inc))) {
        isTarget = true;
      }
    }
    
    if (!isTarget) return;
    
    const chatType = getChatType(item);
    const isMuted = item.querySelector('.icon-muted, [class*="icon-muted"]') !== null;
    
    // A. Online status alerts
    if (chatType === 'pm' && notifOnlineEnabled) {
      const onlineEl = item.querySelector('.avatar-online-shown');
      const isOnlineNow = onlineEl !== null;
      
      if (isOnlineNow) {
        if (!onlineUsers.has(name)) {
          if (!isFirstRun) {
            showToast(name, getLanguage() === 'ru' ? 'сейчас в сети' : 'is now online', 'online');
          }
          onlineUsers.add(name);
        }
      } else {
        onlineUsers.delete(name);
      }
    }
    
    // B. Typing status alerts
    const isTypingAllowed = (chatType === 'pm' || (chatType === 'group' && !isMuted));
    if (isTypingAllowed && notifTypingEnabled) {
      const typingEl = item.querySelector('.typing-status');
      const isTypingNow = typingEl !== null;
      
      if (isTypingNow) {
        const typingText = typingEl.textContent.trim();
        const typingKey = `${name}_${typingText}`;
        if (!typingUsers.has(typingKey)) {
          for (let key of typingUsers) {
            if (key.startsWith(name + '_')) {
              typingUsers.delete(key);
            }
          }
          if (!isFirstRun) {
            showToast(name, typingText + '...', 'message');
          }
          typingUsers.add(typingKey);
        }
      } else {
        for (let key of typingUsers) {
          if (key.startsWith(name + '_')) {
            typingUsers.delete(key);
          }
        }
      }
    }
    
    // C. Message Notifications counts
    let isMessageNotifAllowed = false;
    if (chatType === 'pm' && notifPmEnabled) {
      isMessageNotifAllowed = true;
    } else if (chatType === 'group' && notifGroupEnabled && !isMuted) {
      isMessageNotifAllowed = true;
    } else if (chatType === 'channel' && notifChannelEnabled && !isMuted) {
      isMessageNotifAllowed = true;
    }
    
    const unreadCount = getUnreadCount(item);
    const prevCount = unreadCounts[name] || 0;
    
    if (unreadCount > prevCount) {
      if (!isFirstRun && isMessageNotifAllowed) {
        const msgEl = item.querySelector('.last-message-summary, .last-message, [class*="last-message"]');
        let text = '';
        if (chatType === 'group') {
          const senderEl = item.querySelector('.sender-name, [class*="sender-name"]');
          const senderName = senderEl ? senderEl.textContent.trim() : '';
          const msgText = msgEl ? msgEl.textContent.trim() : '';
          text = senderName ? `${senderName}: ${msgText}` : msgText;
        } else {
          text = msgEl ? msgEl.textContent.replace(/^(Вы:|You:|Вы\s*:\s*|You\s*:\s*)/i, '').trim() : '';
        }
        showToast(name, text || (getLanguage() === 'ru' ? 'Новое сообщение' : 'New message'), 'message');
      }
    }
    unreadCounts[name] = unreadCount;
  });
  
  isFirstRun = false;
}



// ==========================================
// 10. RETRACTABLE BUILT-IN SCRATCHPAD
// ==========================================
let scratchpadTrigger = null;
let scratchpadDrawer = null;

function applyScratchpadSettings() {
  const isEnabled = localStorage.getItem('quantgram-scratchpad-enabled') === 'true';
  
  if (isEnabled) {
    if (!scratchpadTrigger) {
      scratchpadTrigger = document.createElement('div');
      scratchpadTrigger.className = 'quantgram-scratchpad-trigger';
      scratchpadTrigger.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      `;
      scratchpadTrigger.style.cssText = `
        position: fixed;
        right: 20px;
        bottom: 80px;
        width: 44px;
        height: 44px;
        background: var(--quantgram-accent, #a8c7fa);
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 9998;
        color: #1c1b1f;
        transition: transform 0.2s ease, background-color 0.2s;
      `;
      scratchpadTrigger.addEventListener('mouseenter', () => {
        scratchpadTrigger.style.transform = 'scale(1.08)';
      });
      scratchpadTrigger.addEventListener('mouseleave', () => {
        scratchpadTrigger.style.transform = 'scale(1)';
      });
      scratchpadTrigger.addEventListener('click', toggleScratchpad);
      document.body.appendChild(scratchpadTrigger);
    } else {
      scratchpadTrigger.style.display = 'flex';
    }
    
    if (!scratchpadDrawer) {
      scratchpadDrawer = document.createElement('div');
      scratchpadDrawer.className = 'quantgram-scratchpad-drawer';
      scratchpadDrawer.style.cssText = `
        position: fixed;
        top: 0;
        right: -320px;
        width: 300px;
        height: 100vh;
        background: rgba(28, 27, 31, 0.85);
        backdrop-filter: blur(15px);
        border-left: 1px solid rgba(255, 255, 255, 0.08);
        z-index: 9999;
        transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        color: #fff;
        box-sizing: border-box;
      `;
      
      const lang = getLanguage();
      const t = i18n[lang] || i18n.en;
      
      scratchpadDrawer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:10px;">
          <h3 style="margin:0; font-size:16px; font-weight:500; color:var(--quantgram-accent, #a8c7fa);">${t.scratchpadTitle}</h3>
          <button id="quantgram-scratchpad-close" style="background:transparent; border:none; color:#9ca3af; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:color 0.2s;">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <textarea id="quantgram-scratchpad-textarea" class="quantgram-textarea" placeholder="${t.scratchpadPlaceholder}" style="flex-grow:1; resize:none; line-height:1.5;"></textarea>
      `;
      
      document.body.appendChild(scratchpadDrawer);
      
      const textarea = scratchpadDrawer.querySelector('#quantgram-scratchpad-textarea');
      textarea.value = localStorage.getItem('quantgram-scratchpad-text') || '';
      textarea.addEventListener('input', (e) => {
        localStorage.setItem('quantgram-scratchpad-text', e.target.value);
      });
      
      scratchpadDrawer.querySelector('#quantgram-scratchpad-close').addEventListener('click', () => {
        scratchpadDrawer.classList.remove('open');
        scratchpadDrawer.style.right = '-320px';
      });
    }
  } else {
    if (scratchpadTrigger) scratchpadTrigger.style.display = 'none';
    if (scratchpadDrawer) {
      scratchpadDrawer.classList.remove('open');
      scratchpadDrawer.style.right = '-320px';
    }
  }
}

function toggleScratchpad() {
  if (!scratchpadDrawer) return;
  const isOpen = scratchpadDrawer.classList.contains('open');
  if (isOpen) {
    scratchpadDrawer.classList.remove('open');
    scratchpadDrawer.style.right = '-320px';
  } else {
    scratchpadDrawer.classList.add('open');
    scratchpadDrawer.style.right = '0';
    const textarea = scratchpadDrawer.querySelector('#quantgram-scratchpad-textarea');
    if (textarea) textarea.focus();
  }
}

// ==========================================
// 11. INLINE TRANSLATOR
// ==========================================
function applyTranslatorSettings() {
  const isEnabled = localStorage.getItem('quantgram-translator-enabled') === 'true';
  if (isEnabled) {
    document.body.classList.remove('quantgram-translator-disabled');
  } else {
    document.body.classList.add('quantgram-translator-disabled');
  }
}

async function translateText(text, targetLang = 'ru') {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data && data[0]) {
    return data[0].map(x => x[0]).join('');
  }
  throw new Error('Translation API error');
}

function injectTranslatorButtons() {
  const allElements = Array.from(document.querySelectorAll('.message-content, .message-bubble, [class*="message-content"], .Message .message-text'));
  const bubbles = allElements.filter(el => {
    return !allElements.some(other => other !== el && other.contains(el));
  });

  bubbles.forEach(bubble => {
    if (bubble.querySelector('.quantgram-translate-btn') || bubble.classList.contains('quantgram-translate-injected')) return;
    bubble.classList.add('quantgram-translate-injected');
    
    const btn = document.createElement('div');
    btn.className = 'quantgram-translate-btn';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    `;
    
    const computedStyle = window.getComputedStyle(bubble);
    if (computedStyle.position === 'static') {
      bubble.style.position = 'relative';
    }
    
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (bubble.querySelector('.quantgram-translated-text')) return;
      
      const clone = bubble.cloneNode(true);
      const toRemove = clone.querySelectorAll('.quantgram-translate-btn, .quantgram-translated-text, .time, .message-time, [class*="time"], [class*="status"]');
      toRemove.forEach(el => el.remove());
      const text = clone.textContent.trim();
      
      if (!text) return;
      
      btn.innerHTML = `<span style="font-size:8px; font-weight:bold; color: #fff;">...</span>`;
      
      try {
        const hasCyrillic = /[а-яё]/i.test(text);
        const targetLang = hasCyrillic ? 'en' : 'ru';
        const translated = await translateText(text, targetLang);
        
        const transDiv = document.createElement('div');
        transDiv.className = 'quantgram-translated-text';
        transDiv.style.cssText = `
          font-size: 11px;
          color: var(--quantgram-accent, #a8c7fa);
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          margin-top: 6px;
          padding-top: 4px;
          font-style: italic;
          user-select: text;
          text-align: left;
        `;
        transDiv.innerHTML = `<span style="display:inline-flex; align-items:center; gap:5px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg><span>${translated}</span></span>`;
        bubble.appendChild(transDiv);
        btn.remove();
      } catch (err) {
        console.error("Quantgram: translation failed", err);
        btn.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        setTimeout(() => {
          btn.innerHTML = `
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          `;
        }, 2000);
      }
    });
    bubble.appendChild(btn);
  });
}

// ==========================================
// 12. QUICK REPLIES (TEMPLATES BAR)
// ==========================================
function applyQuickRepliesSettings() {
  const isEnabled = localStorage.getItem('quantgram-quickreplies-enabled') === 'true';
  const old = document.querySelector('.quantgram-quick-replies');
  if (!isEnabled && old) old.remove();
}

function injectQuickReplies() {
  const isEnabled = localStorage.getItem('quantgram-quickreplies-enabled') === 'true';
  if (!isEnabled) return;
  
  const inputArea = document.querySelector('.MessageInput, .chat-input, [class*="MessageInput"]');
  if (!inputArea || inputArea.querySelector('.quantgram-quick-replies')) return;
  
  const container = document.createElement('div');
  container.className = 'quantgram-quick-replies';
  container.style.cssText = `
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    overflow-x: auto;
    background: rgba(168, 199, 250, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    width: 100%;
    box-sizing: border-box;
    align-items: center;
  `;
  
  let templates = [];
  try {
    templates = JSON.parse(localStorage.getItem('quantgram-quick-replies-list')) || [];
  } catch (e) {}
  
  if (!Array.isArray(templates) || templates.length === 0) {
    templates = [
      { text: "Привет!", key: "1" },
      { text: "Как дела?", key: "2" },
      { text: "Сейчас занят, отвечу позже.", key: "3" },
      { text: "Отличная идея!", key: "4" },
      { text: "Спасибо!", key: "5" }
    ];
  } else {
    templates = templates.map((item, idx) => {
      if (typeof item === 'string') {
        return { text: item, key: idx < 9 ? String(idx + 1) : '' };
      }
      if (item && typeof item === 'object') {
        return { text: item.text || '', key: item.key || '' };
      }
      return { text: '', key: '' };
    }).filter(item => item.text);
  }
  
  templates.forEach((item) => {
    if (!item.text) return;
    const btn = document.createElement('button');
    btn.className = 'quantgram-quick-reply-btn';
    const shortcut = item.key ? ` (Alt+${item.key.toUpperCase()})` : '';
    btn.textContent = item.text + shortcut;
    btn.style.cssText = `
      background: rgba(168, 199, 250, 0.08);
      color: var(--quantgram-accent, #a8c7fa);
      border: 1px solid rgba(168, 199, 250, 0.2);
      border-radius: 12px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
    `;
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(168, 199, 250, 0.15)';
      btn.style.borderColor = 'var(--quantgram-accent, #a8c7fa)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(168, 199, 250, 0.08)';
      btn.style.borderColor = 'rgba(168, 199, 250, 0.2)';
    });
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      insertTextIntoInput(item.text);
    });
    container.appendChild(btn);
  });
  
  container.style.cssText = `
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    overflow-x: auto;
    background: rgba(168, 199, 250, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    width: 100%;
    box-sizing: border-box;
    align-items: center;
  `;
  container.className = 'quantgram-quick-replies';
  inputArea.insertBefore(container, inputArea.firstChild);
}

function insertTextIntoInput(text) {
  const header = document.querySelector('.MiddleHeader, [class*="MiddleHeader"], .chat-header');
  const titleEl = header ? header.querySelector('.title, .name, [class*="title"], [class*="name"]') : null;
  const chatName = titleEl ? titleEl.textContent.trim() : "";
  const processedText = text.replace(/{name}/gi, chatName || "");
  
  const inputEl = document.querySelector('.Middle [contenteditable="true"], .MessageInput [contenteditable="true"], [contenteditable="true"], textarea');
  if (inputEl) {
    inputEl.focus();
    try {
      document.execCommand('insertText', false, processedText);
    } catch (e) {
      inputEl.textContent += processedText;
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

function showSettingsModal(defaultTab = null) {
  if (document.getElementById('quantgram-modal-backdrop')) {
    if (defaultTab) {
      const scrollArea = document.querySelector('.quantgram-settings-scroll-area');
      const sec = document.getElementById(`sec-${defaultTab}`);
      if (scrollArea && sec) {
        scrollArea.scrollTo({
          top: sec.offsetTop - scrollArea.offsetTop,
          behavior: 'smooth'
        });
        const navBtns = document.querySelectorAll('.quantgram-sidebar-nav-btn');
        const activeBtn = document.querySelector(`.quantgram-sidebar-nav-btn[data-target="${defaultTab}"]`);
        if (activeBtn) {
          navBtns.forEach(b => b.classList.remove('active'));
          activeBtn.classList.add('active');
        }
      }
      if (defaultTab === 'history') renderNotificationHistory();
    }
    return;
  }
  
  const lang = getLanguage();
  const text = i18n[lang] || i18n.en;
  
  let logoBase64 = '';
  try {
    const fs = require('fs');
    const path = require('path');
    const logoPath = path.join(__dirname, 'assets/icon_dark.png');
    if (fs.existsSync(logoPath)) {
      logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;
    }
  } catch (e) {
    console.error("Failed to load icon_dark.png", e);
  }
  
  const backdrop = document.createElement('div');
  backdrop.id = 'quantgram-modal-backdrop';
  backdrop.className = 'quantgram-modal-backdrop';
  
  const modal = document.createElement('div');
  modal.className = 'quantgram-modal';
  
  // Read config settings
  const adBlockEnabled = localStorage.getItem('quantgram-adblock') === 'true';
  const notifEnabled = localStorage.getItem('quantgram-notif-enabled') !== 'false';
  const notifMode = localStorage.getItem('quantgram-notif-mode') || 'all';
  const includeText = localStorage.getItem('quantgram-notif-include') || '';
  const excludeText = localStorage.getItem('quantgram-notif-exclude') || '';
  const notifOnline = localStorage.getItem('quantgram-notif-online') === 'true';
  const notifTyping = localStorage.getItem('quantgram-notif-typing') === 'true';
  const notifPm = localStorage.getItem('quantgram-notif-pm') === 'true';
  const notifGroup = localStorage.getItem('quantgram-notif-group') === 'true';
  const notifChannel = localStorage.getItem('quantgram-notif-channel') === 'true';
  const notifDuration = localStorage.getItem('quantgram-notif-duration') || '5';
  const notifStyle = localStorage.getItem('quantgram-notif-style') || 'glass';
  const notifPosition = localStorage.getItem('quantgram-notif-position') || 'top-right';
  
  const compactMode = localStorage.getItem('quantgram-compact-mode') === 'true';
  const focusBlur = localStorage.getItem('quantgram-focus-blur') === 'true';
  const customSound = localStorage.getItem('quantgram-custom-sound') === 'true';
  const soundType = localStorage.getItem('quantgram-notif-sound-type') || 'chime';
  const soundVolume = localStorage.getItem('quantgram-notif-volume') || '80';
  const appIconTheme = localStorage.getItem('quantgram-app-icon') || 'dark';
  const translatorEnabled = localStorage.getItem('quantgram-translator-enabled') === 'true';
  const quickrepliesEnabled = localStorage.getItem('quantgram-quickreplies-enabled') === 'true';
  
  // AI, CSS and Font settings
  const aiEnabled = localStorage.getItem('quantgram-ai-enabled') === 'true';
  const aiProvider = localStorage.getItem('quantgram-ai-provider') || 'ollama';
  const aiEndpoint = localStorage.getItem('quantgram-ai-endpoint') || 'http://localhost:11434';
  const aiModel = localStorage.getItem('quantgram-ai-model') || 'llama3';
  const aiKey = localStorage.getItem('quantgram-ai-key') || '';
  const aiPrompt = localStorage.getItem('quantgram-ai-prompt') || 'Вы — ИИ-ассистент Quantgram. Напишите краткую сводку (summary) последних сообщений диалога на русском языке. Сделайте упор на важные факты, вопросы и задачи.';
  
  const fontFamily = localStorage.getItem('quantgram-font') || 'default';
  const customFontName = localStorage.getItem('quantgram-custom-font-name') || 'Segoe UI';
  const customCssCode = localStorage.getItem('quantgram-custom-css-code') || '';
  
  let quickRepliesList = [];
  try {
    quickRepliesList = JSON.parse(localStorage.getItem('quantgram-quick-replies-list'));
  } catch(e) {}
  const quickRepliesText = Array.isArray(quickRepliesList) ? quickRepliesList.join(', ') : '';
  
  const scratchpadEnabled = localStorage.getItem('quantgram-scratchpad-enabled') === 'true';
  
  modal.innerHTML = `
    <div class="quantgram-modal-header">
      <h3>${text.modalTitle}</h3>
      <button class="quantgram-modal-close" id="quantgram-modal-close-btn" title="Close">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <div class="quantgram-modal-body" style="padding: 0; display: flex; flex-direction: row; height: 520px; overflow: hidden;">
      <!-- Left Column: Sidebar -->
      <div class="quantgram-modal-sidebar">
        <button class="quantgram-sidebar-nav-btn active" data-target="privacy">
          <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          <span>${text.tabPrivacy}</span>
        </button>
        <button class="quantgram-sidebar-nav-btn" data-target="notifications">
          <svg viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          <span>${text.tabNotifications}</span>
        </button>
        <button class="quantgram-sidebar-nav-btn" data-target="interface">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
          <span>${lang === 'ru' ? 'Дизайн' : 'Design'}</span>
        </button>
        <button class="quantgram-sidebar-nav-btn" data-target="tools">
          <svg viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
          <span>${text.tabTools}</span>
        </button>
        <button class="quantgram-sidebar-nav-btn" data-target="history">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>${lang === 'ru' ? 'История' : 'History'}</span>
        </button>
        <button class="quantgram-sidebar-nav-btn" data-target="backup">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          <span>${lang === 'ru' ? 'Бэкап' : 'Backup'}</span>
        </button>
        <button class="quantgram-sidebar-nav-btn" data-target="about">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
          <span>${lang === 'ru' ? 'О клиенте' : 'About'}</span>
        </button>
      </div>

      <!-- Right Column: Main Content -->
      <div class="quantgram-modal-main">
        <!-- Search bar at top -->
        <div class="quantgram-search-container">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="quantgram-settings-search" class="quantgram-search-input" placeholder="${lang === 'ru' ? 'Поиск настроек...' : 'Search settings...'}">
        </div>

        <div class="quantgram-settings-scroll-area">
          <!-- 1. PRIVACY SECTION -->
          <div class="quantgram-settings-section" id="sec-privacy">
            <h4 class="quantgram-section-title">${text.tabPrivacy}</h4>
            
            <!-- Block Sponsored ads -->
            <div class="quantgram-option-row">
              <div class="quantgram-option-info">
                <span class="quantgram-option-title">${text.blockAdsTitle}</span>
                <span class="quantgram-option-desc">${text.blockAdsDesc}</span>
              </div>
              <label class="quantgram-switch">
                <input type="checkbox" id="chk-block-ads" ${adBlockEnabled ? 'checked' : ''}>
                <span class="quantgram-slider"></span>
              </label>
            </div>

            <!-- Blur Protection focus -->
            <div class="quantgram-option-row">
              <div class="quantgram-option-info">
                <span class="quantgram-option-title">${text.focusBlurTitle}</span>
                <span class="quantgram-option-desc">${text.focusBlurDesc}</span>
              </div>
              <label class="quantgram-switch">
                <input type="checkbox" id="chk-focus-blur" ${focusBlur ? 'checked' : ''}>
                <span class="quantgram-slider"></span>
              </label>
            </div>
          </div>

          <!-- 2. NOTIFICATIONS SECTION -->
          <div class="quantgram-settings-section" id="sec-notifications">
            <h4 class="quantgram-section-title">${text.tabNotifications}</h4>

            <!-- Audio alert chime -->
            <div class="quantgram-option-row" style="flex-direction: column; align-items: stretch; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div class="quantgram-option-info">
                  <span class="quantgram-option-title">${text.customSoundTitle}</span>
                  <span class="quantgram-option-desc">${text.customSoundDesc}</span>
                </div>
                <label class="quantgram-switch">
                  <input type="checkbox" id="chk-custom-sound" ${customSound ? 'checked' : ''}>
                  <span class="quantgram-slider"></span>
                </label>
              </div>
              
              <div id="quantgram-sound-options" style="display: ${customSound ? 'flex' : 'none'}; flex-direction: column; gap: 10px; padding: 10px; margin-top: 4px; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px dashed rgba(255, 255, 255, 0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                  <span style="font-size: 12px; color: #fff;">${lang === 'ru' ? 'Выбор звука:' : 'Sound Type:'}</span>
                  <div class="quantgram-segmented" id="seg-sound-type">
                    <button class="quantgram-segment-btn ${soundType === 'chime' ? 'active' : ''}" data-val="chime">
                      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5v14M22 9v6M7 8v8M2 10v4"></path></svg>
                      <span>${lang === 'ru' ? 'Синтез' : 'Synth'}</span>
                    </button>
                    <button class="quantgram-segment-btn ${soundType === 'custom' ? 'active' : ''}" data-val="custom">
                      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                      <span>${lang === 'ru' ? 'Файл .wav' : 'Custom file'}</span>
                    </button>
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: #fff;">${lang === 'ru' ? 'Громкость:' : 'Volume:'}</span>
                    <span id="quantgram-volume-label" style="font-size: 12px; color: var(--quantgram-accent, #a8c7fa); font-weight: 700;">${soundVolume}%</span>
                  </div>
                  <input type="range" id="ipt-sound-volume" min="0" max="100" value="${soundVolume}" style="width: 100%; accent-color: var(--quantgram-accent, #a8c7fa); cursor: pointer; background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; outline: none; border: none; padding: 0;">
                </div>
              </div>
            </div>

            <!-- Popup Notifications Module -->
            <div class="quantgram-option-row" style="flex-direction: column; align-items: stretch; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div class="quantgram-option-info">
                  <span class="quantgram-option-title">${text.notifTitle}</span>
                  <span class="quantgram-option-desc">${text.notifDesc}</span>
                </div>
                <label class="quantgram-switch">
                  <input type="checkbox" id="chk-notif-enabled" ${notifEnabled ? 'checked' : ''}>
                  <span class="quantgram-slider"></span>
                </label>
              </div>
              
              <div id="quantgram-notif-options" style="display: ${notifEnabled ? 'flex' : 'none'}; flex-direction: column; gap: 10px; padding: 10px; margin-top: 4px; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px dashed rgba(255, 255, 255, 0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                  <span style="font-size: 13px; font-weight: 600; color: #fff;">${text.notifModeTitle}</span>
                  <div class="quantgram-segmented" id="seg-notif-mode">
                    <button class="quantgram-segment-btn ${notifMode === 'all' ? 'active' : ''}" data-val="all">
                      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"></path></svg>
                      <span>${lang === 'ru' ? 'Для всех' : 'For all'}</span>
                    </button>
                    <button class="quantgram-segment-btn ${notifMode === 'custom' ? 'active' : ''}" data-val="custom">
                      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                      <span>${lang === 'ru' ? 'Списки' : 'Selected'}</span>
                    </button>
                  </div>
                </div>
                
                <div id="div-notif-include" style="display: ${notifMode === 'custom' ? 'flex' : 'none'}; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; color: #9ca3af;">${text.includeListLabel}</span>
                  <input type="text" id="ipt-notif-include" class="quantgram-input" value="${includeText}" placeholder="Egor, @username, ...">
                </div>
                
                <div id="div-notif-exclude" style="display: ${notifMode === 'all' ? 'flex' : 'none'}; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; color: #9ca3af;">${text.excludeListLabel}</span>
                  <input type="text" id="ipt-notif-exclude" class="quantgram-input" value="${excludeText}" placeholder="John, @bot, ...">
                </div>

                <!-- Toast Notification Duration slider -->
                <div style="display: flex; flex-direction: column; gap: 4px; border-top: 1px dashed rgba(255, 255, 255, 0.08); padding-top: 8px; margin-top: 4px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: #fff;">${text.toastDurationLabel}</span>
                    <span id="quantgram-duration-label" style="font-size: 12px; color: var(--quantgram-accent, #a8c7fa); font-weight: 700;">${notifDuration} ${lang === 'ru' ? 'сек' : 'sec'}</span>
                  </div>
                  <input type="range" id="ipt-notif-duration" min="1" max="15" value="${notifDuration}" style="width: 100%; accent-color: var(--quantgram-accent, #a8c7fa); cursor: pointer; background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; outline: none; border: none; padding: 0;">
                </div>

                <!-- Toast Notification Style -->
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; border-top: 1px dashed rgba(255, 255, 255, 0.08); padding-top: 8px; margin-top: 4px;">
                  <span style="font-size: 12px; color: #fff;">${lang === 'ru' ? 'Стиль:' : 'Style:'}</span>
                  <div class="quantgram-segmented" id="seg-notif-style">
                    <button class="quantgram-segment-btn ${notifStyle === 'glass' ? 'active' : ''}" data-val="glass">Glass</button>
                    <button class="quantgram-segment-btn ${notifStyle === 'dark' ? 'active' : ''}" data-val="dark">Dark</button>
                    <button class="quantgram-segment-btn ${notifStyle === 'glow' ? 'active' : ''}" data-val="glow">Neon</button>
                    <button class="quantgram-segment-btn ${notifStyle === 'minimal' ? 'active' : ''}" data-val="minimal">Min</button>
                  </div>
                </div>

                <!-- Toast Notification Position -->
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; border-top: 1px dashed rgba(255, 255, 255, 0.08); padding-top: 8px; margin-top: 4px;">
                  <span style="font-size: 12px; color: #fff;">${lang === 'ru' ? 'Позиция:' : 'Position:'}</span>
                  <div class="quantgram-segmented" id="seg-notif-position" style="flex-wrap: wrap; gap: 2px;">
                    <button class="quantgram-segment-btn ${notifPosition === 'top-right' ? 'active' : ''}" data-val="top-right">Top-R</button>
                    <button class="quantgram-segment-btn ${notifPosition === 'bottom-right' ? 'active' : ''}" data-val="bottom-right">Bot-R</button>
                    <button class="quantgram-segment-btn ${notifPosition === 'top-left' ? 'active' : ''}" data-val="top-left">Top-L</button>
                    <button class="quantgram-segment-btn ${notifPosition === 'bottom-left' ? 'active' : ''}" data-val="bottom-left">Bot-L</button>
                  </div>
                </div>
      
                <!-- Category Specific Notification Toggles -->
                <div style="display: flex; flex-direction: column; gap: 8px; border-top: 1px dashed rgba(255, 255, 255, 0.08); padding-top: 8px; margin-top: 4px;">
                  <span style="font-size: 12px; font-weight: 700; color: var(--quantgram-accent, #a8c7fa); margin-bottom: 2px;">${text.catTitle}</span>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: #fff;">${text.catOnline}</span>
                    <label class="quantgram-switch">
                      <input type="checkbox" id="chk-notif-online" ${notifOnline ? 'checked' : ''}>
                      <span class="quantgram-slider"></span>
                    </label>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: #fff;">${text.catTyping}</span>
                    <label class="quantgram-switch">
                      <input type="checkbox" id="chk-notif-typing" ${notifTyping ? 'checked' : ''}>
                      <span class="quantgram-slider"></span>
                    </label>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: #fff;">${text.catPm}</span>
                    <label class="quantgram-switch">
                      <input type="checkbox" id="chk-notif-pm" ${notifPm ? 'checked' : ''}>
                      <span class="quantgram-slider"></span>
                    </label>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: #fff;">${text.catGroup}</span>
                    <label class="quantgram-switch">
                      <input type="checkbox" id="chk-notif-group" ${notifGroup ? 'checked' : ''}>
                      <span class="quantgram-slider"></span>
                    </label>
                  </div>
                  
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: #fff;">${text.catChannel}</span>
                    <label class="quantgram-switch">
                      <input type="checkbox" id="chk-notif-channel" ${notifChannel ? 'checked' : ''}>
                      <span class="quantgram-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. INTERFACE/DESIGN SECTION -->
          <div class="quantgram-settings-section" id="sec-interface">
            <h4 class="quantgram-section-title">${lang === 'ru' ? 'Дизайн и оформление' : 'Design & Branding'}</h4>

            <!-- Compact Mode (Sidebar Window) -->
            <div class="quantgram-option-row">
              <div class="quantgram-option-info">
                <span class="quantgram-option-title">${lang === 'ru' ? 'Компактный режим (Sidebar)' : 'Compact Mode (Sidebar Window)'}</span>
                <span class="quantgram-option-desc">${lang === 'ru' ? 'Делает окно узким, убирает сайдбары и закрепляет поверх других окон.' : 'Narrow layout size, collapse sidebar, and lock window on top.'}</span>
              </div>
              <label class="quantgram-switch">
                <input type="checkbox" id="chk-compact-mode" ${compactMode ? 'checked' : ''}>
                <span class="quantgram-slider"></span>
              </label>
            </div>

            <!-- App Icon Theme Selection -->
            <div class="quantgram-option-row" style="flex-direction: column; align-items: stretch; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div class="quantgram-option-info">
                  <span class="quantgram-option-title">${lang === 'ru' ? 'Тема иконки приложения' : 'App Icon Theme'}</span>
                  <span class="quantgram-option-desc">${lang === 'ru' ? 'Стиль иконки Quantgram для панели задач и ярлыка.' : 'Choose client window and launcher icon theme.'}</span>
                </div>
                <div class="quantgram-segmented" id="seg-app-icon">
                  <button class="quantgram-segment-btn ${appIconTheme === 'dark' ? 'active' : ''}" data-val="dark">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                    <span>${lang === 'ru' ? 'Темная' : 'Dark'}</span>
                  </button>
                  <button class="quantgram-segment-btn ${appIconTheme === 'light' ? 'active' : ''}" data-val="light">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line></svg>
                    <span>${lang === 'ru' ? 'Светлая' : 'Light'}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Font family selection -->
            <div class="quantgram-option-row" style="flex-direction: column; align-items: stretch; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div class="quantgram-option-info">
                  <span class="quantgram-option-title">${lang === 'ru' ? 'Шрифт интерфейса' : 'Interface Font'}</span>
                  <span class="quantgram-option-desc">${lang === 'ru' ? 'Выберите стиль шрифта для всех элементов.' : 'Choose the typography for all client elements.'}</span>
                </div>
                <div class="quantgram-segmented" id="seg-font-family" style="flex-wrap: wrap; gap: 4px;">
                  <button class="quantgram-segment-btn ${fontFamily === 'default' ? 'active' : ''}" data-val="default">Def</button>
                  <button class="quantgram-segment-btn ${fontFamily === 'inter' ? 'active' : ''}" data-val="inter">Inter</button>
                  <button class="quantgram-segment-btn ${fontFamily === 'outfit' ? 'active' : ''}" data-val="outfit">Outfit</button>
                  <button class="quantgram-segment-btn ${fontFamily === 'roboto' ? 'active' : ''}" data-val="roboto">Roboto</button>
                  <button class="quantgram-segment-btn ${fontFamily === 'jakarta' ? 'active' : ''}" data-val="jakarta">GoogleSans</button>
                  <button class="quantgram-segment-btn ${fontFamily === 'montserrat' ? 'active' : ''}" data-val="montserrat">Mont</button>
                  <button class="quantgram-segment-btn ${fontFamily === 'jetbrains' ? 'active' : ''}" data-val="jetbrains">Mono</button>
                  <button class="quantgram-segment-btn ${fontFamily === 'custom' ? 'active' : ''}" data-val="custom">Cust</button>
                </div>
              </div>
              
              <div id="quantgram-custom-font-options" style="display: ${fontFamily === 'custom' ? 'flex' : 'none'}; justify-content: space-between; align-items: center; gap: 10px; padding: 10px; margin-top: 4px; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px dashed rgba(255, 255, 255, 0.08);">
                <span style="font-size: 11px; color: #9ca3af;">${lang === 'ru' ? 'Имя системного шрифта:' : 'System Font Family Name:'}</span>
                <input type="text" id="ipt-custom-font-name" class="quantgram-input" value="${customFontName}" placeholder="e.g. Arial, Segoe UI, sans-serif" style="width: 200px;">
              </div>
            </div>

            <!-- Custom CSS Live Editor -->
            <div class="quantgram-option-row" style="flex-direction: column; align-items: stretch; gap: 8px;">
              <div class="quantgram-option-info">
                <span class="quantgram-option-title">${lang === 'ru' ? 'Пользовательский CSS' : 'Custom CSS Live Editor'}</span>
                <span class="quantgram-option-desc">${lang === 'ru' ? 'Вставьте свой CSS код для индивидуального стиля клиента.' : 'Apply real-time CSS style overrides to the client.'}</span>
              </div>
              <textarea id="ipt-custom-css" class="quantgram-textarea" style="height: 100px; font-family: monospace; font-size: 11px; resize: vertical;" placeholder="body { ... }">${customCssCode}</textarea>
            </div>
          </div>

          <!-- 4. TOOLS SECTION -->
          <div class="quantgram-settings-section" id="sec-tools">
            <h4 class="quantgram-section-title">${text.tabTools}</h4>

            <!-- Inline Translator -->
            <div class="quantgram-option-row">
              <div class="quantgram-option-info">
                <span class="quantgram-option-title">${text.translatorTitle}</span>
                <span class="quantgram-option-desc">${text.translatorDesc}</span>
              </div>
              <label class="quantgram-switch">
                <input type="checkbox" id="chk-translator" ${translatorEnabled ? 'checked' : ''}>
                <span class="quantgram-slider"></span>
              </label>
            </div>

            <!-- Quick Replies (Templates) -->
            <div class="quantgram-option-row" style="flex-direction: column; align-items: stretch; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div class="quantgram-option-info">
                  <span class="quantgram-option-title">${text.quickRepliesTitle}</span>
                  <span class="quantgram-option-desc">${text.quickRepliesDesc}</span>
                </div>
                <label class="quantgram-switch">
                  <input type="checkbox" id="chk-quickreplies" ${quickrepliesEnabled ? 'checked' : ''}>
                  <span class="quantgram-slider"></span>
                </label>
              </div>
              <div id="quantgram-quickreplies-options" style="display: ${quickrepliesEnabled ? 'flex' : 'none'}; flex-direction: column; gap: 10px; padding: 10px; margin-top: 4px; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px dashed rgba(255, 255, 255, 0.08);">
                <span style="font-size: 12px; font-weight: 700; color: var(--quantgram-accent, #a8c7fa);">${lang === 'ru' ? 'Список быстрых ответов:' : 'Quick Replies List:'}</span>
                
                <div id="quantgram-templates-editor-list" style="display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; padding-right: 4px;">
                  <!-- Dynamically populated rows -->
                </div>

                <div style="display: flex; gap: 8px; justify-content: flex-start; margin-top: 4px;">
                  <button class="quantgram-btn" id="btn-template-add-single" style="padding: 4px 10px; font-size: 11px;">
                    <span>+ ${lang === 'ru' ? 'Добавить' : 'Add Item'}</span>
                  </button>
                  <button class="quantgram-btn" id="btn-template-bulk-import" style="padding: 4px 10px; font-size: 11px; background: rgba(255, 255, 255, 0.05); border-color: rgba(255,255,255,0.15); color: #fff;">
                    <span>${lang === 'ru' ? 'Импортировать список' : 'Bulk Import'}</span>
                  </button>
                </div>
                
                <div id="div-template-bulk-area" style="display: none; flex-direction: column; gap: 6px; border-top: 1px dashed rgba(255, 255, 255, 0.08); padding-top: 8px; margin-top: 4px;">
                  <span style="font-size: 11px; color: #9ca3af;">${lang === 'ru' ? 'Введите фразы (каждая с новой строки):' : 'Enter phrases (one per line):'}</span>
                  <textarea id="ipt-template-bulk-text" class="quantgram-textarea" style="height: 80px; font-size: 11px; resize: none;" placeholder="Привет, {name}!&#10;Как дела?&#10;Буду позже..."></textarea>
                  <button class="quantgram-btn" id="btn-template-bulk-submit" style="padding: 4px 10px; font-size: 11px; align-self: flex-start;">
                    <span>${lang === 'ru' ? 'Добавить все' : 'Add All'}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Scratchpad drawer -->
            <div class="quantgram-option-row">
              <div class="quantgram-option-info">
                <span class="quantgram-option-title">${text.scratchpadTitle}</span>
                <span class="quantgram-option-desc">${text.scratchpadDesc}</span>
              </div>
              <label class="quantgram-switch">
                <input type="checkbox" id="chk-scratchpad" ${scratchpadEnabled ? 'checked' : ''}>
                <span class="quantgram-slider"></span>
              </label>
            </div>

            <!-- AI Assistant Module -->
            <div class="quantgram-option-row" style="flex-direction: column; align-items: stretch; gap: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div class="quantgram-option-info">
                  <span class="quantgram-option-title">${lang === 'ru' ? 'ИИ-Ассистент' : 'AI Helper & Smart Reply'}</span>
                  <span class="quantgram-option-desc">${lang === 'ru' ? 'Сводка диалогов и умные ответы через локальную LLM.' : 'Summarize chat threads and draft replies using local LLM.'}</span>
                </div>
                <label class="quantgram-switch">
                  <input type="checkbox" id="chk-ai-enabled" ${aiEnabled ? 'checked' : ''}>
                  <span class="quantgram-slider"></span>
                </label>
              </div>
              
              <div id="quantgram-ai-options" style="display: ${aiEnabled ? 'flex' : 'none'}; flex-direction: column; gap: 10px; padding: 10px; margin-top: 4px; background: rgba(255, 255, 255, 0.02); border-radius: 12px; border: 1px dashed rgba(255, 255, 255, 0.08);">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                  <span style="font-size: 12px; color: #fff;">${lang === 'ru' ? 'Провайдер:' : 'AI Provider:'}</span>
                  <div class="quantgram-segmented" id="seg-ai-provider" style="flex-wrap: wrap; gap: 4px;">
                    <button class="quantgram-segment-btn ${aiProvider === 'ollama' ? 'active' : ''}" data-val="ollama">Ollama</button>
                    <button class="quantgram-segment-btn ${aiProvider === 'openai' ? 'active' : ''}" data-val="openai">OpenAI</button>
                    <button class="quantgram-segment-btn ${aiProvider === 'gemini' ? 'active' : ''}" data-val="gemini">Gemini</button>
                    <button class="quantgram-segment-btn ${aiProvider === 'anthropic' ? 'active' : ''}" data-val="anthropic">Claude</button>
                  </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; color: #9ca3af;">${lang === 'ru' ? 'Эндпоинт API:' : 'API Endpoint:'}</span>
                  <input type="text" id="ipt-ai-endpoint" class="quantgram-input" value="${aiEndpoint}" placeholder="e.g. http://localhost:11434">
                </div>

                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; color: #9ca3af;">${lang === 'ru' ? 'Ключ API:' : 'API Key:'}</span>
                  <input type="password" id="ipt-ai-key" class="quantgram-input" value="${aiKey}" placeholder="e.g. sk-... or AIzaSy...">
                </div>

                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; color: #9ca3af;">${lang === 'ru' ? 'Модель ИИ:' : 'AI Model:'}</span>
                  <input type="text" id="ipt-ai-model" class="quantgram-input" value="${aiModel}" placeholder="e.g. llama3, gpt-4o-mini">
                </div>

                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <span style="font-size: 11px; color: #9ca3af;">${lang === 'ru' ? 'Промпт для Сводки:' : 'AI Summarize System Prompt:'}</span>
                  <textarea id="ipt-ai-prompt" class="quantgram-textarea" style="height: 60px; font-size: 11px; resize: none;">${aiPrompt}</textarea>
                </div>
              </div>
            </div>

            <!-- DevTools Diagnostics -->
            <div class="quantgram-option-row">
              <div class="quantgram-option-info">
                <span class="quantgram-option-title">${text.devLogsTitle}</span>
                <span class="quantgram-option-desc">${text.devLogsDesc}</span>
              </div>
              <button class="quantgram-btn" id="btn-open-console">${text.devConsoleBtn}</button>
            </div>
          </div>

          <!-- 5. NOTIFICATION HISTORY SECTION -->
          <div class="quantgram-settings-section" id="sec-history">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <h4 class="quantgram-section-title" style="margin-bottom: 0;">${lang === 'ru' ? 'История уведомлений' : 'Notification History'}</h4>
              <button class="quantgram-back-btn" id="btn-clear-notif-history" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.05); padding: 4px 10px; font-size: 11px;">
                <span>${lang === 'ru' ? 'Очистить' : 'Clear'}</span>
              </button>
            </div>
            <div class="quantgram-history-list" id="quantgram-history-list" style="max-height: 250px; overflow-y: auto;">
              <!-- History items will be rendered here dynamically -->
            </div>
          </div>

          <!-- 6. BACKUP & SYNC SECTION -->
          <div class="quantgram-settings-section" id="sec-backup">
            <h4 class="quantgram-section-title">${lang === 'ru' ? 'Резервная копия' : 'Backup & Sync'}</h4>
            <div style="display: flex; flex-direction: column; gap: 16px; padding: 4px 0;">
              <div class="quantgram-option-row" style="flex-direction: column; align-items: flex-start; gap: 8px;">
                <span style="font-size: 13px; font-weight: 600; color: #fff;">${lang === 'ru' ? 'Экспорт настроек' : 'Export Settings'}</span>
                <span style="font-size: 11px; color: #9ca3af; line-height: 1.5;">${lang === 'ru' ? 'Скачать все текущие настройки клиента, шаблоны ответов и заметки блокнота в один файл JSON.' : 'Download all active client settings, quick reply snippets, and scratchpad notes as a JSON file.'}</span>
                <button class="quantgram-btn" id="btn-config-export" style="align-self: flex-start; margin-top: 4px;">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  <span>${lang === 'ru' ? 'Экспортировать JSON' : 'Export JSON'}</span>
                </button>
              </div>

              <div class="quantgram-option-row" style="flex-direction: column; align-items: flex-start; gap: 8px; border-top: 1px dashed rgba(255, 255, 255, 0.08); padding-top: 16px;">
                <span style="font-size: 13px; font-weight: 600; color: #fff;">${lang === 'ru' ? 'Импорт настроек' : 'Import Settings'}</span>
                <span style="font-size: 11px; color: #9ca3af; line-height: 1.5;">${lang === 'ru' ? 'Выберите файл JSON конфигурации для восстановления ваших настроек. Это перезагрузит приложение.' : 'Select a backup configuration JSON file to restore settings. This action reloads the application.'}</span>
                <button class="quantgram-btn" id="btn-config-import-trigger" style="align-self: flex-start; margin-top: 4px;">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  <span>${lang === 'ru' ? 'Импортировать JSON' : 'Import JSON'}</span>
                </button>
                <input type="file" id="ipt-config-import" accept=".json" style="display: none;">
              </div>
            </div>
          </div>

          <!-- 7. ABOUT SECTION -->
          <div class="quantgram-settings-section" id="sec-about">
            <h4 class="quantgram-section-title">${lang === 'ru' ? 'О клиенте' : 'About Quantgram'}</h4>
            <div class="quantgram-option-row" style="flex-direction: column; align-items: center; gap: 16px; padding: 24px; text-align: center;">
              <div style="position: relative; width: 80px; height: 80px; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 24px rgba(0, 255, 209, 0.2); border: 2px solid var(--quantgram-accent, #a8c7fa);">
                <img src="${logoBase64}" alt="Quantgram Logo" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <span style="font-size: 18px; font-weight: 700; color: #fff; letter-spacing: 0.5px;">QUANTGRAM</span>
                <span style="font-size: 11px; color: var(--quantgram-accent, #a8c7fa); font-weight: 600; text-transform: uppercase;">Version 1.0.0</span>
              </div>
              <p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0; max-width: 480px;">
                ${lang === 'ru' 
                  ? 'Прокачанный клиент для любителей кастомизации и приватности. Никакой рекламы, удобные шаблоны ответов, встроенный блокнот для гениальных мыслей и умный ИИ-помощник, который сделает всю рутину за вас. Наслаждайтесь общением на максималках!' 
                  : 'A supercharged Telegram client built for customization and privacy. Zero ads, handy reply templates, a built-in scratchpad for your brilliant thoughts, and a smart AI assistant to handle the routine for you. Enjoy messaging at its finest!'}
              </p>
              <div style="display: flex; gap: 12px; margin-top: 8px; width: 100%; justify-content: center; flex-wrap: wrap;">
                <button id="btn-open-channel" class="quantgram-btn" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; font-size: 13px; border-color: rgba(0, 255, 209, 0.3); background: rgba(0, 255, 209, 0.05); color: var(--quantgram-accent, #a8c7fa); cursor: pointer;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="flex-shrink: 0;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z"/></svg>
                  <span>${lang === 'ru' ? 'Наш Telegram-канал' : 'Telegram Channel'}</span>
                </button>
                <button id="btn-contact-admin" class="quantgram-btn" style="display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; font-size: 13px; border-color: rgba(168, 199, 250, 0.3); background: rgba(168, 199, 250, 0.05); color: #fff; cursor: pointer;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  <span>${lang === 'ru' ? 'Связаться с админом' : 'Contact Admin'}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Version Info -->
          <div style="text-align: center; margin-top: 12px; font-size: 11px; color: #9ca3af; padding-bottom: 12px;">
            ${text.versionInfo}
          </div>
        </div>
      </div>
    </div>
  `;
  
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  
  const closeModal = () => backdrop.remove();
  document.getElementById('quantgram-modal-close-btn').addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
  
  const btnOpenChannel = document.getElementById('btn-open-channel');
  if (btnOpenChannel) {
    btnOpenChannel.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
      
      const anchor = document.createElement('a');
      anchor.href = 'https://t.me/quantgra';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      anchor.remove();
    });
  }
  
  const btnContactAdmin = document.getElementById('btn-contact-admin');
  if (btnContactAdmin) {
    btnContactAdmin.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
      
      const anchor = document.createElement('a');
      anchor.href = 'https://t.me/drmgen';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      anchor.remove();
    });
  }
  
  const scrollArea = modal.querySelector('.quantgram-settings-scroll-area');
  const sections = modal.querySelectorAll('.quantgram-settings-section');
  const navBtns = modal.querySelectorAll('.quantgram-sidebar-nav-btn');
  
  let isScrollingByClick = false;
  let scrollTimeout = null;

  // Search filter handler
  const searchInput = document.getElementById('quantgram-settings-search');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    sections.forEach(section => {
      const titleEl = section.querySelector('.quantgram-section-title');
      const sectionTitle = titleEl ? titleEl.textContent.toLowerCase() : '';
      const rows = section.querySelectorAll('.quantgram-option-row');
      
      let hasVisibleContent = false;
      
      if (rows.length > 0) {
        rows.forEach(row => {
          const textContent = row.textContent.toLowerCase();
          if (query === '' || textContent.includes(query) || sectionTitle.includes(query)) {
            row.style.display = '';
            hasVisibleContent = true;
          } else {
            row.style.display = 'none';
          }
        });
      } else {
        const sectionText = section.textContent.toLowerCase();
        if (query === '' || sectionText.includes(query)) {
          hasVisibleContent = true;
        }
      }
      
      if (hasVisibleContent || query === '') {
        section.style.display = '';
      } else {
        section.style.display = 'none';
      }
    });
  });

  // Intersection Observer scrollspy (high-performance, no lag)
  const observerOptions = {
    root: scrollArea,
    rootMargin: '-10px 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    if (isScrollingByClick) return;
    
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.id.replace('sec-', '');
        navBtns.forEach(btn => {
          if (btn.getAttribute('data-target') === activeId) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => observer.observe(sec));

  // Sidebar navigation click handler
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      const sec = document.getElementById(`sec-${target}`);
      if (scrollArea && sec) {
        isScrollingByClick = true;
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        scrollArea.scrollTo({
          top: sec.offsetTop - scrollArea.offsetTop,
          behavior: 'smooth'
        });
        
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isScrollingByClick = false;
        }, 800);
        
        if (target === 'history') {
          renderNotificationHistory();
        }
      }
    });
  });

  // Initial Routing / Scroll to default tab if specified
  if (defaultTab) {
    setTimeout(() => {
      const sec = document.getElementById(`sec-${defaultTab}`);
      if (scrollArea && sec) {
        scrollArea.scrollTo({
          top: sec.offsetTop - scrollArea.offsetTop,
          behavior: 'instant'
        });
        
        const activeBtn = modal.querySelector(`.quantgram-sidebar-nav-btn[data-target="${defaultTab}"]`);
        if (activeBtn) {
          navBtns.forEach(b => b.classList.remove('active'));
          activeBtn.classList.add('active');
        }
      }
      if (defaultTab === 'history') {
        renderNotificationHistory();
      }
    }, 50);
  } else {
    renderNotificationHistory();
  }

// 1. Privacy Bindings
  
  // 2. Notifications Bindings
  const chkSound = document.getElementById('chk-custom-sound');
  const divSoundOpts = document.getElementById('quantgram-sound-options');
  const iptSoundVolume = document.getElementById('ipt-sound-volume');
  const lblSoundVolume = document.getElementById('quantgram-volume-label');
  
  chkSound.addEventListener('change', (e) => {
    localStorage.setItem('quantgram-custom-sound', e.target.checked);
    divSoundOpts.style.display = e.target.checked ? 'flex' : 'none';
  });
  
  // Segmented Sound Type click events binding
  document.querySelectorAll('#seg-sound-type .quantgram-segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#seg-sound-type .quantgram-segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-val');
      localStorage.setItem('quantgram-notif-sound-type', val);
      playNotificationSound(); // Play preview sound on change
    });
  });
  
  // Throttle sound previews to prevent spamming
  let soundPreviewTimeout = null;
  iptSoundVolume.addEventListener('input', (e) => {
    lblSoundVolume.textContent = e.target.value + '%';
    localStorage.setItem('quantgram-notif-volume', e.target.value);
    
    if (soundPreviewTimeout) clearTimeout(soundPreviewTimeout);
    soundPreviewTimeout = setTimeout(() => {
      playNotificationSound();
    }, 150);
  });
  
  const chkNotif = document.getElementById('chk-notif-enabled');
  const divOptions = document.getElementById('quantgram-notif-options');
  
  chkNotif.addEventListener('change', (e) => {
    localStorage.setItem('quantgram-notif-enabled', e.target.checked);
    divOptions.style.display = e.target.checked ? 'flex' : 'none';
  });
  
  // Segmented Notif Mode click events binding
  document.querySelectorAll('#seg-notif-mode .quantgram-segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#seg-notif-mode .quantgram-segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-val');
      localStorage.setItem('quantgram-notif-mode', val);
      
      document.getElementById('div-notif-include').style.display = val === 'custom' ? 'flex' : 'none';
      document.getElementById('div-notif-exclude').style.display = val === 'all' ? 'flex' : 'none';
    });
  });
  
  document.getElementById('ipt-notif-include').addEventListener('input', (e) => {
    localStorage.setItem('quantgram-notif-include', e.target.value);
  });
  
  document.getElementById('ipt-notif-exclude').addEventListener('input', (e) => {
    localStorage.setItem('quantgram-notif-exclude', e.target.value);
  });

  // Notification Toast Duration binding
  const iptNotifDuration = document.getElementById('ipt-notif-duration');
  const lblNotifDuration = document.getElementById('quantgram-duration-label');
  if (iptNotifDuration && lblNotifDuration) {
    iptNotifDuration.addEventListener('input', (e) => {
      const val = e.target.value;
      lblNotifDuration.textContent = val + (lang === 'ru' ? ' сек' : ' sec');
      localStorage.setItem('quantgram-notif-duration', val);
    });
  }

  // Notification Toast Style binding
  document.querySelectorAll('#seg-notif-style .quantgram-segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#seg-notif-style .quantgram-segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-val');
      localStorage.setItem('quantgram-notif-style', val);
    });
  });

  // Notification Toast Position binding
  document.querySelectorAll('#seg-notif-position .quantgram-segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#seg-notif-position .quantgram-segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-val');
      localStorage.setItem('quantgram-notif-position', val);
    });
  });
  
  document.getElementById('chk-notif-online').addEventListener('change', (e) => {
    localStorage.setItem('quantgram-notif-online', e.target.checked);
  });
  document.getElementById('chk-notif-typing').addEventListener('change', (e) => {
    localStorage.setItem('quantgram-notif-typing', e.target.checked);
  });
  document.getElementById('chk-notif-pm').addEventListener('change', (e) => {
    localStorage.setItem('quantgram-notif-pm', e.target.checked);
  });
  document.getElementById('chk-notif-group').addEventListener('change', (e) => {
    localStorage.setItem('quantgram-notif-group', e.target.checked);
  });
  document.getElementById('chk-notif-channel').addEventListener('change', (e) => {
    localStorage.setItem('quantgram-notif-channel', e.target.checked);
  });
  
  // 3. Interface Bindings
  document.getElementById('chk-block-ads').addEventListener('change', (e) => {
    localStorage.setItem('quantgram-adblock', e.target.checked);
    applyAdblockSettings();
  });
  
  document.getElementById('chk-focus-blur').addEventListener('change', (e) => {
    localStorage.setItem('quantgram-focus-blur', e.target.checked);
    if (!e.target.checked) document.body.classList.remove('quantgram-blur-active');
  });
  
  const chkCompactMode = document.getElementById('chk-compact-mode');
  if (chkCompactMode) {
    chkCompactMode.addEventListener('change', (e) => {
      localStorage.setItem('quantgram-compact-mode', e.target.checked);
      ipcRenderer.send('quantgram-compact-toggle', e.target.checked);
    });
  }
  
  // Segmented App Icon Theme click events binding
  document.querySelectorAll('#seg-app-icon .quantgram-segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#seg-app-icon .quantgram-segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-val');
      localStorage.setItem('quantgram-app-icon', val);
      
      ipcRenderer.send('quantgram-set-icon', val);
      try {
        updateLinuxDesktopLauncher(val);
      } catch (err) {}
    });
  });
  
  // 4. Tools Bindings
  document.getElementById('chk-translator').addEventListener('change', (e) => {
    localStorage.setItem('quantgram-translator-enabled', e.target.checked);
    applyTranslatorSettings();
  });
  
  const chkQuick = document.getElementById('chk-quickreplies');
  const divQuick = document.getElementById('quantgram-quickreplies-options');
  
  // Quick Replies list helpers
  const getTemplatesList = () => {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('quantgram-quick-replies-list')) || [];
    } catch(e) {}
    return list.map((item, idx) => {
      if (typeof item === 'string') {
        return { text: item, key: idx < 9 ? String(idx + 1) : '' };
      }
      if (item && typeof item === 'object') {
        return { text: item.text || '', key: item.key || '' };
      }
      return { text: '', key: '' };
    }).filter(item => item.text);
  };
  
  const saveTemplatesList = (list) => {
    localStorage.setItem('quantgram-quick-replies-list', JSON.stringify(list));
    const old = document.querySelector('.quantgram-quick-replies');
    if (old) {
      old.remove();
    }
    applyQuickRepliesSettings();
    injectQuickReplies();
  };
  
  const renderTemplatesEditor = () => {
    const listContainer = document.getElementById('quantgram-templates-editor-list');
    if (!listContainer) return;
    
    let templates = getTemplatesList();
    
    if (templates.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; color: #9ca3af; padding: 12px 0; font-size: 11px;">
          ${lang === 'ru' ? 'Список пуст' : 'List is empty'}
        </div>
      `;
      return;
    }
    
    listContainer.innerHTML = templates.map((item, idx) => {
      return `
        <div class="quantgram-template-row" data-idx="${idx}" style="display: flex; gap: 8px; align-items: center; width: 100%;">
          <input type="text" class="quantgram-input ipt-template-text" value="${item.text.replace(/"/g, '&quot;')}" placeholder="${lang === 'ru' ? 'Текст ответа...' : 'Reply text...'}" style="flex: 1; font-size: 12px; padding: 4px 8px; height: auto;">
          <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
            <span style="font-size: 11px; color: #9ca3af;">Alt+</span>
            <input type="text" class="quantgram-input ipt-template-key" value="${item.key || ''}" placeholder="key" maxlength="1" style="width: 38px; text-align: center; font-size: 12px; padding: 4px 0; height: auto; font-family: monospace;">
          </div>
          <button class="quantgram-back-btn btn-template-delete" style="color: #ef4444; border-color: rgba(239, 68, 68, 0.2); background: rgba(239, 68, 68, 0.05); padding: 4px 6px; display: flex; align-items: center; justify-content: center; height: 26px; width: 26px; border-radius: 6px; flex-shrink: 0; min-width: 0;" title="${lang === 'ru' ? 'Удалить' : 'Delete'}">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      `;
    }).join('');
    
    listContainer.querySelectorAll('.quantgram-template-row').forEach(row => {
      const idx = parseInt(row.getAttribute('data-idx'));
      
      row.querySelector('.ipt-template-text').addEventListener('input', (e) => {
        const current = getTemplatesList();
        if (current[idx]) {
          current[idx].text = e.target.value;
          saveTemplatesList(current);
        }
      });
      
      row.querySelector('.ipt-template-key').addEventListener('input', (e) => {
        const current = getTemplatesList();
        if (current[idx]) {
          current[idx].key = e.target.value.trim().substring(0, 1).toLowerCase();
          saveTemplatesList(current);
        }
      });
      
      row.querySelector('.btn-template-delete').addEventListener('click', () => {
        const current = getTemplatesList();
        current.splice(idx, 1);
        saveTemplatesList(current);
        renderTemplatesEditor();
      });
    });
  };

  // Render editor on opening settings
  if (quickrepliesEnabled) {
    renderTemplatesEditor();
  }
  
  chkQuick.addEventListener('change', (e) => {
    localStorage.setItem('quantgram-quickreplies-enabled', e.target.checked);
    divQuick.style.display = e.target.checked ? 'flex' : 'none';
    applyQuickRepliesSettings();
    if (e.target.checked) {
      renderTemplatesEditor();
    }
  });

  // Actions Bindings
  const btnAddSingle = document.getElementById('btn-template-add-single');
  if (btnAddSingle) {
    btnAddSingle.addEventListener('click', () => {
      const list = getTemplatesList();
      const suggestKey = list.length < 9 ? String(list.length + 1) : '';
      list.push({ text: '', key: suggestKey });
      saveTemplatesList(list);
      renderTemplatesEditor();
    });
  }

  const btnBulkTrigger = document.getElementById('btn-template-bulk-import');
  const bulkArea = document.getElementById('div-template-bulk-area');
  if (btnBulkTrigger && bulkArea) {
    btnBulkTrigger.addEventListener('click', () => {
      bulkArea.style.display = bulkArea.style.display === 'none' ? 'flex' : 'none';
    });
  }

  const btnBulkSubmit = document.getElementById('btn-template-bulk-submit');
  const iptBulkText = document.getElementById('ipt-template-bulk-text');
  if (btnBulkSubmit && iptBulkText) {
    btnBulkSubmit.addEventListener('click', () => {
      const val = iptBulkText.value.trim();
      if (!val) return;
      
      const lines = val.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 0) {
        const list = getTemplatesList();
        lines.forEach(line => {
          const suggestKey = list.length < 9 ? String(list.length + 1) : '';
          list.push({ text: line, key: suggestKey });
        });
        saveTemplatesList(list);
        iptBulkText.value = '';
        if (bulkArea) bulkArea.style.display = 'none';
        renderTemplatesEditor();
      }
    });
  }
  
  document.getElementById('chk-scratchpad').addEventListener('change', (e) => {
    localStorage.setItem('quantgram-scratchpad-enabled', e.target.checked);
    applyScratchpadSettings();
  });
  
  document.getElementById('btn-open-console').addEventListener('click', () => {
    ipcRenderer.send('open-devtools');
  });

  // 5. History Bindings
  const btnClearHistory = document.getElementById('btn-clear-notif-history');
  if (btnClearHistory) {
    btnClearHistory.addEventListener('click', () => {
      localStorage.removeItem('quantgram-notif-history');
      renderNotificationHistory();
    });
  }

  // 6. Font Family Bindings
  const divCustomFontOpts = document.getElementById('quantgram-custom-font-options');
  const iptCustomFontName = document.getElementById('ipt-custom-font-name');
  
  document.querySelectorAll('#seg-font-family .quantgram-segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#seg-font-family .quantgram-segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-val');
      localStorage.setItem('quantgram-font', val);
      if (divCustomFontOpts) {
        divCustomFontOpts.style.display = val === 'custom' ? 'flex' : 'none';
      }
      applyFontSettings();
    });
  });

  if (iptCustomFontName) {
    iptCustomFontName.addEventListener('input', (e) => {
      localStorage.setItem('quantgram-custom-font-name', e.target.value.trim());
      applyFontSettings();
    });
  }

  // Custom CSS Editor Binding
  const iptCustomCss = document.getElementById('ipt-custom-css');
  if (iptCustomCss) {
    iptCustomCss.addEventListener('input', (e) => {
      localStorage.setItem('quantgram-custom-css-code', e.target.value);
      applyCustomCSS();
    });
  }

  // 7. AI Assistant Bindings
  const chkAI = document.getElementById('chk-ai-enabled');
  const divAIOpts = document.getElementById('quantgram-ai-options');
  if (chkAI && divAIOpts) {
    chkAI.addEventListener('change', (e) => {
      localStorage.setItem('quantgram-ai-enabled', e.target.checked);
      divAIOpts.style.display = e.target.checked ? 'flex' : 'none';
      injectAIHelper();
    });
  }

  const providerDefaults = {
    ollama: { endpoint: 'http://localhost:11434', model: 'llama3' },
    openai: { endpoint: 'https://api.openai.com', model: 'gpt-4o-mini' },
    gemini: { endpoint: 'https://generativelanguage.googleapis.com', model: 'gemini-1.5-flash' },
    anthropic: { endpoint: 'https://api.anthropic.com', model: 'claude-3-5-sonnet-20241022' }
  };

  document.querySelectorAll('#seg-ai-provider .quantgram-segment-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#seg-ai-provider .quantgram-segment-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.getAttribute('data-val');
      localStorage.setItem('quantgram-ai-provider', val);
      
      const defaults = providerDefaults[val];
      if (defaults) {
        const iptEndpoint = document.getElementById('ipt-ai-endpoint');
        const iptModel = document.getElementById('ipt-ai-model');
        if (iptEndpoint && iptModel) {
          iptEndpoint.value = defaults.endpoint;
          iptModel.value = defaults.model;
          localStorage.setItem('quantgram-ai-endpoint', defaults.endpoint);
          localStorage.setItem('quantgram-ai-model', defaults.model);
        }
      }
    });
  });

  const iptAIEndpoint = document.getElementById('ipt-ai-endpoint');
  if (iptAIEndpoint) {
    iptAIEndpoint.addEventListener('input', (e) => {
      localStorage.setItem('quantgram-ai-endpoint', e.target.value.trim());
    });
  }

  const iptAIKey = document.getElementById('ipt-ai-key');
  if (iptAIKey) {
    iptAIKey.addEventListener('input', (e) => {
      localStorage.setItem('quantgram-ai-key', e.target.value.trim());
    });
  }

  const iptAIModel = document.getElementById('ipt-ai-model');
  if (iptAIModel) {
    iptAIModel.addEventListener('input', (e) => {
      localStorage.setItem('quantgram-ai-model', e.target.value.trim());
    });
  }

  const iptAIPrompt = document.getElementById('ipt-ai-prompt');
  if (iptAIPrompt) {
    iptAIPrompt.addEventListener('input', (e) => {
      localStorage.setItem('quantgram-ai-prompt', e.target.value);
    });
  }

  // 8. Backup & Sync Bindings
  const btnExport = document.getElementById('btn-config-export');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      exportConfiguration();
    });
  }

  const btnImportTrigger = document.getElementById('btn-config-import-trigger');
  const iptImport = document.getElementById('ipt-config-import');
  if (btnImportTrigger && iptImport) {
    btnImportTrigger.addEventListener('click', () => {
      iptImport.click();
    });
    iptImport.addEventListener('change', () => {
      importConfiguration(iptImport);
    });
  }
}

function renderNotificationHistory() {
  const container = document.getElementById('quantgram-history-list');
  if (!container) return;
  
  let history = [];
  try {
    history = JSON.parse(localStorage.getItem('quantgram-notif-history') || '[]');
  } catch(e) {}
  
  if (!Array.isArray(history) || history.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: #9ca3af; padding: 24px 0; font-size: 12px; font-weight: 500;">
        ${getLanguage() === 'ru' ? 'История уведомлений пуста' : 'Notification history is empty'}
      </div>
    `;
    return;
  }
  
  container.innerHTML = history.map(item => {
    const isOnline = item.type === 'online';
    const borderCol = isOnline ? '#10b981' : 'var(--quantgram-accent, #a8c7fa)';
    const bgCol = isOnline ? 'rgba(16, 185, 129, 0.05)' : 'rgba(168, 199, 250, 0.05)';
    const iconColor = isOnline ? '#10b981' : 'var(--quantgram-accent, #a8c7fa)';
    const iconSvg = isOnline ? `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ` : `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="${iconColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    `;
    
    return `
      <div class="quantgram-history-item" style="border-left: 3px solid ${borderCol}; background: ${bgCol};">
        <div class="quantgram-history-icon">${iconSvg}</div>
        <div class="quantgram-history-content">
          <div class="quantgram-history-title-row">
            <span class="quantgram-history-title">${item.title}</span>
            <span class="quantgram-history-time">${item.time}</span>
          </div>
          <span class="quantgram-history-body">${item.body}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// 16. ADBLOCKING RULES ENGINE
// ==========================================
function applyAdblockSettings() {
  const adBlockEnabled = localStorage.getItem('quantgram-adblock') === 'true';
  if (adBlockEnabled) {
    let adStyle = document.getElementById('quantgram-adblock-css');
    if (!adStyle) {
      adStyle = document.createElement('style');
      adStyle.id = 'quantgram-adblock-css';
      adStyle.textContent = `
        .sponsored-message, 
        .message-sponsored, 
        [class*="sponsored"], 
        [class*="Sponsored"] { 
          display: none !important; 
        }
      `;
      document.head.appendChild(adStyle);
    }
    // Perform initial scan
    scanAndRemoveAds();
  } else {
    const adStyle = document.getElementById('quantgram-adblock-css');
    if (adStyle) adStyle.remove();
  }
}

function scanAndRemoveAds() {
  const adBlockEnabled = localStorage.getItem('quantgram-adblock') === 'true';
  if (!adBlockEnabled) return;

  // 1. Hide elements with class containing "sponsored" directly
  const sponsoredEls = document.querySelectorAll('[class*="sponsored" i]');
  sponsoredEls.forEach(el => {
    el.style.setProperty('display', 'none', 'important');
  });

  // 2. Scan text elements for sponsored keywords and hide their parent containers
  const textElements = document.querySelectorAll('span, a, div, p');
  textElements.forEach(el => {
    const txt = (el.textContent || '').trim();
    if (txt.length === 0 || txt.length > 25) return;

    if (txt === 'Реклама' || txt === 'Sponsored' || txt === 'Promoted' || txt === 'что это?' || txt === 'what is this?') {
      let current = el;
      for (let i = 0; i < 8; i++) {
        if (!current || current === document.body) break;
        const className = current.className || '';
        if (typeof className === 'string' && (
          className.includes('message') || 
          className.includes('Message') || 
          className.includes('bubble') || 
          className.includes('sponsored') || 
          className.includes('Sponsored') || 
          className.includes('ListItem') || 
          className.includes('list-item') ||
          className.includes('chat-message') ||
          className.includes('ChatMessage')
        )) {
          current.style.setProperty('display', 'none', 'important');
          
          const parentItem = current.closest('.message-list-item, .Message, [class*="message-list-item"], [class*="ChatMessage"]');
          if (parentItem) {
            parentItem.style.setProperty('display', 'none', 'important');
          }
          break;
        }
        current = current.parentElement;
      }
    }
  });
}

// ==========================================
// 17. APP DOM INITIALIZATION LISTENERS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  document.head.appendChild(styleElement);
  
  if (document.title && document.title.includes('Telegram')) {
    document.title = document.title.replace(/Telegram/gi, 'Quantgram');
  }
  
  const observer = new MutationObserver((mutations) => {
    if (document.title && document.title.includes('Telegram')) {
      document.title = document.title.replace(/Telegram/gi, 'Quantgram');
    }
    injectQuantgramMenu();
    scanAndRemoveAds();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
  
  applyAdblockSettings();
  applyAppIconSettings();
  applyTranslatorSettings();
  applyScratchpadSettings();
  applyQuickRepliesSettings();
  applyFontSettings();
  applyCustomCSS();
  applyCompactModeSettings();
});

function applyCompactModeSettings() {
  const compactMode = localStorage.getItem('quantgram-compact-mode') === 'true';
  ipcRenderer.send('quantgram-compact-toggle', compactMode);
}

// ==========================================
// 17. APP ICON & DESKTOP SHORTCUT WRITER
// ==========================================
function applyAppIconSettings() {
  try {
    const theme = localStorage.getItem('quantgram-app-icon') || 'dark';
    
    // 1. Send update command to main Electron process to update window/dock icon
    ipcRenderer.send('quantgram-set-icon', theme);
    
    // 2. Rewrite the Linux desktop environment launcher shortcut (.desktop file)
    const fs = require('fs');
    const path = require('path');
    const desktopPath = '/home/mdev/Desktop/Quantgram.desktop';
    const iconPath = path.join(__dirname, theme === 'dark' ? 'assets/icon_dark.png' : 'assets/icon_light.png');
    
    const content = `[Desktop Entry]
Name=Quantgram
Exec=electron ${__dirname} %u
Icon=${iconPath}
MimeType=x-scheme-handler/tg;
Type=Application
Terminal=false
Categories=Network;InstantMessaging;
Comment=Custom Quantgram Client
`;
    fs.writeFileSync(desktopPath, content, 'utf8');
    
    const localAppsDir = '/home/mdev/.local/share/applications';
    const localAppPath = path.join(localAppsDir, 'Quantgram.desktop');
    try {
      if (!fs.existsSync(localAppsDir)) {
        fs.mkdirSync(localAppsDir, { recursive: true });
      }
      fs.writeFileSync(localAppPath, content, 'utf8');
    } catch (e) {
      console.error("Quantgram: Failed to write local applications shortcut", e);
    }
    
    // Try to ensure executable permissions so Linux handles it as a trustable desktop entry
    try {
      const { exec } = require('child_process');
      exec(`chmod +x ${desktopPath}`);
      exec(`chmod +x ${localAppPath}`);
    } catch (e) {}
    
    console.log(`Quantgram: App icon updated to ${theme} and synced to desktop/launcher shortcuts.`);
  } catch (err) {
    console.error("Quantgram: Failed to apply app icon/desktop shortcut updates", err);
  }
}

// Menu item injector inside Telegram dropdown header
function injectQuantgramMenu() {
  const menuContainers = document.querySelectorAll('.bubble.menu-container, .left-menu, .Menu-item-list, .left-menu-items');
  
  menuContainers.forEach(container => {
    if (container.querySelector('.quantgram-menu-item-added')) return;
    
    // Ensure we only inject into the main left hamburger menu, not message or chat context menus
    const isMainMenu = container.closest('.left-menu, #left-menu, .left-menu-items') || 
                       container.querySelector('.tgico-settings, .tgico-newgroup, .tgico-saved, .tgico-users, .tgico-call, .tgico-darkmode, .icon-settings, .icon-contacts');
    if (!isMainMenu) return;
    
    const hasMenuItems = container.querySelector('.MenuItem, .left-menu-item, [role="menuitem"], .btn-menu-item');
    if (!hasMenuItems) return;
    
    const list = container.querySelector('.bubble-menu-wrapper, .left-menu-items, .menu-list, .items-container') || container;
    
    if (list) {
      const divider = document.createElement('div');
      divider.className = 'quantgram-menu-item-added';
      divider.style.height = '1px';
      divider.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
      divider.style.margin = '4px 0';
      
      const lang = getLanguage();
      const text = i18n[lang] || i18n.en;
      
      // Item 1: Settings
      const itemSettings = document.createElement('div');
      itemSettings.className = 'quantgram-menu-item quantgram-menu-item-added';
      itemSettings.innerHTML = `
        <div class="quantgram-menu-item-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </div>
        <span>${text.menuItem}</span>
      `;
      itemSettings.addEventListener('click', (e) => {
        e.stopPropagation();
        document.body.click(); 
        showSettingsModal();
      });
      
      // Item 2: Design Settings
      const itemDesign = document.createElement('div');
      itemDesign.className = 'quantgram-menu-item quantgram-menu-item-added';
      itemDesign.innerHTML = `
        <div class="quantgram-menu-item-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            <path d="M2 12h20"></path>
          </svg>
        </div>
        <span>${text.menuItemDesign}</span>
      `;
      itemDesign.addEventListener('click', (e) => {
        e.stopPropagation();
        document.body.click(); 
        showSettingsModal('interface');
      });
      
      // Item 3: Notification History
      const itemHistory = document.createElement('div');
      itemHistory.className = 'quantgram-menu-item quantgram-menu-item-added';
      itemHistory.innerHTML = `
        <div class="quantgram-menu-item-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <span>${text.menuItemHistory}</span>
      `;
      itemHistory.addEventListener('click', (e) => {
        e.stopPropagation();
        document.body.click(); 
        showSettingsModal('history');
      });
      
      list.appendChild(divider);
      list.appendChild(itemSettings);
      list.appendChild(itemDesign);
      list.appendChild(itemHistory);
    }
  });
}

// ==========================================
// 18. SCHEDULER SCANNER LOOP
// ==========================================
function runAppScanners() {
  checkNotifications();
  injectTranslatorButtons();
  injectQuickReplies();
  updateTaskbarBadge();
  injectVoiceDownloadButtons();
  injectAIHelper();
  scanAndRemoveAds();
}

setInterval(runAppScanners, 1500);

// Alt keyboard shortcuts listener for quick replies
const ruEnMap = {
  'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з', '[': 'х', ']': 'ъ',
  'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л', 'l': 'д', ';': 'ж', "'": 'э',
  'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь', ',': 'б', '.': 'ю', '/': '.'
};

window.addEventListener('keydown', (e) => {
  if (e.altKey && !e.ctrlKey && !e.metaKey) {
    const isEnabled = localStorage.getItem('quantgram-quickreplies-enabled') === 'true';
    if (!isEnabled) return;

    // Do not trigger if typing in a text field inside the settings modal
    const activeEl = document.activeElement;
    if (activeEl && (
      activeEl.tagName === 'INPUT' || 
      activeEl.tagName === 'TEXTAREA'
    ) && (
      activeEl.classList.contains('quantgram-input') || 
      activeEl.classList.contains('quantgram-textarea') ||
      activeEl.closest('.quantgram-modal')
    )) {
      return;
    }

    let templates = [];
    try {
      templates = JSON.parse(localStorage.getItem('quantgram-quick-replies-list'));
    } catch (err) {}
    
    if (!Array.isArray(templates) || templates.length === 0) {
      templates = [
        { text: "Привет!", key: "1" },
        { text: "Как дела?", key: "2" },
        { text: "Сейчас занят, отвечу позже.", key: "3" },
        { text: "Отличная идея!", key: "4" },
        { text: "Спасибо!", key: "5" }
      ];
    }

    const standardized = templates.map((item, idx) => {
      if (typeof item === 'string') {
        return { text: item, key: idx < 9 ? String(idx + 1) : '' };
      }
      return item;
    });

    const pressedKey = e.key.toLowerCase();
    const match = standardized.find(item => {
      if (!item || !item.key || !item.text) return false;
      const k = item.key.toLowerCase();
      if (pressedKey === k) return true;
      if (ruEnMap[k] === pressedKey) return true;
      const revKey = Object.keys(ruEnMap).find(key => ruEnMap[key] === k);
      if (revKey && revKey === pressedKey) return true;
      return false;
    });

    if (match) {
      e.preventDefault();
      e.stopPropagation();
      insertTextIntoInput(match.text);
    }
  }
}, true);

// ==========================================
// 19. CUSTOM TYPOGRAPHY & LIVE CSS INJECTION
// ==========================================
function applyFontSettings() {
  const font = localStorage.getItem('quantgram-font') || 'default';
  let style = document.getElementById('quantgram-font-css');
  if (!style) {
    style = document.createElement('style');
    style.id = 'quantgram-font-css';
    document.head.appendChild(style);
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=JetBrains+Mono:wght@400;700&family=Roboto:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600;700&family=Montserrat:wght@400;600;700&display=swap';
    document.head.appendChild(link);
  }
  
  let fontStack = '';
  if (font === 'inter') {
    fontStack = "'Inter', sans-serif";
  } else if (font === 'outfit') {
    fontStack = "'Outfit', sans-serif";
  } else if (font === 'roboto') {
    fontStack = "'Roboto', sans-serif";
  } else if (font === 'jakarta') {
    fontStack = "'Plus Jakarta Sans', sans-serif";
  } else if (font === 'montserrat') {
    fontStack = "'Montserrat', sans-serif";
  } else if (font === 'jetbrains') {
    fontStack = "'JetBrains Mono', monospace";
  } else if (font === 'custom') {
    const customName = localStorage.getItem('quantgram-custom-font-name') || 'Segoe UI';
    fontStack = `"${customName}", sans-serif`;
  }
  
  if (fontStack) {
    style.textContent = `
      body, html, input, button, textarea, [contenteditable], .text, .message, .chat-info, .peer-name {
        font-family: ${fontStack} !important;
      }
    `;
  } else {
    style.textContent = '';
  }
}

function applyCustomCSS() {
  const customCss = localStorage.getItem('quantgram-custom-css-code') || '';
  let style = document.getElementById('quantgram-custom-css');
  if (!style) {
    style = document.createElement('style');
    style.id = 'quantgram-custom-css';
    document.head.appendChild(style);
  }
  style.textContent = customCss;
}

// ==========================================
// 20. CONFIGURATION BACKUP & RESTORE
// ==========================================
function exportConfiguration() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('quantgram-'));
  const config = {};
  keys.forEach(k => {
    config[k] = localStorage.getItem(k);
  });
  
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  
  const timestamp = new Date().toISOString().slice(0, 10);
  dlAnchorElem.setAttribute("download", `quantgram_config_${timestamp}.json`);
  dlAnchorElem.click();
}

function importConfiguration(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const config = JSON.parse(e.target.result);
      let count = 0;
      Object.entries(config).forEach(([key, val]) => {
        if (key.startsWith('quantgram-')) {
          localStorage.setItem(key, val);
          count++;
        }
      });
      alert(getLanguage() === 'ru' 
        ? `Импорт завершен успешно! Загружено ${count} настроек. Перезагрузка приложения...` 
        : `Import successful! Loaded ${count} settings. Reloading application...`);
      window.location.reload();
    } catch(err) {
      alert(getLanguage() === 'ru' ? 'Ошибка парсинга файла резервной копии.' : 'Error parsing backup file.');
    }
  };
  reader.readAsText(file);
}

// ==========================================
// 21. TASKBAR BADGE COUNTER SENDER
// ==========================================
let lastUnreadCount = 0;
function updateTaskbarBadge() {
  if (!document.title) return;
  const match = document.title.match(/\((\d+)\)/);
  const count = match ? parseInt(match[1]) : 0;
  if (count !== lastUnreadCount) {
    lastUnreadCount = count;
    ipcRenderer.send('quantgram-update-badge', count);
  }
}

// ==========================================
// 22. VOICE MESSAGES DOWNLOADER & CONVERTER
// ==========================================
function bufferToWav(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArr = new ArrayBuffer(length);
  const view = new DataView(bufferArr);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAV header
  setUint32(0x46464952);                         // "RIFF"
  setUint32(length - 8);                         // file length - 8
  setUint32(0x45564157);                         // "WAVE"

  setUint32(0x20746d66);                         // "fmt " chunk
  setUint32(16);                                 // chunk length
  setUint16(1);                                  // sample format (raw)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2);                      // block align
  setUint16(16);                                 // bits per sample

  setUint32(0x61746164);                         // "data" chunk
  setUint32(length - pos - 4);                   // chunk length

  // write interleaved data
  for (i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (i = 0; i < numOfChan; i++) {             // interleave channels
      sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
      sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF); // scale to 16-bit signed int
      view.setInt16(pos, sample, true);          // write 16-bit sample
      pos += 2;
    }
    offset++;
  }

  return new Blob([bufferArr], { type: 'audio/wav' });

  function setUint16(data) {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data) {
    view.setUint32(pos, data, true);
    pos += 4;
  }
}

function injectVoiceDownloadButtons() {
  const voiceWrappers = document.querySelectorAll('.AudioPlayer, .audio-player, .voice-player, [class*="voice-player"], [class*="AudioPlayer"]');
  voiceWrappers.forEach(wrapper => {
    if (wrapper.querySelector('.quantgram-audio-dl-btn')) return;
    
    // Create download button
    const btn = document.createElement('button');
    btn.className = 'quantgram-audio-dl-btn';
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    `;
    btn.title = getLanguage() === 'ru' ? 'Скачать WAV' : 'Download WAV';
    btn.style.cssText = `
      background: rgba(168, 199, 250, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 50%;
      color: var(--quantgram-accent, #a8c7fa);
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-left: 8px;
      flex-shrink: 0;
      transition: all 0.2s ease;
    `;
    
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      let audioTag = wrapper.querySelector('audio');
      if (!audioTag) {
        const parentBubble = wrapper.closest('.message, [class*="message"]');
        if (parentBubble) {
          audioTag = parentBubble.querySelector('audio');
        }
      }
      if (!audioTag) {
        audioTag = document.querySelector('audio');
      }
      
      if (!audioTag || !audioTag.src) {
        const playBtn = wrapper.querySelector('.play, [class*="play"], [class*="toggle-play"], button');
        if (playBtn) {
          playBtn.click();
          setTimeout(() => {
            playBtn.click(); // Pause
            const updatedAudio = wrapper.querySelector('audio') || document.querySelector('audio');
            downloadAudioFromTag(updatedAudio, btn);
          }, 100);
        } else {
          alert(getLanguage() === 'ru' ? 'Не удалось найти аудио-файл. Запустите воспроизведение и повторите.' : 'Could not find audio tag. Start playing the audio and try again.');
        }
        return;
      }
      
      await downloadAudioFromTag(audioTag, btn);
    });
    
    const controls = wrapper.querySelector('.controls, .player-controls, [class*="controls"]') || wrapper;
    controls.appendChild(btn);
  });
}

async function downloadAudioFromTag(audioTag, btn) {
  if (!audioTag || !audioTag.src) {
    alert(getLanguage() === 'ru' ? 'Не удалось найти источник аудио.' : 'Audio source not found.');
    return;
  }
  
  const origText = btn.innerHTML;
  btn.innerHTML = `
    <svg class="quantgram-spinner" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: quantgram-rotate 1s linear infinite;">
      <circle cx="12" cy="12" r="10" stroke-dasharray="30 10"></circle>
    </svg>
  `;
  btn.style.pointerEvents = 'none';
  
  try {
    const res = await fetch(audioTag.src);
    const blob = await res.blob();
    
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    const wavBlob = bufferToWav(audioBuffer);
    
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
    a.download = `voice_message_${timestamp}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Audio download failed:', err);
    alert((getLanguage() === 'ru' ? 'Ошибка конвертации аудио: ' : 'Audio conversion failed: ') + err.message);
  } finally {
    btn.innerHTML = origText;
    btn.style.pointerEvents = 'auto';
  }
}

// ==========================================
// 23. LOCAL AI HELPER / SUMMARIZER
// ==========================================
let currentAIChatTitle = "";
function injectAIHelper() {
  const isEnabled = localStorage.getItem('quantgram-ai-enabled') === 'true';
  if (!isEnabled) {
    const oldSum = document.getElementById('quantgram-ai-summarize-btn');
    const oldRep = document.getElementById('quantgram-ai-reply-btn');
    if (oldSum) oldSum.remove();
    if (oldRep) oldRep.remove();
    return;
  }
  
  const header = document.querySelector('.MiddleHeader, [class*="MiddleHeader"], .chat-header');
  if (!header) return;
  
  const titleEl = header.querySelector('.title, .name, [class*="title"], [class*="name"]');
  const activeTitle = titleEl ? titleEl.textContent.trim() : "";
  if (activeTitle !== currentAIChatTitle) {
    currentAIChatTitle = activeTitle;
    const oldSum = header.querySelector('#quantgram-ai-summarize-btn');
    const oldRep = header.querySelector('#quantgram-ai-reply-btn');
    if (oldSum) oldSum.remove();
    if (oldRep) oldRep.remove();
  }
  
  if (header.querySelector('#quantgram-ai-summarize-btn')) return;
  
  const btnSum = document.createElement('button');
  btnSum.id = 'quantgram-ai-summarize-btn';
  btnSum.innerHTML = `
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
    <span>${getLanguage() === 'ru' ? 'ИИ Сводка' : 'AI Summary'}</span>
  `;
  btnSum.style.cssText = `
    background: rgba(168, 199, 250, 0.12);
    color: var(--quantgram-accent, #a8c7fa);
    border: 1px solid rgba(168, 199, 250, 0.25);
    border-radius: 14px;
    padding: 5px 14px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    margin-left: 8px;
    transition: all 0.2s ease;
  `;
  btnSum.addEventListener('click', (e) => {
    e.stopPropagation();
    runAIService('summarize', btnSum);
  });
  
  const btnRep = document.createElement('button');
  btnRep.id = 'quantgram-ai-reply-btn';
  btnRep.innerHTML = `
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>
    <span>${getLanguage() === 'ru' ? 'ИИ Ответ' : 'AI Reply'}</span>
  `;
  btnRep.style.cssText = `
    background: rgba(168, 199, 250, 0.12);
    color: var(--quantgram-accent, #a8c7fa);
    border: 1px solid rgba(168, 199, 250, 0.25);
    border-radius: 14px;
    padding: 5px 14px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    margin-left: 8px;
    transition: all 0.2s ease;
  `;
  btnRep.addEventListener('click', (e) => {
    e.stopPropagation();
    runAIService('reply', btnRep);
  });
  
  const oldMark = header.querySelector('#quantgram-mark-read-btn');
  if (oldMark) {
    oldMark.parentNode.insertBefore(btnSum, oldMark.nextSibling);
    btnSum.parentNode.insertBefore(btnRep, btnSum.nextSibling);
  } else {
    const rightSection = header.querySelector('.chat-info, .right-section, [class*="right-section"]') || header;
    rightSection.appendChild(btnSum);
    rightSection.appendChild(btnRep);
  }
}

async function runAIService(type, btn) {
  const provider = localStorage.getItem('quantgram-ai-provider') || 'ollama';
  const endpoint = localStorage.getItem('quantgram-ai-endpoint') || 'http://localhost:11434';
  const model = localStorage.getItem('quantgram-ai-model') || 'llama3';
  const apiKey = localStorage.getItem('quantgram-ai-key') || '';
  const prompt = type === 'summarize'
    ? (localStorage.getItem('quantgram-ai-prompt') || 'Вы — ИИ-ассистент Quantgram. Напишите краткую сводку (summary) последних сообщений диалога на русском языке. Сделайте упор на важные факты, вопросы и задачи.')
    : (localStorage.getItem('quantgram-ai-reply-prompt') || 'Сгенерируйте один или два подходящих варианта краткого и вежливого ответа на последнее сообщение собеседника на основе контекста диалога на русском языке.');
    
  const transcript = getRecentChatMessages();
  if (!transcript) {
    alert(getLanguage() === 'ru' ? 'Не найдено сообщений в этом чате для отправки ИИ.' : 'No messages found in this chat to send to AI.');
    return;
  }
  
  const origHTML = btn.innerHTML;
  btn.innerHTML = `
    <svg class="quantgram-spinner" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: quantgram-rotate 1s linear infinite; margin-right: 4px;">
      <circle cx="12" cy="12" r="10" stroke-dasharray="30 10"></circle>
    </svg>
    <span>${getLanguage() === 'ru' ? 'ИИ думает...' : 'AI Thinking...'}</span>
  `;
  btn.style.pointerEvents = 'none';
  
  try {
    let url = '';
    const headers = { 'Content-Type': 'application/json' };
    let body = {};
    
    if (provider === 'gemini') {
      url = `${endpoint}/v1beta/openai/chat/completions`;
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      body = {
        model: model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Вот диалог:\n\n' + transcript }
        ],
        temperature: 0.5
      };
    } else if (provider === 'anthropic') {
      url = `${endpoint}/v1/messages`;
      if (apiKey) {
        headers['x-api-key'] = apiKey;
      }
      headers['anthropic-version'] = '2023-06-01';
      body = {
        model: model,
        max_tokens: 1024,
        system: prompt,
        messages: [
          { role: 'user', content: 'Вот диалог:\n\n' + transcript }
        ],
        temperature: 0.5
      };
    } else {
      // ollama, openai
      url = `${endpoint}/v1/chat/completions`;
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      body = {
        model: model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: 'Вот диалог:\n\n' + transcript }
        ],
        temperature: 0.5
      };
    }
    
    const res = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    
    const data = await res.json();
    let resultText = '';
    
    if (provider === 'anthropic') {
      if (data.content && data.content[0]) {
        resultText = data.content[0].text;
      } else {
        throw new Error('Unexpected Anthropic API response format');
      }
    } else {
      if (data.choices && data.choices[0] && data.choices[0].message) {
        resultText = data.choices[0].message.content;
      } else {
        throw new Error('Unexpected OpenAI/Ollama/Gemini API response format');
      }
    }
    
    if (type === 'summarize') {
      showAISummaryDialog(resultText);
    } else {
      insertTextIntoInput(resultText);
    }
  } catch (err) {
    console.error('AI Service error:', err);
    alert((getLanguage() === 'ru' ? 'Ошибка ИИ: ' : 'AI Error: ') + err.message + '\n\n' + (getLanguage() === 'ru' ? 'Убедитесь, что Ollama или API-эндпоинт запущены и доступны.' : 'Make sure Ollama or API endpoint is running and reachable.'));
  } finally {
    btn.innerHTML = origHTML;
    btn.style.pointerEvents = 'auto';
  }
}

function showAISummaryDialog(text) {
  let dlg = document.getElementById('quantgram-ai-summary-overlay');
  if (dlg) dlg.remove();
  
  dlg = document.createElement('div');
  dlg.id = 'quantgram-ai-summary-overlay';
  dlg.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(28, 27, 31, 0.65);
    backdrop-filter: blur(8px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: #1c1b1f;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.55);
    border-radius: 28px;
    width: 90%;
    max-width: 500px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    color: #fff;
    font-family: var(--quantgram-font-family, 'Roboto', sans-serif);
    animation: quantgram-fade-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  `;
  
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
    padding-bottom: 12px;
  `;
  
  const title = document.createElement('span');
  title.textContent = getLanguage() === 'ru' ? '🤖 Сводка диалога от ИИ' : '🤖 AI Chat Summary';
  title.style.cssText = `
    font-weight: 500;
    font-size: 16px;
    color: var(--quantgram-accent, #a8c7fa);
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = `
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
  closeBtn.style.cssText = `
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    display: flex;
    align-items: center;
  `;
  closeBtn.addEventListener('click', () => dlg.remove());
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  const body = document.createElement('div');
  body.style.cssText = `
    max-height: 300px;
    overflow-y: auto;
    font-size: 13px;
    line-height: 1.6;
    color: #e5e7eb;
    white-space: pre-wrap;
    padding-right: 8px;
  `;
  body.textContent = text;
  
  const footer = document.createElement('div');
  footer.style.cssText = `
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
  `;
  
  const btnCopy = document.createElement('button');
  btnCopy.textContent = getLanguage() === 'ru' ? 'Копировать' : 'Copy';
  btnCopy.style.cssText = `
    background: rgba(168, 199, 250, 0.12);
    border: 1px solid rgba(168, 199, 250, 0.25);
    color: var(--quantgram-accent, #a8c7fa);
    padding: 6px 16px;
    border-radius: 12px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
  `;
  btnCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(text);
    btnCopy.textContent = getLanguage() === 'ru' ? 'Скопировано!' : 'Copied!';
    setTimeout(() => {
      btnCopy.textContent = getLanguage() === 'ru' ? 'Копировать' : 'Copy';
    }, 2000);
  });
  
  footer.appendChild(btnCopy);
  content.appendChild(header);
  content.appendChild(body);
  content.appendChild(footer);
  dlg.appendChild(content);
  document.body.appendChild(dlg);
}

function getRecentChatMessages() {
  const selector = '.message, .message-content, .bubble, .bubble-content, [class*="message"], [class*="bubble"]';
  const elements = Array.from(document.querySelectorAll(selector));
  
  const messages = [];
  for (let i = elements.length - 1; i >= 0 && messages.length < 25; i--) {
    const el = elements[i];
    if (el.classList.contains('date-separator') || el.classList.contains('service')) continue;
    
    const textEl = el.querySelector('.text-content, .message-text, [class*="text"]');
    const text = textEl ? textEl.textContent.trim() : el.textContent.trim();
    
    if (text && text.length > 0) {
      const nameEl = el.querySelector('.name, .sender, [class*="name"], [class*="sender"]');
      const sender = nameEl ? nameEl.textContent.trim() : '';
      messages.unshift((sender ? sender + ': ' : '') + text);
    }
  }
  return messages.join('\n');
}
