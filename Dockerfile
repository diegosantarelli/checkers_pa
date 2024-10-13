# Usa l'immagine base ufficiale di Node.js
FROM node:18

# Imposta la directory di lavoro all'interno del container
WORKDIR /usr/src/app

# Copia i file package.json e package-lock.json per installare le dipendenze
COPY package*.json ./

# Installa le dipendenze del progetto
RUN npm install

# Copia il resto del codice sorgente nel container
COPY . .

# Copia lo script wait-for-it.sh nel container e rendilo eseguibile
RUN chmod +x /usr/src/app/wait-for-it.sh

# Compila TypeScript in JavaScript
RUN npm run build

# Espone la porta 3000
EXPOSE 3000

# Comando per avviare l'applicazione (modificato per usare wait-for-it e pg_isready)
CMD ["bash", "-c", "./wait-for-it.sh db:5432 --timeout=60 --strict -- pg_isready -h db -p 5432 && npm start"]