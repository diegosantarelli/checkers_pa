# 👨🏻‍💻Sviluppo di un sistema backend per la gestione delle partite di dama
<div align="center">
  <img src="./images/Dama.jpeg" alt="Logo del progetto" width="400"/>
</div>


<img src="https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" /> <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" /> <img src="https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white" /> <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" /> <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white" /> <img src="https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white" /> <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white" /> <img src="https://img.shields.io/badge/WebStorm-000000?style=for-the-badge&logo=WebStorm&logoColor=white" /> <img src="https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=Postman&logoColor=white" />
<img src="https://img.shields.io/badge/dbeaver-382923?style=for-the-badge&logo=dbeaver&logoColor=white" />


<hr />

Il seguente progetto è stato sviluppato come parte dell’esame di **Programmazione Avanzata** (A.A. 2023/2024) presso l'**Università Politecnica delle Marche**, all’interno del corso di Laurea Magistrale in Ingegneria Informatica e dell’Automazione (LM-32). Il sistema realizzato è un back-end che permette la gestione delle partite di dama in TypeScript utilizzando Node.js, Express, Sequelize e la libreria rapid-draughts per la logica del gioco.

L’idea alla base del progetto è che, gli utenti (autenticati tramite token JWT) possano giocare contro altri utenti o contro l’intelligenza artificiale (IA), con la possibilità di scegliere tra diversi livelli di difficoltà. Il sistema è stato sviluppato per gestire partite multiple, permettendo agli utenti di creare una nuova partita convalidando l’idoneità della richiesta, scalando i token necessari sia per la creazione della partita che per ogni mossa successiva. Il progetto integra un sistema di abbandono e vittoria, con un sistema di punti per i giocatori e prevede la possibilità di esportare lo storico delle mosse in formato JSON o PDF.

Il progetto è stato interamente concepito e realizzato da **Simone Recinelli** e **Diego Santarelli**. Entrambi gli autori hanno collaborato attivamente in tutte le fasi di sviluppo, dalla progettazione iniziale dell’architettura del sistema, alla scrittura del codice, fino all’integrazione dei diversi componenti e alla fase di testing. La sinergia tra i due ha permesso di affrontare e risolvere problematiche complesse legate alla gestione delle partite e all’ottimizzazione delle prestazioni del sistema. Il contributo di entrambi ha garantito la creazione di un progetto solido e ben strutturato, rispettando gli obiettivi e i requisiti del progetto richiesto dal **Prof. Mancini Adriano**.
# 👆🏼Indice
- [Obiettivi di progetto](#obiettivi-di-progetto)
- [Progettazione](#progettazione)
     - [Diagramma dei casi d'uso](#diagramma-dei-casi-duso)

## 🎯 Obiettivi di progetto
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

## 🛠 Progettazione
La progettazione di un sistema software ben strutturato richiede una suddivisione ordinata delle componenti principali del progetto. Nel nostro caso, l’architettura è stata organizzata in modo tale da favorire la manutenibilità, la scalabilità e la chiarezza del codice. Ogni componente ha una responsabilità specifica, contribuendo al corretto funzionamento dell’intero sistema.

L’organizzazione delle directory del nostro progetto segue una suddivisione logica che consente una gestione chiara di file e moduli. Ogni directory contiene file relativi a un aspetto particolare dell’applicazione, permettendo una gestione modulare e separata del codice. Questa struttura facilita la collaborazione tra sviluppatori, semplifica l’estensione del progetto e garantisce un facile accesso a specifiche funzionalità.

Di seguito viene riportata la struttura delle directory:
```
checkers_pa/
├── images/
├── node_modules/
├── src/
│   ├── controllers/
│   ├── database/
│   ├── factories/
│   ├── helpers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── sequency_diagrams/
│   ├── services/
│   ├── app.ts
│   ├── boardConfiguration.json
│   ├── express.d.ts
│   └── global.d.ts
├── .dockerignore
├── .env
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── LICENSE
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json

```

### 🏛️Architettura dei servizi

Il sistema di gestione delle partite di dama sviluppato in questo progetto utilizza una struttura a client-server, dove il server, implementato con Node.js e Express, funge da back-end. Il server gestisce tutte le operazioni relative all’autenticazione degli utenti, alla gestione delle partite, all’esecuzione delle mosse e all’interazione con l’intelligenza artificiale (IA). Per la logica del gioco, è stata utilizzata la libreria rapid-draughts, che garantisce un motore di gioco performante grazie alla sua implementazione con bitboards, offrendo così un’esperienza di gioco veloce e ottimizzata.

#### Componenti principali

1.	**Server (Node.js con Express)**  
Il server riceve e gestisce le richieste degli utenti tramite API REST. Gli utenti possono autenticarsi, creare partite, eseguire mosse e visualizzare lo storico delle partite. Tutte le interazioni sono protette da un sistema di autenticazione basato su token JWT, che garantisce che solo gli utenti autorizzati possano accedere alle funzionalità protette.
2.	**Database (PostgreSQL)**  
La persistenza dei dati viene gestita tramite un database PostgreSQL, interfacciato con il server tramite l’ORM Sequelize. Le principali entità memorizzate includono:
•	Giocatori: che mantengono informazioni sugli utenti registrati, il loro saldo di token e il loro punteggio.
•	Partite: che registrano lo stato delle partite, i partecipanti, il vincitore e il numero di mosse effettuate.
•	Mosse: che memorizzano ogni singola mossa effettuata durante una partita, con i dettagli sulla posizione e sul giocatore che l’ha eseguita.
3.	**Autenticazione tramite JWT**    
Gli utenti si autenticano tramite JSON Web Tokens (JWT), ottenuti tramite il login con email e password. Il token JWT viene poi utilizzato per ogni richiesta successiva, permettendo al sistema di riconoscere e autorizzare gli utenti senza dover richiedere nuovamente le credenziali.
4.	**Intelligenza Artificiale (AI)**    
Gli utenti possono giocare contro un’intelligenza artificiale (IA) che utilizza la libreria rapid-draughts, una libreria veloce e performante per la gestione del gioco della dama. Questa libreria offre diverse strategie per l’IA, tra cui una strategia casuale (Random Strategy) e una più avanzata basata sull’algoritmo AlphaBeta, configurabile in base alla profondità di ricerca desiderata. Le partite contro l’IA possono essere personalizzate scegliendo tra vari livelli di difficoltà (facile, normale o difficile).
5.	**Libreria rapid-draughts**   
Rapid-draughts è una libreria scritta in TypeScript progettata per offrire un motore di gioco rapido e convalidato per il gioco della dama. Utilizza una rappresentazione della scacchiera tramite bitboards, che consente una generazione rapida delle mosse e un uso minimo della memoria.  
Le principali caratteristiche della libreria includono:
*	La gestione dello stato della scacchiera tramite un array 1D di caselle valide.
*	Il supporto per il tracciamento della cronologia delle mosse.
*	L’integrazione di strategie di IA, tra cui la strategia Random e la strategia AlphaBeta.
*	La possibilità di effettuare mosse e aggiornare lo stato della partita in modo efficiente.
Esempio di utilizzo della libreria:

```typescript
import { EnglishDraughts as Draughts } from 'rapid-draughts/english';

const draughts = Draughts.setup();
const moves = draughts.moves;  // Ottenere le mosse legali
draughts.move(moves[0]);       // Effettuare una mossa
```
#### Interazione tra i componenti

Il sistema è basato su un’architettura a livelli, che semplifica l’interazione tra i diversi componenti. Le richieste inviate dagli utenti vengono elaborate nel seguente modo:

1.	**Autenticazione**: il sistema verifica il token JWT per autenticare l’utente.
2.	**Gestione delle partite**: l’utente può creare nuove partite contro altri utenti o contro l’IA, con la gestione delle difficoltà configurabili.
3.  **Esecuzione delle mosse**: il sistema valida ogni mossa, assicurandosi che sia conforme alle regole di gioco, e aggiorna lo stato della scacchiera e delle partite.
4.	**IA**: se l’utente gioca contro l’IA, il sistema chiama la strategia selezionata (casuale o AlphaBeta) per eseguire le mosse dell’IA.


### 📊Diagrammi UML

#### 🕹️ Diagramma dei casi d'uso

Il diagramma dei casi d’uso è uno strumento fondamentale per la rappresentazione delle interazioni tra gli utenti (attori) e il sistema. Nel contesto di questo progetto, i casi d’uso rappresentano le funzionalità principali che il sistema offre agli utenti, evidenziando le azioni che possono essere compiute all’interno del sistema di gestione delle partite di dama.

Il diagramma dei casi d’uso permette di avere una visione ad alto livello delle operazioni che gli utenti possono effettuare. Sono evidenziati quattro attori: **Public User**, **Player**, **Admin** e **AI**, ognuno dei quali interagisce con il sistema tramite funzioni dedicate. Lo Use Case Diagram verrà inserito di seguito:


```mermaid
%% Use Case Diagram in Mermaid.js

graph TD
  PublicUser["Public User"] --> playersRanking["playersRanking"]
  PublicUser --> login["login"]

  Player["Player"] --> createGame["createGame"]
  Player --> makeMove["makeMove"]
  Player --> exportMoveHistory["exportMoveHistory"]
  Player --> AbandonGame["Abandon Game"]
  Player --> CheckGameStatus["Check Game Status"]
  Player --> ViewGameMoves["View Game Moves"]
  Player --> ExportGameHistory["Export Game History"]
  Player --> GetVictoryCertificate["Get Victory Certificate"]
  Player --> getMatchList["getMatchList"]

  Admin["Admin"] --> RechargeUserTokens["Recharge User Tokens"]

  AI["AI"] --> MakeMoveAI["Make Move"]

  System["System"] --> GenerateJSONFile["Generate JSON File"]
  System --> GeneratePDF["Generate PDF"]
  System --> CheckForGameEnd["Check For Game End"]
  System --> VerifyMoveValidity["Verify Move Validity"]
  System --> UpdateGameStatus["Update Game Status"]
  System --> UpdatePlayerPoints["Update Player Points"]
  System --> EditTokenCount["Edit Token Count"]

  createGame --> authenticateJWT["authenticateJWT"]
  makeMove --> authenticateJWT
  exportMoveHistory --> authenticateJWT
  getMatchList --> authenticateJWT

  playersRanking --> SortPlayerRankings["Sort Player Rankings"]
  ExportGameHistory --> FilterGamesByDate["Filter Games By Date"]
  AbandonGame --> UpdatePlayerPoints
```


#### 🗂️ Diagramma E-R

### Schema E-R
Il sistema utilizza PostgreSQL come RDBMS, un database open source riconosciuto per la sua affidabilità, flessibilità e capacità di scalare facilmente. In particolare, in un ambiente backend come quello del sistema implementato, dove sono fondamentali l’autenticazione dei dati e la velocità di lettura e scrittura, PostgreSQL si distingue come uno dei database più performanti e ottimizzati.
Il diagramma E-R (Entity-Relationship) rappresenta una visione concettuale del database, mostrando le entità coinvolte e le relazioni tra di esse. In questo progetto, il diagramma E-R è stato utilizzato per modellare le entità principali coinvolte nella gestione delle partite di dama, come i giocatori, le partite, le mosse e l’intelligenza artificiale. Ogni entità è stata progettata con specifiche proprietà e regole, garantendo un’adeguata gestione dei dati e una chiara rappresentazione delle interazioni tra i vari componenti del sistema.

L’obiettivo del diagramma è illustrare in maniera chiara e sintetica come le informazioni vengono organizzate e come le entità interagiscono tra loro ed esso viene illustrato di seguito:

```mermaid
erDiagram
  GIOCATORE {
    int id_giocatore PK
    string nome
    string cognome
    string email
    string hash
    float token_residuo
    float punteggio_totale
    string ruolo
  }

  PARTITA {
    int id_partita PK
    int id_giocatore1 FK
    int id_giocatore2 FK
    string livello_IA
    string stato
    string tipo
    json tavola
    datetime data_inizio
    int id_vincitore FK
    int mosse_totali
    int tempo_totale
  }

  MOSSA {
    int id_mossa PK
    int numero_mossa
    json tavola
    string pezzo
    int id_partita FK
    int id_giocatore FK
    string from_position
    string to_position
    datetime data
  }

  MOSSAIA {
    int id_mossa PK
    int numero_mossa
    json tavola
    string pezzo
    int id_partita FK
    datetime data
  }

  GIOCATORE ||--o{ PARTITA : "partecipa"
  GIOCATORE ||--o{ MOSSA : "fa"
  PARTITA ||--o{ MOSSA : "ha"
  PARTITA ||--o{ MOSSAIA : "ha"
  ```
### 🧱 Pattern utilizzati

Nel progetto sono stati applicati diversi pattern architetturali e design pattern per garantire una struttura flessibile, manutenibile e facilmente estendibile. I pattern utilizzati verranno elencati di seguito.

#### Model-View-Controller (MVC)

Il pattern Model-View-Controller (MVC) è un’architettura ampiamente utilizzata per separare le responsabilità all’interno dell’applicazione. In questo progetto, è stato implementato con una particolare attenzione alla gestione dei dati e delle interazioni tra utenti e sistema, ma senza una vera componente View, in quanto il progetto è un backend. Nel contesto di questo sistema, la struttura MVC è la seguente:

* **Model**: Implementato attraverso Sequelize, un ORM che mappa gli oggetti del database in modelli JavaScript/TypeScript. I modelli definiscono le entità come Giocatore, Partita, Mossa, che rappresentano i dati e contengono la logica di gestione del database. I modelli sono il cuore del livello dati, gestiscono lo stato e riflettono la struttura del database.
* **Controller**: I controller si occupano di gestire le richieste HTTP e coordinare la logica del servizio. Essi fungono da intermediari tra i modelli e i servizi. In questo progetto, ogni controller invoca le operazioni sui servizi per eseguire la logica aziendale, ricevere i dati e restituire le risposte appropriate. Ad esempio, il moveController gestisce l’esecuzione delle mosse e l’interazione con il servizio delle mosse.
* **Service**: Anche se non c’è una componente View, la logica è spostata sui Service che incapsulano le operazioni business-critical. I servizi lavorano a stretto contatto con i modelli per eseguire operazioni come la creazione di partite, l’esecuzione di mosse, la gestione del punteggio, ecc.

#### Data Access Object (DAO)

Il pattern Data Access Object (DAO) è stato implementato utilizzando Sequelize, che fornisce un’interfaccia per l’accesso ai dati. Questo pattern permette di astrarre e isolare la logica di accesso al database dal resto dell’applicazione. Sequelize agisce come il DAO, poiché gestisce tutte le operazioni CRUD (Create, Read, Update, Delete) per i modelli. Il vantaggio dell’utilizzo del DAO è la modularità e la facilità di sostituzione o aggiornamento della logica di accesso ai dati senza influenzare la logica di business. Ogni modello di dati ha le sue operazioni CRUD ben definite tramite i metodi di Sequelize.

#### Chain of Responsibility (COR)

Il pattern Chain of Responsibility (COR) è utilizzato attraverso i middleware di Express.js. Ogni middleware gestisce una fase specifica della pipeline delle richieste HTTP, permettendo un flusso organizzato e modulare. Le richieste passano attraverso una catena di middleware che validano, autenticano e infine gestiscono l’errore o restituiscono la risposta.

Alcuni esempi concreti di middleware implementati includono:

* **Middleware di autenticazione**: Verifica che un utente sia autenticato tramite un token JWT. Se l’utente non è autenticato, la catena viene interrotta e viene restituito un errore. È chiaramente implementato con la funzione authenticateJWT, che verifica la validità del token JWT nella richiesta. Se il token non è valido o mancante, viene interrotta la catena e viene restituito un errore UNAUTHORIZED.
* **Middleware di gestione degli errori**: Cattura gli errori lungo la catena e restituisce una risposta d’errore formattata. È stato implementato come middleware globale per catturare e gestire gli errori lungo la catena, formattando le risposte di errore con l’uso della ErrorFactory.

Questo pattern assicura che ogni richiesta sia gestita in modo efficiente e modulare, permettendo l’aggiunta o la rimozione di funzionalità senza modificare il core dell’applicazione.

#### Factory

Il pattern Factory è stato impiegato per gestire in maniera centralizzata la creazione di errori personalizzati nel progetto, tramite il file ErrorFactory.ts. Questa classe fornisce un’interfaccia unificata per generare diverse tipologie di errori HTTP in base al contesto specifico. Il vantaggio principale di questo approccio è la riduzione della ripetizione del codice, centralizzando la logica di creazione degli errori e migliorando la manutenibilità del progetto.

La classe ErrorFactory nel file ErrorFactory.ts utilizza la libreria http-status-codes per associare facilmente i codici di stato HTTP ai relativi errori, permettendo la generazione di errori come NOT_FOUND, UNAUTHORIZED, FORBIDDEN, e altri, in modo flessibile.

L’adozione del pattern Factory consente di:

* Centralizzare la gestione degli errori, semplificando la creazione di messaggi di errore personalizzati.
* Integrare in modo coerente i codici di stato HTTP, utilizzando la libreria http-status-codes, garantendo una gestione uniforme e standardizzata delle eccezioni.
* Estendere il sistema di gestione degli errori in modo semplice e pulito, senza dover modificare singolarmente ogni parte del codice dove gli errori vengono gestiti.

Grazie a questa implementazione, il progetto è più modulare, leggibile e facilmente manutenibile.
#### Singleton

Il pattern Singleton è stato implementato per gestire la connessione al database. L’istanza di Sequelize, che gestisce tutte le interazioni con il database, viene creata una sola volta durante l’inizializzazione dell’applicazione. Questo assicura che ci sia una singola fonte di connessione al database condivisa tra tutte le componenti, evitando problemi di concorrenza o conflitti di connessione. L’utilizzo di un Singleton per la connessione al database migliora l’efficienza e la coerenza delle operazioni di lettura e scrittura sui dati.

Al fine di integrare il pattern Singleton nel progetto, è stata implementata una classe DatabaseConnection che sfrutta una proprietà statica per memorizzare un’istanza di Sequelize. Il metodo getInstance() si occupa di verificare se l’istanza esiste già: se sì, la restituisce, altrimenti la crea utilizzando le variabili d’ambiente configurate. In questo modo, assicuriamo che solo una singola connessione al database venga utilizzata da tutte le richieste che transitano nell’applicazione.

#### 🔁 Diagrammi delle sequenze

##### POST '/login'

La seguente rotta autentica un giocatore nel sistema. Il client invia l’email e la password del giocatore. Il sistema cerca un giocatore con quell’email nel database. Se l’email è corretta, il sistema verifica che la password fornita corrisponda a quella memorizzata. Se entrambi i controlli passano, il sistema genera un token JWT che include l’ID del giocatore, l’email e il ruolo (utente o admin). Questo token sarà usato per autenticare le richieste successive. Se le credenziali non sono valide, viene restituito un errore con codice 401 Unauthorized.

```mermaid
sequenceDiagram
  actor C as Client
  participant R as Router
  participant GC as GameController
  participant G as Giocatore
  participant P as PasswordHelper
  participant J as JwtHelper
  participant E as ErrorFactory
  participant Res as Response

  C->>R: POST /login (email, password)
  R->>GC: login(req, res, next)

  GC->>G: findOne({ where: { email } })
  G-->>GC: user

  alt User not found or invalid password
    GC->>E: createError('UNAUTHORIZED', 'Credenziali non valide')
    E-->>GC: Error
    GC->>R: next(error)
  else User found
    GC->>P: verifyPassword(password, user.hash)
    P-->>GC: true

    alt Password is valid
      GC->>J: generateToken({ id_giocatore, email, ruolo })
      J-->>GC: JWT token

      GC->>Res: res.status(200).json({ token })
    else Password is invalid
      GC->>E: createError('UNAUTHORIZED', 'Credenziali non valide')
      E-->>GC: Error
      GC->>R: next(error)
    end
  end
```

##### POST '/game/create'

La seguente rotta permette a un giocatore di creare una partita. Il giocatore deve essere autenticato tramite il token JWT. Se l’autenticazione è valida, il sistema controlla se il giocatore ha già una partita in corso. Se sì, viene restituito un errore. Se no, il giocatore può scegliere di sfidare un altro giocatore specificando la sua email, o di giocare contro l’IA selezionando un livello di difficoltà. Il sistema valida i parametri (es. tipo di partita e livello IA). Se l’altro giocatore è stato indicato, viene verificato che non abbia già una partita in corso. Infine, viene creata la partita con la configurazione iniziale della scacchiera e viene restituita al giocatore. Se la partita è contro l’IA, non è necessario specificare un secondo giocatore.

```mermaid
sequenceDiagram
  actor C as Client
  participant R as Router
  participant GC as GameController
  participant GS as GameService
  participant G as Giocatore
  participant P as Partita
  participant JWT as JwtMiddleware
  participant EF as ErrorFactory

  C->>R: POST /game/create (token, email_giocatore2, tipo, livello_IA)
  R->>JWT: authenticateJWT(token)
  alt Token non valido o assente
    JWT->>EF: createError('UNAUTHORIZED', 'Autenticazione richiesta')
    EF-->>JWT: Error
    JWT->>R: next(error)
    R->>C: 401 Unauthorized
  else Token valido
    JWT->>GC: createGame(req, res, next)
    GC->>G: findByPk(req.user.id_giocatore)
    alt Giocatore non trovato
      G-->>GC: null
      GC->>EF: createError('FORBIDDEN', 'Il giocatore non esiste')
      EF-->>GC: Error
      GC->>R: next(error)
      R->>C: 403 Forbidden
    else Giocatore trovato
      G-->>GC: giocatore
      GC->>P: findOne({ id_giocatore1: req.user.id_giocatore, stato: 'in corso' })
      alt Partita in corso esistente per Giocatore1
        P-->>GC: partita in corso
        GC->>EF: createError('BAD_REQUEST', 'Hai già una partita in corso')
        EF-->>GC: Error
        GC->>R: next(error)
        R->>C: 400 Bad Request
      else Nessuna partita in corso per Giocatore1
        P-->>GC: null
        alt email_giocatore2 fornita
          GC->>G: getIdGiocatore(email_giocatore2)
          alt Giocatore2 non trovato
            G-->>GC: null
            GC->>EF: createError('NOT_FOUND', 'Giocatore2 non trovato')
            EF-->>GC: Error
            GC->>R: next(error)
            R->>C: 404 Not Found
          else Giocatore2 trovato
            G-->>GC: id_giocatore2
            GC->>P: findOne({ id_giocatore1: id_giocatore2, stato: 'in corso' })
            alt Partita in corso per Giocatore2
              P-->>GC: partita in corso
              GC->>EF: createError('BAD_REQUEST', 'Giocatore2 ha già una partita in corso')
              EF-->>GC: Error
              GC->>R: next(error)
              R->>C: 400 Bad Request
            else Nessuna partita in corso per Giocatore2
              P-->>GC: null
            end
          end
        else email_giocatore2 non fornita
          GC->>GS: createGame(id_giocatore1, null, tipo, livello_IA)
        end
        alt Parametri non validi
          GC->>EF: createError('BAD_REQUEST', 'Parametri non validi')
          EF-->>GC: Error
          GC->>R: next(error)
          R->>C: 400 Bad Request
        else Parametri validi
          GC->>GS: createGame(id_giocatore1, email_giocatore2, tipo, livello_IA)
          alt Partita PvP
            GS->>P: create({ id_giocatore1, id_giocatore2, stato, tipo, tavola })
            P-->>GS: partita creata
            GS-->>GC: partita creata
            GC->>R: res.status(201).json({ success, partita })
            R->>C: 201 Created (Partita PvP creata)
          else Partita contro IA
            GS->>P: create({ id_giocatore1, stato, tipo, livello_IA, tavola })
            P-->>GS: partita creata
            GS-->>GC: partita creata
            GC->>R: res.status(200).json({ success, partita })
            R->>C: 200 OK (Partita contro IA creata)
          end
        end
      end
    end
  end
```

##### POST '/do/move'

La seguente rotta consente a un giocatore di eseguire una mossa in una partita in corso. Il client deve inviare il token di autenticazione, l’ID della partita, e le coordinate della mossa (from e to). Il sistema verifica l’autenticazione del giocatore, quindi controlla che il giocatore faccia parte della partita e che questa sia ancora in corso. Successivamente, verifica che la mossa sia valida rispetto alle regole del gioco (es. non ripetere la stessa mossa consecutivamente). Se la mossa è valida, viene applicata alla scacchiera e la partita viene aggiornata. Se si gioca contro l’IA, l’IA effettua la sua mossa in risposta, che viene anch’essa registrata. Se la partita finisce con una vittoria o un pareggio, viene notificato l’esito.

```mermaid
sequenceDiagram
    actor C as Client
    participant R as Router
    participant MC as MoveController
    participant MS as MoveService
    participant G as Giocatore
    participant P as Partita
    participant M as Mossa
    participant JWT as JwtMiddleware
    participant EF as ErrorFactory

    C->>R: POST /do/move (token, id_partita, from, to)
    R->>JWT: authenticateJWT(token)
    alt Token non valido o assente
        JWT->>EF: createError('UNAUTHORIZED', 'Autenticazione richiesta')
        EF-->>JWT: Error
        JWT->>R: next(error)
        R->>C: 401 Unauthorized
    else Token valido
        JWT->>MC: move(req, res, next)
        MC->>G: findByPk(req.user.id_giocatore)
        alt Giocatore non trovato
            G-->>MC: null
            MC->>EF: createError('NOT_FOUND', 'Giocatore non trovato')
            EF-->>MC: Error
            MC->>R: next(error)
            R->>C: 404 Not Found
        else Giocatore trovato
            G-->>MC: giocatore
            MC->>MS: executeMove(id_partita, from, to, id_giocatore)
            MS->>P: findByPk(id_partita)
            alt Partita non trovata
                P-->>MS: null
                MS->>EF: createError('NOT_FOUND', 'Partita non trovata')
                EF-->>MS: Error
                MS->>MC: throw error
                MC->>R: next(error)
                R->>C: 404 Not Found
            else Partita trovata
                P-->>MS: partita
                alt Mossa non valida
                    MS->>EF: createError('BAD_REQUEST', 'Mossa non valida')
                    EF-->>MS: Error
                    MS->>MC: throw error
                    MC->>R: next(error)
                    R->>C: 400 Bad Request
                else Mossa valida
                    MS->>M: create({ id_partita, from, to, id_giocatore })
                    M-->>MS: mossa salvata
                    alt Partita contro IA
                        MS->>MS: executeAiMove(draughts)
                        MS->>M: create IA move
                        M-->>MS: IA mossa salvata
                        MS-->>MC: return mossa + IA mossa
                        MC->>R: res.status(201).json({ success, moveDescription, aiMoveDescription })
                        R->>C: 201 Created
                    else Solo partita PvP
                        MS-->>MC: return moveDescription
                        MC->>R: res.status(201).json({ success, moveDescription })
                        R->>C: 201 Created
                    end
                end
            end
        end
    end
```

##### GET '/game-status/match-list?startDate=YYYY-MM-DD'

La seguente rotta restituisce un elenco delle partite giocate da un giocatore autenticato. Il client può fornire una data di inizio opzionale per filtrare solo le partite giocate da quella data in poi. Il sistema autentica l’utente tramite il token JWT, recupera l’ID del giocatore e cerca tutte le partite completate o abbandonate che lo coinvolgono. Se è specificata una data, il sistema restituisce solo le partite giocate a partire da quella data. Ogni partita include informazioni sullo stato (vinta, persa, abbandonata), il numero di mosse e la data di inizio.

```mermaid
sequenceDiagram
    actor C as Client
    participant R as Router
    participant GC as GameStatusController
    participant GS as GameStatusService
    participant G as Giocatore
    participant P as Partita
    participant JWT as JwtMiddleware
    participant EF as ErrorFactory

    C->>R: GET /game-status/match-list?startDate=yyyy-MM-dd (token)
    R->>JWT: authenticateJWT(token)
    alt Token non valido o assente
        JWT->>EF: createError('UNAUTHORIZED', 'Autenticazione richiesta')
        EF-->>JWT: Error
        JWT->>R: next(error)
        R->>C: 401 Unauthorized
    else Token valido
        JWT->>GC: getMatchList(req, res, next)
        GC->>G: findByPk(req.user.id_giocatore)
        alt Giocatore non trovato
            G-->>GC: null
            GC->>EF: createError('FORBIDDEN', 'Giocatore non trovato')
            EF-->>GC: Error
            GC->>R: next(error)
            R->>C: 403 Forbidden
        else Giocatore trovato
            G-->>GC: giocatore
            GC->>GS: getMatchList(id_giocatore, startDate)
            alt Partite trovate
                GS->>P: findAll({ id_giocatore, startDate })
                P-->>GS: partite
                GS-->>GC: return partite
                GC->>R: res.status(200).json(partite)
                R->>C: 200 OK (Lista partite)
            else Nessuna partita trovata
                GS-->>GC: []
                GC->>R: res.status(200).json([])
                R->>C: 200 OK (Nessuna partita trovata)
            end
        end
    end
```

##### PUT '/game-status/check-status/:id_partita'

La seguente rotta verifica lo stato di una partita specifica. Il client invia un token JWT per autenticarsi e l’ID della partita che vuole controllare. Il sistema autentica l’utente e controlla che la partita esista. Se la partita è terminata, il sistema restituisce lo stato (vittoria, sconfitta o pareggio) e, se esiste, il nome del vincitore. Se la partita è ancora in corso, viene restituito lo stato “in corso”. Se la partita è stata abbandonata, il sistema lo segnala.

```mermaid
sequenceDiagram
    actor C as Client
    participant R as Router
    participant GC as GameStatusController
    participant GS as GameStatusService
    participant G as Giocatore
    participant P as Partita
    participant JWT as JwtMiddleware
    participant EF as ErrorFactory

    C->>R: PUT /game-status/check-status/:id_partita (token)
    R->>JWT: authenticateJWT(token)
    alt Token non valido o assente
        JWT->>EF: createError('UNAUTHORIZED', 'Autenticazione richiesta')
        EF-->>JWT: Error
        JWT->>R: next(error)
        R->>C: 401 Unauthorized
    else Token valido
        JWT->>GC: evaluateGame(req, res, next)
        GC->>P: findByPk(id_partita)
        alt Partita non trovata
            P-->>GC: null
            GC->>EF: createError('NOT_FOUND', 'Partita non trovata')
            EF-->>GC: Error
            GC->>R: next(error)
            R->>C: 404 Not Found
        else Partita trovata
            P-->>GC: partita
            alt Partita completata o abbandonata
                alt Partita completata e vincitore identificato
                    GC->>G: findByPk(partita.id_vincitore)
                    alt Vincitore non trovato
                        G-->>GC: null
                        GC->>EF: createError('NOT_FOUND', 'Vincitore non trovato')
                        EF-->>GC: Error
                        GC->>R: next(error)
                        R->>C: 404 Not Found
                    else Vincitore trovato
                        G-->>GC: vincitore
                        GC->>R: res.status(200).json({ stato: "completata", vincitore: vincitore.nome })
                        R->>C: 200 OK (Partita completata, vincitore)
                    end
                else Partita abbandonata
                    GC->>R: res.status(200).json({ stato: "abbandonata" })
                    R->>C: 200 OK (Partita abbandonata)
                end
            else Partita in corso
                GC->>R: res.status(200).json({ stato: "in corso" })
                R->>C: 200 OK (Partita in corso)
            end
        end
    end
```

##### GET '/do/move/:id_partita/export?format={pdf, json}'

La seguente rotta permette di esportare lo storico delle mosse di una partita in formato JSON o PDF. Il client deve essere autenticato e specificare il formato desiderato. Il sistema verifica che la partita esista e che ci siano mosse registrate per quella partita. Se viene scelto il formato JSON, viene restituito un array di mosse con dettagli come origine, destinazione e data. Se viene scelto il formato PDF, il sistema genera un file PDF con lo storico delle mosse che può essere scaricato dal client.

```mermaid
sequenceDiagram
    actor C as Client
    participant R as Router
    participant MC as moveController
    participant MS as MoveService
    participant EF as ErrorFactory
    participant MM as MossaModel
    participant PDF as PDFGenerator
    participant JWT as JwtMiddleware

    C ->> R: GET /do/move/:id_partita/export (token, format=json/pdf)
    R ->> JWT: authenticateJWT(token)
    alt Token non valido o assente
        JWT ->> EF: createError('UNAUTHORIZED', 'Autenticazione richiesta')
        EF -->> JWT: Error
        JWT ->> R: next(error)
        R ->> C: 401 Unauthorized
    else Token valido
        JWT ->> MC: exportMoveHistory(req, res, next)
        alt Formato non valido
            MC ->> EF: createError('BAD_REQUEST', 'Formato non valido')
            EF -->> MC: Error
            MC ->> R: next(error)
            R ->> C: 400 Bad Request
        else Formato valido
            MC ->> MS: getMoveHistory(id_partita)
            MS ->> MM: findAll({ where: { id_partita } })
            alt Nessuna mossa trovata
                MM -->> MS: []
                MS ->> EF: createError('NOT_FOUND', 'Nessuna mossa trovata')
                EF -->> MS: Error
                MS ->> MC: throw error
                MC ->> R: next(error)
                R ->> C: 404 Not Found
            else Mosse trovate
                MM -->> MS: moveHistory
                alt Formato JSON
                    MC ->> R: res.json(moveHistory)
                    R ->> C: 200 OK (JSON)
                else Formato PDF
                    MC ->> MS: exportToPDF(id_partita)
                    MS ->> PDF: generate PDF
                    PDF -->> MS: pdfBuffer
                    MS -->> MC: return pdfBuffer
                    MC ->> R: res.setHeader('Content-Type', 'application/pdf')
                    MC ->> R: res.send(pdfBuffer)
                    R ->> C: 200 OK (PDF)
                end
            end
        end
    end
```

##### PUT '/game-status/abandon-game/:id_partita'

La seguente rotta permette a un giocatore di abbandonare una partita in corso. Il client deve autenticarsi con un token JWT e inviare l’ID della partita. Il sistema verifica che il giocatore faccia parte della partita e che questa sia ancora in corso. Se il giocatore abbandona, la partita viene segnata come abbandonata e il suo avversario viene dichiarato vincitore. Il giocatore che abbandona perde 0.5 punti, mentre l’avversario guadagna 1 punto.

```mermaid
sequenceDiagram
    actor C as Client
    participant R as Router
    participant GC as GameStatusController
    participant GS as GameStatusService
    participant G as GiocatoreModel
    participant P as PartitaModel
    participant JWT as JwtMiddleware
    participant EF as ErrorFactory

    C ->> R: PUT /game-status/abandon-game/:id_partita (token)
    R ->> JWT: authenticateJWT(token)
    alt Token non valido o assente
        JWT ->> EF: createError('UNAUTHORIZED', 'Autenticazione richiesta')
        EF -->> JWT: Error
        JWT ->> R: next(error)
        R ->> C: 401 Unauthorized
    else Token valido
        JWT ->> GC: abandonGame(req, res, next)

        GC ->> P: findByPk(id_partita)
        alt Partita non trovata
            P -->> GC: null
            GC ->> EF: createError('NOT_FOUND', 'Partita non trovata')
            EF -->> GC: Error
            GC ->> R: next(error)
            R ->> C: 404 Not Found
        else Partita trovata
            P -->> GC: partita

            alt Giocatore non autorizzato (non fa parte della partita)
                GC ->> EF: createError('FORBIDDEN', 'Giocatore non autorizzato')
                EF -->> GC: Error
                GC ->> R: next(error)
                R ->> C: 403 Forbidden
            else Giocatore autorizzato
                alt Partita non in corso
                    GC ->> EF: createError('BAD_REQUEST', 'La partita NON è in corso')
                    EF -->> GC: Error
                    GC ->> R: next(error)
                    R ->> C: 400 Bad Request
                else Partita in corso
                    GC ->> P: update({ stato: "abbandonata", id_vincitore: avversario }, { where: { id_partita } })
                    P -->> GC: Partita aggiornata
                    GC ->> G: update(punteggio_totale - 0.5, { where: { id_giocatore } })  // Penalizza chi abbandona
                    GC ->> G: update(punteggio_totale + 1, { where: { id_giocatore: avversario } })  // Assegna punto all'avversario
                    G -->> GC: Aggiornamento completato

                    GC ->> R: res.status(200).json({ stato: "abbandonata", vincitore: avversario })
                    R ->> C: 200 OK (Partita abbandonata, vincitore)
                end
            end
        end
    end
```

##### GET '/game-status/ranking?order={asc, desc}'

La seguente rotta restituisce la classifica dei giocatori, ordinata in base al punteggio totale. Il client può specificare se vuole ordinare la classifica in modo crescente o decrescente. Il sistema autentica l’utente e recupera tutti i giocatori ordinati per punteggio totale. Se nessun giocatore viene trovato, viene restituito un errore.

```mermaid
sequenceDiagram
  actor C as Client
  participant R as Router
  participant GSC as GameStatusController
  participant GSS as GameStatusService
  participant GM as GiocatoreModel
  participant EF as ErrorFactory

  C ->> R: GET /game-status/ranking (order=asc/desc)
  R ->> GSC: playersRanking(req, res, next)
  GSC ->> GSS: playersRanking(order)

  alt Parametro order non valido
    GSS ->> EF: createError('BAD_REQUEST', 'Ordine non valido')
    EF -->> GSS: Error
    GSS ->> GSC: throw error
    GSC ->> R: next(error)
  else Parametro order valido
    GSS ->> GM: findAll({ order: [['punteggio_totale', order]] })

    alt Nessun giocatore trovato
      GM -->> GSS: []
      GSS ->> EF: createError('NOT_FOUND', 'Nessun giocatore trovato')
      EF -->> GSS: Error
      GSS ->> GSC: throw error
      GSC ->> R: next(error)
    else Giocatori trovati
      GM -->> GSS: classifica giocatori
      GSS ->> GSC: return classifica giocatori
      GSC ->> R: res.status(200).json({ success: true, data: classifica })
      R ->> C: 200 OK (Lista classifica giocatori)
    end
  end
```

##### GET '/game-status/win-certify/:id_partita'

La seguente rotta permette di ottenere un certificato di vittoria per una partita completata. Il client deve essere autenticato e specificare l’ID della partita. Il sistema verifica che la partita esista e che sia stata completata con un vincitore. Se tutto è corretto, viene generato un certificato in formato PDF che include i dettagli della partita (vincitore, avversario, numero di mosse, durata).

```mermaid
sequenceDiagram
  actor C as Client
  participant R as Router
  participant GC as GameStatusController
  participant GS as GameStatusService
  participant G as GiocatoreModel
  participant P as PartitaModel
  participant PDF as PDF Generator
  participant JWT as JWT Middleware
  participant EF as ErrorFactory

  C ->> R: GET /game-status/win-certify/:id_partita (token)
  R ->> JWT: authenticateJWT(token)

  alt Token non valido o assente
    JWT ->> EF: createError('UNAUTHORIZED', 'Autenticazione richiesta')
    EF -->> JWT: Error
    JWT ->> R: next(error)
    R ->> C: 401 Unauthorized
  else Token valido
    JWT ->> GC: getVictoryCertify(req, res, next)
    GC ->> GS: getVictoryCertify(id_partita)
    GS ->> P: findByPk(id_partita)

    alt Partita non trovata
      P -->> GS: null
      GS ->> EF: createError('NOT_FOUND', 'Partita non trovata')
      EF -->> GS: Error
      GS ->> GC: throw error
      GC ->> R: next(error)
      R ->> C: 404 Not Found
    else Partita trovata
      P -->> GS: partita
      GS ->> G: findByPk(id_vincitore)

      alt Vincitore non trovato
        G -->> GS: null
        GS ->> EF: createError('NOT_FOUND', 'Vincitore non trovato')
        EF -->> GS: Error
        GS ->> GC: throw error
        GC ->> R: next(error)
        R ->> C: 404 Not Found
      else Vincitore trovato
        G -->> GS: vincitore
        GS ->> PDF: generateVictoryCertifyPDF(partita, vincitore)
        PDF -->> GS: pdfBuffer
        GS ->> GC: return pdfBuffer
        GC ->> R: res.send(pdfBuffer)
        R ->> C: 200 OK (PDF inviato)
      end
    end
  end
```

##### PUT '/admin/recharge'

La seguente rotta consente a un amministratore di ricaricare il saldo dei token di un giocatore. L’amministratore deve essere autenticato e deve fornire l’email del giocatore e il nuovo saldo di token da impostare. Il sistema verifica che l’utente sia un admin, controlla che l’email del giocatore esista e aggiorna il saldo dei token. Se il nuovo saldo è valido (maggiore o uguale a 0), l’operazione viene completata.

```mermaid
sequenceDiagram
  actor A as Admin
  participant R as Router
  participant AC as AdminController
  participant GM as GiocatoreModel
  participant EF as ErrorFactory
  participant JWT as JWT Middleware
  participant isAdmin as isAdmin Middleware

  A ->> R: PUT /admin/recharge (token, email, nuovoCredito)
  R ->> JWT: authenticateJWT(token)

  alt Token non valido o assente
    JWT ->> EF: createError('UNAUTHORIZED', 'Autenticazione richiesta')
    EF -->> JWT: Error
    JWT ->> R: next(error)
    R ->> A: 401 Unauthorized
  else Token valido
    JWT ->> isAdmin: isAdmin(req.user)

    alt Utente non è admin
      isAdmin ->> EF: createError('FORBIDDEN', 'Accesso non autorizzato')
      EF -->> isAdmin: Error
      isAdmin ->> R: next(error)
      R ->> A: 403 Forbidden
    else Utente è admin
      isAdmin ->> AC: creditRecharge(req, res, next)

      alt Parametri email o nuovoCredito mancanti
        AC ->> EF: createError('BAD_REQUEST', 'Email e nuovo credito obbligatori')
        EF -->> AC: Error
        AC ->> R: next(error)
        R ->> A: 400 Bad Request
      else Parametri validi
        AC ->> GM: findOne({ where: { email } })

        alt Utente non trovato
          GM -->> AC: null
          AC ->> EF: createError('NOT_FOUND', 'Utente non trovato')
          EF -->> AC: Error
          AC ->> R: next(error)
          R ->> A: 404 Not Found
        else Utente trovato
          GM -->> AC: user

          alt Credito non valido (nuovoCredito < 0)
            AC ->> EF: createError('BAD_REQUEST', 'Credito non può essere negativo')
            EF -->> AC: Error
            AC ->> R: next(error)
            R ->> A: 400 Bad Request
          else Credito valido
            AC ->> GM: update user.token_residuo = nuovoCredito
            GM -->> AC: success
            AC ->> R: res.status(201).json({ success, message })
            R ->> A: 201 Created (Credito aggiornato)
          end
        end
      end
    end
  end
```


## 🔗API Routes

| **Verbo HTTP** | **Endpoint**                                      | **Descrizione**                                                                                 | **Autenticazione JWT** |
|----------------|---------------------------------------------------|-------------------------------------------------------------------------------------------------|------------------------|
| **POST**       | `/login`                                          | Autenticazione dell'utente tramite email e password.                                             | ❌                     |
| **PUT**        | `/admin/recharge`                                 | Ricarica del saldo dei token per un utente (solo admin).                                         | ✅                     |
| **GET**        | `/game-status/ranking?order={asc,desc}`           | Recupero della classifica dei giocatori per punteggio.                                           | ❌                     |
| **POST**       | `/game/create`                                    | Creazione di una nuova partita tra giocatori o contro l'IA.                                      | ✅                     |
| **POST**       | `/do/move`                                        | Esecuzione di una mossa nella partita corrente.                                                  | ✅                     |
| **PUT**        | `/game-status/check-status/{:id_partita}`         | Recupero dello stato attuale di una specifica partita.                                           | ✅                     |
| **GET**        | `/game-status/win-certify/{:id_partita}`          | Generazione del certificato di vittoria per una partita.                                         | ✅                     |
| **GET**        | `/do/move/{:id_partita}/export?format={pdf,json}` | Esportazione della cronologia delle mosse di una partita (formato PDF o JSON).                   | ✅                     |
| **PUT**        | `/game-status/abandon-game/{:id_partita}`         | Abbandono di una partita in corso, con aggiornamento del punteggio.                              | ✅                     |
| **GET**        | `/game-status/match-list?startDate=YYYY-MM-DD`    | Recupero della cronologia delle partite giocate dal giocatore con filtro data opzionale.          | ✅                     |

### POST `/login`

La rotta POST /login serve per effettuare l’autenticazione di un utente. L’utente deve inserire l’email e la password all’interno del corpo della richiesta. L’email viene utilizzata per individuare il giocatore nel database, mentre la password viene verificata per confermare l’identità del giocatore. Se l’autenticazione ha esito positivo, viene generato un token JWT che verrà restituito all’utente e potrà essere usato per autenticare le successive richieste.
#### Parametri

| **Posizione**      | **Nome**   | **Tipo**  | **Descrizione**              | **Obbligatorio** |
|--------------------|------------|-----------|------------------------------|------------------|
| Richiesta nel body | `email`    | `string`  | Indirizzo email dell'utente   | ✅               |
| Richiesta nel body     | `password` | `string`  | Password dell'utente          | ✅               |

#### Esempio di richiesta

```
{
    "email": "simone@example.com",
    "password": "progavanzata"
}
```
#### Risposta
```
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF9naW9jYXRvcmUiOjEsInJ1b2xvIjoidXRlbnRlIiwiZW1haWwiOiJzaW1vbmVAZXhhbXBsZS5jb20iLCJpYXQiOjE3Mjg1NTA1OTIsImV4cCI6MTcyODU1NDE5Mn0.iraDD3h4vAG4VjJQVM04xCEehdrxBkXxkSXcV95xhx4"
}
```

### POST `/game/create`

La rotta POST `/game/create` permette a un giocatore di creare una nuova partita. Il giocatore deve essere autenticato tramite un token JWT, che viene utilizzato per identificare l'utente. Se l'autenticazione è valida, il sistema verifica se il giocatore ha già una partita in corso. Se il giocatore ha una partita attiva, viene restituito un errore. In caso contrario, il giocatore può scegliere di sfidare un altro giocatore inserendo la sua email, oppure può decidere di giocare contro l'IA selezionando un livello di difficoltà. Il sistema esegue la validazione dei parametri inseriti, come il tipo di partita e il livello IA. Se viene indicato un secondo giocatore, il sistema controlla che anche lui non abbia già una partita in corso. Alla fine, la partita viene creata con una configurazione iniziale della scacchiera e restituita al giocatore. Se si sceglie di giocare contro l'IA, non è necessario specificare il secondo giocatore.

#### Parametri

| **Posizione**      | **Nome**           | **Tipo** | **Descrizione**                              | **Obbligatorio** |
|--------------------|--------------------|----------|----------------------------------------------|------------------|
| Richiesta nel body | `email_giocatore2`  | `string` | Email del secondo giocatore (PvP)            | ❌               |
| Richiesta nel body | `tipo`              | `string` | Tipo di partita (PvP o contro IA)            | ✅               |
| Richiesta nel body | `livello_IA`        | `string` | Livello di difficoltà IA (solo per partite IA) | ❌               |

#### Esempio di richiesta per la creazione di una partita contro un giocatore
```
{
  "email_giocatore2": "piero@example.com",
  "tipo": "Competitiva"
}
```

#### Risposta
```
{
  "success": true,
  "statusCode": 201,
  "message": "Partita PvP creata con successo",
  "data": {
    "id_partita": 5,
    "id_giocatore1": 1,
    "id_giocatore2": 3,
    "stato": "in corso",
    "data_inizio": "2024-10-10"
  }
}
```

#### Esempio di richiesta per la creazione di una partita contro un l'IA
```
{
  "livello_IA": "difficile",
  "tipo": "Competitiva"
}
```

#### Risposta
```
{
    "success": true,
    "statusCode": 200,
    "message": "Partita contro IA creata con successo",
    "data": {
        "id_partita": 6,
        "stato": "in corso",
        "id_giocatore1": 1,
        "data_inizio": "2024-10-10"
    }
}
```

### POST `/do/move`

La rotta POST `/do/move` permette a un giocatore di eseguire una mossa in una partita in corso. Il giocatore deve essere autenticato tramite un token JWT, che viene utilizzato per identificare l'utente e assicurarsi che faccia parte della partita. Il sistema verifica l'autenticazione e controlla se la partita esiste e se è ancora in corso. Una volta verificata la validità della mossa (ad esempio, evitando di ripetere la stessa mossa), la mossa viene applicata alla scacchiera. Se si gioca contro l'IA, il sistema effettua la mossa dell'IA e la registra.

#### Parametri

| **Posizione**      | **Nome**      | **Tipo**  | **Descrizione**                | **Obbligatorio** |
|--------------------|---------------|-----------|--------------------------------|------------------|
| Richiesta nel body | `id_partita`  | `number`  | ID della partita               | ✅               |
| Richiesta nel body | `from`        | `string`  | Coordinata di origine della mossa | ✅               |
| Richiesta nel body | `to`          | `string`  | Coordinata di destinazione della mossa | ✅               |

#### Esempio di richiesta in una partita con un giocatore
```
{
    "id_partita": 7,
    "from": "D7",
    "to": "H7"
}
```

#### Risposta
```
{
  "success": true,
  "statusCode": 201,
  "message": "Mossa eseguita correttamente",
  "data": {
    "move": "Hai mosso un pezzo singolo di colore nero da D7 a H7."
  }
}
```

#### Esempio di richiesta in una partita con l'IA
```
{
    "id_partita": 8,
    "from": "D7",
    "to": "H7"
}
```

#### Risposta
```
{
    "success": true,
    "statusCode": 201,
    "message": "Mossa eseguita correttamente",
    "data": {
        "move": "Hai mosso un pezzo singolo di colore nero da D7 a H7. IA ha mosso un pezzo singolo di colore nero da E6 a A6."
    }
}
```

### GET `/game-status/match-list?startDate=YYYY-MM-DD`

La rotta GET `/game-status/match-list` permette a un giocatore autenticato di recuperare un elenco delle partite giocate. Il client può opzionalmente fornire una data di inizio (`startDate`) per filtrare solo le partite giocate a partire da quella data. Il sistema autentica il giocatore tramite il token JWT e cerca tutte le partite completate o abbandonate che lo coinvolgono. Se una data è specificata, vengono incluse solo le partite giocate da quel giorno in poi. Ogni partita restituita include informazioni come lo stato (vinta, persa, abbandonata), il numero di mosse e la data di inizio.

#### Parametri

| **Posizione**    | **Nome**      | **Tipo**  | **Descrizione**                        | **Obbligatorio** |
|------------------|---------------|-----------|----------------------------------------|---------------|
| Query param      | `startDate`   | `string`  | Data di inizio in formato `YYYY-MM-DD` | ❌            |

#### Esempio di risposta senza filtro per la data
```
{
    "partite": {
        "success": true,
        "statusCode": 200,
        "message": "Elenco delle partite giocate da Simone Recinelli",
        "data": [
            {
                "id_partita": 1,
                "stato": "completata",
                "numero_mosse": 5,
                "risultato": "Vinta",
                "data_inizio": "2024-04-09"
            },
            {
                "id_partita": 4,
                "stato": "completata",
                "numero_mosse": 5,
                "risultato": "Persa",
                "data_inizio": "2024-02-24"
            }
        ]
    }
}
```
#### Esempio di risposta con filtro per la data "2024-04-09"
```
{
    "partite": {
        "success": true,
        "statusCode": 200,
        "message": "Elenco delle partite giocate da Simone Recinelli",
        "data": [
            {
                "id_partita": 1,
                "stato": "completata",
                "numero_mosse": 5,
                "risultato": "Vinta",
                "data_inizio": "2024-04-09"
            }
        ]
    }
}
```

#### Esempio di risposta in caso di mancata partita trovata in quella specifica data
```
{
    "error": "Nessuna partita trovata per la data 2023-12-26"
}
```

### PUT `/game-status/check-status/:id_partita`

La rotta `PUT /game-status/check-status/:id_partita` permette a un giocatore di verificare lo stato di una partita specifica. Il giocatore deve essere autenticato tramite il token JWT e deve fornire l'ID della partita che desidera controllare. Il sistema autentica l'utente e verifica che la partita esista. Se la partita è terminata, restituisce lo stato e, se disponibile, il nome del vincitore. Se la partita è ancora in corso, viene restituito lo stato "in corso". Se la partita è stata abbandonata, il sistema lo segnala.

#### Parametri

| **Posizione**    | **Nome**         | **Tipo**  | **Descrizione**              | **Obbligatorio** |
|------------------|------------------|-----------|------------------------------|------------------|
| Path Param       | `id_partita`      | `integer` | ID della partita da verificare | ✅               |

#### Esempio di risposta (`http://localhost:3001/game-status/check-status/1`)
```
{
    "risultato": {
        "success": true,
        "statusCode": 200,
        "risultato": "La partita è stata vinta da Simone"
    }
}
```

### GET `/do/move/:id_partita/export?format={pdf, json}`

La rotta `GET /do/move/:id_partita/export?format={pdf, json}` permette a un giocatore autenticato di esportare lo storico delle mosse di una partita. Il formato di esportazione può essere JSON o PDF. Il sistema verifica l'autenticazione del giocatore e l'esistenza della partita, oltre a controllare se ci sono mosse registrate. In formato JSON, viene restituito un array con i dettagli delle mosse, mentre in formato PDF viene generato e restituito un file PDF che può essere scaricato.

#### Parametri

| **Posizione**    | **Nome**         | **Tipo**  | **Descrizione**                   | **Obbligatorio** |
|------------------|------------------|-----------|-----------------------------------|------------------|
| Path Param       | `id_partita`      | `integer` | ID della partita da esportare     | ✅               |
| Query Param      | `format`          | `string`  | Formato di esportazione (json/pdf) | ✅               |

#### Esempio di risposta (`http://localhost:3001/do/move/1/export?format=json`)

GIOCATORE NOME E COGNOME MANCA
```
[
    {
        "numeroMossa": 1,
        "origin": "A6",
        "destination": "B5",
        "dataMossa": "2024-10-10 13:55:25"
    },
    {
        "numeroMossa": 2,
        "origin": "H3",
        "destination": "E4",
        "dataMossa": "2024-10-10 13:57:25"
    }
]
```

#### Esempio di risposta (`http://localhost:3001/do/move/1/export?format=pdf`)

AGGIUNGERE PDF

### Abandon

{
"risultato": {
"success": true,
"statusCode": 201,
"risultato": "Il giocatore Simone Recinelli ha abbandonato la partita. Il giocatore Piero Matteotti ha vinto e ha ricevuto 1 punto."
}
}










