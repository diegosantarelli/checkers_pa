import express from 'express';

const app = express();
const port = 3000;  // Può essere cambiata la porta se necessario

// Rotta di prova
app.get('/', function (req, res) {
    res.send('Ciao, il server è attivo!');
});

// Avvia
app.listen(port, () => {
    console.log(`Server in esecuzione su http://localhost:${port}`);
});