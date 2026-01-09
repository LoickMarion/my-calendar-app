import React from 'react';
import { useThemeStore } from '../state/themeStore.jsx';
import { applyTextCase } from '../state/textCase.js';

export default function CaseText({ children }) {
  const { theme } = useThemeStore();

  const text = React.Children.toArray(children).join('');

  return applyTextCase(text, theme['text-case']);
}
