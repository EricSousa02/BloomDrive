// Teste simples para verificar se a API de thumbnail está funcionando
// Para usar: cole no console do browser na página do dashboard

async function testThumbnailAPI() {
  // Pega o primeiro arquivo de imagem da página
  const imageElements = document.querySelectorAll('[data-file-type="image"]');
  
  if (imageElements.length === 0) {
    console.log('❌ Nenhuma imagem encontrada na página');
    return;
  }

  // Pega o ID do primeiro arquivo de imagem
  const firstImage = imageElements[0];
  const fileId = firstImage.getAttribute('data-file-id');
  
  if (!fileId) {
    console.log('❌ Não foi possível encontrar file ID');
    return;
  }

  console.log('🔍 Testando API de thumbnail para arquivo:', fileId);

  try {
    const response = await fetch(`/api/files/${fileId}/thumbnail?width=150&height=150&quality=75`);
    
    if (response.ok) {
      console.log('✅ API de thumbnail funcionando!');
      console.log('📊 Status:', response.status);
      console.log('📦 Tamanho:', response.headers.get('content-length'));
      console.log('🎯 Tipo:', response.headers.get('content-type'));
    } else {
      console.log('❌ Erro na API de thumbnail:');
      console.log('📊 Status:', response.status);
      const error = await response.text();
      console.log('💬 Erro:', error);
    }
  } catch (error) {
    console.log('❌ Erro de rede:', error);
  }
}

// Executar o teste
testThumbnailAPI();
