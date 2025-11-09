import { useEffect } from 'react';

/**
 * Hook para manejar atajos de teclado
 * @param {Object} shortcuts - Objeto con los atajos y sus callbacks
 * @param {boolean} enabled - Si los atajos están habilitados
 */
const useKeyboardShortcuts = (shortcuts, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      // Ignorar si el usuario está escribiendo en un input/textarea
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName);
      
      // Construir la combinación de teclas
      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey; // metaKey para Mac
      const shift = event.shiftKey;
      const alt = event.altKey;

      // Crear string de la combinación
      let combination = '';
      if (ctrl) combination += 'ctrl+';
      if (shift) combination += 'shift+';
      if (alt) combination += 'alt+';
      combination += key;

      // Buscar el atajo
      const shortcut = shortcuts[combination];
      
      if (shortcut) {
        // Algunos atajos funcionan incluso cuando estás escribiendo
        if (shortcut.allowWhileTyping || !isTyping) {
          event.preventDefault();
          shortcut.action(event);
        }
      }

      // Atajos especiales sin modificadores
      if (!isTyping && shortcuts[key]) {
        event.preventDefault();
        shortcuts[key].action(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);
};

export default useKeyboardShortcuts;
