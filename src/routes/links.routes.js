const express = require('express');
const pool = require('../database');

const { isLoggedIn } = require("../lib/auth");

const router = express.Router();


router.get('/add', isLoggedIn, async (req, res) => {
    res.render("links/add");
});

router.post('/add', isLoggedIn, async (req, res) => {
    const { title, url, description } = req.body;
    const newLink = {
        idLink: null,
        title,
        url,
        description,
        idUser: req.user.idUser
    };

    await pool.query('INSERT INTO links set ?', [newLink]);
    req.flash('success', 'Link Save Successfully');
    res.redirect("/links");
});

router.get("/", isLoggedIn ,async(req, res) => {
    const links = await pool.query('SELECT * FROM links WHERE idUser = ?', [req.user.idUser]);
    console.log(links);
    res.render("links/list", {
        links
    });
});

router.get('/delete/:id', isLoggedIn ,async (req, res) => {
    const { id } = req.params;
    await pool.query("DELETE FROM links WHERE idLink = ?", [id]);
    req.flash('success', 'Link Removed Successfully');
    res.redirect("/links");
});

router.get('/edit/:id', isLoggedIn ,async (req, res) => {
    const { id } = req.params;    

    // Retorna un array con los registros encontrados
    const link = await pool.query("SELECT * FROM links WHERE idLink = ?", [id]);
    
    res.render('links/edit', {
        link: link[0]
    })
});

router.post('/edit/:id', isLoggedIn ,async (req, res) => {
    const { id } = req.params;
    const data = req.body;

    console.log(data, id);
    await pool.query("UPDATE links SET ? WHERE idLink = ?", [data, id]);

    req.flash('success', 'Link Updated Successfully');
    res.redirect('/links')
});

module.exports = router;