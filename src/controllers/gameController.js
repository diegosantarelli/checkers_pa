// src/controllers/gameController.js
import { Giocatore } from '../models'; // Assicurati che il modello sia importato correttamente

export const addPlayer = async (req, res) => {
    try {
        const player = await Giocatore.create(req.body); // Crea un nuovo giocatore
        return res.status(201).json(player); // Restituisce il giocatore creato con status 201
    } catch (error) {
        return res.status(500).json({ error: error.message }); // Gestisce l'errore
    }
};

export const getPlayers = async (req, res) => {
    try {
        const players = await Giocatore.findAll(); // Recupera tutti i giocatori
        return res.status(200).json(players); // Restituisce i giocatori con status 200
    } catch (error) {
        return res.status(500).json({ error: error.message }); // Gestisce l'errore
    }
};