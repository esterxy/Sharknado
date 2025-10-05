# Sharknado — Documentação do Repositório

> **Stack**: FastAPI (backend) · React + Vite + Mapbox GL (frontend) · Notebooks de ML (Random Forest e predições quase em tempo real) · PostgreSQL (persistência planejada).  
> **Monorepo** com três pastas na raiz: `Fastapi/`, `MachileLearning/` e `vite-project/`.

---

## Sumário

1. [Visão Geral](#visão-geral)  
2. [Estrutura do Repositório](#estrutura-do-repositório)  
3. [Como Executar](#como-executar)  
4. [Frontend (vite-project)](#frontend-vite-project)  
5. [Backend (FastAPI)](#backend-fastapi)  
6. [Machine Learning (MachileLearning)](#machine-learning-machilelearning)  
7. [Fluxo de Dados & Integração](#fluxo-de-dados--integração)  
8. [Variáveis de Ambiente](#variáveis-de-ambiente)  
9. [API (contrato)](#api-contrato)  
10. [Boas Práticas & Segurança](#boas-práticas--segurança)  
11. [Roadmap](#roadmap)  
12. [Créditos & Licença](#créditos--licença)

---

## Visão Geral

**Objetivo:** mapear hotspots de forrageamento de tubarões a partir de variáveis oceanográficas (ex.: clorofila, frentes e eddies) e disponibilizar isso via **API** e **mapa web**.

- **Frontend**: SPA (React + Vite + Mapbox GL) que renderiza pontos/camadas de hotspots e aplica filtros simples.  
- **Backend**: API FastAPI com módulos para banco de dados, modelos (ORM), esquemas (Pydantic) e rotas. Rota `/hotspots` entrega os pontos previstos.  
- **ML**: notebooks com Random Forest, artefato `modelo_tubarao_v1.pkl` e rotinas de ingestão de dados quase em tempo real (ex.: ERDDAP/GIBS).

> O repositório pode conter dados/mock para desenvolvimento local (ex.: `mockHotspots.json`) e scripts utilitários para ingestão de dados.

---

## Estrutura do Repositório

```
Sharknado/
├─ Fastapi/                 # API e integração com dados (NASA GIBS, DB)
│  ├─ core/                 # conexão/cliente de banco (PostgreSQL/SQLAlchemy)
│  ├─ models/               # modelos ORM
│  ├─ schemas/              # Pydantic (entrada/saída)
│  ├─ routers/              # endpoints (ex.: /hotspots, /health)
│  └─ gibs.py               # ponto de entrada FastAPI (app)
│
├─ MachileLearning/         # notebooks, dados e modelo/artefatos
│  ├─ RandomForestSharknados.ipynb
│  ├─ PrevisõesTempoReal.ipynb
│  ├─ dataset_enriquecido.csv
│  └─ modelo_tubarao_v1.pkl
│
└─ vite-project/            # SPA React + Vite + Mapbox GL
   ├─ src/
   │  ├─ components/        # Map.jsx, Sidebar.jsx, etc.
   │  ├─ data/mockHotspots.json
   │  └─ main.jsx, App.jsx
   ├─ index.html
   └─ package.json
```

> Os nomes exatos dos arquivos podem variar; ajuste conforme o que está no seu repositório.

---

## Como Executar

### Requisitos

- **Node.js 18+** (frontend)  
- **Python 3.10+** (backend/ML)  
- **PostgreSQL 14+** (persistência)  
- **Conta Mapbox** (token) para o mapa

### 1) Frontend (Vite)

```bash
cd vite-project
npm install
# crie .env.local com VITE_MAPBOX_TOKEN=seu_token e VITE_API_BASE=http://localhost:8000
npm run dev  # abre em http://localhost:5173
```

### 2) Backend (FastAPI)

```bash
cd Fastapi
python -m venv .venv && source .venv/bin/activate    # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt  # se existir; senão:
# pip install fastapi uvicorn pydantic sqlalchemy psycopg2-binary python-dotenv requests

# crie .env com:
# DATABASE_URL=postgresql+psycopg2://usuario:senha@host:5432/sharknado
# ALLOWED_ORIGINS=http://localhost:5173
# MODEL_PATH=../MachileLearning/modelo_tubarao_v1.pkl
# GIBS_BASE=https://gibs.earthdata.nasa.gov/wmts
# ERDDAP_BASE=https://<servidor-erddap>

uvicorn gibs:app --reload
# Swagger/OpenAPI: http://localhost:8000/docs
```

### 3) Notebooks de ML

Abra os cadernos em `MachileLearning/`:

- **RandomForestSharknados.ipynb** — treino e exportação do modelo (`modelo_tubarao_v1.pkl`) a partir de `dataset_enriquecido.csv`.  
- **PrevisõesTempoReal.ipynb** — busca dados recentes (ex.: ERDDAP) e executa o modelo; gera pontos previstos (hotspots).

**Integração com o backend:** após a predição, salve no PostgreSQL e exponha via `GET /hotspots`.

---

## Frontend (vite-project)

### Componentes

- **Map.jsx**: inicializa Mapbox GL, carrega hotspots (de `mockHotspots.json` ou da API) e renderiza camadas/pontos.  
- **Sidebar.jsx**: filtros simples (ex.: período, região).  
- **.env.local**: `VITE_MAPBOX_TOKEN`, `VITE_API_BASE`.

### Dicas

- Use **clusterização** para muitos pontos.  
- Exiba **legenda** (cores por score) e **tooltip** com metadados (ex.: `fonte`, `timestamp`).

---

## Backend (FastAPI)

### Organização sugerida

- `core/database.py`: sessão/engine do SQLAlchemy com `DATABASE_URL`.  
- `models/hotspot.py`: tabela `hotspots` (`id`, `lat`, `lon`, `score`, `timestamp`, `fonte`).  
- `schemas/hotspot.py`: `HotspotOut` (resposta) e `HotspotIn` (ingestão).  
- `routers/hotspots.py`: `GET /hotspots` (listar/filtrar), `POST /hotspots` (ingestão).  
- `gibs.py`: instancia `FastAPI`, CORS e `include_router`.

### Exemplo de criação de tabela (SQL)

```sql
CREATE TABLE IF NOT EXISTS hotspots (
  id TEXT PRIMARY KEY,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  score DOUBLE PRECISION NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  fonte TEXT,
  extra JSONB
);
CREATE INDEX IF NOT EXISTS idx_hotspots_time ON hotspots (timestamp);
CREATE INDEX IF NOT EXISTS idx_hotspots_geom ON hotspots (lat, lon);
```

---

## Machine Learning (MachileLearning)

- **Baseline**: Random Forest (explicável, rápido e robusto) com features ambientais (clorofila, SST, gradientes, métricas de eddies/frentes, hora local).  
- **Artefatos**: `modelo_tubarao_v1.pkl` (serializado), `dataset_enriquecido.csv`.  
- **Produção**: transformar notebook em **script/CLI** (ex.: `python ml/predict.py --date 2025-10-05`) e agendar via cron.

**Boas práticas**

- Cross‑validação **bloqueada** no tempo/espaço.  
- Métricas: AUC/PR‑AUC, Brier, calibração.  
- SHAP para explicar **influência das variáveis**.

---

## Fluxo de Dados & Integração

1. **Aquisição/Derivação**: satélites (ex.: PACE/MODIS para clorofila; SWOT/altimetria para eddies; SST), serviços como **GIBS/ERDDAP**.  
2. **Modelo**: gera `score` de probabilidade por ponto/região.  
3. **Persistência**: escreve no **PostgreSQL** (tabela `hotspots`).  
4. **API**: `GET /hotspots` retorna JSON com filtros por área/tempo.  
5. **Mapa**: frontend consome API e renderiza camadas e filtros.

---

## Variáveis de Ambiente

### Frontend (`vite-project/.env.local`)

```ini
VITE_MAPBOX_TOKEN=seu_token_mapbox
VITE_API_BASE=http://localhost:8000
```

### Backend (`Fastapi/.env`)

```ini
DATABASE_URL=postgresql+psycopg2://usuario:senha@host:5432/sharknado
ALLOWED_ORIGINS=http://localhost:5173
MODEL_PATH=../MachileLearning/modelo_tubarao_v1.pkl
GIBS_BASE=https://gibs.earthdata.nasa.gov/wmts
ERDDAP_BASE=https://<servidor-erddap>
LOG_LEVEL=INFO
```

---

## API (contrato)

### `GET /hotspots`

Retorna uma lista paginada/filtrável de hotspots.

**Query params sugeridos**

- `bbox` (minLon,minLat,maxLon,maxLat) **ou** `lat`, `lon`, `radius_km`  
- `since` (ISO‑8601) — filtra por data/hora  
- `limit` (padrão 100)

**Exemplo de resposta**

```json
{
  "items": [
    {
      "id": "hs_2025_0001",
      "lat": -22.97,
      "lon": -43.18,
      "score": 0.82,
      "timestamp": "2025-10-04T12:00:00Z",
      "fonte": "modelo_tubarao_v1",
      "camadas": {
        "chl_a": 0.45,
        "sst": 21.6,
        "eddy": "anticiclonico"
      }
    }
  ],
  "total": 1
}
```

### `POST /hotspots` (opcional)

Recebe predições do pipeline ML para ingestão no banco.

### `GET /health`

Verificação simples do serviço.

---

## Boas Práticas & Segurança

- **Tokens e chaves**: nunca hardcode; use `.env` e arquivos `*.example`.  
- **CORS**: permita apenas origens conhecidas (ex.: `http://localhost:5173` em dev).  
- **Observação de conservação**: agregue/atras coordenadas de espécies sensíveis em produção.  
- **Reprodutibilidade**: fixe versões em `requirements.txt` e `package.json`.

---

## Roadmap

- [ ] Backend: publicar routers/schemas/models; Dockerfile + docker‑compose.  
- [ ] ML: converter notebook de predição em script/CLI; agendar job; salvar em PostgreSQL.  
- [ ] Frontend: trocar `mockHotspots.json` por chamada real à API; legenda/clusterização.  
- [ ] Dados: integrar PACE/MODIS (clorofila/PFTs) e SWOT (eddies) via APIs; documentar fontes.  
- [ ] Documentação: adicionar `Fastapi/README.md`, `.env.example` e `vite-project/.env.local.example` ao repo.

---

## Créditos & Licença

- Autores/contribuidores: atualize esta seção com os nomes do repositório.  
- **Licença**: recomenda‑se adicionar `LICENSE` (MIT ou Apache‑2.0) à raiz do projeto.

---

## Referências (contexto técnico)

- Missões NASA: PACE (fitoplâncton), MODIS‑Aqua (clorofila) e SWOT (altimetria/eddies).  
- Literatura sobre efeito de eddies no forrageamento de tubarões (ex.: estudos de 2018–2019).

---

### Como usar este arquivo

- Coloque este `README.md` na **raiz do repositório**.  
- Adapte nomes de arquivos/rotas para refletir exatamente o que está no seu código.  
- Opcional: crie `Fastapi/README.md` e `vite-project/README.md` com detalhes específicos.
