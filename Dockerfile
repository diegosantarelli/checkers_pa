# Usa l'immagine base ufficiale di Node.js
FROM node:18

# Imposta la directory di lavoro all'interno del container
WORKDIR /usr/src/app

# Copia i file package.json e package-lock.json per installare le dipendenze
COPY package*.json ./

# Installa le dipendenze del progetto
RUN npm install

# Installa TypeScript globalmente (opzionale)
#RUN npm install -g typescript

# Copia il resto del codice sorgente nel container
COPY . .

# Compila TypeScript in JavaScript
RUN npm run build

# Espone la porta 3000
EXPOSE 3000

# Comando per avviare l'applicazione
CMD ["npm", "start"]