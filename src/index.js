const express = require('express');

// PERMITE VER LAS PETICIONES AL SERVIDOR EN LA CONSOLA
const morgan = require('morgan');

// PERMITE CREAR VARIABLES GLOBALES DESDE LAS RUTAS
// PARA QUE FUNCIONE FLASH EL LO TIENE QUE ALMACENAR EN UNA SESION, TENEMOS QUE UTILZAR EL MODULO EXPRESS-SESSION PARA CREAR UNA SESSION DE FORMA LOCAL
// O CREAR UNA SESSION CON EXPRESS-MYSQL-SESSION : PERMITE CREAR UNA SESSION Y ALMACENAR LA SESSION EN LA BASE DE DATOS
const flash = require("connect-flash");

// EXPRESS-SESSION : PERMITE CREAR UNA SESSION Y ALMACENAR LA SESSION EN LA MEMORIA DEL SERVIDOR
const session = require("express-session");

// EXPRESS-MYSQL-SESSION : PERMITE CREAR UNA SESSION Y ALMACENAR LA SESSION EN LA BASE DE DATOS
const MySQLStore = require('express-mysql-session');

// Requerimos no para definir authenticaciones porque eso se esta haciendo en el el archivo passport /lib/passport,js sino, para ejecutar su codigo principal
const passport = require('passport');

const {database} = require("./keys");

// Inicialization
const app = express();

// Aqui hacemos que la applicacion se entere de la authenticacion que estoy creando
require("./lib/passport");

const port = process.env.PORT || 3000;

// SETTINGS
app.set('view engine', 'ejs');
app.set('views', __dirname + "/views");


// MIDLEWARES
app.use(express.static(__dirname + "/public"))
app.use(express.urlencoded({extended: true}));
app.use(express.json());
// Inicializamos passport
app.use(passport.initialize());
app.use(morgan("dev"));



// CRREAMOS Y CONFIGURAMOS LA SESSION
app.use(session({
    secret: "Alejamdro", 
    resave: false,
    saveUninitialized: false,

    // En esta propiedad decimos donde guardar la session, en este caso guardamos en la base de datos, creando un nuevo objeto del modulo EXPRESS-MYSQL-SESSION
    // El parametro que hay que pasarle son los datos de la conexion a la base de datos
    store: new MySQLStore(database) 
})); 

app.use(flash());
// Le decimos a passport donde guardar los datos
app.use(passport.session());

// GLOBAL VARIABLES
app.use((req, res, next) => {
    app.locals.success = req.flash("success");
    app.locals.message = req.flash("message");
    app.locals.user = req.user;
    app.locals.age = 12;
    res.locals.time = require('timeago.js');

    // FORMA ALTERNATIVA
    // app.locals.time = require('timeago.js');
    next();
});

// ROUTES
app.use(require("./routes/index.routes"));
app.use(require("./routes/autentication.routes"));
app.use("/links", require("./routes/links.routes"));


// 404 page
app.use((req, res, next) => {
    res.status(404).render("404", {
        nombre: "404",
        descripcion: "No encontrado"
    })
});

app.listen(port, () => {
    console.log("server on port", port);
    // console.log(nada);    
});