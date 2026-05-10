#!/usr/bin/env node
// SETUP: Claude Code — Creador de videos cortos
const fs = require('fs'), path = require('path'), BASE = process.cwd();
function log(m){console.log('\x1b[32m✓\x1b[0m '+m);}
function warn(m){console.log('\x1b[33m⚠\x1b[0m '+m);}
function title(m){console.log('\n\x1b[36m═══ '+m+' ═══\x1b[0m');}

title('Configurando Claude Code: Creador de videos cortos');
['.claude','.claude/commands','.claude/skills','docs','src'].forEach(f=>{fs.mkdirSync(path.join(BASE,f),{recursive:true});log('Carpeta: '+f);});
fs.writeFileSync(path.join(BASE,'CLAUDE.md'),"# Creador de videos cortos\n\n## Descripción\n**1. DESCRIPCION DEL PROYECTO**\nEl proyecto \"Creador de videos cortos\" es una aplicación web que utiliza inteligencia artificial (IA) para generar videos virales en varias plataformas. La aplicación debe tener la capacidad de generar temas, guiones de historia, imágenes y videos cortos con audio y efectos. El objetivo es crear contenido de alta calidad que sea viral en plataformas como YouTube, Instagram, Facebook, TikTok, Telegram, Discord y WhatsApp.\n\n**2. STACK TECNOLOGICO**\n* Frontend: React o Angular\n* Backend: Node.js con Express.js\n* Base de datos: MongoDB o PostgreSQL\n* IA: Utilizar bi\n\n## APIs Configuradas\n// Fal.ai: 1000+ modelos imagen/video. FLUX, Kling\n// DeepSeek (créditos iniciales): 5M tokens gratis al registrarse (30 días)\n\n## REGLAS INVIOLABLES DE TRABAJO\n\n### COMUNICACIÓN\n- Responde SIEMPRE en español\n- Usa lenguaje claro, sin tecnicismos innecesarios\n- Cuando no estés seguro, pregunta ANTES de actuar\n\n### ACCIONES MANUALES\n- Antes de cualquier acción irreversible, muestra exactamente QUÉ harás y espera confirmación\n- Para comandos en terminal: muestra el comando COMPLETO y explica qué hace\n- Para modificar archivos existentes: muestra el DIFF antes de aplicar\n\n### CÓDIGO\n- NO inventes — si no conoces una función o API, di que no sabes\n- NO rompas funcionalidad existente sin avisar\n- Cambios quirúrgicos: modifica SOLO lo necesario\n- Entrega SIEMPRE el archivo completo cuando se pida reemplazo\n\n### PROGRESO\n- Cuando termines: \"✅ COMPLETADO: [descripción]\"\n- Si necesitas acción manual: \"🔴 ACCIÓN MANUAL REQUERIDA: [instrucciones exactas]\"");log('CLAUDE.md creado');
fs.writeFileSync(path.join(BASE,'.claude','settings.json'),JSON.stringify({permissions:{allow:['Bash','Read','Write','Edit'],deny:[]},env:{ANTHROPIC_API_KEY:'TU_API_KEY_AQUI'}},null,2));log('.claude/settings.json creado');
fs.writeFileSync(path.join(BASE,'.mcp.json'),JSON.stringify({
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem"
      ],
      "env": {}
    },
    "sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ],
      "env": {}
    },
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres"
      ],
      "env": {}
    },
    "context7": {
      "command": "npx",
      "args": [
        "-y",
        "@upstash/context7-mcp"
      ],
      "env": {}
    },
    "git": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-git"
      ],
      "env": {}
    },
    "github": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "ghcr.io/github/github-mcp-server"
      ],
      "env": {}
    },
    "sqlite": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sqlite"
      ],
      "env": {}
    },
    "sentry": {
      "command": "npx",
      "args": [
        "-y",
        "@sentry/mcp-server"
      ],
      "env": {}
    },
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-memory"
      ],
      "env": {}
    },
    "playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@playwright/mcp@latest"
      ],
      "env": {}
    },
    "brave-search": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-brave-search"
      ],
      "env": {}
    },
    "stripe": {
      "command": "npx",
      "args": [
        "-y",
        "@stripe/mcp-server"
      ],
      "env": {}
    },
    "fetch": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-fetch"
      ],
      "env": {}
    },
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase"
      ],
      "env": {}
    },
    "tavily-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "tavily-mcp"
      ],
      "env": {}
    },
    "cloudflare-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@cloudflare/mcp-server-cloudflare"
      ],
      "env": {}
    }
  }
},null,2));log('.mcp.json creado — 16 MCPs');
if(!fs.existsSync(path.join(BASE,'.gitignore'))){fs.writeFileSync(path.join(BASE,'.gitignore'),'node_modules/\n.env\n.claude/settings.local.json\nCLAUDE.local.md\n*.log\n');log('.gitignore creado');}
console.log('\n\x1b[32m✅ SETUP COMPLETO — CLAUDE CODE\x1b[0m');
console.log('\x1b[33m🔴 ACCIÓN MANUAL: Agrega ANTHROPIC_API_KEY en .claude/settings.json\x1b[0m');
console.log('\x1b[33m🔴 ACCIÓN MANUAL: Ejecuta: claude\x1b[0m');
console.log('\x1b[36mTip: usa /init dentro de Claude Code\x1b[0m\n');