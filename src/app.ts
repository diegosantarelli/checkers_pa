import express from 'express';

const app = express();
const port = 3000;  // Può essere cambiata la porta se necessario

// Rotta di prova
app.get('/', (req: any, res: { send: (arg0: string) => void; }) => {
    res.send('Ciao, il server è attivo!');
});

// Avvia
app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});