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


    let prompt = `Genera dos recetas completa para un plato unicamente con los siguintes ingredientes: "${nombrePlato}", que no incluya ingredientes no ingresados. Mostrar ingredientes, preparación paso a paso, informacion nutricional (calorias, proteinas y carbohidratos), tiempo de coccion y algún consejo útil. Si no ingresa ingredientes que no sean comestibles o validos poner "Por favor ingresar ingredientes validos"`;

    if (filtros.tipoDieta != '') {
      prompt += `Que las dos recetas generadas sigan el tipo de dieta: ${filtros.tipoDieta}", y agregar un apartado de "Tipo de dieta: ${filtros.tipoDieta}" por cada receta.`;
    }
        if (filtros.tiempo != '') {
      prompt += `Que las dos recetas generadas tengan un tiempo de preparacion: ${filtros.tiempo}" y agregar un apartado de "Tiempo de coccion: " con el tiempo de coccion estimado, por cada receta..`;
    }
        if (filtros.dificultad != '') {
      prompt += `Que las dos recetas generadas tengan una dificultad: ${filtros.dificultad}" y agregar un apartado de "Dificultad: ${filtros.dificultad}", por cada receta..`;
    }
        if (filtros.origen != '') {
      prompt += `Que las dos recetas generadas sean de origen: ${filtros.origen}" y agregar un apartado de "Origen: ${filtros.origen}", por cada receta..`;
    }
        if (filtros.tipoPlato != '') {
      prompt += `Que las dos recetas generadas sean una: ${filtros.tipoPlato}" y agregar un apartado de "Tipo de Plato: ${filtros.tipoPlato}", por cada receta.`;
    }
        if (filtros.coccion != '') {
      prompt += `Que las dos recetas generadas tengan un metodo de coccion en: ${filtros.coccion}" y agregar un apartado de "Metodos de cocción: ${filtros.coccion}, por cada receta"`;
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
