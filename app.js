const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const app = express();

// Configuração do MongoDB
const dbURI = 'mongodb://localhost:27017/?directConnection=true';
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Defina o modelo para os dados do Bitcoin
const bitcoinSchema = new mongoose.Schema({
  value: {
    type: Number,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Bitcoin = mongoose.model('Bitcoin', bitcoinSchema);

app.get('/api/bitcoin', async (req, res) => {
  try {
    const response = await axios.get('https://api.coindesk.com/v1/bpi/currentprice.json');
    const bitcoinPrice = response.data.bpi.BRL.rate_float;

    const newBitcoinEntry = new Bitcoin({ value: bitcoinPrice });
    await newBitcoinEntry.save();

    res.json({ bitcoinPrice });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter a cotação do Bitcoin' });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
