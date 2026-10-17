(async () => {
  const sources = document.querySelectorAll('pre.uml-diagram');
  if (!sources.length) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    sequence: { actorFontSize: 18, messageFontSize: 18, noteFontSize: 18 }
  });

  for (const [index, source] of Array.from(sources).entries()) {
    try {
      const { svg: markup } = await mermaid.render(`uml-${index}`, source.textContent);
      const diagram = document.createElement('div');
      diagram.className = 'uml-diagram';
      diagram.innerHTML = markup;
      source.replaceWith(diagram);
      const svg = diagram.querySelector('svg');
      const width = svg.viewBox.baseVal.width;
      if (!width) continue;

      const viewer = document.createElement('div');
      viewer.className = 'diagram-viewer';
      diagram.before(viewer);
      viewer.append(diagram);

      const toolbar = document.createElement('div');
      toolbar.className = 'diagram-toolbar';
      toolbar.setAttribute('role', 'group');
      toolbar.setAttribute('aria-label', 'Масштаб диаграммы');
      viewer.prepend(toolbar);
      diagram.tabIndex = 0;
      diagram.setAttribute('role', 'region');
      diagram.setAttribute('aria-label', 'Диаграмма с прокруткой');

      let scale = 1;
      const label = document.createElement('span');
      label.setAttribute('aria-live', 'polite');
      function setScale(value) {
        scale = Math.max(0.25, Math.min(3, value));
        svg.style.width = `${width * scale}px`;
        label.textContent = `${Math.round(scale * 100)}%`;
      }
      function addButton(text, title, action) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = text;
        button.setAttribute('aria-label', title);
        button.title = title;
        button.addEventListener('click', action);
        toolbar.append(button);
      }
      addButton('−', 'Уменьшить', () => setScale(scale - 0.25));
      toolbar.append(label);
      addButton('+', 'Увеличить', () => setScale(scale + 0.25));
      addButton('100%', 'Исходный масштаб', () => setScale(1));
      addButton('По ширине', 'Вписать в ширину страницы', () => {
        setScale((diagram.clientWidth - 32) / width);
      });
      if (document.fullscreenEnabled) {
        addButton('На весь экран', 'Переключить полноэкранный режим', async () => {
          try {
            if (document.fullscreenElement === viewer) await document.exitFullscreen();
            else await viewer.requestFullscreen();
          } catch (error) {
            console.warn('Полноэкранный режим недоступен:', error);
          }
        });
      }
      setScale(1);
    } catch (error) {
      console.error('Не удалось отобразить диаграмму:', error);
      const message = document.createElement('p');
      message.textContent = 'Не удалось отобразить диаграмму. Ниже приведен ее исходный текст.';
      message.setAttribute('role', 'alert');
      source.before(message);
    }
  }
})();
