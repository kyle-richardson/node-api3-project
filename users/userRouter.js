const express = require('express');
const db = require('./userDb')
const postsDb = require('../posts/postDb')

const router = express.Router();
router.use(express.json()) 

router.post('/', validateUser, (req, res) => {
  const body = req.body
  db.insert(body)
    .then(user=> {
      res.status(200).json(user)
    })
    .catch(err=> {
      res.status(500).json({error: 'could not create user'})
    })
});

router.post('/:id/posts', validateId, validatePost, (req, res) => {
  const {id} = req.params
  const body = req.body
  const userId = body.user_id
  if(userId && userId == id)
    postsDb.insert(body)
      .then(prom => {
        res.status(200).json(prom)
      })
      .catch(err=> {
        res.status(500).json({error: `could not update user ${id}`})
      })
  else
    res.status(400).json({error: 'missing user_id field or user_id does not match expected user id'})
  
});

router.get('/', (req, res) => {
  db.get()
    .then(users => {
      res.status(200).json(users)
    })
    .catch(err=> {
      res.status(500).json({error: 'could not retrieve users'})
    })
});

router.get('/:id', validateId,(req, res) => {
  const {id} = req.params
  db.getById(id)
    .then(user=> {
      res.status(200).json(user)
    })
    .catch(err=> {
      res.status(500).json({error: `could not retrieve user at id ${id}`})
    })
});

router.get('/:id/posts', validateId,(req, res) => {
  const {id} = req.params
  db.getUserPosts(id)
    .then(posts=> {
      res.status(200).json(posts)
    })
    .catch(err=> {
      res.status(500).json({error: `could not retrieve posts for user ${id}`})
    })
});

router.delete('/:id', validateId,(req, res) => {
  const {id} = req.params
  db.getById(id)
    .then(user=> {
      db.remove(id)
        .then(del => {
          if(del===1)
            res.status(200).json(user)
          else 
            res.status(400).json({error: 'nothing deleted'})
        })
        .catch(err=> {
          res.status(500).json({error: `could not delete user ${id}`})
        })
    })
    .catch(err=> {
      res.status(500).json({error: 'server error'})
    })
  
});

router.put('/:id', validateId, (req, res) => {
  const {id} = req.params
  const changes = req.body
  db.update(id, changes)
    .then(promise => {
      if(promise===1)
        db.getById(id)
          .then(user=> {
            res.status(200).json(user)
          })
          .catch(err=> {
            res.status(500).json({error: 'server error'})
          })
      else
          res.status(400).json({error: 'nothing changed'})
    })
    .catch(err=> {
      res.status(500).json({error: `could not update user ${id}`})
    })
});

//custom middleware

function validateId(req, res, next) {
  const { id } = req.params;
  db.getById(id)
    .then(user => {
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(400).json({ message: "invalid user id" });
        // next(new Error("invalid user id" );
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ message: 'exception', err });
    });
}

function validateUser(req, res, next) {
  const body = req.body;
  if(body) {
    if(!body.name)  {res.status(400).json({ message: "missing required name field" })}
    else next()
  }
  else {
    res.status(400).json({ message: "missing user data" });
  }
}

function validatePost(req, res, next) {
  const body = req.body;
  if(body) {
    if(!body.text) {res.status(400).json({ message: "missing required text field" })}
    else next()
  }
  else {
    res.status(400).json({ message: "missing post data" });
  }
}

module.exports = router;
