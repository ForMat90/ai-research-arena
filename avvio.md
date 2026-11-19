# Avvio rapido

Comandi per far partire il progetto su Windows (PowerShell), dalla cartella `QuantumResearchLab`.

## 1. Prima installazione

Serve Python 3.11 o superiore.

```powershell
python --version
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Se PowerShell blocca l'attivazione del venv, esegui una volta:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Le versioni successive basta attivare il venv con `.\.venv\Scripts\Activate.ps1`.

## 2. Configurazione (facoltativa)

Non serve alcuna chiave per avviare: il provider predefinito è gratuito e anonimo.

```powershell
Copy-Item .env.example .env
```

Il file `.env` serve solo se vuoi cambiare provider o modello (vedi in fondo).

## 3. Avvio del server

```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Poi apri il browser su:

```
http://127.0.0.1:8000
```

Per fermare il server: `CTRL+C` nella finestra.

## 4. Controllo rapido

Con il server attivo, in un'altra finestra:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
```

Deve restituire `status: ok` e il provider attivo.

## Se ottieni "[WinError 10013]"

Significa che la porta è già occupata o non consentita. Due soluzioni.

Avvia su un'altra porta:

```powershell
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8010 --reload
```

Oppure libera la porta 8000 chiudendo il processo che la occupa:

```powershell
Get-NetTCPConnection -LocalPort 8000 -State Listen | Select-Object OwningProcess
Stop-Process -Id <PID>
```

Sostituisci `<PID>` con il numero restituito dal primo comando.

## Provider alternativi

Tutto si imposta nel file `.env`.

Inferenza locale senza chiavi con Ollama:

```dotenv
LLM_PROVIDER=ollama
```

Poi, una sola volta:

```powershell
ollama pull qwen2.5:7b
```

OpenRouter con chiave personale:

```dotenv
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=la_tua_chiave
```

## Comandi utili

Attivare il venv nelle sessioni successive:

```powershell
.\.venv\Scripts\Activate.ps1
```

Eseguire i test del workflow multi-agent:

```powershell
python -m unittest discover -s tests -v
```
