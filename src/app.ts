import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import loginRoutes from './routes/loginRoutes'; // Corretto import per loginRoutes
import checkerRoutes from './routes/checkerRoutes'; // Corretto import per checkerRoutes
import mossaRoutes from './routes/mossaRoutes';
import partitaRoutes from "./routes/winnerRoutes";

// Configurazione delle variabili d'ambiente
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 3001;  // Usa una variabile d'ambiente per la porta o il default 3001

// Middleware per analizzare il corpo delle richieste in formato JSON
app.use(express.json());

// Rotta di prova
app.get('/', (req, res) => {
    res.send('Ciao, il server è attivo!');
});

// Rotta di login
app.use('/login', loginRoutes);

// Rotta protetta per creare la partita
app.use('/game', checkerRoutes);

// Rotta per validazione mossa
app.use('/do', mossaRoutes);

// Rotta per la verifica delle partite
app.use('/winner', partitaRoutes);

// Avvio del server
app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});

export default app;