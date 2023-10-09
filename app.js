const express = require('express');
const fs = require('fs/promises');

const app = express();
app.use(express.json());

const { MongoClient } = require('mongodb');

const DATABASE_URL = 'mongodb://localhost:27017'; // URL de conexión a tu base de datos MongoDB
const DATABASE_NAME = 'miBaseDeDatos'; // Nombre de tu base de datos

let db; // Variable para almacenar la referencia a la base de datos

MongoClient.connect(DATABASE_URL, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Error al conectar a la base de datos', err);
    return;
  }
  console.log('Conexión a la base de datos establecida correctamente');
  db = client.db(DATABASE_NAME);
});

// Endpoint para obtener todos los usuarios
app.get('/users', async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray();
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
});

// Endpoint para crear un nuevo usuario
app.post('/users', async (req, res) => {
  try {
    const newUser = req.body;
    const result = await db.collection('users').insertOne(newUser);
    res.json(result.ops[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario.' });
  }
});

// Endpoint para actualizar un usuario existente
app.put('/users/:dni', async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedUser = req.body;
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updatedUser },
      { returnOriginal: false }
    );
    res.json(result.value);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario.' });
  }
});

// Endpoint para eliminar un usuario existente
app.delete('/users/:dni', async (req, res) => {
  try {
    const userId = req.params.id;
    const result = await db.collection('users').findOneAndDelete({ _id: new ObjectId(userId) });
    res.json({ message: 'Usuario eliminado exitosamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario.' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});