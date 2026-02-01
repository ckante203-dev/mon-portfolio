require('dotenv').config(); // <-- Correction ici : "require" au lieu de "equire"
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path'); 
const app = express();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Configuration des vues pour Vercel
app.set('views', path.join(__dirname, 'views')); 
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