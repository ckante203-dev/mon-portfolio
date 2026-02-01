require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();

// Connexion à Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.set('view engine', 'ejs');

// Route principale
app.get('/', async (req, res) => {
    try {
        const { data: services, error } = await supabase
            .from('services')
            .select('*');

        if (error) throw error;

        res.render('index', { services });
    } catch (err) {
        console.error(err);
        res.status(500).send("Erreur lors de la récupération des données.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});