const express = require('express');
const app     = express();
var cors      = require('cors');



//settings
app.set('port', process.env.PORT || 5000);
app.use(cors());

//middlewares  
app.use(express.json());

app.use(express.urlencoded({extended:false}));
//routes
app.use(require('./Routes/Routes'));

//init server
app.listen(app.get('port'),()=>{
    console.log('server on port', app.get('port'))
})
