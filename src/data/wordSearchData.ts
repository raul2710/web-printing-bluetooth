export interface WordSearchTheme {
  id: string;
  nome: string;
  icone: string;
  palavras: string[];
}

export const TEMAS_CACA_PALAVRAS: WordSearchTheme[] = [
  {
    id: "animais",
    nome: "Animais",
    icone: "🐾",
    palavras: ["CACHORRO", "GATO", "LEAO", "TIGRE", "MACACO", "GIRAFA", "ZEBRA", "URSO", "COELHO", "COBRA", "SAPO", "PATO", "CAVALO", "GOLFINHO"]
  },
  {
    id: "frutas",
    nome: "Frutas",
    icone: "🍎",
    palavras: ["BANANA", "MACA", "UVA", "MORANGO", "ABACAXI", "LARANJA", "MELANCIA", "MAMAO", "PERA", "KIWI", "MANGA", "CEREJA", "LIMAO"]
  },
  {
    id: "tecnologia",
    nome: "Tecnologia",
    icone: "💻",
    palavras: ["CODIGO", "BLUETOOTH", "CANVAS", "TERMAL", "REACT", "TECLADO", "PIXEL", "DITHER", "SENSOR", "DADOS", "NUVEM", "ROUTER"]
  },
  {
    id: "comidas",
    nome: "Gastronomia",
    icone: "🍕",
    palavras: ["PIZZA", "PASTEL", "COXINHA", "FEIJOADA", "HAMBURGUER", "SUSHI", "LASANHA", "RISOTO", "CREPE", "QUIBE", "FONDUE", "TACOS"]
  },
  {
    id: "natureza",
    nome: "Natureza",
    icone: "🌿",
    palavras: ["MONTANHA", "OCEANO", "FLORESTA", "CACHOEIRA", "SAVANA", "DESERTO", "VULCAO", "LAGOA", "CANYON", "GEISER", "PRAIA", "AURORA"]
  },
  {
    id: "espaco",
    nome: "Astronomia",
    icone: "🚀",
    palavras: ["PLANETA", "ESTRELA", "GALAXIA", "COMETA", "METEORO", "LUA", "SOL", "ORBITA", "NEBULOSA", "BURACO", "GRAVIDADE", "COSMOS"]
  },
  {
    id: "musica",
    nome: "Instrumentos",
    icone: "🎸",
    palavras: ["GUITARRA", "BATERIA", "PIANO", "VIOLINO", "FLAUTA", "TROMPETE", "SAXOFONE", "HARPA", "BAIXO", "CLARINETE", "BANJO", "ORGAO"]
  },
  {
    id: "paises",
    nome: "Países",
    icone: "🌎",
    palavras: ["BRASIL", "JAPAO", "CANADA", "MEXICO", "FRANCA", "ITALIA", "ESPANHA", "ALEMANHA", "ANGOLA", "CHILE", "EGITO", "PORTUGAL"]
  }
];
