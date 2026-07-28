import React from 'react';
import { TELEGRAM_URL } from '../config.js';

export default function TelegramButton() {
  return (
    <a
      className="tg-float"
      href={TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Написать в Telegram"
      title="Написать в Telegram"
    >
      <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M181.5 68.5 156 179.6c-2 8.7-7.2 10.8-14.6 6.7l-40.3-29.7-19.4 18.7c-2.1 2.1-3.9 3.9-8 3.9l2.9-40.7 74.1-67c3.2-2.9-.7-4.5-5-1.6l-91.6 57.7-39.4-12.3c-8.6-2.7-8.7-8.6 1.8-12.7l153.9-59.3c7.1-2.7 13.3 1.7 11.1 12.5Z"
          fill="#fff"
        />
      </svg>
    </a>
  );
}
