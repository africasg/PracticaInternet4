#!/bin/bash

# ===============================================
# 🚀 Script para inicializar un proyecto Node + TypeScript + Express + CORS + Axios
# ===============================================

echo "📁 Inicializando nuevo proyecto Node.js..."
npm init -y

echo "📦 Instalando TypeScript y dependencias de desarrollo..."
npm install --save-dev typescript ts-node @types/node nodemon

echo "📦 Instalando librerías principales (Express, CORS, Axios)..."
npm install express cors axios mongodb dotenv bcryptjs jsonwebtoken apollo-server graphql @graphql-tools/utils

echo "📘 Instalando tipos para TypeScript..."
npm install -D --save-dev @types/express @types/cors @types/axios @types/bcryptjs @types/jsonwebtoken

echo "⚙️ Creando archivo tsconfig.json..., instalando mongodb y dotenv"
npx tsc --init

echo "📂 Creando archivo principal..."
mkdir src
cd src
touch index.ts
cd ..

echo "🧹 Creando archivo .gitignore..."
cat <<EOL > .gitignore
/node_modules
.env
EOL

echo "🧩 Configurando package.json..."



# 2️⃣ Sustituir los scripts originales por los personalizados
sed -i 's#"test": "echo.*exit 1"#"start": "ts-node src/index.ts",\
    "build": "tsc",\
    "dev": "nodemon --exec ts-node src/index.ts"#' package.json

echo "✅ Proyecto configurado correctamente."
echo ""
echo "👉 Ejecuta en modo desarrollo: npm run dev"
echo "👉 Compila TypeScript: npm run build"
echo "👉 Ejecuta el proyecto: npm start"
echo "🚀 Todo listo, leyenda del terminal."

