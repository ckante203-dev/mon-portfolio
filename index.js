require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const app = express();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Middleware Global (pour le menu actif)
app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
});

// --- ROUTES ---

// Accueil
app.get('/', async (req, res) => {
    try {
        const { data: services } = await supabase.from('services').select('*');
        res.render('index', { services: services || [] });
    } catch (err) {
        res.render('index', { services: [] });
    }
});

app.get('/services', async (req, res) => {
    try {
        const { data: servicesData, error } = await supabase
            .from('services')
            .select('*');

        if (error) throw error;
        res.render('services', { services: servicesData || [] });
    } catch (err) {
        console.error(err);
        res.render('services', { services: [] });
    }
});

// --- LA ROUTE PROJETS CORRIGÉE ---
app.get('/projets', async (req, res) => {
    try {
        const { data: projetsData, error } = await supabase
            .from('projets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // On envoie bien la variable 'projets'
        res.render('projets', { projets: projetsData || [] });
    } catch (err) {
        console.error("Erreur Supabase projets:", err);
        // Si ça plante, on envoie un tableau vide pour éviter le crash EJS
        res.render('projets', { projets: [] });
    }
});

// Contact
app.get('/contact', (req, res) => {
    res.render('contact');
});

app.post('/contact', async (req, res) => {
    const { prenom, nom, email, message } = req.body;
    try {
        await supabase.from('contacts').insert([{ prenom, nom, email, message }]);
        res.send("<script>alert('Message envoyé !'); window.location.href='/contact';</script>");
    } catch (err) {
        res.status(500).send("Erreur d'envoi");
    }
});

app.use((req, res) => {
    res.status(404).send("Page introuvable");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});