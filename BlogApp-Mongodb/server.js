const express = require('express'); //gets the express module
const app = express(); //require the express package 
const url = "mongodb://localhost:27017";
const mongoClient = require ('mongodb').MongoClient;
const bodyParser = require('body-parser');
const session = require('express-session');
app.use(bodyParser.urlencoded({entended:true}));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'secret',
  name: 'uniqueID',
  saveUninitialized:false
}))

// connecting to the database(sorta redundent)
mongoClient.connect(url,function(err,database){
  if(err){
    throw err;
  } else{
    let dbo = database.db('BookApp');
    //console.log("connected");
  }
})

//redirects to login page or index
app.get('/', function(req,res){
   if(req.session.loggedIn) {
      res.sendFile('index.html', {root : __dirname});
  } else {res.redirect('/loginpage')}
})

//rediects to login page
app.get('/loginpage', function(req,res){
      res.sendFile('form.html', {root : __dirname});
})

//login
app.post('/login', function(req,res){
   mongoClient.connect(url,function(err,database){
     let dbo = database.db('BlogApp');
     let password = req.body.password;
     let username = req.body.username;
     let query = {username:username, password:password}
     dbo.collection('Users').find(query).toArray(function(err,results){
       if(results[0].password == req.body.password) {
          //console.log(results[0].username);
        let newuser = results[0].username;
        req.session.username = newuser;
        req.session.loggedIn = true;
       res.redirect('/');    
       }else{
        throw err;
      }
     })
   })
})

//signup
app.post('/signup', function(req,res){
  mongoClient.connect(url,function(err,database){
     let password = req.body.password;
     let username = req.body.username;
     let dbo = database.db('BlogApp');
     let myData = {username:username, password:password}
     
     dbo.collection("Users").insertOne(myData,function(err,response){
       if(err){
        throw err;
      }else{
        //console.log("success");
        database.close();
      }
     })
   })
  res.redirect('/loginpage');
})

//Insert
app.post('/insert', function(req,res){
  mongoClient.connect(url,function(err,database){
     let newuser = req.session.username;
     let title = req.body.title;
     let content = req.body.content;
     let dbo = database.db('BlogApp');
     let query = {'username':newuser};
     let newvalues = {$addToSet:{blogposts:{'title':title,'content':content}}}
     
     dbo.collection("Users").updateOne(query,newvalues,function(err,results){
       if(err){
        throw err;
      }else{
//         console.log("success");
        database.close();
      }
     })
   })
  res.redirect('/select');
})

//Select all
app.get('/select',function(req,res){
    mongoClient.connect(url,function(err,database){
      let dbo = database.db('BlogApp')
      let message = "Here is all your Blog Posts";
      let newuser = req.session.username;
      // you could also write the query as let query = {username:req.session.username}
      let query = {username:newuser};
      dbo.collection('Users').find(query).toArray(function(err,results){
        let data = results[0];

        res.render('select.ejs',{message:message,object:data});
      })
    }) 
})

// kill the session
app.get('/distroy',function(req,res){
  req.session.destroy();
  res.redirect('/');
})

app.listen(3001)