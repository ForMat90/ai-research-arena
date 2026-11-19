# 🏛️ AI Research Arena

[Python](<https://www.python.org/?utm_source=chatgpt.com>) [FastAPI](<https://fastapi.tiangolo.com?utm_source=chatgpt.com>) [LangGraph](<https://langchain-ai.github.io/langgraph/?utm_source=chatgpt.com>) [Docker](<https://www.docker.com/?utm_source=chatgpt.com>)

Progetto personale in cui quattro agenti LLM con ruoli diversi discutono una tua domanda e arrivano a una sintesi. Il dibattito è orchestrato come una macchina a stati (LangGraph), servito in streaming real-time (SSE) da FastAPI e mostrato in una UI web animata.

<img width="1687" height="1010" alt="Screenshot 2026-11-19 140720" src="https://github.com/user-attachments/assets/5ca778e8-db7f-4ce3-8cd8-5b2808129b85" />

> Obiettivo del progetto: imparare e dimostrare, end-to-end, come si costruisce un sistema multi-agent: orchestrazione, output strutturato validato, streaming, fallback tra provider, test deterministici e containerizzazione.

## Cosa fa

Scrivi una domanda (opzionalmente alleghi un PDF). Poi:

1. Luna (coordinatrice) porta la domanda al tavolo.
2. Nova (analista teorica) risponde: principi, definizioni, ragionamento.
3. Atlas (analista pratica) verifica se regge: esempi, controesempi, limiti concreti.
4. Sigma (revisore critico) cerca il punto più debole e formula un'obiezione.
5. Sigma emette un verdetto strutturato (JSON) che decide se serve un altro round (massimo 3).
6. Luna produce la sintesi finale in sezioni. Se il verdetto non è "supported", un agente aggiunge una breve nota di cautela o correzione.

Dalla risposta finale si possono generare flashcard, esportabili in JSON e CSV.

## Come funziona

### Perché una macchina a stati e non un ciclo di chat?

In una semplice chat tra bot gli agenti tendono ad annuire a vicenda e non c'è un criterio chiaro per fermarsi. Qui l'interazione è un grafo (LangGraph):

- Stato condiviso (`DebateState`): domanda, fonti, testo del PDF, memoria, lista cumulativa dei turni.
- Nodi: ogni agente è un nodo che legge lo stato, chiama l'LLM in streaming e restituisce un aggiornamento.
- Archi condizionali: dopo ogni round il nodo di revisione di Sigma restituisce un JSON validato con Pydantic; il campo `continue_debate` decide se si va avanti o si passa a Luna. Il tetto di 3 round è imposto dal codice, non dal modello.

Esempio di verdetto strutturato:

json

```json
{
  "verdict": "supported | caveat | correction | insufficient_sources",
  "note": "Spiegazione del punto debole residuo",
  "continue_debate": true,
  "reason": "Motivo breve della scelta"
}
```

### Workflow multi-agent

mermaid

```mermaid
graph TD
    START([Domanda]) --> R[Research: arXiv + PDF]
    R --> N1[Nova R1]
    N1 --> A1[Atlas R1]
    A1 --> S1[Sigma R1: obiezione]
    S1 --> SR1{Sigma: continuare?}

    SR1 -- sì --> N2[Nova R2] --> A2[Atlas R2] --> SR2{Sigma: continuare?}
    SR2 -- sì --> N3[Nova R3] --> A3[Atlas R3] --> SR3[Sigma: chiusura forzata]

    SR1 -- no --> L[Luna: sintesi]
    SR2 -- no --> L
    SR3 --> L

    L --> COND{verdetto == supported?}
    COND -- sì --> END([Fine stream])
    COND -- no --> FU[Nota finale] --> END
```

### Streaming

Il backend emette eventi Server-Sent Events (SSE):

- `agent_start`
- `token`
- `agent_end`
- `round_decision`
- `sources`
- `complete`
- `error`

Il frontend (JavaScript puro, senza framework) legge gli eventi dallo stream e anima il tavolo in tempo reale.

### Fonti

Per ogni domanda viene fatta una ricerca per parole chiave sull'API di arXiv (primi 3 risultati, solo abstract).

Se alleghi un PDF, il testo viene estratto con `pypdf`:

- Dimensione massima: 10 MB.
- Massimo 50 pagine.
- Massimo 20.000 caratteri.

Gli agenti possono citare le fonti come `[S1]`, `[D1]`.

> Non è un RAG con embedding e database vettoriale: è una ricerca per parole chiave sugli abstract.

### Provider LLM

| Provider | Chiave API | Note |
| --- | --- | --- |
| Pollinations | No | Gratuito, con rate-limit per IP; predefinito nel codice se manca il file `.env` |
| LLM7 | No | Predefinito in `.env.example`, utilizzato anche come fallback |
| Ollama | No | Modello locale, consigliato per velocità e privacy |
| OpenRouter | Sì | Se manca la chiave si torna al provider gratuito |

Si può assegnare un modello diverso a ciascun ruolo:

- `NOVA_MODEL`
- `ATLAS_MODEL`
- `SIGMA_MODEL`
- `COORDINATOR_MODEL`

### Privacy

- Il server non salva domande né PDF.
- Le ultime 3 domande/risposte stanno solo nel `localStorage` del browser (pulsante Dimentica per cancellarle).
- La memoria e il PDF vengono passati ai modelli dentro tag delimitati e marcati come dati, non istruzioni (mitigazione di base contro la prompt injection, non una garanzia).
- Quando invii una domanda, il contenuto viene trasmesso al provider LLM scelto.

## Stack tecnologico

- Backend: Python, FastAPI, LangGraph, Pydantic, httpx, pypdf.
- Frontend: HTML, CSS, JavaScript vanilla (SVG animati, nessun framework).
- Orchestrazione: LangGraph con workflow multi-agent e routing condizionale.
- Validazione: Pydantic per gli output strutturati.
- Streaming: Server-Sent Events (SSE).
- Containerizzazione: Docker, Docker Compose.
- Test: `unittest` con mock di rete e LLM.
- Interfaccia: bilingue italiano / inglese.

## Avvio rapido

AI Research Arena può essere eseguito in due modalità:

- Docker Compose (consigliato): ambiente isolato e riproducibile, senza dover installare manualmente Python e le dipendenze.
- Python locale: esecuzione tradizionale tramite ambiente virtuale.

### Opzione 1 — Docker Compose (consigliato)

Requisiti:

- Docker Desktop su Windows/macOS oppure Docker Engine con Docker Compose su Linux.

Clona il repository:

bash

```bash
git clone https://github.com/ForMat90/ai-research-arena.git
cd ai-research-arena
```

Crea il file di configurazione.

Windows PowerShell:

powershell

```powershell
Copy-Item .env.example .env
```

Linux/macOS:

bash

```bash
cp .env.example .env
```

Costruisci l'immagine e avvia l'applicazione:

bash

```bash
docker compose up --build
```

Apri il browser:

\*\*http://localhost:8000\*\*

Per arrestare l'applicazione:

bash

```bash
docker compose down
```

Per avviarla nuovamente in background:

bash

```bash
docker compose up -d
```

Per visualizzare i log:

bash

```bash
docker compose logs -f
```

La configurazione dei provider LLM viene letta dal file `.env`.

### Opzione 2 — Python locale

Requisiti:

- Python 3.11 o superiore.

Clona il repository:

powershell

```powershell
git clone https://github.com/ForMat90/ai-research-arena.git
cd ai-research-arena
```

Crea e attiva un ambiente virtuale:

powershell

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Installa le dipendenze:

powershell

```powershell
python -m pip install -r requirements.txt
```

Crea il file di configurazione:

powershell

```powershell
Copy-Item .env.example .env
```

Avvia il backend:

powershell

```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Apri il browser:

\*\*http://127.0.0.1:8000\*\*

Su Linux/macOS usa `source .venv/bin/activate` e `cp .env.example .env`.

### Configurazione provider

Non è necessariamente richiesta una chiave API: sono disponibili provider gratuiti.

Per utilizzare un modello locale con Ollama:

dotenv

```dotenv
LLM_PROVIDER=ollama
LLM_MODEL=qwen2.5:7b
```

Scarica il modello:

bash

```bash
ollama pull qwen2.5:7b
```

Nota Docker: se Ollama è installato sul computer host, il container deve poter raggiungere il servizio Ollama tramite l'indirizzo di rete dell'host. `localhost` all'interno del container identifica il container stesso, non il computer host.

Altri dettagli (porta occupata e provider alternativi) sono disponibili in [`avvio.md`](<https://avvio.md?utm_source=chatgpt.com>).

## Docker

L'applicazione viene eseguita in un singolo container Docker che comprende:

- Backend FastAPI.
- Workflow multi-agent LangGraph.
- Frontend web.
- Dipendenze Python.

Docker Compose gestisce:

- Costruzione dell'immagine Docker.
- Avvio e arresto del container.
- Esposizione della porta applicativa.
- Configurazione delle variabili d'ambiente.
- Politica di riavvio del container.

La porta 8000 viene esposta esclusivamente sull'interfaccia locale del computer (`127.0.0.1`).

Il file `.env` contiene la configurazione personale dei provider e non deve essere caricato su GitHub.

## Test

I test utilizzano `unittest` con mock di rete e LLM.

Per eseguirli:

powershell

```powershell
python -m unittest discover -s tests -v
```

I test mockano `_stream_completion`, `_completion` e `_search_arxiv`, quindi girano senza rete e senza chiavi. Verificano che:

- Se Sigma dice `continue_debate: false`, il grafo si ferma e passa a Luna dopo un solo round.
- Se Sigma continua a dire `true`, il dibattito non supera mai `MAX_DEBATE_ROUNDS = 3`.
- La memoria utente viene iniettata nel contesto con i delimitatori corretti.
- La selezione di provider e modelli per ruolo funziona anche senza chiavi.

## Limiti noti

- Con il provider gratuito una discussione completa può richiedere da 2 a 5 minuti (rate-limit del servizio).
- Gli agenti sono tutti LLM: possono sbagliare o inventare. Il verdetto di Sigma è una valutazione del modello, non una verifica dei fatti.
- Le fonti sono solo abstract arXiv trovati per parole chiave: possono essere poco pertinenti.
- Nessuna autenticazione né limiti per utente: è pensato per uso locale, non per un deploy pubblico così com'è.
- I PDF scansionati (senza testo) non sono supportati.

## Struttura del progetto

text

```text
ai-research-arena/
│
├── backend/              API FastAPI, grafo LangGraph, prompt degli agenti
├── frontend/             Interfaccia web (index.html, app.js, style.css)
├── tests/                Test del workflow
│
├── Dockerfile            Immagine Docker dell'applicazione
├── docker-compose.yml    Configurazione del container
├── .dockerignore         File esclusi dal contesto Docker
│
├── requirements.txt      Dipendenze Python
├── .env.example          Esempio di configurazione
├── avvio.md              Comandi di avvio e risoluzione problemi
├── README.md             Documentazione del progetto
└── LICENSE               Licenza MIT
```

## Progetti correlati

- [drone-hil-automation-lab](<https://github.com/ForMat90/drone-hil-automation-lab?utm_source=chatgpt.com>): test end-to-end su un drone simulato in Gazebo/ROS 2, guidati con Playwright via API HTTP.

## Autore

Matteo ([@ForMat90](<https://github.com/ForMat90?utm_source=chatgpt.com>))

Automation tester che sta ampliando le proprie competenze verso l'AI Engineering.

Questo progetto è il mio banco di prova su orchestrazione di agenti LLM, output strutturato, workflow multi-agent, streaming e sviluppo backend.

## Licenza

MIT. Vedi il file LICENSE.<img width="1713" height="1042" alt="Screenshot 2026-11-19 092548" src="https://github.com/user-attachments/assets/ab8aaa26-6a19-42d6-9e49-0c97b87a20f7" />

