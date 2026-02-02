require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// --- CONFIGURATIONS ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, 
    auth: {
        user: 'ckante203@gmail.com',
        pass: process.env.EMAIL_PASS 
    }
});

// --- MIDDLEWARES ---
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

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

// Page Projets (Cœur du système)
app.get('/projets', async (req, res) => {
    try {
        const { data: tousLesProjets, error } = await supabase
            .from('projets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // On filtre les données reçues de Supabase
        const projetsPro = tousLesProjets.filter(p => p.type === 'pro');
        const projetsPerso = tousLesProjets.filter(p => p.type === 'perso');

        res.render('projets', { projetsPro, projetsPerso });
    } catch (err) {
        console.error("Erreur projets:", err);
        res.render('projets', { projetsPro: [], projetsPerso: [] });
    }
});

// ROUTE MANQUANTE À RAJOUTER :
app.get('/services', async (req, res) => {
    try {
        // On lance les deux requêtes en parallèle pour plus de vitesse
        const [servicesRes, competencesRes] = await Promise.all([
            supabase.from('services').select('*'),
            supabase.from('competences').select('*')
        ]);

        res.render('services', { 
            services: servicesRes.data || [], 
            competences: competencesRes.data || [] 
        });
    } catch (err) {
        console.error("Erreur page services:", err);
        res.render('services', { services: [], competences: [] });
    }
});

// Contact
app.get('/contact', (req, res) => res.render('contact'));

app.post('/contact', async (req, res) => {
    const { prenom, nom, email, message } = req.body;
    try {
        await transporter.sendMail({
            from: 'ckante203@gmail.com',
            to: 'ckante203@gmail.com',
            subject: `💼 Message de ${prenom} ${nom}`,
            text: `Nom: ${prenom} ${nom}\nEmail: ${email}\nMessage: ${message}`
        });
        res.send("<script>alert('Message envoyé !'); window.location.href='/contact';</script>");
    } catch (err) {
        res.status(500).send("Erreur d'envoi.");
    }
});

app.use((req, res) => res.status(404).render('404'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}`));