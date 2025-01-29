#!/bin/bash

# Rodar Prettier
echo "🚀 Rodando Prettier..."
npm run prettier:check

# Verificar se Prettier encontrou erros e corrigir automaticamente
if [ $? -ne 0 ]; then
  echo "❌ Prettier encontrou erros. Corrigindo automaticamente..."
  npm run format
else
  echo "✅ Código já está formatado!"
fi

# Rodar os testes Python e JavaScript
echo "🔧 Rodando testes Python e JavaScript..."
npm run test

echo "🎯 Finalizando o script..."
