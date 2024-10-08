# Progetto Programmazione Avanzata 2023-2024
<div align="center">
  <img src="./images/Opening.jpg" alt="Logo del progetto" width="320"/>
</div>


<img src="https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" /> <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" /> <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" /> <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" /> <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white" /> <img src="https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white" /> <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" /> <img src="https://img.shields.io/badge/WebStorm-000000?style=for-the-badge&logo=WebStorm&logoColor=white" /> <img src="https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=Postman&logoColor=white" />
<!-- <img src="https://img.shields.io/badge/dbeaver-382923?style=for-the-badge&logo=dbeaver&logoColor=white" /> -->


<hr />

Questo è un progetto sviluppato come parte dell'esame di Programmazione Avanzata (A.A. 2023/2024) presso l'UNIVPM.
Il sistema realizzato è un back-end che permette la gestione delle partite di dama in _TypeScript_ utilizzando _Node.js_, _Express_, _Sequelize_ e la libreria [rapid-draughts](https://github.com/loks0n/rapid-draughts) per la logica del gioco.
L'idea alla base del progetto è che, gli utenti (autenticati tramite _token JWT_) possano giocare contro altri utenti o contro l'intelligenza artificiale (IA), con la possibilità di scegliere tra diversi livelli di difficoltà.

# Indice
- [Obiettivi di progetto](#obiettivi-di-progetto)
- [Progettazione](#progettazione)

## Obiettivi di progetto
Come scritto precedentemente, l'obiettivo principale è realizzare un sistema di back-end per la gestione delle partite di dama.
Per raggiungere tale scopo, questo va diviso in funzionalità da realizzare:
- _Autenticazione dell'utente_ mediante token JWT, per la quale è prevista una rotta di login. Il login viene effettuato tramite l'email dell'utente e la sua password. 
- _Creazione di partite_ nelle quali l'utente può giocare contro altri utenti o contro l'intelligenza artificiale (IA), con la possibilità di scegliere tra diversi livelli di difficoltà, utilizzando la libreria [rapid-draughts](https://github.com/loks0n/rapid-draughts).
- _Validazione della richiesta di creazione della partita_, in quanto ogni utente autenticato possiede un numero di token necessari per la creazione della partita e per effettuare mosse all'interno di essa; in particolare:
    - Ad ogni utente vengono detratti 0.45 token all’atto della creazione.
    - Ad ogni mossa, vengono detratti 0.0125 token (anche per le mosse effettuate dall'IA).
    - Se il credito scende sotto zero, l'utente può continuare la partita ma non può crearne di nuove fino alla ricarica.
- _Esecuzione di una mossa_ per la quale deve essere verificato se questa sia ammissibile o meno.
- _Verifica delle partite svolte_ da un utente, filtrando opzionalmente per la data di inizio di una partita, per ognuna delle quali occorre riportare:
    - Se la partita è stata vinta o persa.
    - Il numero totale di mosse.
- _Valutazione dello stato di una partita_, che si considera chiusa quando:
    - Un utente/AI vince (se l'utente vince guadagna 1 punto).
    - L'utente abbandona (esso perde 0.5 punti).
- _Storico delle mosse_ di una data partita con la possibilità di esportare in formato JSON o PDF.
- _Classifica dei giocatori_ dando la possibilità di scegliere l’ordinamento ascendente/discendente. Questa, rispetto alle altre, è una rotta non protetta accessibile anche dagli utenti non autenticati.
- _Ottenimento di un certificato_ in formato PDF che che attesti la vittoria in una data partita; il certificato deve contenere il tempo impiegato per vincere la partita, il numero di mosse totali (dei due utenti) ed il nome dell’avversario.

## Progettazione
  
