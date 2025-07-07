export function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('bloom-drive-theme') || 'system';
        var root = document.documentElement;
        
        // Força o atributo data-theme para ser consistente
        root.setAttribute('data-theme', theme);
        root.classList.remove('light', 'dark');
        
        if (theme === 'system') {
          var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          root.classList.add(systemTheme);
          root.setAttribute('data-resolved-theme', systemTheme);
        } else {
          root.classList.add(theme);
          root.setAttribute('data-resolved-theme', theme);
        }
        
        // Revela o conteúdo após aplicar o tema
        root.style.visibility = 'visible';
      } catch (e) {
        // Fallback para light mode se houver erro
        var root = document.documentElement;
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
        root.setAttribute('data-resolved-theme', 'light');
        root.style.visibility = 'visible';
      }
    })();
  `;

  return (
    <script 
      dangerouslySetInnerHTML={{ __html: script }} 
      suppressHydrationWarning={true}
    />
  );
}
