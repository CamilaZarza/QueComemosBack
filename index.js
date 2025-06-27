import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS para permitir solicitudes desde cualquier origen
const corsOptions = {
  origin: '*',  // Permitir todos los orígenes
  methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Inicializar Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post('/generar-receta', async (req, res) => {
  const { nombrePlato, filtros } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.0-flash' });


    let prompt = `Genera dos recetas completas para un plato utilizando únicamente los siguientes ingredientes: "${nombrePlato}". 
    No incluir ingredientes que no hayan sido ingresados. 
    Cada receta debe incluir: 
    - lista de ingredientes
    - preparación paso a paso
    - información nutricional (calorías, proteínas y carbohidratos)
    - un consejo útil. 
    Si se ingresan ingredientes no válidos o no comestibles, responder con: "Por favor, ingresar ingredientes válidos."`;

    if (filtros.tipoDieta) {
      prompt += ` En ambas recetas se deben seguir el tipo de dieta "${filtros.tipoDieta}" y deben incluir un apartado "Tipo de dieta: ${filtros.tipoDieta}", escrito correctamente sin caracteres especiales.`;
    }

    if (filtros.tiempo) {
      prompt += `En ambas recetas el tiempo estimado de preparación debe ser de "${filtros.tiempo}", incluyendo un apartado "Tiempo de cocción: ${filtros.tiempo}".`;
    }

    if (filtros.dificultad) {
      prompt += ` En ambas recetas la dificultad debe ser "${filtros.dificultad}", con un apartado "Dificultad: ${filtros.dificultad}".`;
    }

    if (filtros.origen) {
      prompt += ` En ambas recetas el origen debe ser "${filtros.origen}" e incluir un apartado "Origen: ${filtros.origen}".`;
    }

    if (filtros.tipoPlato) {
      prompt += ` Ambas recetas deben ser del tipo "${filtros.tipoPlato}", incluyendo un apartado "Tipo de plato: ${filtros.tipoPlato}".`;
    }

    if (filtros.coccion) {
      prompt += ` En ambas recetas se debe emplear el método de cocción "${filtros.coccion}" y agregar un apartado "Método de cocción: ${filtros.coccion}".`;
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const receta = response.text();

    res.json({ receta });
  } catch (error) {
    console.error('Error al generar la receta:', error);
    res.status(500).json({ error: 'No se pudo generar la receta.' });
  }
});

// ✅ Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
