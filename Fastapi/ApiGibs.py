from fastapi import FastAPI

app = FastAPI()
data_fake = [
    {
        "id": 1,
        "lat": -3.1190,
        "lng": -60.0217,
        "probabilidade": 0.87,
        "especie": "Boto-cor-de-Rosa"
    },
    {
        "id": 2,
        "let": -23.5505,
        "lng": -46.6333,
        "probabilidade":0.75,
        "especie": "Tubarão-Tigre"
    },
    {
        "id": 3,
        "lat": -12.9777,
        "lng": -38.5016,
        "probabilidade": 0.93,
        "especie": "Tubarão-Branco"
    },
    {
        "id": 4,
        "lat": -8.0543,
        "lng": -34.9913,
        "probabilidade": 0.69,
        "especie": "Tubarão-Lixa"
    },
    {
      "id":  5,
      "lat": -27.5949,
      "lng": -48.5482,
      "probabilidade": 0.82,
      "especie": "Tubararão-Azul" 
    }
]
@app.get("/")
def root():
        return {"message": "API rodando! Acesse /Gibs/gibs_api para os dados"}

@app.get("/Gibs/gibs_api")
def gibs_api():
    return data_fake
    


