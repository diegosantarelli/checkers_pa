import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import loginRoutes from './routes/loginRoutes';
import checkerRoutes from './routes/checkerRoutes';
import mossaRoutes from './routes/mossaRoutes';
import partitaRoutes from "./routes/winnerRoutes";
import gameStatusRoutes from "./routes/gameStatusRoutes";
import winnerRoutes from "./routes/winnerRoutes";

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

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
app.use('/winner', winnerRoutes);

// Rotta per lo stato della partita e abbandonare la partita
app.use('/partita', gameStatusRoutes);

app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});

export default app;